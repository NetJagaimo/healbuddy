import { mount } from 'svelte';
import App from './App.svelte';
import { AppStore } from './lib/store.svelte.js';
import { InstallState } from './lib/install.svelte.js';
import './app.css';

const store = new AppStore();
// 盡早建立，才接得到啟動時就觸發的 beforeinstallprompt
const install = new InstallState();
store.init().then(() => navigator.storage?.persist?.());

mount(App, { target: document.getElementById('app'), props: { store, install } });
