<script>
  import QuickRecord from '../components/QuickRecord.svelte';
  import DayEntries from '../components/DayEntries.svelte';
  import InstallPrompt from '../components/InstallPrompt.svelte';
  import { formatDay } from '../lib/date.js';

  let { store, install } = $props();

  // 首頁的安裝提示關掉後就不再出現（品項頁仍保留）；只存在這支手機的瀏覽器
  const KEY = 'healbuddy.installBannerDismissed';
  let dismissed = $state(readDismissed());
  function readDismissed() {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  }
  function dismiss() {
    dismissed = true;
    try {
      localStorage.setItem(KEY, '1');
    } catch {}
  }
</script>

<header class="page-head">
  <h1>{formatDay(store.today)}</h1>
</header>

{#if install && !dismissed}
  <InstallPrompt {install} ondismiss={dismiss} />
{/if}

{#key store.today}
  <QuickRecord {store} date={store.today} />
{/key}

<section class="card" aria-label="今日紀錄區">
  <h2 class="section-title">今日紀錄</h2>
  <DayEntries {store} date={store.today} />
</section>
