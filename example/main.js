import {
  Fragment,
  Teleport,
  Text,
  computed,
  defineAsyncComponent,
  h,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
  render,
  watch,
} from '../build/output/vue-mini.es.js';

const app = document.querySelector('#app');
const lifecycleLog = document.querySelector('#lifecycle-log');

if (!app || !lifecycleLog) {
  throw new Error('示例页面缺少必要的挂载节点');
}

function addLog(message) {
  const item = document.createElement('li');
  item.textContent = message;
  lifecycleLog.appendChild(item);
}

const AsyncChild = defineAsyncComponent(
  () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        import('./async-child.js').then((module) => resolve(module.default), reject);
      }, 900);
    })
);

const CounterPanel = {
  props: ['count', 'double'],
  setup(props, { slots }) {
    onBeforeMount(() => addLog('CounterPanel：beforeMount'));
    onMounted(() => addLog('CounterPanel：mounted'));
    onUpdated(() => addLog(`CounterPanel：updated，count = ${props.count}`));
    onBeforeUnmount(() => addLog('CounterPanel：beforeUnmount'));
    onUnmounted(() => addLog('CounterPanel：unmounted'));

    return () =>
      h({
        type: 'section',
        props: { class: 'card counter-panel' },
        children: [
          h({ type: 'div', props: { class: 'card-title' }, children: '响应式与组件更新' }),
          h({
            type: 'p',
            props: { class: 'metric' },
            children: `count = ${props.count}，computed double = ${props.double}`,
          }),
          slots.default?.(),
        ],
      });
  },
};

const App = {
  setup() {
    const count = ref(0);
    const showCounter = ref(true);
    const double = computed(() => count.value * 2);

    watch(count, (value, oldValue) => {
      addLog(`watch：${oldValue} → ${value}`);
    });

    onBeforeMount(() => addLog('App：beforeMount'));
    onMounted(() => addLog('App：mounted'));
    onUpdated(() => addLog('App：updated'));

    return {
      count,
      double,
      showCounter,
      increment() {
        count.value += 1;
      },
      toggleCounter() {
        showCounter.value = !showCounter.value;
      },
    };
  },

  render() {
    const counterContent = this.showCounter
      ? h({
          type: CounterPanel,
          props: { count: this.count, double: this.double },
          children: {
            default: () =>
              h({
                type: 'div',
                props: { class: 'actions' },
                children: [
                  h({
                    type: 'button',
                    props: { onClick: this.increment },
                    children: 'count + 1',
                  }),
                  h({
                    type: 'span',
                    props: { class: this.count % 2 === 0 ? 'badge even' : 'badge odd' },
                    children: this.count % 2 === 0 ? '偶数' : '奇数',
                  }),
                ],
              }),
          },
        })
      : h({ type: 'p', props: { class: 'card muted' }, children: 'CounterPanel 已卸载' });

    return h({
      type: 'div',
      props: { class: 'page' },
      children: [
        h({ type: 'h1', children: 'MiniVue build 功能检查' }),
        h({
          type: Fragment,
          children: [
            h({
              type: Text,
              children: '该页面直接使用 build/output/vue-mini.es.js。',
            }),
            h({
              type: 'div',
              props: { class: 'toolbar' },
              children: [
                h({
                  type: 'button',
                  props: { onClick: this.toggleCounter },
                  children: this.showCounter ? '卸载计数组件' : '重新挂载计数组件',
                }),
              ],
            }),
          ],
        }),
        counterContent,
        h({
          type: 'section',
          props: { class: 'card' },
          children: [
            h({ type: 'div', props: { class: 'card-title' }, children: '动态 import 异步组件' }),
            h({
              type: AsyncChild,
              props: { message: `当前 count 为 ${this.count}` },
            }),
          ],
        }),
        h({
          type: Teleport,
          props: { to: '#teleport-target' },
          children: [
            h({
              type: 'strong',
              props: { class: 'teleported' },
              children: `我由 App 渲染，但被传送到这里；count = ${this.count}`,
            }),
          ],
        }),
      ],
    });
  },
};

render(h({ type: App }), app);
