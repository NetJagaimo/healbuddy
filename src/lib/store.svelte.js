import { openAppDB, loadAll, replaceAll, validateImport, EXPORT_VERSION } from './db.js';
import { todayISO, timeHM } from './date.js';

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
const checkId = (date, typeId) => `${date}|${typeId}`;
const clone = (o) => ({ ...o });

/**
 * App 狀態：資料量小，全部載入記憶體，每個操作同步寫回 IndexedDB。
 * 每個操作都會設定 toast，並提供復原（見 docs/entities/復原提示.md）。
 */
export class AppStore {
  foods = $state([]);
  intakes = $state([]);
  exerciseTypes = $state([]);
  exerciseChecks = $state([]);
  today = $state(todayISO());
  toast = $state(null);
  ready = $state(false);

  #db;
  #now;
  #toastSeq = 0;

  constructor({ now = () => new Date() } = {}) {
    this.#now = now;
    this.today = todayISO(now());
  }

  async init(dbName) {
    this.#db = await openAppDB(dbName);
    await this.#reload();
    this.ready = true;
    return this;
  }

  async #reload() {
    const data = await loadAll(this.#db);
    this.foods = data.foods;
    this.intakes = data.intakes;
    this.exerciseTypes = data.exerciseTypes.sort((a, b) => a.order - b.order);
    this.exerciseChecks = data.exerciseChecks;
  }

  refreshToday() {
    const t = todayISO(this.#now());
    if (t !== this.today) this.today = t;
  }

  #notify(message, undo) {
    this.toast = { id: ++this.#toastSeq, message, undo };
  }

  async undo() {
    const t = this.toast;
    if (!t?.undo) return;
    this.toast = null;
    await t.undo();
  }

  dismissToast(id) {
    if (this.toast?.id === id) this.toast = null;
  }

  // ---- 多吃紀錄 ----

  async recordIntake(date, food) {
    const now = this.#now();
    const entry = {
      id: uid(),
      date,
      foodItemId: food.id,
      name: food.name,
      // 補登的紀錄不記時間（見 docs/entities/補登紀錄.md）
      time: date === this.today ? timeHM(now) : null,
      createdAt: now.getTime()
    };
    this.intakes.push(entry);
    await this.#db.put('intakes', clone(entry));
    this.#notify(`已記錄 ${food.name}`, () => this.#removeIntake(entry.id));
    return entry;
  }

  async #removeIntake(id) {
    this.intakes = this.intakes.filter((e) => e.id !== id);
    await this.#db.delete('intakes', id);
  }

  async deleteIntake(id) {
    const entry = this.intakes.find((e) => e.id === id);
    if (!entry) return;
    const saved = clone(entry);
    await this.#removeIntake(id);
    this.#notify(`已刪除 ${saved.name}`, async () => {
      this.intakes.push(saved);
      await this.#db.put('intakes', clone(saved));
    });
  }

  // ---- 運動打卡 ----

  isChecked(date, typeId) {
    return this.exerciseChecks.some((c) => c.id === checkId(date, typeId));
  }

  async #addCheck(check) {
    this.exerciseChecks.push(check);
    await this.#db.put('exerciseChecks', clone(check));
  }

  async #removeCheck(id) {
    this.exerciseChecks = this.exerciseChecks.filter((c) => c.id !== id);
    await this.#db.delete('exerciseChecks', id);
  }

  async toggleExercise(date, type) {
    const id = checkId(date, type.id);
    const existing = this.exerciseChecks.find((c) => c.id === id);
    if (existing) {
      const saved = clone(existing);
      await this.#removeCheck(id);
      this.#notify(`已取消 ${saved.emoji} ${saved.name}`, () => this.#addCheck(saved));
      return false;
    }
    const check = {
      id,
      date,
      exerciseTypeId: type.id,
      name: type.name,
      emoji: type.emoji,
      createdAt: this.#now().getTime()
    };
    await this.#addCheck(check);
    this.#notify(`已記錄 ${type.emoji} ${type.name}`, () => this.#removeCheck(id));
    return true;
  }

  async deleteCheck(id) {
    const existing = this.exerciseChecks.find((c) => c.id === id);
    if (!existing) return;
    const saved = clone(existing);
    await this.#removeCheck(id);
    this.#notify(`已刪除 ${saved.emoji} ${saved.name}`, () => this.#addCheck(saved));
  }

  // ---- 食物品項 ----

  #validName(name, list, exceptId) {
    const n = name.trim();
    if (!n) throw new Error('請輸入名稱');
    if (list.some((x) => x.id !== exceptId && x.name === n)) throw new Error('已經有這個名稱了');
    return n;
  }

  async addFood(name) {
    const food = { id: uid(), name: this.#validName(name, this.foods), createdAt: this.#now().getTime() };
    this.foods.push(food);
    await this.#db.put('foods', clone(food));
    return food;
  }

  async renameFood(id, name) {
    const food = this.foods.find((f) => f.id === id);
    food.name = this.#validName(name, this.foods, id);
    await this.#db.put('foods', clone(food));
  }

  async deleteFood(id) {
    const food = this.foods.find((f) => f.id === id);
    if (!food) return;
    const saved = clone(food);
    this.foods = this.foods.filter((f) => f.id !== id);
    await this.#db.delete('foods', id);
    this.#notify(`已刪除品項 ${saved.name}`, async () => {
      this.foods.push(saved);
      await this.#db.put('foods', clone(saved));
    });
  }

  // ---- 運動項目（見 docs/entities/運動項目管理.md）----

  #validEmoji(emoji) {
    const e = emoji.trim();
    if (!e) throw new Error('請輸入 emoji');
    return e;
  }

  async addExerciseType(name, emoji) {
    const type = {
      id: uid(),
      name: this.#validName(name, this.exerciseTypes),
      emoji: this.#validEmoji(emoji),
      order: Math.max(-1, ...this.exerciseTypes.map((t) => t.order)) + 1
    };
    this.exerciseTypes.push(type);
    await this.#db.put('exerciseTypes', clone(type));
    return type;
  }

  async updateExerciseType(id, { name, emoji }) {
    const type = this.exerciseTypes.find((t) => t.id === id);
    type.name = this.#validName(name, this.exerciseTypes, id);
    type.emoji = this.#validEmoji(emoji);
    await this.#db.put('exerciseTypes', clone(type));
  }

  async deleteExerciseType(id) {
    const type = this.exerciseTypes.find((t) => t.id === id);
    if (!type) return;
    const saved = clone(type);
    this.exerciseTypes = this.exerciseTypes.filter((t) => t.id !== id);
    await this.#db.delete('exerciseTypes', id);
    this.#notify(`已刪除運動 ${saved.emoji} ${saved.name}`, async () => {
      this.exerciseTypes = [...this.exerciseTypes, saved].sort((a, b) => a.order - b.order);
      await this.#db.put('exerciseTypes', clone(saved));
    });
  }

  // ---- 備份 ----

  exportData() {
    return {
      app: 'healbuddy',
      version: EXPORT_VERSION,
      exportedAt: this.#now().toISOString(),
      foods: $state.snapshot(this.foods),
      intakes: $state.snapshot(this.intakes),
      exerciseTypes: $state.snapshot(this.exerciseTypes),
      exerciseChecks: $state.snapshot(this.exerciseChecks)
    };
  }

  async importData(data) {
    await replaceAll(this.#db, validateImport(data));
    await this.#reload();
    this.toast = null;
  }
}
