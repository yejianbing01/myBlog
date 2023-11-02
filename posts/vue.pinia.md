---
title: 'pinia笔记'
date: '2023-11-01'
---


## 定义 Store
>vue3

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')
```
>vue2

```js
import { createPinia, PiniaVuePlugin } from 'pinia'

Vue.use(PiniaVuePlugin)
const pinia = createPinia()

new Vue({
    el: '#app',
    // 其他配置...
    // ...
    // 请注意，同一个`pinia'实例
    // 可以在同一个页面的多个 Vue 应用中使用。 
    pinia,
})
```
Store 是用 defineStore() 定义的:
- 第一个参数要求是一个独一无二的名字
- 的第二个参数可接受两类值：Setup 函数或 Option 对象


```js
import { defineStore } from 'pinia'

// 你可以对 `defineStore()` 的返回值进行任意命名，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。(比如 `useUserStore`，`useCartStore`，`useProductStore`)
// 第一个参数是你的应用中 Store 的唯一 ID。
export const useAlertsStore = defineStore('alerts', {
  // 其他配置...
})
```

- Option Store
    ```js
    export const useCounterStore = defineStore('counter', {
    state: () => ({ count: 0 }),
    getters: {
        double: (state) => state.count * 2,
    },
    actions: {
        increment() {
        this.count++
        },
    },
    })
    ```

- Setup Store
    ```js
    export const useCounterStore = defineStore('counter', () => {
    const count = ref(0)
    function increment() {
        count.value++
    }

    return { count, increment }
    })
    ```

## 使用 Store
store 是一个用 reactive 包装的对象，这意味着不需要在 getters 后面写 .value，就像 setup 中的 props 一样，如果你写了，我们也不能解构它
```js
<script setup>
const store = useCounterStore()
// ❌ 这将不起作用，因为它破坏了响应性
// 这就和直接解构 `props` 一样
const { name, doubleCount } = store 
name // 将始终是 "Eduardo" 
doubleCount // 将始终是 0 
setTimeout(() => {
  store.increment()
}, 1000)
// ✅ 这样写是响应式的
// 💡 当然你也可以直接使用 `store.doubleCount`
const doubleValue = computed(() => store.doubleCount)
</script>
```
- 为了从 store 中提取属性时保持其响应性，你需要使用 ***storeToRefs()***。它将为每一个响应式属性创建引用
- 可以直接从 store 中解构 action
    ```js
    <script setup>
    import { storeToRefs } from 'pinia'
    const store = useCounterStore()
    // `name` 和 `doubleCount` 是响应式的 ref
    // 同时通过插件添加的属性也会被提取为 ref
    // 并且会跳过所有的 action 或非响应式 (不是 ref 或 reactive) 的属性
    const { name, doubleCount } = storeToRefs(store)
    // 作为 action 的 increment 可以直接解构
    const { increment } = store
    </script>
    ```

## 插件
由于有了底层 API 的支持，Pinia store 现在完全支持扩展。以下是你可以扩展的内容：
- 为 store 添加新的属性
- 定义 store 时增加新的选项
- 为 store 增加新的方法
- 包装现有的方法
- 改变甚至取消 action
- 实现副作用，如本地存储
- 仅应用插件于特定 store

Pinia 插件是一个函数，可以选择性地返回要添加到 store 的属性。它接收一个可选参数，即 context
```js
export function myPiniaPlugin(context) {
  context.pinia // 用 `createPinia()` 创建的 pinia。 
  context.app // 用 `createApp()` 创建的当前应用(仅 Vue 3)。
  context.store // 该插件想扩展的 store
  context.options // 定义传给 `defineStore()` 的 store 的可选对象。
  // ...
}
```
然后用 pinia.use() 将这个函数传给 pinia：
```js
pinia.use(myPiniaPlugin)
```

### 添加新的选项

在定义 store 时，可以创建新的选项，以便在插件中使用它们。例如，你可以创建一个 debounce 选项，允许你让任何 action 实现防抖
```js
defineStore('search', {
  actions: {
    searchContacts() {
      // ...
    },
  },

  // 这将在后面被一个插件读取
  debounce: {
    // 让 action searchContacts 防抖 300ms
    searchContacts: 300,
  },
})
```
然后，该插件可以读取该选项来包装 action，并替换原始 action：
```js
// 使用任意防抖库
import debounce from 'lodash/debounce'

pinia.use(({ options, store }) => {
  if (options.debounce) {
    // 我们正在用新的 action 来覆盖这些 action
    return Object.keys(options.debounce).reduce((debouncedActions, action) => {
      debouncedActions[action] = debounce(
        store[action],
        options.debounce[action]
      )
      return debouncedActions
    }, {})
  }
})
```
注意，在使用 setup 语法时，自定义选项作为第 3 个参数传递：
```js
defineStore(
  'search',
  () => {
    // ...
  },
  {
    // 这将在后面被一个插件读取
    debounce: {
      // 让 action searchContacts 防抖 300ms
      searchContacts: 300,
    },
  }
)
```