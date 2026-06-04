/** ポインタ位置に応じた挿入インデックス（左→右の配列順） */
export function resolveInsertIndex(
  items: number[],
  overId: string,
  pointerX: number | null,
  chipsRow: HTMLElement | null,
): number {
  if (items.length === 0) return 0;

  const overNo = parsePoemNoFromId(overId);
  if (overNo !== null && items.includes(overNo)) {
    const el = chipsRow?.querySelector(`[data-poem-no="${overNo}"]`);
    if (el && pointerX !== null) {
      const rect = el.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      const idx = items.indexOf(overNo);
      return pointerX < mid ? idx : idx + 1;
    }
    return items.indexOf(overNo);
  }

  if (overId.startsWith("area-") && chipsRow && pointerX !== null) {
    return indexFromPointerX(items, chipsRow, pointerX);
  }

  return items.length;
}

function indexFromPointerX(
  items: number[],
  chipsRow: HTMLElement,
  pointerX: number,
): number {
  for (let i = 0; i < items.length; i++) {
    const el = chipsRow.querySelector(`[data-poem-no="${items[i]}"]`);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const mid = rect.left + rect.width / 2;
    if (pointerX < mid) return i;
  }
  return items.length;
}

function parsePoemNoFromId(id: string): number | null {
  if (!id.startsWith("poem-")) return null;
  const no = Number(id.slice(5));
  return Number.isFinite(no) ? no : null;
}

/** 同一エリア内の並べ替え用に arrayMove の newIndex を補正 */
export function adjustIndexAfterRemoval(
  oldIndex: number,
  insertIndex: number,
): number {
  return oldIndex < insertIndex ? insertIndex - 1 : insertIndex;
}
