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
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fudalist } from "../data/fudalist";
import { ALL_AREAS, AREA_LABELS } from "../lib/areas";
import { loadTeigi, saveTeigi } from "../lib/storage";
import {
  downloadTeigiJson,
  mapToTeigi,
  teigiToMap,
} from "../lib/teigiIo";
import type { AreaId, Poem } from "../types";

const POOL_ID = "pool";

function DraggableKimariji({ poem }: { poem: Poem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `poem-${poem.no}`,
      data: { poem },
    });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <span
      ref={setNodeRef}
      style={style}
      className="teigi-chip"
      {...listeners}
      {...attributes}
    >
      {poem.kimariji}
    </span>
  );
}

function DroppableArea({
  id,
  label,
  poems,
}: {
  id: string;
  label: string;
  poems: Poem[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`teigi-area ${isOver ? "teigi-area--over" : ""}`}
      data-area={id}
    >
      <div className="teigi-area-label">{label}</div>
      <div className="teigi-area-chips">
        {poems.map((p) => (
          <DraggableKimariji key={p.no} poem={p} />
        ))}
      </div>
    </div>
  );
}

export function TeigiEditPage() {
  const sorted = useMemo(
    () => [...fudalist].sort((a, b) => a.order - b.order),
    [],
  );

  const [placementMap, setPlacementMap] = useState<Map<number, AreaId>>(() => {
    const saved = loadTeigi();
    return saved ? teigiToMap(saved) : new Map();
  });

  const [activePoem, setActivePoem] = useState<Poem | null>(null);
  const [savedMsg, setSavedMsg] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const poolPoems = sorted.filter((p) => !placementMap.has(p.no));

  const poemsByArea = (area: AreaId): Poem[] =>
    sorted.filter((p) => placementMap.get(p.no) === area);

  const onDragEnd = (event: DragEndEvent) => {
    setActivePoem(null);
    const { active, over } = event;
    if (!over) return;
    const poem = active.data.current?.poem as Poem | undefined;
    if (!poem) return;

    const overId = String(over.id);
    setPlacementMap((prev) => {
      const next = new Map(prev);
      if (overId === POOL_ID) {
        next.delete(poem.no);
      } else if (overId.startsWith("area-")) {
        const area = overId.replace("area-", "") as AreaId;
        next.set(poem.no, area);
      }
      return next;
    });
  };

  const save = () => {
    const data = mapToTeigi(placementMap);
    saveTeigi(data);
    setSavedMsg("保存しました");
    window.setTimeout(() => setSavedMsg(""), 2000);
  };

  const exportJson = () => {
    downloadTeigiJson(mapToTeigi(placementMap));
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => {
        const poem = e.active.data.current?.poem as Poem | undefined;
        setActivePoem(poem ?? null);
      }}
      onDragEnd={onDragEnd}
    >
      <section className="app-card teigi-edit">
        <h2>定位置編集</h2>
        <p className="app-placeholder">
          決まり字を各エリアへドラッグして配置してください。
        </p>

        <div className="teigi-grid">
          {ALL_AREAS.map((area) => (
            <DroppableArea
              key={area}
              id={`area-${area}`}
              label={AREA_LABELS[area]}
              poems={poemsByArea(area)}
            />
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
          <Link to="/" className="app-button secondary">
            トップへ戻る
          </Link>
        </div>
      </section>

      <DragOverlay>
        {activePoem ? (
          <span className="teigi-chip teigi-chip--overlay">
            {activePoem.kimariji}
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
      <div className="teigi-pool-label">未配置（order 順・縦書き）</div>
      <div className="teigi-pool-scroll">
        {poems.map((p) => (
          <DraggableKimariji key={p.no} poem={p} />
        ))}
      </div>
    </div>
  );
}
