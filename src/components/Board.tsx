import type { AreaBoard, BoardCard } from "../types/board";
import type { AreaId, PracticeMode } from "../types";
import { areaPackClass } from "../lib/areas";
import { poemImageSrc, uraImageSrc } from "../lib/poemImage";
import { FudaImage } from "./FudaImage";

type BoardProps = {
  opponent: AreaBoard;
  self: AreaBoard;
  mode: PracticeMode;
  fudaWidth: number;
  interactive?: boolean;
  onCardClick?: (card: BoardCard, camp: "opponent" | "self") => void;
};

function BoardArea({
  areaId,
  areaBoard,
  camp,
  fudaWidth,
  interactive,
  onCardClick,
}: {
  areaId: AreaId;
  areaBoard: AreaBoard;
  camp: "opponent" | "self";
  fudaWidth: number;
  interactive?: boolean;
  onCardClick?: (card: BoardCard, camp: "opponent" | "self") => void;
}) {
  const cards = areaBoard[areaId];
  const outerPack = areaPackClass(areaId, camp);

  return (
    <div className={`board-area ${outerPack}`} data-area={areaId}>
      {cards.map((card) => {
        const src = card.faceUp
          ? poemImageSrc(card.poem, camp)
          : uraImageSrc();
        const clickable = interactive && !card.faceUp;
        return (
          <button
            key={card.id}
            type="button"
            className={`board-card-btn ${card.faceUp ? "is-face-up" : ""}`}
            disabled={!clickable}
            onClick={() => onCardClick?.(card, camp)}
            aria-label={card.faceUp ? card.poem.kimariji : "裏向きの札"}
          >
            <FudaImage src={src} alt={card.poem.kimariji} displayWidth={fudaWidth} />
          </button>
        );
      })}
    </div>
  );
}

const ROWS: { left: AreaId; right: AreaId }[] = [
  { left: "leftUpper", right: "rightUpper" },
  { left: "leftMiddle", right: "rightMiddle" },
  { left: "leftLower", right: "rightLower" },
];

export function Board({
  opponent,
  self,
  mode,
  fudaWidth,
  interactive,
  onCardClick,
}: BoardProps) {
  const showOpponent = mode === "opponent" || mode === "both";
  const showSelf = mode === "self" || mode === "both";

  return (
    <div className="karuta-board">
      {showOpponent && (
        <section className="board-camp board-camp--opponent" aria-label="相手陣">
          {ROWS.map((row) => (
            <div key={`opp-${row.left}`} className="board-row">
              <BoardArea
                areaId={row.right}
                areaBoard={opponent}
                camp="opponent"
                fudaWidth={fudaWidth}
                interactive={interactive}
                onCardClick={onCardClick}
              />
              <BoardArea
                areaId={row.left}
                areaBoard={opponent}
                camp="opponent"
                fudaWidth={fudaWidth}
                interactive={interactive}
                onCardClick={onCardClick}
              />
            </div>
          ))}
        </section>
      )}

      {showOpponent && showSelf && <div className="board-camp-gap" aria-hidden />}

      {showSelf && (
        <section className="board-camp board-camp--self" aria-label="自陣">
          {ROWS.map((row) => (
            <div key={`self-${row.left}`} className="board-row">
              <BoardArea
                areaId={row.left}
                areaBoard={self}
                camp="self"
                fudaWidth={fudaWidth}
                interactive={interactive}
                onCardClick={onCardClick}
              />
              <BoardArea
                areaId={row.right}
                areaBoard={self}
                camp="self"
                fudaWidth={fudaWidth}
                interactive={interactive}
                onCardClick={onCardClick}
              />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
