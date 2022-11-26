import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';

// marked settings

marked.setOptions({
  gfm: true,
  breaks: true
});

// markedKatex settings

const options = {
  throwOnError: false,
  displayMode: true
};
marked.use(markedKatex(options));

export { marked } from 'marked';