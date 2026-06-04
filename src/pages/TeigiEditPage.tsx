import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { fudalist } from "../data/fudalist";
import { ALL_AREAS, isLeftArea, SELF_AREA_ROWS } from "../lib/areas";
import { formatTeigiKimariji } from "../lib/teigiKimariji";
import { loadTeigi, saveTeigi } from "../lib/storage";
import { downloadTeigiJson } from "../lib/teigiIo";
import {
  cloneTeigiState,
  emptyTeigiState,
  poemOrderMap,
  poolNos,
  stateFromTeigi,
  teigiFromState,
  type TeigiAreaState,
} from "../lib/teigiState";
import type { AreaId, Poem } from "../types";

const POOL_ID = "pool";

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

function findContainer(state: TeigiAreaState, id: string): string | null {
  if (id === POOL_ID) return POOL_ID;
  if (id.startsWith("area-")) return id;
  const no = parsePoemId(id);
  if (no === null) return null;
  for (const area of ALL_AREAS) {
    if (state[area].includes(no)) return areaContainerId(area);
  }
  return POOL_ID;
}

function KimarijiChip({
  kimariji,
  style,
  className,
  listeners,
  attributes,
  setNodeRef,
}: {
  kimariji: string;
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
      className={className ?? "teigi-chip teigi-chip--vertical"}
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
      kimariji={formatTeigiKimariji(poem.kimariji)}
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
      kimariji={formatTeigiKimariji(poem.kimariji)}
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
}: {
  areaId: AreaId;
  poemNos: number[];
  poemByNo: Map<number, Poem>;
}) {
  const containerId = areaContainerId(areaId);
  const { setNodeRef, isOver } = useDroppable({ id: containerId });
  const sortableIds = poemNos.map(poemId);

  return (
    <div
      ref={setNodeRef}
      className={`teigi-area${isLeftArea(areaId) ? "" : " teigi-area--right"}${isOver ? " teigi-area--over" : ""}`}
      data-area={areaId}
    >
      <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
        <div className="teigi-area-chips">
          {poemNos.map((no) => {
            const poem = poemByNo.get(no);
            if (!poem) return null;
            return <SortableKimariji key={no} no={no} poem={poem} />;
          })}
        </div>
      </SortableContext>
    </div>
  );
}

export function TeigiEditPage() {
  const sorted = useMemo(
    () => [...fudalist].sort((a, b) => a.order - b.order),
    [],
  );
  const poemByNo = useMemo(
    () => new Map(sorted.map((p) => [p.no, p])),
    [sorted],
  );
  const orderMap = useMemo(() => poemOrderMap(sorted), [sorted]);

  const [areaState, setAreaState] = useState<TeigiAreaState>(() => {
    const saved = loadTeigi();
    return stateFromTeigi(saved, orderMap);
  });

  const [activePoem, setActivePoem] = useState<Poem | null>(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

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

  const onDragEnd = (event: DragEndEvent) => {
    setActivePoem(null);
    const { active, over } = event;
    if (!over) return;

    const activeNo = parsePoemId(active.id);
    if (activeNo === null) return;

    const activeId = String(active.id);
    const overId = String(over.id);

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
        const overNo = parsePoemId(overId);
        const newIndex =
          overNo !== null ? items.indexOf(overNo) : items.length - 1;
        if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev;
        return { ...prev, [area]: arrayMove(items, oldIndex, newIndex) };
      }

      const next = cloneTeigiState(prev);

      if (activeContainer !== POOL_ID) {
        const fromArea = activeContainer.replace("area-", "") as AreaId;
        next[fromArea] = next[fromArea].filter((n) => n !== activeNo);
      }

      if (overContainer !== POOL_ID) {
        const toArea = overContainer.replace("area-", "") as AreaId;
        const items = [...next[toArea]];
        const overNo = parsePoemId(overId);
        const insertIndex =
          overNo !== null && items.includes(overNo)
            ? items.indexOf(overNo)
            : items.length;
        items.splice(insertIndex, 0, activeNo);
        next[toArea] = items;
      }

      return next;
    });
  };

  const save = () => {
    const data = teigiFromState(areaState);
    saveTeigi(data);
    setSavedMsg("保存しました");
    window.setTimeout(() => setSavedMsg(""), 2000);
  };

  const exportJson = () => {
    downloadTeigiJson(teigiFromState(areaState));
  };

  const resetAll = () => {
    setAreaState(emptyTeigiState());
    setResetConfirmOpen(false);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => {
        const no = parsePoemId(e.active.id);
        setActivePoem(no !== null ? (poemByNo.get(no) ?? null) : null);
      }}
      onDragEnd={onDragEnd}
    >
      <section className="app-card teigi-edit">
        <h2>定位置編集</h2>

        <div className="teigi-grid">
          {SELF_AREA_ROWS.map((row) => (
            <div key={`${row.left}-${row.right}`} className="teigi-grid-row">
              <SortableArea
                areaId={row.left}
                poemNos={areaState[row.left]}
                poemByNo={poemByNo}
              />
              <SortableArea
                areaId={row.right}
                poemNos={areaState[row.right]}
                poemByNo={poemByNo}
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
          <button type="button" className="secondary" onClick={exportJson}>
            JSON 出力
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
          <span className="teigi-chip teigi-chip--vertical teigi-chip--overlay">
            {formatTeigiKimariji(activePoem.kimariji)}
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
      className={`teigi-pool ${isOver ? "teigi-area--over" : ""}`}
    >
      <div className="teigi-pool-scroll">
        {poems.map((p) => (
          <PoolDraggableKimariji key={p.no} poem={p} />
        ))}
      </div>
    </div>
  );
}
