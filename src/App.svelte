<script>
  import { onMount } from 'svelte';
  import TodayPage from './pages/TodayPage.svelte';
  import RecordsPage from './pages/RecordsPage.svelte';
  import ItemsPage from './pages/ItemsPage.svelte';
  import Toast from './components/Toast.svelte';

  let { store } = $props();

  // hash 路由，避免 GitHub Pages 深層路徑 404（見 docs/entities/github.io架站.md）
  const TABS = [
    ['today', '今日'],
    ['records', '紀錄'],
    ['items', '品項']
  ];
  const fromHash = () => {
    const h = location.hash.replace('#/', '');
    return TABS.some(([k]) => k === h) ? h : 'today';
  };
  let tab = $state(fromHash());

  onMount(() => {
    const onHash = () => (tab = fromHash());
    // App 開著跨過午夜時，「今天」自動切到新的一天
    const tick = () => store.refreshToday();
    const timer = setInterval(tick, 30_000);
    addEventListener('hashchange', onHash);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      removeEventListener('hashchange', onHash);
      document.removeEventListener('visibilitychange', tick);
    };
  });

  function go(key) {
    tab = key;
    history.replaceState(null, '', `#/${key}`);
    scrollTo(0, 0);
  }
</script>

<main>
  {#if !store.ready}
    <p class="loading">載入中…</p>
  {:else if tab === 'today'}
    <TodayPage {store} />
  {:else if tab === 'records'}
    <RecordsPage {store} />
  {:else}
    <ItemsPage {store} />
  {/if}
</main>

<Toast {store} />

<nav aria-label="主選單">
  {#each TABS as [key, label]}
    <button aria-current={tab === key ? 'page' : undefined} onclick={() => go(key)}>{label}</button>
  {/each}
</nav>

<style>
  main {
    max-width: 520px;
    margin: 0 auto;
    padding: calc(0.75rem + env(safe-area-inset-top)) 16px calc(var(--nav-h) + 5rem);
  }
  nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    height: calc(var(--nav-h) + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: var(--surface);
    border-top: 1px solid var(--line);
    z-index: 10;
  }
  nav button {
    flex: 1;
    border: none;
    background: none;
    font-size: 1rem;
    color: var(--muted);
  }
  nav button[aria-current='page'] {
    color: var(--accent-ink);
    font-weight: 700;
  }
  .loading {
    color: var(--muted);
    text-align: center;
    margin-top: 3rem;
  }
</style>
