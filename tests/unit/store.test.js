import { describe, it, expect, beforeEach } from 'vitest';
import { AppStore } from '../../src/lib/store.svelte.js';
import { DEFAULT_EXERCISES } from '../../src/lib/db.js';

let n = 0;
let clock;
const setNow = (d) => (clock = d);

async function makeStore(dbName = `test-${++n}`) {
  const store = new AppStore({ now: () => clock });
  return store.init(dbName);
}

beforeEach(() => setNow(new Date(2026, 8, 26, 15, 20)));

describe('初始化', () => {
  it('第一次開啟會寫入 4 個預設運動項目', async () => {
    const s = await makeStore();
    expect(s.exerciseTypes.map((t) => t.name)).toEqual(DEFAULT_EXERCISES.map((t) => t.name));
    expect(s.foods).toEqual([]);
  });
});

describe('多吃紀錄', () => {
  it('今天的紀錄帶時間；補登的紀錄不帶時間', async () => {
    const s = await makeStore();
    const food = await s.addFood('珍奶');
    const a = await s.recordIntake('2026-09-26', food);
    const b = await s.recordIntake('2026-09-20', food);
    expect(a.time).toBe('15:20');
    expect(b.time).toBeNull();
    expect(s.intakes).toHaveLength(2);
  });

  it('同一品項可記多次', async () => {
    const s = await makeStore();
    const food = await s.addFood('珍奶');
    await s.recordIntake(s.today, food);
    await s.recordIntake(s.today, food);
    expect(s.intakes).toHaveLength(2);
  });

  it('記錄後可復原', async () => {
    const s = await makeStore();
    const food = await s.addFood('珍奶');
    await s.recordIntake(s.today, food);
    expect(s.toast.message).toBe('已記錄 珍奶');
    await s.undo();
    expect(s.intakes).toHaveLength(0);
    expect(s.toast).toBeNull();
  });

  it('刪除後可復原', async () => {
    const s = await makeStore();
    const food = await s.addFood('珍奶');
    const entry = await s.recordIntake(s.today, food);
    await s.deleteIntake(entry.id);
    expect(s.intakes).toHaveLength(0);
    expect(s.toast.message).toBe('已刪除 珍奶');
    await s.undo();
    expect(s.intakes.map((e) => e.id)).toEqual([entry.id]);
  });

  it('只能復原最近一次操作', async () => {
    const s = await makeStore();
    const food = await s.addFood('珍奶');
    await s.recordIntake(s.today, food);
    await s.recordIntake(s.today, food);
    await s.undo();
    await s.undo(); // 沒有可復原的操作了
    expect(s.intakes).toHaveLength(1);
  });

  it('品項改名或刪除不影響舊紀錄', async () => {
    const s = await makeStore();
    const food = await s.addFood('珍奶');
    await s.recordIntake(s.today, food);
    await s.renameFood(food.id, '珍珠奶茶');
    await s.deleteFood(food.id);
    expect(s.intakes[0].name).toBe('珍奶');
  });
});

describe('運動打卡', () => {
  it('同日多項各記一筆；再按一次取消', async () => {
    const s = await makeStore();
    const [gym, , walk] = s.exerciseTypes;
    await s.toggleExercise(s.today, gym);
    await s.toggleExercise(s.today, walk);
    expect(s.exerciseChecks).toHaveLength(2);
    expect(s.isChecked(s.today, gym.id)).toBe(true);
    await s.toggleExercise(s.today, gym);
    expect(s.isChecked(s.today, gym.id)).toBe(false);
    expect(s.toast.message).toBe('已取消 🏋 健身房');
    await s.undo();
    expect(s.isChecked(s.today, gym.id)).toBe(true);
  });

  it('不同日期各自獨立', async () => {
    const s = await makeStore();
    const gym = s.exerciseTypes[0];
    await s.toggleExercise('2026-09-25', gym);
    expect(s.isChecked('2026-09-25', gym.id)).toBe(true);
    expect(s.isChecked('2026-09-26', gym.id)).toBe(false);
  });

  it('刪除打卡後可復原', async () => {
    const s = await makeStore();
    const gym = s.exerciseTypes[0];
    await s.toggleExercise(s.today, gym);
    await s.deleteCheck(s.exerciseChecks[0].id);
    expect(s.exerciseChecks).toHaveLength(0);
    await s.undo();
    expect(s.exerciseChecks).toHaveLength(1);
  });
});

describe('品項與運動項目管理', () => {
  it('名稱不可空白或重複', async () => {
    const s = await makeStore();
    await s.addFood('珍奶');
    await expect(s.addFood('  ')).rejects.toThrow('請輸入名稱');
    await expect(s.addFood('珍奶')).rejects.toThrow('已經有這個名稱了');
  });

  it('新增、修改、刪除運動項目；舊紀錄保留原本的 emoji', async () => {
    const s = await makeStore();
    const bike = await s.addExerciseType('騎車', '🚴');
    expect(s.exerciseTypes.at(-1).name).toBe('騎車');
    await s.toggleExercise(s.today, bike);
    await s.updateExerciseType(bike.id, { name: '單車', emoji: '🚲' });
    expect(s.exerciseTypes.at(-1)).toMatchObject({ name: '單車', emoji: '🚲' });
    await s.deleteExerciseType(bike.id);
    expect(s.exerciseTypes.find((t) => t.id === bike.id)).toBeUndefined();
    expect(s.exerciseChecks[0]).toMatchObject({ name: '騎車', emoji: '🚴' });
    await s.undo();
    expect(s.exerciseTypes.at(-1).name).toBe('單車');
  });

  it('運動項目必須有 emoji', async () => {
    const s = await makeStore();
    await expect(s.addExerciseType('騎車', ' ')).rejects.toThrow('請輸入 emoji');
  });
});

describe('資料保存與備份', () => {
  it('重新開啟後資料仍在', async () => {
    const s = await makeStore('persist');
    const food = await s.addFood('珍奶');
    await s.recordIntake(s.today, food);
    await s.toggleExercise(s.today, s.exerciseTypes[0]);

    const again = await makeStore('persist');
    expect(again.foods.map((f) => f.name)).toEqual(['珍奶']);
    expect(again.intakes).toHaveLength(1);
    expect(again.exerciseChecks).toHaveLength(1);
  });

  it('匯出再匯入資料一致', async () => {
    const s = await makeStore();
    const food = await s.addFood('珍奶');
    await s.recordIntake(s.today, food);
    await s.addExerciseType('騎車', '🚴');
    await s.toggleExercise(s.today, s.exerciseTypes[0]);
    const backup = JSON.parse(JSON.stringify(s.exportData()));

    const other = await makeStore();
    await other.addFood('會被取代');
    await other.importData(backup);
    const again = other.exportData();
    for (const key of ['foods', 'intakes', 'exerciseTypes', 'exerciseChecks']) {
      expect(again[key]).toEqual(backup[key]);
    }
  });

  it('拒絕不是 healbuddy 的檔案', async () => {
    const s = await makeStore();
    await expect(s.importData({ foo: 1 })).rejects.toThrow('這不是 healbuddy 的備份檔');
  });
});

describe('午夜換日', () => {
  it('跨過午夜後 today 更新', async () => {
    setNow(new Date(2026, 8, 26, 23, 59));
    const s = await makeStore();
    expect(s.today).toBe('2026-09-26');
    setNow(new Date(2026, 8, 27, 0, 0));
    s.refreshToday();
    expect(s.today).toBe('2026-09-27');
  });
});
