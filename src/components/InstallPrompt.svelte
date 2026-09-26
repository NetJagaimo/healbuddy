<script>
  /** 教使用者把 App 加到主畫面；支援的瀏覽器直接一鍵安裝 */
  let { install, ondismiss = null } = $props();

  const steps = {
    'ios-safari': ['點 Safari 的「分享」按鈕（有些版本在「⋯」選單裡）', '往下找到「加入主畫面」', '點右上角「加入」'],
    'ios-other': ['點網址列旁的「分享」按鈕', '選「加入主畫面」', '點右上角「加入」'],
    android: ['點右上角的「⋮」選單', '選「安裝應用程式」或「加到主畫面」', '點「安裝」'],
    desktop: ['點網址列右側的「安裝」圖示，或瀏覽器選單中的「安裝 healbuddy」']
  };
</script>

{#if install.needed}
  <section class="card install" aria-label="安裝 App">
    <div class="head">
      <h2>把 healbuddy 加到主畫面</h2>
      {#if ondismiss}
        <button class="close" aria-label="不再顯示安裝提示" onclick={ondismiss}>✕</button>
      {/if}
    </div>
    <p class="why">像 App 一樣從主畫面打開，沒有網路也能用。</p>
    {#if install.deferred}
      <button class="primary" onclick={() => install.install()}>一鍵安裝</button>
    {:else}
      <ol>
        {#each steps[install.platform] as step}<li>{step}</li>{/each}
      </ol>
    {/if}
  </section>
{/if}

<style>
  .install {
    border: 1.5px solid var(--accent);
    background: var(--accent-soft);
  }
  .head {
    display: flex;
    align-items: flex-start;
  }
  h2 {
    flex: 1;
    font-size: 1rem;
    margin: 0;
  }
  .close {
    border: none;
    background: none;
    color: var(--muted);
    font-size: 1rem;
    padding: 0 0.2rem;
  }
  .why {
    margin: 0.35rem 0 0.5rem;
    color: var(--muted);
    font-size: 0.9rem;
  }
  ol {
    margin: 0;
    padding-left: 1.3rem;
    line-height: 1.7;
  }
  .primary {
    width: 100%;
    padding: 0.7rem;
    border: none;
    border-radius: 12px;
    background: var(--accent);
    color: #fff;
    font-size: 1rem;
    font-weight: 700;
  }
</style>
