import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { detectPlatform, InstallState } from '../../src/lib/install.svelte.js';
import InstallPrompt from '../../src/components/InstallPrompt.svelte';

const UA = {
  iphoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  iphoneChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0 Mobile/15E148 Safari/604.1',
  ipadDesktopMode: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
};

function fakeWindow({ ua = UA.android, standalone = false, maxTouchPoints = 0 } = {}) {
  const win = new EventTarget();
  win.navigator = { userAgent: ua, maxTouchPoints, standalone };
  win.matchMedia = () => ({ matches: standalone });
  return win;
}

function fakePromptEvent(outcome = 'accepted') {
  const e = new Event('beforeinstallprompt', { cancelable: true });
  e.prompt = vi.fn(async () => {});
  e.userChoice = Promise.resolve({ outcome });
  return e;
}

describe('detectPlatform', () => {
  it.each([
    [UA.iphoneSafari, 0, 'ios-safari'],
    [UA.iphoneChrome, 0, 'ios-other'],
    [UA.ipadDesktopMode, 5, 'ios-safari'],
    [UA.android, 0, 'android'],
    [UA.mac, 0, 'desktop']
  ])('%#', (ua, touch, expected) => {
    expect(detectPlatform(ua, touch)).toBe(expected);
  });
});

describe('InstallState', () => {
  it('已安裝（standalone）時不需要提示', () => {
    expect(new InstallState(fakeWindow({ standalone: true })).needed).toBe(false);
  });

  it('收到 beforeinstallprompt 後可一鍵安裝', async () => {
    const win = fakeWindow();
    const s = new InstallState(win);
    const e = fakePromptEvent('accepted');
    win.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
    expect(s.deferred).toBe(e);
    expect(await s.install()).toBe(true);
    expect(e.prompt).toHaveBeenCalled();
    expect(s.needed).toBe(false);
  });

  it('使用者取消安裝時，提示仍保留', async () => {
    const win = fakeWindow();
    const s = new InstallState(win);
    win.dispatchEvent(fakePromptEvent('dismissed'));
    expect(await s.install()).toBe(false);
    expect(s.needed).toBe(true);
  });

  it('appinstalled 後隱藏提示', () => {
    const win = fakeWindow();
    const s = new InstallState(win);
    win.dispatchEvent(new Event('appinstalled'));
    expect(s.needed).toBe(false);
  });
});

describe('InstallPrompt', () => {
  it('iPhone Safari 顯示加入主畫面步驟', () => {
    render(InstallPrompt, { install: new InstallState(fakeWindow({ ua: UA.iphoneSafari })) });
    expect(screen.getByText('往下找到「加入主畫面」')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '一鍵安裝' })).not.toBeInTheDocument();
  });

  it('iPhone Chrome 顯示網址列分享按鈕步驟', () => {
    render(InstallPrompt, { install: new InstallState(fakeWindow({ ua: UA.iphoneChrome })) });
    expect(screen.getByText('點網址列旁的「分享」按鈕')).toBeInTheDocument();
  });

  it('支援一鍵安裝時顯示按鈕', async () => {
    const win = fakeWindow();
    const install = new InstallState(win);
    render(InstallPrompt, { install });
    expect(screen.getByText('點右上角的「⋮」選單')).toBeInTheDocument();
    const e = fakePromptEvent();
    win.dispatchEvent(e);
    await userEvent.click(await screen.findByRole('button', { name: '一鍵安裝' }));
    expect(e.prompt).toHaveBeenCalled();
    expect(screen.queryByRole('region', { name: '安裝 App' })).not.toBeInTheDocument();
  });

  it('已安裝時不顯示', () => {
    render(InstallPrompt, { install: new InstallState(fakeWindow({ standalone: true })) });
    expect(screen.queryByRole('region', { name: '安裝 App' })).not.toBeInTheDocument();
  });
});
