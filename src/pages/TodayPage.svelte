<script>
  import QuickRecord from '../components/QuickRecord.svelte';
  import DayEntries from '../components/DayEntries.svelte';
  import { formatDay } from '../lib/date.js';

  let { store } = $props();
</script>

<header class="page-head">
  <h1>{formatDay(store.today)}</h1>
</header>

{#key store.today}
  <QuickRecord {store} date={store.today} />
{/key}

<section class="card" aria-label="今日紀錄區">
  <h2 class="section-title">今日紀錄</h2>
  <DayEntries {store} date={store.today} />
</section>
