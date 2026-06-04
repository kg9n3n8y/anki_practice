import type { GeneratedBoard } from "../types/board";
import type { BoardCard } from "../types/board";
import type { AreaId, Poem } from "../types";
import { ALL_AREAS } from "./areas";
import { cloneBoard, findCardOnBoard } from "./placement";

export type AnswerOutcome = "correct" | "incorrect" | "near";

function flipCard(board: GeneratedBoard, cardId: string): GeneratedBoard {
  const next = cloneBoard(board);
  const flipIn = (areas: typeof next.opponent) => {
    for (const cards of Object.values(areas)) {
      for (const c of cards) {
        if (c.id === cardId) c.faceUp = true;
      }
    }
  };
  flipIn(next.opponent);
  flipIn(next.self);
  return next;
}

function flipByPoemNo(board: GeneratedBoard, poemNo: number): GeneratedBoard {
  const card = findCardOnBoard(board, poemNo);
  if (!card) return board;
  return flipCard(board, card.id);
}

type CardLocation = {
  camp: "opponent" | "self";
  area: AreaId;
  index: number;
};

function findCardLocation(
  board: GeneratedBoard,
  cardId: string,
): CardLocation | null {
  for (const camp of ["opponent", "self"] as const) {
    const areas = board[camp];
    for (const area of ALL_AREAS) {
      const index = areas[area].findIndex((c) => c.id === cardId);
      if (index >= 0) return { camp, area, index };
    }
  }
  return null;
}

/** 同一エリア内で配列上の左右隣（index ± 1） */
function isAdjacentInSameArea(
  board: GeneratedBoard,
  correctCard: BoardCard,
  tappedCard: BoardCard,
): boolean {
  const correctLoc = findCardLocation(board, correctCard.id);
  const tappedLoc = findCardLocation(board, tappedCard.id);
  if (!correctLoc || !tappedLoc) return false;
  if (correctLoc.camp !== tappedLoc.camp || correctLoc.area !== tappedLoc.area) {
    return false;
  }
  return Math.abs(correctLoc.index - tappedLoc.index) === 1;
}

export type AnswerResult = {
  board: GeneratedBoard;
  outcome: AnswerOutcome;
  message: string;
  /** 盤上の歌で今回表にした札（オーバーレイ用。盤外・札が裏のままのときは null） */
  flippedCardId: string | null;
};

export function evaluateAnswer(
  board: GeneratedBoard,
  question: Poem,
  tapped: BoardCard | "none",
): AnswerResult {
  const onBoard = findCardOnBoard(board, question.no);

  if (onBoard) {
    if (tapped === "none") {
      const next = flipByPoemNo(board, question.no);
      return {
        board: next,
        outcome: "incorrect",
        message: "",
        flippedCardId: onBoard.id,
      };
    }
    if (tapped.id === onBoard.id) {
      const next = flipCard(board, tapped.id);
      return {
        board: next,
        outcome: "correct",
        message: "",
        flippedCardId: tapped.id,
      };
    }
    if (isAdjacentInSameArea(board, onBoard, tapped)) {
      const next = flipByPoemNo(board, question.no);
      return {
        board: next,
        outcome: "near",
        message: "",
        flippedCardId: onBoard.id,
      };
    }
    const next = flipByPoemNo(board, question.no);
    return {
      board: next,
      outcome: "incorrect",
      message: "",
      flippedCardId: onBoard.id,
    };
  }

  if (tapped === "none") {
    return { board, outcome: "correct", message: "", flippedCardId: null };
  }

  // 盤外の歌に対して札をタップした不正解: 札は裏のまま
  return { board, outcome: "incorrect", message: "", flippedCardId: null };
}
