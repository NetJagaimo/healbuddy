// 胖胖等級：依當天多吃的樣數（見 docs/entities/胖胖等級.md）
export function fatLevel(count) {
  if (count <= 0) return '';
  if (count <= 2) return '🐹';
  if (count <= 4) return '🐷';
  return '🦛';
}
