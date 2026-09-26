// 日期一律用本地時間的 YYYY-MM-DD 字串，00:00 換日（見 docs/entities/午夜換日.md）

const pad = (n) => String(n).padStart(2, '0');
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(now = new Date()) {
  return toISO(now);
}

export function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso, n) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function timeHM(now = new Date()) {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function weekdayChar(iso) {
  return WEEKDAYS[parseISO(iso).getDay()];
}

/** 一週從星期日開始，回傳該週 7 天 */
export function weekDays(iso) {
  const start = addDays(iso, -parseISO(iso).getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthDays(iso) {
  const d = parseISO(iso);
  const count = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => toISO(new Date(d.getFullYear(), d.getMonth(), i + 1)));
}

/** 月曆格：每列 7 格（日到六），月份外的格子為 null */
export function monthGrid(iso) {
  const days = monthDays(iso);
  const cells = [...Array(parseISO(days[0]).getDay()).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export function addMonths(iso, n) {
  const d = parseISO(iso);
  return toISO(new Date(d.getFullYear(), d.getMonth() + n, 1));
}

export function formatDay(iso) {
  const d = parseISO(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日（${weekdayChar(iso)}）`;
}

export function formatShort(iso) {
  const d = parseISO(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatMonth(iso) {
  const d = parseISO(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

export function dayOfMonth(iso) {
  return parseISO(iso).getDate();
}
