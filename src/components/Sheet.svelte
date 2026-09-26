<script>
  /** 從底部滑出的面板 */
  let { title, onclose, children } = $props();
</script>

<div class="backdrop" onclick={onclose} aria-hidden="true"></div>
<div class="sheet" role="dialog" aria-modal="true" aria-label={title}>
  <header>
    <h2>{title}</h2>
    <button class="close" aria-label="關閉" onclick={onclose}>✕</button>
  </header>
  {@render children()}
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.3);
    z-index: 20;
  }
  .sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: 85vh;
    overflow-y: auto;
    background: var(--bg);
    border-radius: 18px 18px 0 0;
    padding: 1rem 1rem calc(var(--nav-h) + 1rem + env(safe-area-inset-bottom));
    z-index: 21;
    animation: up 0.2s ease-out;
  }
  header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  h2 {
    flex: 1;
    margin: 0;
    font-size: 1.1rem;
  }
  .close {
    border: none;
    background: none;
    font-size: 1.1rem;
    color: var(--muted);
  }
  @keyframes up {
    from {
      transform: translateY(100%);
    }
  }
</style>
