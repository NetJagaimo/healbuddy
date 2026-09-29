<script>
  import InstallPrompt from '../components/InstallPrompt.svelte';

  let { store, install } = $props();

  let newFood = $state('');
  let newExName = $state('');
  let newExEmoji = $state('');
  let editing = $state(null); // { kind, id, name, emoji }
  let error = $state('');
  let fileInput;

  async function run(fn) {
    error = '';
    try {
      await fn();
      return true;
    } catch (e) {
      error = e.message;
      return false;
    }
  }

  // 先清空輸入框再寫入，避免寫入期間使用者接著輸入的內容被清掉；失敗時放回原文字
  async function addFood(e) {
    e.preventDefault();
    const name = newFood;
    newFood = '';
    if (!(await run(() => store.addFood(name)))) newFood = name;
  }

  async function addExercise(e) {
    e.preventDefault();
    const [name, emoji] = [newExName, newExEmoji];
    newExName = '';
    newExEmoji = '';
    if (!(await run(() => store.addExerciseType(name, emoji)))) {
      newExName = name;
      newExEmoji = emoji;
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    const ed = editing;
    const ok = await run(() =>
      ed.kind === 'food'
        ? store.renameFood(ed.id, ed.name)
        : store.updateExerciseType(ed.id, { name: ed.name, emoji: ed.emoji })
    );
    if (ok) editing = null;
  }

  function exportBackup() {
    const data = store.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `healbuddy-${store.today}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importBackup(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!confirm('匯入會取代目前所有資料，確定嗎？')) return;
    await run(async () => store.importData(JSON.parse(await file.text())));
  }
</script>

{#if error}<p class="error" role="alert">{error}</p>{/if}

<section class="card" aria-label="食物品項">
  <h2 class="section-title">食物</h2>
  <ul>
    {#each store.foods as food (food.id)}
      <li>
        {#if editing?.kind === 'food' && editing.id === food.id}
          <form onsubmit={saveEdit}>
            <input aria-label="品項名稱" bind:value={editing.name} />
            <button type="submit">儲存</button>
            <button type="button" onclick={() => (editing = null)}>取消</button>
          </form>
        {:else}
          <span class="name">{food.name}</span>
          <button aria-label={`編輯 ${food.name}`} onclick={() => (editing = { kind: 'food', id: food.id, name: food.name })}>✎</button>
          <button aria-label={`刪除品項 ${food.name}`} onclick={() => store.deleteFood(food.id)}>🗑</button>
        {/if}
      </li>
    {/each}
  </ul>
  <form class="add" onsubmit={addFood}>
    <input aria-label="新品項名稱" placeholder="名稱，例如：珍奶" bind:value={newFood} />
    <button type="submit">新增</button>
  </form>
</section>

<section class="card" aria-label="運動項目">
  <h2 class="section-title">運動</h2>
  <ul>
    {#each store.exerciseTypes as type (type.id)}
      <li>
        {#if editing?.kind === 'exercise' && editing.id === type.id}
          <form onsubmit={saveEdit}>
            <input class="emoji" aria-label="運動 emoji" bind:value={editing.emoji} />
            <input aria-label="運動名稱" bind:value={editing.name} />
            <button type="submit">儲存</button>
            <button type="button" onclick={() => (editing = null)}>取消</button>
          </form>
        {:else}
          <span class="name">{type.emoji} {type.name}</span>
          <button
            aria-label={`編輯 ${type.name}`}
            onclick={() => (editing = { kind: 'exercise', id: type.id, name: type.name, emoji: type.emoji })}>✎</button
          >
          <button aria-label={`刪除運動 ${type.name}`} onclick={() => store.deleteExerciseType(type.id)}>🗑</button>
        {/if}
      </li>
    {/each}
  </ul>
  <form class="add" onsubmit={addExercise}>
    <input class="emoji" aria-label="新運動 emoji" placeholder="😀" bind:value={newExEmoji} />
    <input aria-label="新運動名稱" placeholder="名稱，例如：騎車" bind:value={newExName} />
    <button type="submit">新增</button>
  </form>
</section>

{#if install}<InstallPrompt {install} />{/if}

<section class="card" aria-label="備份">
  <h2 class="section-title">備份</h2>
  <div class="backup">
    <button onclick={exportBackup}>匯出備份</button>
    <button onclick={() => fileInput.click()}>匯入備份</button>
    <input
      bind:this={fileInput}
      type="file"
      accept="application/json,.json"
      aria-label="選擇備份檔"
      hidden
      onchange={importBackup}
    />
  </div>
</section>

<style>
  ul {
    list-style: none;
    margin: 0 0 0.6rem;
    padding: 0;
  }
  li {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    border-bottom: 1px solid var(--line);
    padding: 0.35rem 0;
  }
  li > button {
    border: none;
    background: none;
    font-size: 1rem;
    padding: 0.3rem 0.5rem;
    color: var(--muted);
  }
  .name {
    flex: 1;
  }
  form {
    display: flex;
    gap: 0.4rem;
    flex: 1;
    /* 讓編輯列能縮到比輸入框預設寬度還窄，否則窄螢幕上儲存／取消會被推出畫面外 */
    min-width: 0;
  }
  input {
    flex: 1;
    min-width: 0;
    padding: 0.55rem 0.7rem;
    border: 1.5px solid var(--line);
    border-radius: 10px;
    font-size: 1rem;
    background: var(--surface);
    color: var(--ink);
  }
  input.emoji {
    flex: 0 0 3.2rem;
    text-align: center;
  }
  form button,
  .backup button {
    border: 1.5px solid var(--accent);
    background: var(--accent-soft);
    border-radius: 10px;
    padding: 0.5rem 0.8rem;
    font-size: 0.95rem;
    white-space: nowrap;
  }
  .backup {
    display: flex;
    gap: 0.5rem;
  }
  .backup button {
    flex: 1;
  }
  .error {
    background: #fde2e1;
    color: #8a1f17;
    padding: 0.6rem 0.8rem;
    border-radius: 10px;
  }
</style>
