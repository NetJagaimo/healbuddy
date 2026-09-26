<script>
  import { untrack } from 'svelte';
  import DayEntries from '../components/DayEntries.svelte';
  import QuickRecord from '../components/QuickRecord.svelte';
  import Sheet from '../components/Sheet.svelte';
  import {
    addDays,
    addMonths,
    formatDay,
    formatShort,
    formatMonth,
    weekDays,
    monthDays,
    monthGrid,
    weekdayChar,
    dayOfMonth
  } from '../lib/date.js';
  import { daySummary, rangeSummary } from '../lib/stats.js';

  let { store } = $props();

  let view = $state('day');
  // 打開紀錄頁時預設為今天
  let date = $state(untrack(() => store.today));
  let backfilling = $state(false);

  const isFuture = (d) => d > store.today;
  const summaryOf = (d) => daySummary(d, store.intakes, store.exerciseChecks);

  const day = $derived(summaryOf(date));
  const week = $derived(weekDays(date));
  const weekStats = $derived(rangeSummary(week, store.intakes, store.exerciseChecks));
  const grid = $derived(monthGrid(date));
  const monthStats = $derived(rangeSummary(monthDays(date), store.intakes, store.exerciseChecks));

  function openDay(d) {
    if (isFuture(d)) return;
    date = d;
    view = 'day';
  }

  // 往後翻不能超過今天所在的日 / 週 / 月
  const canNext = $derived(
    view === 'day'
      ? date < store.today
      : view === 'week'
        ? week[6] < store.today
        : monthDays(date).at(-1) < store.today
  );

  function move(dir) {
    if (dir > 0 && !canNext) return;
    let next;
    if (view === 'day') next = addDays(date, dir);
    else if (view === 'week') next = addDays(date, 7 * dir);
    else next = addMonths(date, dir);
    date = isFuture(next) ? store.today : next;
  }

  const periodLabel = $derived(
    view === 'day'
      ? formatDay(date)
      : view === 'week'
        ? `${formatShort(week[0])} – ${formatShort(week[6])}`
        : formatMonth(date)
  );

  const tabs = [
    ['day', '今日'],
    ['week', '本週'],
    ['month', '本月']
  ];
</script>

{#snippet stats(s)}
  <div class="stats">
    <p>多吃 {s.intakeCount} 樣 · 運動 {s.exerciseDays} 天</p>
    {#if s.topFoods.length}
      <p>最常吃：{s.topFoods.slice(0, 2).map((f) => `${f.name} ×${f.count}`).join(' · ')}</p>
    {/if}
    {#if s.topExercises.length}
      <p>最常做：{s.topExercises[0].name} ×{s.topExercises[0].count}</p>
    {/if}
  </div>
{/snippet}

<div class="segmented" role="tablist" aria-label="紀錄檢視">
  {#each tabs as [key, label]}
    <button role="tab" aria-selected={view === key} onclick={() => (view = key)}>{label}</button>
  {/each}
</div>

<div class="period">
  <button aria-label="上一段" onclick={() => move(-1)}>◀</button>
  <h1>{periodLabel}</h1>
  <button aria-label="下一段" disabled={!canNext} onclick={() => move(1)}>▶</button>
</div>

{#if view === 'day'}
  <section class="card" aria-label="當日紀錄">
    <p class="badge" aria-label="當日狀態">{day.level}{day.level && day.emojis ? ' ' : ''}{day.emojis}</p>
    <DayEntries {store} {date} grouped />
    <button class="primary" onclick={() => (backfilling = true)}>＋ 補登這一天</button>
  </section>
{:else if view === 'week'}
  <section class="card">
    <ul class="week" aria-label="本週">
      {#each week as d (d)}
        {@const s = summaryOf(d)}
        <li>
          <button disabled={isFuture(d)} onclick={() => openDay(d)} aria-label={`${formatShort(d)} 紀錄`}>
            <span class="wd">{weekdayChar(d)}</span>
            <span class="lv">{s.level}</span>
            <span class="foods">{s.intakes.map((e) => e.name).join(' ')}</span>
            <span class="ex">{s.emojis}</span>
          </button>
        </li>
      {/each}
    </ul>
    {@render stats(weekStats)}
  </section>
{:else}
  <section class="card">
    <table class="month" aria-label="本月">
      <thead>
        <tr>{#each ['日', '一', '二', '三', '四', '五', '六'] as w}<th>{w}</th>{/each}</tr>
      </thead>
      <tbody>
        {#each grid as row, i (i)}
          <tr>
            {#each row as d, j (j)}
              <td>
                {#if d}
                  {@const s = summaryOf(d)}
                  <button disabled={isFuture(d)} onclick={() => openDay(d)} aria-label={`${formatShort(d)} 紀錄`}>
                    <span class="num" class:today={d === store.today}>{dayOfMonth(d)}</span>
                    <span class="lv">{s.level}</span>
                    <span class="ex">{s.emojis}</span>
                  </button>
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
    {@render stats(monthStats)}
  </section>
{/if}

{#if backfilling}
  <Sheet title={`補登 ${formatDay(date)}`} onclose={() => (backfilling = false)}>
    <QuickRecord {store} {date} />
    <p class="hint">點一下就記入 {formatShort(date)}</p>
  </Sheet>
{/if}

<style>
  .segmented {
    display: flex;
    background: var(--line);
    border-radius: 12px;
    padding: 3px;
    margin-bottom: 0.75rem;
  }
  .segmented button {
    flex: 1;
    border: none;
    background: none;
    padding: 0.5rem;
    border-radius: 9px;
    font-size: 0.95rem;
    color: var(--muted);
  }
  .segmented button[aria-selected='true'] {
    background: var(--surface);
    color: var(--ink);
    font-weight: 600;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
  }
  .period {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }
  .period h1 {
    font-size: 1.1rem;
    margin: 0;
  }
  .period button {
    border: none;
    background: none;
    font-size: 1.1rem;
    padding: 0.4rem 0.8rem;
    color: var(--ink);
  }
  .period button:disabled {
    opacity: 0.25;
  }
  .badge {
    text-align: center;
    font-size: 2.6rem;
    min-height: 3.2rem;
    margin: 0.2rem 0 0;
  }
  .primary {
    display: block;
    width: 100%;
    margin-top: 1.2rem;
    padding: 0.75rem;
    border-radius: 12px;
    border: 1.5px dashed var(--accent);
    background: var(--accent-soft);
    font-size: 1rem;
    font-weight: 600;
  }
  .week {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .week button {
    width: 100%;
    display: grid;
    grid-template-columns: 1.6rem 1.8rem 1fr auto;
    align-items: center;
    gap: 0.3rem;
    text-align: left;
    border: none;
    border-bottom: 1px solid var(--line);
    background: none;
    padding: 0.55rem 0.1rem;
    font-size: 1rem;
    color: var(--ink);
  }
  .week button:disabled {
    opacity: 0.35;
  }
  .foods {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .wd {
    color: var(--muted);
  }
  .month {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .month th {
    font-weight: 500;
    color: var(--muted);
    font-size: 0.8rem;
    padding-bottom: 0.3rem;
  }
  .month td {
    padding: 1px;
    vertical-align: top;
  }
  .month button {
    width: 100%;
    min-height: 4.2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    border: none;
    border-radius: 8px;
    background: none;
    padding: 0.2rem 0;
    color: var(--ink);
  }
  .month button:disabled {
    opacity: 0.35;
  }
  .month .num {
    font-size: 0.8rem;
    color: var(--muted);
  }
  .month .num.today {
    color: var(--accent-ink);
    font-weight: 700;
  }
  .month .lv {
    font-size: 1.1rem;
    min-height: 1.3rem;
  }
  .month .ex {
    font-size: 0.95rem;
    line-height: 1.1;
    word-break: break-all;
  }
  .stats {
    margin-top: 0.9rem;
    color: var(--muted);
    font-size: 0.95rem;
  }
  .stats p {
    margin: 0.2rem 0;
  }
  .hint {
    color: var(--muted);
    text-align: center;
    font-size: 0.9rem;
  }
</style>
