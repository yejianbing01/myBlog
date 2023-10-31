---
title: 'VUE3笔记'
date: '2023-10-16'
---

## 生命周期钩子
- onBeforeMount()
- onMounted()
- 
- onBeforeUpdate()
- onUpdated()
- 
- onBeforeUnmount()
- onUnmounted()
- 
- ​​​onActivated()
注册一个回调函数，若组件实例是 <KeepAlive> 缓存树的一部分，当组件被插入到 DOM 中时调用
- onDeactivated()
注册一个回调函数，若组件实例是 <KeepAlive> 缓存树的一部分，当组件从 DOM 中被移除时调用。
- 
- onErrorCaptured()
注册一个钩子，在捕获了后代组件传递的错误时调用。



 v-on 提供了事件修饰符

<!-- 修饰符可以串联 -->
- .stop
- .prevent
- .capture
- .self
- .once
- .passive

按键修饰符
在监听键盘事件时，我们经常需要检查详细的按键。Vue 允许为 v-on 在监听键盘事件时添加按键修饰符：

<!-- 只有在 `key` 是 `Enter` 时调用 `vm.submit()` -->
<input v-on:keyup.enter="submit">
 - .enter
 - .tab
 - .delete (捕获“删除”和“退格”键)
 - .esc
 - .space
 - .up
 - .down
 - .left
 - .right
系统修饰键
可以用如下修饰符来实现仅在按下相应按键时才触发鼠标或键盘事件的监听器。
 - .ctrl
 - .alt
 - .shift
 - .meta

v-model 指令在表单 <input>、<textarea> 及 <select> 元素上创建双向数据绑定。
 - text 和 textarea 元素使用 value property 和 input 事件；
 - checkbox 和 radio 使用 checked property 和 change 事件；
 - select 字段将 value 作为 prop 并将 change 作为事件。
修饰符
.lazy
.number
.trim

watch vs. watchEffect

watch 和 watchEffect 都能响应式地执行有副作用的回调。它们之间的主要区别是追踪响应式依赖的方式：
 -   watch 只追踪明确侦听的数据源。它不会追踪任何在回调中访问到的东西。另外，仅在数据源确实改变时才会触发回调。watch 会避免在发生副作用时追踪依赖，因此，我们能更加精确地控制回调函数的触发时机。
 -   watchEffect，则会在副作用发生期间追踪依赖。它会在同步执行过程中，自动追踪所有能访问到的响应式属性。这更方便，而且代码往往更简洁，但有时其响应性依赖关系会不那么明确。
回调的触发时机

当你更改了响应式状态，它可能会同时触发 Vue 组件更新和侦听器回调。
默认情况下，用户创建的侦听器回调，都会在 Vue 组件更新之前被调用。这意味着你在侦听器回调中访问的 DOM 将是被 Vue 更新之前的状态。
如果想在侦听器回调中能访问被 Vue 更新之后的 DOM，你需要指明 flush: 'post' 选项：

```js
watch(source, callback, {
  flush: 'post'
})

watchEffect(callback, {
  flush: 'post'
})

// 后置刷新的 watchEffect() 有个更方便的别名 watchPostEffect()：
watchPostEffect(() => {
  /* 在 Vue 更新后执行 */
})
```

通过插槽分发内容
<slot></slot> ~= react的 props.children
v-slot 有对应的简写 #，因此 <template v-slot:header> 可以简写为 <template #header>。其意思就是“将这部分模板片段传入子组件的 header 插槽中”。



动态组件
<!-- 组件会在 `currentTabComponent` 改变时改变 -->
<component v-bind:is="currentTabComponent"></component>
在上述示例中，currentTabComponent 可以包括
 - 已注册组件的名字，或
 - 一个组件的选项对象

异步组件


