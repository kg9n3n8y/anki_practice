import type { AreaBoard, BoardCard, FeedbackKind } from "../types/board";
import type { AreaId, PracticeMode } from "../types";
import { areaPackClass } from "../lib/areas";
import { poemImageSrc, uraImageSrc } from "../lib/poemImage";
import { FudaImage } from "./FudaImage";

type OverlayMark = Exclude<FeedbackKind, null>;

const OVERLAY_SYMBOL: Record<Exclude<OverlayMark, "correct">, string> = {
  incorrect: "×",
  near: "△",
};

type BoardProps = {
  opponent: AreaBoard;
  self: AreaBoard;
  mode: PracticeMode;
  interactive?: boolean;
  onCardClick?: (card: BoardCard, camp: "opponent" | "self") => void;
  /** 解答済みで表向きの札へのマーク（cardId → 正誤。確認モード終了まで保持） */
  cardOverlays?: Partial<Record<string, OverlayMark>>;
};

function BoardArea({
  areaId,
  areaBoard,
  camp,
  interactive,
  onCardClick,
  cardOverlays,
}: {
  areaId: AreaId;
  areaBoard: AreaBoard;
  camp: "opponent" | "self";
  interactive?: boolean;
  onCardClick?: (card: BoardCard, camp: "opponent" | "self") => void;
  cardOverlays?: Partial<Record<string, OverlayMark>>;
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
        const overlay = cardOverlays?.[card.id] ?? null;
        return (
          <button
            key={card.id}
            type="button"
            className={`board-card-btn ${card.faceUp ? "is-face-up" : ""}`}
            disabled={!clickable}
            onClick={() => onCardClick?.(card, camp)}
            aria-label={card.faceUp ? card.poem.kimariji : "裏向きの札"}
          >
            <FudaImage
              src={src}
              alt={card.poem.kimariji}
              boardSized
            />
            {overlay && card.faceUp && (
              <span
                className={`board-card-mark board-card-mark--${overlay}`}
                aria-hidden
              >
                {overlay !== "correct" && OVERLAY_SYMBOL[overlay]}
              </span>
            )}
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
  interactive,
  onCardClick,
  cardOverlays,
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
                interactive={interactive}
                onCardClick={onCardClick}
                cardOverlays={cardOverlays}
              />
              <BoardArea
                areaId={row.left}
                areaBoard={opponent}
                camp="opponent"
                interactive={interactive}
                onCardClick={onCardClick}
                cardOverlays={cardOverlays}
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
                interactive={interactive}
                onCardClick={onCardClick}
                cardOverlays={cardOverlays}
              />
              <BoardArea
                areaId={row.right}
                areaBoard={self}
                camp="self"
                interactive={interactive}
                onCardClick={onCardClick}
                cardOverlays={cardOverlays}
              />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
