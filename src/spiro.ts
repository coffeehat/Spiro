import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Element-Plus
// import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// Current App
import Spiro from './Spiro.vue';

// Others
import { updateArticleReadCount, getArticleReadCount } from './common/network';
import { goToAnchorIfValid } from './common/utils';
import { SpiroConfig } from './config';
export { SpiroConfig };

export function mountSpiro(el_id: string) {
  createApp(Spiro)
    // .use(ElementPlus)
    .use(createPinia())
    .mount("#" + el_id);
  goToAnchorIfValid();
}

export function updateReadCount(el_id: string, article_uuid: string, ) {
  let update_count_on_page = (count: number) => {
    let el = document.getElementById(el_id)
    if (el) {
      el.innerText = count.toString()
    }
  };
  getArticleReadCount(
    SpiroConfig.article_uuid,
    SpiroConfig.readcountinfo.article_link,
    SpiroConfig.readcountinfo.article_name,
    update_count_on_page
  );
  
  let update_read_count = () => updateArticleReadCount(
    SpiroConfig.article_uuid,
    SpiroConfig.readcountinfo.article_link,
    SpiroConfig.readcountinfo.article_name,
    update_count_on_page
  )
  setTimeout(update_read_count, SpiroConfig.readcountinfo.update_delay_ms);
}