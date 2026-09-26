import { mount } from 'svelte';
import App from './App.svelte';
import { AppStore } from './lib/store.svelte.js';
import './app.css';

const store = new AppStore();
store.init().then(() => navigator.storage?.persist?.());

mount(App, { target: document.getElementById('app'), props: { store } });
