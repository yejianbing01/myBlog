---
title: 'vue-router笔记'
date: '2023-10-31'
---

## 组件
- router-link
类似 a 标签，导航链接
- router-view
router-view 是 路由出口， 将显示与 url 对应的组件。你可以把它放在任何地方，以适应你的布局。

## 导航守卫
> 完整的导航解析流程
1. 导航被触发。
1. 在失活的组件里调用 beforeRouteLeave 守卫。
1. 调用全局的 beforeEach 守卫。
1. 在重用的组件里调用 beforeRouteUpdate 守卫(2.2+)。
1. 在路由配置里调用 beforeEnter。
1. 解析异步路由组件。
1. 在被激活的组件里调用 beforeRouteEnter。
1. 调用全局的 beforeResolve 守卫(2.5+)。
1. 导航被确认。
1. 调用全局的 afterEach 钩子。
1. 触发 DOM 更新。
1. 调用 beforeRouteEnter 守卫中传给 next 的回调函数，创建好的组件实例会作为回调函数的参数传入。

### 全局前置守卫 router.beforeEach
当一个导航触发时，全局前置守卫按照创建顺序调用。守卫是异步解析执行，此时导航在所有守卫 resolve 完之前一直处于等待中
```js
const router = createRouter({ ... })
// to: 即将要进入的目标
// from: 当前导航正要离开的路由
router.beforeEach((to, from) => {
    // 返回 false 以取消导航
    return false
})
```

可选的第三个参数 next
```js
// GOOD
router.beforeEach((to, from, next) => {
    if (to.name !== 'Login' && !isAuthenticated) next({ name: 'Login' })
    else next()
})
```
### 全局解析守卫 router.beforeResolve
解析守卫刚好会在导航被确认之前、所有组件内守卫和异步路由组件被解析之后调用
```js
router.beforeResolve(async to => {
if (to.meta.requiresCamera) {
    try {
    await askForCameraPermission()
    } catch (error) {
    if (error instanceof NotAllowedError) {
        // ... 处理错误，然后取消导航
        return false
    } else {
        // 意料之外的错误，取消导航并把错误传给全局处理器
        throw error
    }
    }
}
})
```
### 全局后置钩子 router.afterEach
    ```js
    router.afterEach((to, from, failure) => {
    if (!failure) sendToAnalytics(to.fullPath)
    })
    ```
### 路由独享的守卫 beforeEnter
可以直接在路由配置上定义。
beforeEnter 守卫 只在进入路由时触发，不会在 params、query 或 hash 改变时触发
```js
const routes = [
{
    path: '/users/:id',
    component: UserDetails,
    beforeEnter: (to, from) => {
    // reject the navigation
    return false
    },
},
]
```

也可以将一个函数数组传递给 beforeEnter，这在为不同的路由重用守卫时很有用

```js
function removeQueryParams(to) {
if (Object.keys(to.query).length)
    return { path: to.path, query: {}, hash: to.hash }
}

function removeHash(to) {
if (to.hash) return { path: to.path, query: to.query, hash: '' }
}

const routes = [
{
    path: '/users/:id',
    component: UserDetails,
    beforeEnter: [removeQueryParams, removeHash],
},
{
    path: '/about',
    component: UserDetails,
    beforeEnter: [removeQueryParams],
},
]
```

### 组件内的守卫
- beforeRouteEnter
- beforeRouteUpdate
- beforeRouteLeave
```js
const UserDetails = {
    template: `...`,
    beforeRouteEnter(to, from) {
        // 在渲染该组件的对应路由被验证前调用
        // 不能获取组件实例 `this` ！
        // 因为当守卫执行时，组件实例还没被创建！
    },
    beforeRouteUpdate(to, from) {
        // 在当前路由改变，但是该组件被复用时调用
        // 举例来说，对于一个带有动态参数的路径 `/users/:id`，在 `/users/1` 和 `/users/2` 之间跳转的时候，
        // 由于会渲染同样的 `UserDetails` 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
        // 因为在这种情况发生的时候，组件已经挂载好了，导航守卫可以访问组件实例 `this`
    },
    beforeRouteLeave(to, from) {
        // 在导航离开渲染该组件的对应路由时调用
        // 与 `beforeRouteUpdate` 一样，它可以访问组件实例 `this`
    },
}
```

## 路由元信息 meta

```js
const routes = [
  {
    path: '/posts',
    component: PostsLayout,
    children: [
      {
        path: 'new',
        component: PostsNew,
        // 只有经过身份验证的用户才能创建帖子
        meta: { requiresAuth: true }
      },
      {
        path: ':id',
        component: PostsDetail
        // 任何人都可以阅读文章
        meta: { requiresAuth: false }
      }
    ]
  }
]
```
我们需要遍历这个数组来检查路由记录中的 meta 字段，但是 Vue Router 还为你提供了一个 $route.meta 方法，它是一个非递归合并所有 meta 字段的（从父字段到子字段）的方法。这意味着你可以简单地写
```js
router.beforeEach((to, from) => {
  // 而不是去检查每条路由记录
  // to.matched.some(record => record.meta.requiresAuth)
  if (to.meta.requiresAuth && !auth.isLoggedIn()) {
    // 此路由需要授权，请检查是否已登录
    // 如果没有，则重定向到登录页面
    return {
      path: '/login',
      // 保存我们所在的位置，以便以后再来
      query: { redirect: to.fullPath },
    }
  }
})
```

可以通过扩展 RouteMeta 接口来输入 meta 字段
```ts
// typings.d.ts or router.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    // 是可选的
    isAdmin?: boolean
    // 每个路由都必须声明
    requiresAuth: boolean
  }
}
```

## 组合式 API useRouter 和 useRoute
```js
import { useRouter, useRoute } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()

    function pushWithQuery(query) {
      router.push({
        name: 'search',
        query: {
          ...route.query,
          ...query,
        },
      })
    }
  },
}
```
- route 对象是一个响应式对象，所以它的任何属性都可以被监听，但你应该避免监听整个 route 对象。在大多数情况下，你应该直接监听你期望改变的参数
```js
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'

export default {
  setup() {
    const route = useRoute()
    const userData = ref()

    // 当参数更改时获取用户信息
    watch(
      () => route.params.id,
      async newId => {
        userData.value = await fetchUser(newId)
      }
    )
  },
}
```
- useLink 
Vue Router 将 RouterLink 的内部行为作为一个组合式函数 (composable) 公开。它接收一个类似 RouterLink 所有 prop 的响应式对象，并暴露底层属性来构建你自己的 RouterLink 组件或生成自定义链接
```js
import { RouterLink, useLink } from 'vue-router'
import { computed } from 'vue'

export default {
  name: 'AppLink',

  props: {
    // 如果使用 TypeScript，请添加 @ts-ignore
    ...RouterLink.props,
    inactiveClass: String,
  },

  setup(props) {
    const {
      // 解析出来的路由对象
      route,
      // 用在链接里的 href
      href,
      // 布尔类型的 ref 标识链接是否匹配当前路由
      isActive,
      // 布尔类型的 ref 标识链接是否严格匹配当前路由
      isExactActive,
      // 导航至该链接的函数
      navigate
      } = useLink(props)

    const isExternalLink = computed(
      () => typeof props.to === 'string' && props.to.startsWith('http')
    )

    return { isExternalLink, href, navigate, isActive }
  },
}
```

## 过渡动效
想要在你的路径组件上使用转场，并对导航进行动画处理，你需要使用 v-slot API：
```js
<router-view v-slot="{ Component }">
  <transition name="fade">
    <component :is="Component" />
  </transition>
</router-view>
```

- 单个路由的过渡
```js
const routes = [
  {
    path: '/custom-transition',
    component: PanelLeft,
    meta: { transition: 'slide-left' },
  },
  {
    path: '/other-transition',
    component: PanelRight,
    meta: { transition: 'slide-right' },
  },
]
```

```html
<router-view v-slot="{ Component, route }">
  <!-- 使用任何自定义过渡和回退到 `fade` -->
  <transition :name="route.meta.transition || 'fade'">
    <component :is="Component" />
  </transition>
</router-view>
```

- 基于路由的动态过渡
也可以根据目标路由和当前路由之间的关系，动态地确定使用的过渡。使用和刚才非常相似的片段：
```html
<!-- 使用动态过渡名称 -->
<router-view v-slot="{ Component, route }">
  <transition :name="route.meta.transition">
    <component :is="Component" />
  </transition>
</router-view>
```
我们可以添加一个 after navigation hook，根据路径的深度动态添加信息到 meta 字段。
```js
router.afterEach((to, from) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  to.meta.transition = toDepth < fromDepth ? 'slide-right' : 'slide-left'
})
```

## 滚动行为
使用前端路由，当切换到新路由时，想要页面滚到顶部，或者是保持原先的滚动位置，就像重新加载页面那样。 vue-router 能做到，而且更好，它让你可以自定义路由切换时页面如何滚动
>注意: 这个功能只在支持 history.pushState 的浏览器中可用
```js
const router = createRouter({
  history: createWebHashHistory(),
  routes: [...],
  scrollBehavior (to, from, savedPosition) {
    // return 期望滚动到哪个的位置
  }
//    scrollBehavior(to, from, savedPosition) {
//     // 始终滚动到顶部
//     return { top: 0 }
//   },
})
```
你也可以通过 el 传递一个 CSS 选择器或一个 DOM 元素。在这种情况下，top 和 left 将被视为该元素的相对偏移量。
```js
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    // 始终在元素 #main 上方滚动 10px
    return {
      // 也可以这么写
      // el: document.getElementById('main'),
      el: '#main',
      top: -10,
    }
  },
})
```

返回 savedPosition，在按下 后退/前进 按钮时，就会像浏览器的原生表现那样
```js
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})
```

如果你要模拟 “滚动到锚点” 的行为
```js
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
      }
    }
  },
})
```

如果你的浏览器支持滚动行为，你可以让它变得更流畅
```js
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
  }
})
```

延迟滚动
```js
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ left: 0, top: 0 })
      }, 500)
    })
  },
})
```

## 路由懒加载
当打包构建应用时，JavaScript 包会变得非常大，影响页面加载。如果我们能把不同路由对应的组件分割成不同的代码块，然后当路由被访问的时候才加载对应组件，这样就会更加高效。
Vue Router 支持开箱即用的动态导入
```js
// 将
// import UserDetails from './views/UserDetails.vue'
// 替换成
const UserDetails = () => import('./views/UserDetails.vue')

const router = createRouter({
  // ...
  routes: [{ path: '/users/:id', component: UserDetails }],
})
```
### 把组件按组分块
- 使用 webpack
有时候我们想把某个路由下的所有组件都打包在同个异步块 (chunk) 中。只需要使用命名 chunk，一个特殊的注释语法来提供 chunk name (需要 Webpack > 2.4)：
    ```js
    const UserDetails = () =>
    import(/* webpackChunkName: "group-user" */ './UserDetails.vue')
    const UserDashboard = () =>
    import(/* webpackChunkName: "group-user" */ './UserDashboard.vue')
    const UserProfileEdit = () =>
    import(/* webpackChunkName: "group-user" */ './UserProfileEdit.vue')
    ```

- 使用 Vite
可以在rollupOptions下定义分块
    ```js
    // vite.config.js
    export default defineConfig({
    build: {
        rollupOptions: {
        // https://rollupjs.org/guide/en/#outputmanualchunks
        output: {
            manualChunks: {
            'group-user': [
                './src/UserDetails',
                './src/UserDashboard',
                './src/UserProfileEdit',
            ],
            },
        },
        },
    },
    })
    ```

## 动态路由
对路由的添加通常是通过 routes 选项来完成的，但是在某些情况下，你可能想在应用程序已经运行的时候添加或删除路由。具有可扩展接口(如 Vue CLI UI )这样的应用程序可以使用它来扩展应用程序。
动态路由主要通过两个函数实现。router.addRoute() 和 router.removeRoute()。它们只注册一个新的路由，也就是说，如果新增加的路由与当前位置相匹配，就需要你用 router.push() 或 router.replace() 来手动导航，才能显示该新路由

- 在导航守卫中添加路由
如果你决定在导航守卫内部添加或删除路由，你不应该调用 router.replace()，而是通过返回新的位置来触发重定向
    ```js
    router.beforeEach(to => {
    if (!hasNecessaryRoute(to)) {
        router.addRoute(generateRoute(to))
        // 触发重定向
        return to.fullPath
    }
    })
    ```
上面的例子有两个假设：第一，新添加的路由记录将与 to 位置相匹配，实际上导致与我们试图访问的位置不同。第二，hasNecessaryRoute() 在添加新的路由后返回 false，以避免无限重定向
因为是在重定向中，所以我们是在替换将要跳转的导航，实际上行为就像之前的例子一样。而在实际场景中，添加路由的行为更有可能发生在导航守卫之外，例如，当一个视图组件挂载时，它会注册新的路由。

- 删除路由

    通过添加一个名称冲突的路由。如果添加与现有途径名称相同的途径，会先删除路由，再添加路由
    ```js
    router.addRoute({ path: '/about', name: 'about', component: About })
    // 这将会删除之前已经添加的路由，因为他们具有相同的名字且名字必须是唯一的
    router.addRoute({ path: '/other', name: 'about', component: Other })
    ```

    通过调用 router.addRoute() 返回的回调：
    ```js
    const removeRoute = router.addRoute(routeRecord)
    removeRoute() // 删除路由如果存在的话
    ```

    通过使用 router.removeRoute() 按名称删除路由。需要注意的是，如果你想使用这个功能，但又想避免名字的冲突，可以在路由中使用 Symbol 作为名字
    ```js
    router.addRoute({ path: '/about', name: 'about', component: About })
    // 删除路由
    router.removeRoute('about')
    ```

- 添加嵌套路由
要将嵌套路由添加到现有的路由中，可以将路由的 name 作为第一个参数传递给 router.addRoute()，这将有效地添加路由，就像通过 children 添加的一样
    ```js
    router.addRoute({ name: 'admin', path: '/admin', component: Admin })
    router.addRoute('admin', { path: 'settings', component: AdminSettings })
    ```

- 查看现有路由
Vue Router 提供了两个功能来查看现有的路由
    1. router.hasRoute()：检查路由是否存在。
    1. router.getRoutes()：获取一个包含所有路由记录的数组