<script>
  import { untrack } from 'svelte';
  import { sortFoodsByUsage, HOME_FOOD_LIMIT } from '../lib/sort.js';

  /** 快速記錄：首頁與補登面板共用，只差在寫入的日期 */
  let { store, date } = $props();

  // 排序只在打開時計算一次，使用中不會因為點擊而跳動（見 docs/entities/常用品項排序.md）
  const initialOrder = untrack(() =>
    sortFoodsByUsage(store.foods, store.intakes, store.today).map((f) => f.id)
  );
  let expanded = $state(false);

  const orderedFoods = $derived.by(() => {
    const byId = new Map(store.foods.map((f) => [f.id, f]));
    const known = initialOrder.filter((id) => byId.has(id)).map((id) => byId.get(id));
    const added = store.foods
      .filter((f) => !initialOrder.includes(f.id))
      .sort((a, b) => b.createdAt - a.createdAt);
    return [...known, ...added];
  });
  const visibleFoods = $derived(expanded ? orderedFoods : orderedFoods.slice(0, HOME_FOOD_LIMIT));
  const hiddenCount = $derived(orderedFoods.length - HOME_FOOD_LIMIT);

  let flashed = $state(null);
  function flash(key) {
    flashed = key;
    setTimeout(() => {
      if (flashed === key) flashed = null;
    }, 300);
  }
</script>

<section class="card" aria-label="吃了什麼">
  <h2>吃了什麼？</h2>
  {#if store.foods.length === 0}
    <p class="hint">還沒有品項，到「品項」頁新增吧。</p>
  {:else}
    <div class="chips">
      {#each visibleFoods as food (food.id)}
        <button
          class="chip"
          class:flash={flashed === food.id}
          onclick={() => {
            flash(food.id);
            store.recordIntake(date, food);
          }}>{food.name}</button
        >
      {/each}
      {#if hiddenCount > 0}
        <button class="chip more" aria-expanded={expanded} onclick={() => (expanded = !expanded)}>
          {expanded ? '收起 ▴' : `更多 ▾`}
        </button>
      {/if}
    </div>
  {/if}
</section>

<section class="card" aria-label="運動了嗎">
  <h2>運動了嗎？</h2>
  <div class="chips exercises">
    {#each store.exerciseTypes as type (type.id)}
      {@const on = store.isChecked(date, type.id)}
      <button
        class="chip exercise"
        class:on
        class:flash={flashed === type.id}
        aria-pressed={on}
        onclick={() => {
          flash(type.id);
          store.toggleExercise(date, type);
        }}>{type.emoji} {type.name}</button
      >
    {/each}
  </div>
</section>

<style>
  h2 {
    font-size: 0.95rem;
    margin: 0 0 0.6rem;
    color: var(--muted);
    font-weight: 600;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .exercises {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .chip {
    border: 1.5px solid var(--line);
    background: var(--surface);
    border-radius: 999px;
    padding: 0.55rem 1rem;
    font-size: 1rem;
    transition: transform 0.15s, background 0.15s;
  }
  .exercise {
    border-radius: 14px;
    text-align: left;
  }
  .chip:active,
  .flash {
    transform: scale(0.93);
    background: var(--accent-soft);
  }
  .on {
    background: var(--accent-soft);
    border-color: var(--accent);
    font-weight: 600;
  }
  .more {
    color: var(--muted);
    border-style: dashed;
  }
  .hint {
    color: var(--muted);
    margin: 0;
  }
</style>
