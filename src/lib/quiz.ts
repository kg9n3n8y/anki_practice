import type { Poem, ConfirmOrder } from "../types";
import { shuffle } from "./shuffle";

export function buildQuestionList(
  boardPoems: Poem[],
  allPoems: Poem[],
  confirmOrder: ConfirmOrder,
  emptyCardCount: number,
): Poem[] {
  const onBoardNos = new Set(boardPoems.map((p) => p.no));
  const boardList = [...boardPoems];
  const others = allPoems.filter((p) => !onBoardNos.has(p.no));
  const extraCount = Math.min(Math.max(0, emptyCardCount), others.length);
  const extras = shuffle(others).slice(0, extraCount);
  const selected = [...boardList, ...extras];

  if (confirmOrder === "order") {
    return [...selected].sort((a, b) => a.order - b.order);
  }
  return shuffle(selected);
}
