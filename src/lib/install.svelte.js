// PWA 安裝提示（見 docs/entities/PWA安裝提示.md）

/** 依 userAgent 判斷該顯示哪一種安裝方式 */
export function detectPlatform(ua, maxTouchPoints = 0) {
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1);
  if (ios) return /CriOS|FxiOS|EdgiOS/.test(ua) ? 'ios-other' : 'ios-safari';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

export class InstallState {
  /** Chrome / Edge 的 beforeinstallprompt 事件；有它就能一鍵安裝 */
  deferred = $state(null);
  installed = $state(false);
  standalone;
  platform;

  constructor(win = window) {
    this.standalone =
      win.matchMedia?.('(display-mode: standalone)').matches || win.navigator.standalone === true;
    this.platform = detectPlatform(win.navigator.userAgent, win.navigator.maxTouchPoints);
    win.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferred = e;
    });
    win.addEventListener('appinstalled', () => {
      this.installed = true;
      this.deferred = null;
    });
  }

  get needed() {
    return !this.standalone && !this.installed;
  }

  async install() {
    const e = this.deferred;
    if (!e) return false;
    this.deferred = null;
    await e.prompt();
    const { outcome } = await e.userChoice;
    if (outcome === 'accepted') this.installed = true;
    return outcome === 'accepted';
  }
}
