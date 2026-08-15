import { h } from '../build/output/vue-mini.es.js';

export default {
  props: ['message'],
  render() {
    return h({
      type: 'div',
      props: { class: 'async-success' },
      children: `异步组件加载成功：${this.message}`,
    });
  },
};
