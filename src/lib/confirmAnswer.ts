import type { GeneratedBoard } from "../types/board";
import type { BoardCard } from "../types/board";
import type { Poem } from "../types";
import { cloneBoard, findCardOnBoard } from "./placement";

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

export type AnswerResult = {
  board: GeneratedBoard;
  correct: boolean;
  message: string;
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
      return { board: next, correct: false, message: "" };
    }
    if (tapped.id === onBoard.id) {
      const next = flipCard(board, tapped.id);
      return { board: next, correct: true, message: "" };
    }
    const next = flipByPoemNo(board, question.no);
    return { board: next, correct: false, message: "" };
  }

  if (tapped === "none") {
    return { board, correct: true, message: "" };
  }

  // 盤外の歌に対して札をタップした不正解: 札は裏のまま（後の出題で正答できるようにする）
  return { board, correct: false, message: "" };
}
