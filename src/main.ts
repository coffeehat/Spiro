import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Element-Plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// Current App
import App from './App.vue';
import './style.css';

createApp(App)
  .use(ElementPlus)
  .use(createPinia())
  .mount('#app');
