import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Element-Plus
// import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// Current App
import Spiro from './Spiro.vue';

// Others
import { updateServerAddress } from './common/network';

export function mountSpiro(el_id: string, article_id: number, server_addr: string) {
  updateServerAddress(server_addr);
  createApp(Spiro, {"article_id": article_id})
    // .use(ElementPlus)
    .use(createPinia())
    .mount(el_id);
}
