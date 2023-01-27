import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Element-Plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// Current App
import Spiro from './Spiro.vue';
import './style.css';

createApp(Spiro)
  .use(ElementPlus)
  .use(createPinia())
  .mount('#app');
