---
title: 'webpack笔记'
date: '2023-10-16'
---

Webpack

webpack自身只能处理压缩js和json文件

webpack配置有哪些
* entry: 入口文件
* output：输出文件配置
* resolve：用来配置模块的解析方式
* module：用来配置模块如何被解析
* plugins：插件，增强相关功能
* devServer：开发服务器配置
* devtool：调试工具
* optimization：优化的相关配置
* externals：外部扩展的配置
* performance：性能相关配置
* target：构建的目标环境

Loader
* image-loader：加载并压缩图片文件
* swc-loader：类似babel-loader，编译效率更高
* css-loader：加载css，支持模块化，压缩，文件导入等特性
* style-loader：把css注入到js中，通过dom操作去加载css
* eslint-loader：通过eslint检查js
* tslint-loader：通过tslint检查ts
* babel-loader：把es6转换成es5

Plugin
* define-plugin：定义环境变量
* progress-plugin：设置打包进度
* html-webpack-plugin：简化html文件创建
* webpack-bundle-analyzer：可视化webpack输出文件的体积
* mini-css-extract-plugin：分离样式文件，css提取为独立文件，支持按需加载
* react-refresh-plugin：react支持热更新


Loader和Plugin的区别
功能不同
* Loader本质是一个函数，它是一个转换器。webpack只能解析原生js文件，对于其他类型的文件就需要用loader进行转换。
* Plugin是一个插件，用于增强webpack功能。webpack在运行的生命周期中会广播出许多事件，plugin可以监听这些事件，在合适的时机通过webpack提供的api改变输出结果。
用法不同
* loader的配置是在module.rules下进行。它的类型是数组，每一项都是一个object，里面描述了对于什么类型的文件（test）用什么加载（loader）和使用的参数（options）
* plugin的配置是在plugins下。它的类型也是数组，每一项是一个Plugin的实例，参数通过构造函数传入。


webpack的构建流程
1. 初始化参数：从配置文件或者shell语句中读取合并参数
2. 开始编译：用参数去初始化Compiler对象，加载所有配置的插件，执行run方法
3. 确定入口：根据entry参数找到入口文件
4. 编译模块：从入口文件出发，调用所有配置的Loader对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
5. 完成模块编译：在经过第4步使用Loader翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系
6. 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的Chunk，再把每个Chunk转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会
7. 输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统
总结就是三个阶段：
* 初始化：启动构建，读取与合并配置参数，加载Plugin，实例化Compiler
* 编译：从Entry出发，针对每个Module串行调用对应的Loader去翻译文件的内容，再找到该Module依赖的Module，递归地进行编译处理
* 输出：将编译后的Module组合成Chunk，将Chunk转换成文件，输出到文件列表中


Webpack的热更新原理
在不刷新页面的前提下，将新代码替换旧代码。
HMR的原理实际上是webpack-dev-server和浏览器之间维护了一个websocket服务。当本地资源发生变化后，webpack会先将打包生成的新的模块代码放入内存中，然后wds向浏览器推送更新，并附带上构建时的hash，让客户端和上一次资源进行对比。客户端对比出差异后会向wds发起ajax请求获取到更改后的内容，通过这些信息再向wds发起jsonp请求获取到最新的模块代码。


bundle，chunk和module分别是什么
* bundle：捆绑包，它是构建过程的最终产物
* chunk：一个chunk由多个模块组合而成，用于代码的合并和分割，在构建过程中被打包到一个文件中
* module：代码的基本单位，可以是一个文件，一个组件，一个库等。在编译的时候会从entry中递归寻找出所有依赖的模块


Code Spliting
Code Spliting代码分割，是一种优化技术。它允许将一个大的chunk拆分成多个小的chunk，从而实现按需加载，减少初始加载时间，并提高应用程序的性能。
通常webpack会将所有代码打包到一个单独的bundle中，然后在页面加载时一次性加载这个bundle。这样的做法会导致初始加载时间过长，尤其是大型应用中，很影响用户的体验。
Code Spliting解决了这个问题，它将应用程序的代码划分成多个代码块，每个代码块代表不同的功能或路由。这些代码块可以在需要时被动态加载，使得页面只加载当前所需的功能，而不必等待整个应用程序的所有代码加载完毕。
在Webpack中通过optimization.splitChunks配置项来开启代码分割。


Webpack的Tree Shaking原理
Tree Shaking也叫树摇优化，它是一种通过移除多余的代码，从而减小最终生成的代码体积，生产环境是默认开启的。
原理：
* ES6模块：Tree Shaking的基础是ES6模块系统，它具有静态特性，意味着模块的导入和导出关系在编译时就已经确定，不会受到程序运行时的影响。
* 静态分析：在webpack构建过程中，webpack会通过静态分析依赖图，从入口文件开始，逐级追踪每个模块的依赖关系，以及模块之间的导入和导出关系。
* 标记未使用代码：在分析模块依赖时，webpack会标记每个变量、函数、类，以确定它们是否被实际使用。如果一个导入的模块只是被导入而没有被使用，或者某个模块的部分代码没有被使用，webpack会将这些未使用的部分标记为unused。
* 删除未使用代码：在代码标记为未使用后，webpack会在最终的代码生成阶段，通过工具（如uglifyjs）删除这些未使用的代码。这包括未使用的模块，函数，变量和导入。
如何提高webpack的打包速度
* 利用缓存：利用webpack的持久缓存功能，避免重复构建没有变化的代码。可以使用cache：true选项启用缓存。
* 使用多进程/多线程构建：使用thread-loader，happypack等插件可以将构建过程分解为多个进程或线程，从而利用多核处理器加速构建。
* 使用DLLPlugin和HardSourceWebpackPlugin：DllPlugin可以将第三方库预先打包成单独的文件，减少构建时间。HardSourceWebpackPlugin可以缓存中间文件，加速后续构建过程。
* 使用TreeShaking：配置Webpack的Tree Shaking机制，去除未使用的代码，减小生成的文件体积
* 移除不必要的插件：避免不必要的复杂性和性能开销。
如何减少打包后的代码体积
* 代码分割（Code Spliting）：将应用程序的代码划分成多个代码块，按需加载。这可以减小初始化加载的体积，使页面更快加载。
* Tree Shaking：配置Webpack的Tree Shaking机制，去除未使用的代码。这可以从模块中移除那些在项目中没有被引用到的部分。
* 压缩代码：使用uglifyjs或teser来压缩js代码，这会删除空格，注释和不必要的代码，减小文件体积
* 使用生产模式：在Webpack中使用生产模式，通过设置mode: 'production'来启用优化。这会自动应用一系列性能优化策略，包括代码压缩和Tree Shaking。
* 使用压缩工具：使用现代的压缩工具，如Brotli和Gzip，来对静态资源进行压缩，从而减小传输体积。
* 利用CDN加速：将项目中引用的静态资源路径修改为CDN上的路径，减少图片，字体等静态资源的打包。
vite比webpack快在哪里
他们都是前端构建工具，但vite构建速度远远超过webpack的构建速度。
* 冷启动速度：vite是利用浏览器的原生ES moudle，采用按需加载，而不是将整个项目打包。而webpack是将整个项目打包成一个或多个bundle，构建过程复杂。
* HMR热更新：vite使用浏览器内置的ES模块功能，使得在开发模式下的热模块替换更加高效，那个文件更新就加载那个文件。它通过WebSocket在模块级别上进行实时更新，而不是像Webpack那样在热更新时重新加载整个包。
* 构建速度：在生产环境下，Vite的构建速度也通常比Webpack快，因为Vite的按需加载策略避免了将所有代码打包到一个大文件中。而且，Vite对于缓存、预构建等方面的优化也有助于减少构建时间。
* 缓存策略：Vite利用浏览器的缓存机制，将依赖的模块存储在浏览器中，避免重复加载。这使得页面之间的切换更加迅速。
* 不需要预编译：Vite不需要预编译或生成中间文件，因此不会产生大量的临时文件，减少了文件IO操作，进一步提升了速度



一 依赖包
```sh
 npm I webpack -D
 npm I webpack-cli -g
```


二 配置文件webpack.config.js

1. entry 入口
2. output 出口
3. mode 开发模式(develop/ production)
4. loader;  Module: { rules: [ { test: //, loader: ’’ } ] }
    1. 打包less资源需要的loader：[style-loader css-loader less-loader]
    2. eslint-loader
    3. babel-loader
    4. @babel/polyfill 兼容性处理  // 包含es6高级语法的转换；core-js 实现polyfill按需加载
    5. 打包样式中的图片资源：file-loader + url-loader
    6. 打包html中的图片资源：html-loader
    7. 打包字体等其他资源：file-loader
5. plugins (插件需要引入和实例化)
    1. html文件处理自动引入js文件： html-webpack-plugin 
6. 自动编译打包devServer
    1. Webpack-dev-server
7. devTool 映射导包后的代码到源代码)
    1. 开发环境：cheap-module-eval-source-map
    2. 生产环境：cheap-module-source-map


