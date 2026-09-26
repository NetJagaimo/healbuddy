<script>
  /** 可復原提示，約 5 秒後消失（見 docs/entities/復原提示.md） */
  let { store, duration = 5000 } = $props();

  $effect(() => {
    const t = store.toast;
    if (!t) return;
    const timer = setTimeout(() => store.dismissToast(t.id), duration);
    return () => clearTimeout(timer);
  });
</script>

{#if store.toast}
  <div class="toast" role="status">
    <span>{store.toast.message}</span>
    {#if store.toast.undo}
      <button onclick={() => store.undo()}>復原</button>
    {/if}
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: calc(var(--nav-h) + 12px + env(safe-area-inset-bottom));
    width: min(92vw, 420px);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--ink);
    color: var(--bg);
    padding: 0.7rem 0.9rem;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgb(0 0 0 / 0.2);
    z-index: 30;
  }
  span {
    flex: 1;
  }
  button {
    border: none;
    background: none;
    color: var(--accent);
    font-weight: 700;
    font-size: 1rem;
  }
</style>
