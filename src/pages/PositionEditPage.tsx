import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { fudalist } from "../data/fudalist";
import { ALL_AREAS, isLeftArea, SELF_AREA_ROWS } from "../lib/areas";
import { copyPositionCompact } from "../lib/positionCompact";
import {
  adjustIndexAfterRemoval,
  resolveInsertIndex,
} from "../lib/positionDragInsert";
import { formatPositionKimariji } from "../lib/positionKimariji";
import {
  clonePositionState,
  emptyPositionState,
  poemOrderMap,
  poolNos,
  stateFromPosition,
  positionFromState,
  type PositionAreaState,
} from "../lib/positionState";
import { loadPosition, savePosition } from "../lib/storage";
import type { AreaId, Poem } from "../types";

const POOL_ID = "pool";

type DragPreview = { area: AreaId; index: number; no: number };

function poemId(no: number): string {
  return `poem-${no}`;
}

function parsePoemId(id: string | number): number | null {
  const s = String(id);
  if (!s.startsWith("poem-")) return null;
  const no = Number(s.slice(5));
  return Number.isFinite(no) ? no : null;
}

function areaContainerId(area: AreaId): string {
  return `area-${area}`;
}

function findContainer(state: PositionAreaState, id: string): string | null {
  if (id === POOL_ID) return POOL_ID;
  if (id.startsWith("area-")) return id;
  const no = parsePoemId(id);
  if (no === null) return null;
  for (const area of ALL_AREAS) {
    if (state[area].includes(no)) return areaContainerId(area);
  }
  return POOL_ID;
}

function displayItemsForArea(
  areaId: AreaId,
  poemNos: number[],
  preview: DragPreview | null,
): { no: number; isGhost: boolean }[] {
  if (!preview || preview.area !== areaId) {
    return poemNos.map((no) => ({ no, isGhost: false }));
  }
  const base = poemNos.filter((n) => n !== preview.no);
  const list = [...base];
  list.splice(preview.index, 0, preview.no);
  return list.map((no) => ({
    no,
    isGhost: no === preview.no && !poemNos.includes(no),
  }));
}

function KimarijiChip({
  kimariji,
  poemNo,
  style,
  className,
  listeners,
  attributes,
  setNodeRef,
}: {
  kimariji: string;
  poemNo?: number;
  style?: CSSProperties;
  className?: string;
  listeners?: ReturnType<typeof useDraggable>["listeners"];
  attributes?: ReturnType<typeof useDraggable>["attributes"];
  setNodeRef?: (node: HTMLElement | null) => void;
}) {
  return (
    <span
      ref={setNodeRef}
      style={style}
      className={className ?? "position-chip position-chip--vertical"}
      {...(poemNo !== undefined ? { "data-poem-no": poemNo } : {})}
      {...listeners}
      {...attributes}
    >
      {kimariji}
    </span>
  );
}

function PoolDraggableKimariji({ poem }: { poem: Poem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: poemId(poem.no),
      data: { no: poem.no },
    });
  return (
    <KimarijiChip
      kimariji={formatPositionKimariji(poem.kimariji)}
      poemNo={poem.no}
      setNodeRef={setNodeRef}
      listeners={listeners}
      attributes={attributes}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
      }}
    />
  );
}

function SortableKimariji({ no, poem }: { no: number; poem: Poem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: poemId(no), data: { no } });
  return (
    <KimarijiChip
      kimariji={formatPositionKimariji(poem.kimariji)}
      poemNo={no}
      setNodeRef={setNodeRef}
      listeners={listeners}
      attributes={attributes}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    />
  );
}

function SortableArea({
  areaId,
  poemNos,
  poemByNo,
  dragPreview,
}: {
  areaId: AreaId;
  poemNos: number[];
  poemByNo: Map<number, Poem>;
  dragPreview: DragPreview | null;
}) {
  const containerId = areaContainerId(areaId);
  const { setNodeRef, isOver } = useDroppable({ id: containerId });
  const displayItems = displayItemsForArea(areaId, poemNos, dragPreview);
  const sortableIds = poemNos.map(poemId);

  return (
    <div
      ref={setNodeRef}
      className={`position-area${isLeftArea(areaId) ? "" : " position-area--right"}${isOver ? " position-area--over" : ""}`}
      data-area={areaId}
    >
      <SortableContext
        items={sortableIds}
        strategy={horizontalListSortingStrategy}
      >
        <div className="position-area-chips">
          {displayItems.map(({ no, isGhost }) => {
            const poem = poemByNo.get(no);
            if (!poem) return null;
            if (isGhost) {
              return (
                <KimarijiChip
                  key={`ghost-${no}`}
                  kimariji={formatPositionKimariji(poem.kimariji)}
                  poemNo={no}
                  className="position-chip position-chip--vertical position-chip--preview"
                />
              );
            }
            return <SortableKimariji key={no} no={no} poem={poem} />;
          })}
        </div>
      </SortableContext>
    </div>
  );
}

export function PositionEditPage() {
  const sorted = useMemo(
    () => [...fudalist].sort((a, b) => a.order - b.order),
    [],
  );
  const poemByNo = useMemo(
    () => new Map(sorted.map((p) => [p.no, p])),
    [sorted],
  );
  const orderMap = useMemo(() => poemOrderMap(sorted), [sorted]);

  const [areaState, setAreaState] = useState<PositionAreaState>(() => {
    const saved = loadPosition();
    return stateFromPosition(saved, orderMap);
  });

  const [activePoem, setActivePoem] = useState<Poem | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const pointerRef = useRef({ x: 0, y: 0 });

  const hasPlacements = useMemo(
    () => ALL_AREAS.some((area) => areaState[area].length > 0),
    [areaState],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const poolPoems = useMemo(() => {
    const nos = poolNos(
      areaState,
      sorted.map((p) => p.no),
    );
    return nos
      .map((no) => poemByNo.get(no))
      .filter((p): p is Poem => p !== undefined)
      .sort((a, b) => a.order - b.order);
  }, [areaState, sorted, poemByNo]);

  const trackPointer = (event: DragMoveEvent | DragOverEvent) => {
    const start = event.activatorEvent;
    if (start && "clientX" in start) {
      const p = start as PointerEvent;
      pointerRef.current = {
        x: p.clientX + event.delta.x,
        y: p.clientY + event.delta.y,
      };
    }
  };

  const chipsRowFor = (area: AreaId): HTMLElement | null =>
    document.querySelector(
      `[data-area="${area}"] .position-area-chips`,
    ) as HTMLElement | null;

  const updateDragPreview = (
    event: DragMoveEvent | DragOverEvent,
    state: PositionAreaState,
  ) => {
    const { active, over } = event;
    if (!over) {
      setDragPreview(null);
      return;
    }
    const activeNo = parsePoemId(active.id);
    if (activeNo === null) {
      setDragPreview(null);
      return;
    }
    const activeId = String(active.id);
    const overId = String(over.id);
    const activeContainer = findContainer(state, activeId);
    const overContainer =
      overId === POOL_ID || overId.startsWith("area-")
        ? overId
        : findContainer(state, overId);

    if (
      !activeContainer ||
      !overContainer ||
      overContainer === POOL_ID ||
      activeContainer === overContainer
    ) {
      setDragPreview(null);
      return;
    }

    const toArea = overContainer.replace("area-", "") as AreaId;
    const items = state[toArea].filter((n) => n !== activeNo);
    const insertIndex = resolveInsertIndex(
      items,
      overId,
      pointerRef.current.x,
      chipsRowFor(toArea),
    );
    setDragPreview({ area: toArea, index: insertIndex, no: activeNo });
  };

  const onDragEnd = (event: DragEndEvent) => {
    setDragPreview(null);
    setActivePoem(null);
    const { active, over } = event;
    if (!over) return;

    const activeNo = parsePoemId(active.id);
    if (activeNo === null) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const pointerX = pointerRef.current.x;

    setAreaState((prev) => {
      const activeContainer = findContainer(prev, activeId);
      const overContainer =
        overId === POOL_ID || overId.startsWith("area-")
          ? overId
          : findContainer(prev, overId);

      if (!activeContainer || !overContainer) return prev;

      if (activeContainer === overContainer) {
        if (activeContainer === POOL_ID) return prev;
        const area = activeContainer.replace("area-", "") as AreaId;
        const items = prev[area];
        const oldIndex = items.indexOf(activeNo);
        if (oldIndex < 0) return prev;
        let insertIndex = resolveInsertIndex(
          items,
          overId,
          pointerX,
          chipsRowFor(area),
        );
        insertIndex = adjustIndexAfterRemoval(oldIndex, insertIndex);
        if (insertIndex === oldIndex) return prev;
        return { ...prev, [area]: arrayMove(items, oldIndex, insertIndex) };
      }

      const next = clonePositionState(prev);

      if (activeContainer !== POOL_ID) {
        const fromArea = activeContainer.replace("area-", "") as AreaId;
        next[fromArea] = next[fromArea].filter((n) => n !== activeNo);
      }

      if (overContainer !== POOL_ID) {
        const toArea = overContainer.replace("area-", "") as AreaId;
        const items = [...next[toArea]];
        const insertIndex = resolveInsertIndex(
          items,
          overId,
          pointerX,
          chipsRowFor(toArea),
        );
        items.splice(insertIndex, 0, activeNo);
        next[toArea] = items;
      }

      return next;
    });
  };

  const save = () => {
    savePosition(positionFromState(areaState));
    setSavedMsg("保存しました");
    window.setTimeout(() => setSavedMsg(""), 2000);
  };

  const copyText = async () => {
    try {
      await copyPositionCompact(areaState);
      setSavedMsg("テキストをコピーしました");
      window.setTimeout(() => setSavedMsg(""), 2000);
    } catch (e) {
      setSavedMsg("");
      window.alert(
        e instanceof Error ? e.message : "コピーに失敗しました",
      );
    }
  };

  const resetAll = () => {
    setAreaState(emptyPositionState());
    setResetConfirmOpen(false);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => {
        const no = parsePoemId(e.active.id);
        setActivePoem(no !== null ? (poemByNo.get(no) ?? null) : null);
        const start = e.activatorEvent;
        if (start && "clientX" in start) {
          const p = start as PointerEvent;
          pointerRef.current = { x: p.clientX, y: p.clientY };
        }
      }}
      onDragMove={(e) => {
        trackPointer(e);
        updateDragPreview(e, areaState);
      }}
      onDragOver={(e) => {
        trackPointer(e);
        updateDragPreview(e, areaState);
      }}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setDragPreview(null);
        setActivePoem(null);
      }}
    >
      <section className="app-card position-edit">
        <h2>定位置編集</h2>

        <div className="position-grid">
          {SELF_AREA_ROWS.map((row) => (
            <div key={`${row.left}-${row.right}`} className="position-grid-row">
              <SortableArea
                areaId={row.left}
                poemNos={areaState[row.left]}
                poemByNo={poemByNo}
                dragPreview={dragPreview}
              />
              <SortableArea
                areaId={row.right}
                poemNos={areaState[row.right]}
                poemByNo={poemByNo}
                dragPreview={dragPreview}
              />
            </div>
          ))}
        </div>

        <PoolDrop poems={poolPoems} />

        {savedMsg && <p className="save-msg">{savedMsg}</p>}

        <div className="app-nav">
          <button type="button" className="app-button" onClick={save}>
            保存
          </button>
          <button type="button" className="secondary" onClick={copyText}>
            テキストをコピー
          </button>
          <button
            type="button"
            className="secondary"
            disabled={!hasPlacements}
            onClick={() => setResetConfirmOpen(true)}
          >
            リセット
          </button>
          <Link to="/" className="app-button secondary">
            トップへ戻る
          </Link>
        </div>
      </section>

      {resetConfirmOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal app-card">
            <h2>定位置をリセットしますか？</h2>
            <p>
              すべての決まり字を未配置プールに戻します。保存するまでストレージには反映されません。
            </p>
            <div className="app-nav">
              <button type="button" className="app-button" onClick={resetAll}>
                リセットする
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setResetConfirmOpen(false)}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      <DragOverlay>
        {activePoem ? (
          <span className="position-chip position-chip--vertical position-chip--overlay">
            {formatPositionKimariji(activePoem.kimariji)}
          </span>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function PoolDrop({ poems }: { poems: Poem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: POOL_ID });
  return (
    <div
      ref={setNodeRef}
      className={`position-pool ${isOver ? "position-area--over" : ""}`}
    >
      <div className="position-pool-scroll">
        {poems.map((p) => (
          <PoolDraggableKimariji key={p.no} poem={p} />
        ))}
      </div>
    </div>
  );
}
