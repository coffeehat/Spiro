import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Element-Plus
// import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// Current App
import Spiro from './Spiro.vue';

// Others
import { updateServerAddress, updateArticleReadCount } from './common/network';

export function mountSpiro(el_id: string, article_uuid: string, server_addr: string) {
  updateServerAddress(server_addr);
  createApp(Spiro, {"article_uuid": article_uuid})
    // .use(ElementPlus)
    .use(createPinia())
    .mount(el_id);
}

export function updateReadCount(el_id: string, article_uuid: string, article_link: string, article_name:string) {
  updateArticleReadCount(
    article_uuid,
    article_link,
    article_name,
    (count) => {
      let el = document.getElementById(el_id)
      if (el) {
        el.innerText = count.toString()
      }
    }
  )
}