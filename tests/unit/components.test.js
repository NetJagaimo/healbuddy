import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import QuickRecord from '../../src/components/QuickRecord.svelte';
import Toast from '../../src/components/Toast.svelte';
import DayEntries from '../../src/components/DayEntries.svelte';
import { AppStore } from '../../src/lib/store.svelte.js';

let n = 0;
const now = () => new Date(2026, 8, 26, 12, 0);
const makeStore = () => new AppStore({ now }).init(`comp-${++n}`);

async function withFoods(names) {
  const s = await makeStore();
  for (const name of names) await s.addFood(name);
  return s;
}

describe('QuickRecord', () => {
  it('首頁只顯示 8 個品項，其餘在「更多」', async () => {
    const s = await withFoods(['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10']);
    render(QuickRecord, { store: s, date: s.today });
    const foods = screen.getByRole('region', { name: '吃了什麼' });
    expect(foods.querySelectorAll('button.chip:not(.more)')).toHaveLength(8);
    await userEvent.click(screen.getByRole('button', { name: /更多/ }));
    expect(foods.querySelectorAll('button.chip:not(.more)')).toHaveLength(10);
  });

  it('點品項即記錄到指定日期', async () => {
    const s = await withFoods(['珍奶']);
    render(QuickRecord, { store: s, date: '2026-09-20' });
    await userEvent.click(screen.getByRole('button', { name: '珍奶' }));
    expect(s.intakes).toHaveLength(1);
    expect(s.intakes[0].date).toBe('2026-09-20');
  });

  it('點擊後按鈕位置不會因排序而跳動', async () => {
    const s = await withFoods(['珍奶', '啤酒']);
    render(QuickRecord, { store: s, date: s.today });
    const order = () =>
      [...screen.getByRole('region', { name: '吃了什麼' }).querySelectorAll('button.chip')].map((b) => b.textContent);
    const before = order();
    await userEvent.click(screen.getByRole('button', { name: before.at(-1) }));
    await userEvent.click(screen.getByRole('button', { name: before.at(-1) }));
    expect(order()).toEqual(before);
  });

  it('運動按鈕切換並顯示已按下', async () => {
    const s = await makeStore();
    render(QuickRecord, { store: s, date: s.today });
    const swim = screen.getByRole('button', { name: /游泳/ });
    expect(swim).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(swim);
    expect(swim).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(swim);
    expect(swim).toHaveAttribute('aria-pressed', 'false');
  });

  it('沒有品項時提示去品項頁新增', async () => {
    const s = await makeStore();
    render(QuickRecord, { store: s, date: s.today });
    expect(screen.getByText(/到「品項」頁新增/)).toBeInTheDocument();
  });
});

describe('DayEntries', () => {
  it('列出當日紀錄並可刪除', async () => {
    const s = await withFoods(['珍奶']);
    await s.recordIntake(s.today, s.foods[0]);
    await s.toggleExercise(s.today, s.exerciseTypes[3]);
    render(DayEntries, { store: s, date: s.today });
    expect(screen.getByText('12:00')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '刪除 珍奶' }));
    await userEvent.click(screen.getByRole('button', { name: '刪除 游泳' }));
    expect(screen.getByText('今天還沒有紀錄')).toBeInTheDocument();
  });
});

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }));
  afterEach(() => vi.useRealTimers());

  it('顯示提示，按「復原」撤銷', async () => {
    const s = await withFoods(['珍奶']);
    await s.recordIntake(s.today, s.foods[0]);
    render(Toast, { store: s });
    expect(screen.getByRole('status')).toHaveTextContent('已記錄 珍奶');
    screen.getByRole('button', { name: '復原' }).click();
    await vi.waitFor(() => expect(s.intakes).toHaveLength(0));
  });

  it('約 5 秒後自動消失', async () => {
    const s = await withFoods(['珍奶']);
    await s.recordIntake(s.today, s.foods[0]);
    render(Toast, { store: s });
    await vi.advanceTimersByTimeAsync(4900);
    expect(screen.queryByRole('status')).toBeInTheDocument();
    await vi.advanceTimersByTimeAsync(200);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
