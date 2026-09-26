<script>
  import { intakesOn, checksOn } from '../lib/stats.js';

  /** 某一天的紀錄清單，每筆都可刪除 */
  let { store, date, grouped = false } = $props();

  const intakes = $derived(intakesOn(date, store.intakes));
  const checks = $derived(checksOn(date, store.exerciseChecks));
</script>

{#snippet intakeRow(e)}
  <li>
    <span class="name">{e.name}</span>
    {#if e.time}<span class="time">{e.time}</span>{/if}
    <button class="del" aria-label={`刪除 ${e.name}`} onclick={() => store.deleteIntake(e.id)}>✕</button>
  </li>
{/snippet}

{#snippet checkRow(c)}
  <li>
    <span class="name">{c.emoji} {c.name}</span>
    <button class="del" aria-label={`刪除 ${c.name}`} onclick={() => store.deleteCheck(c.id)}>✕</button>
  </li>
{/snippet}

{#if grouped}
  <h3>多吃</h3>
  {#if intakes.length}
    <ul aria-label="多吃">{#each intakes as e (e.id)}{@render intakeRow(e)}{/each}</ul>
  {:else}
    <p class="empty">沒有</p>
  {/if}
  <h3>運動</h3>
  {#if checks.length}
    <ul aria-label="運動">{#each checks as c (c.id)}{@render checkRow(c)}{/each}</ul>
  {:else}
    <p class="empty">沒有</p>
  {/if}
{:else if intakes.length || checks.length}
  <ul aria-label="今日紀錄">
    {#each intakes as e (e.id)}{@render intakeRow(e)}{/each}
    {#each checks as c (c.id)}{@render checkRow(c)}{/each}
  </ul>
{:else}
  <p class="empty">今天還沒有紀錄</p>
{/if}

<style>
  h3 {
    font-size: 0.9rem;
    color: var(--muted);
    margin: 1rem 0 0.3rem;
    font-weight: 600;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0;
    border-bottom: 1px solid var(--line);
  }
  li:last-child {
    border-bottom: none;
  }
  .name {
    flex: 1;
  }
  .time {
    color: var(--muted);
    font-variant-numeric: tabular-nums;
    font-size: 0.9rem;
  }
  .del {
    border: none;
    background: none;
    color: var(--muted);
    font-size: 1rem;
    padding: 0.3rem 0.5rem;
  }
  .empty {
    color: var(--muted);
    margin: 0.3rem 0;
  }
</style>
