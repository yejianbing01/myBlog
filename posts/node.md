---
title: Node.js学习笔记
date: 2021-01-20 15:33:57
tags:
---

# Node.js

## Node.js 是什么？

Node.js 是一个基于 Chrome V8 引擎 的 javaScript 运行环境

* 异步非阻塞 I/O (I/O 线程池)
* 特别适用于 I/O 密集型应用
* 事件循环机制
* 单线程
* 跨平台                                    

Node 中的任何一个模块都被一个外层函数包裹
```javaScript
function (exports, require, module, __filename, __dirname) {
    // console.log(arguments.callee.toString())
}
```

<!-- more -->

## Node.js 中的事件循环机制(EventLoop)
```javaScript
// 延时定时器
setTimeout(function(){})
// 循环定时器
setInterval(function(){})

// 设置立即执行函数
setImmediate(function(){})
// 设置立即执行函数
process.nextTick(function(){})
```

1. 第一阶段：timers(定时器阶段--setTimeout,setInterval)
    1. 开始计时
    2. 执行定时器的回调

2. 第二阶段：pending callbacks（系统阶段）

3. 第三阶段：idle，prepare（准备阶段）

4. 第四阶段：poll（轮询阶段，核心）
    1.  如果回调队列里有待执行的回调函数，从回调队列中取出回调函数，同步执行，直到回调队列为空，或者达到系统的最大限度
    2. 如果回调队列为空
        1. 如果有设置过setImmediate：进入下一个check阶段，目的是为了执行setImmediate 所设置的回调函数
        2. 如果未设置过setImmediate：在此阶段停留，等待回调函数被插入回调队列。若定时器到点了，进入 下一个check阶段：为了进入第一阶段

5. 第五个阶段：check（专门用于执行 setImmediate 所设置的回调）

6. 第六阶段：close callbacks（关闭回调阶段）

## Node包管理器--NPM(Node Package Manager)

npm 常用命令
```shell
# 初始化项目
npm init

# 安装生产依赖包
npm install xxx --save 或 npm i xxx -S 或 npm i xxx

# 安装开发依赖包
npm install xxx --save-dev 或 npm i xxx -D

# 安装全局依赖包
npm install xxx -g 或 npm i xxx -g

# 查看全局安装位置
npm root -g

# 安装package.json中声明的所有包
npm install 或 npm i

# 移除依赖包，同时会一处package.json中的申明
npm remove xxx

# 查看安装的依赖包版本
npm ls xxx

# 关于package.json中的版本 ^: 锁定大版本  ~: 锁定小版本
```

cnpm使用
```shell
# 1. 直接安装cnpm (不推荐使用cnpm命令有bug)
npm install -g cnpm --registry=https://registry.npm.taobao.org

# 2. 设置cnpm仓库地址为淘宝镜像地址
npm config set registry https://registry.npm.taobao.org

# 3. 查看是否更改成功
npm config get registry
```

yarn
```shell
# 全局安装yarn
npm install yarn -g

# 由于yarn的全局安装位置与npm不同，所以要配置yarn的全局安装路径到环境变量中。将以下两个命令输出的路径添加到环境变量中。
yarn global dir
yarn global bin

# 初始化项目
yarn init -y

# 下载项目中声明的依赖
yarn

# 下载指定依赖
yarn add xxx@1.2.3

# 下载指定开发依赖
yarn add xxx@1.2.3 -D

# 全局下载指定依赖包
yarn global add xxx

# 删除依赖包
yarn remove xxx
yarn global remove xxx

# 设置淘宝镜像
yarn config set registry https://registry.npm.taobao.org
```

# Buffer

```javaScript
 //  性能差，弃用。1. 在堆内存中开启空间 2. 清理
let buf = new Buffer(10);

// 在堆内存中开辟空间(该空间完全干净)
let buf = Buffer.alloc(10);

// 在堆内存中开辟空间(该空间中可能有数据)，性能最好
let buf = Buffer.allocUnsafe(10);

// 将数据存入Buffer
let buf = Buffer.from("hello world");

// 输入Buffer对象。Buffer存的是二进制数据，输入的时候会转换成16进制 
// <Buffer 68 65 6c 6c 6f 20 77 6f 72 6c 64>
console.log(buf) 

```

# fs(File System文件系统)

1. 简单文件写入

```javaScript
const fs = require('fs');

/**
异步文件写入
options
    - encoding 编码格式
    - mode 设置文件的操作权限 默认: 0O666
    - flag 写入模式 a: 追加  默认 w: 覆盖写入
*/ 
fs.writeFile(path, data, options, callback);


// 同步写入
fs.writeFileSync();

```

2. 流式文件写入

```javaScript
/*
创建一个可写流
- path 文件路径
- options 配置对象
    - flags: 
    - encoding: 
    - fd: 文件统一 标识
    - mode: 
    - autoClose: 自动关闭文件
    - emitClose: 强制关闭
    - start: 
*/
const ws = fs.createWriteStream(path, options);

// 注册监听可写流打开，关闭事件
ws.on('open',()=>{})
ws.on('close',()=>{})

// 使用可写流写入文件
ws.write('hello world');
// 关闭可写流
ws.end()
```

3. 简单文件读取
```javaScript
const fs = require('fs');

fs.readFile(path, function(error, data){
    if (error) {
        console.log(error);
    } else {
        console.log(data) // 读取的data为Buffer
    }
})

```

4. 流式文件读取

```javaScript
const fs = require('fs');

/*
创建一个可读流
- path 文件路径
- options 配置对象
    - flags: 
    - encoding: 
    - fd: 文件统一 标识
    - mode: 
    - autoClose
    - emitClose:
    - start: 
    - end: 
    - highWaterMark：每次读取数据的大小，默认值是64 * 1024Byte
*/
const rs = fs.createReadStream(__dirname + '/test.txt',);

// 检测流状态
rs.on('open', function () {
    console.log('可读流打开了');
});
rs.on('close', function () {
    console.log('可读流关闭了');
})
rs.on('data', (data) => {
    console.log(data.length); // 输出是65536，每次读取64KB的内容
});
```

5. 边读取边写入
```javaScript
const rs = fs.createReadStream(__dirname + '/test.txt');
const ws = fs.createWriteStream(__dirname + '/test1.txt');

ws.on('open', function () {
    console.log('可写流打开了');
});
ws.on('close', function () {
    console.log('可写流关闭了');
})

rs.on('open', function () {
    console.log('可读流打开了');
});
rs.on('close', function () {
    console.log('可读流关闭了');
    ws.close();
})
rs.on('data', (data) => {
    console.log(data.length); // 输出是65536，每次读取64KB的内容
    ws.write(data, (err) => {
       err && console.log(err);
    });
});
```
# mongoose

```javaScript

// 安装依赖
npm install mongoose

// 连接数据库
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/demo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('数据库连接成功');
    }
});

// 监听数据库连接状态
mongoose.connection.on('open', function (err) {
    if (err) {
        console.log('数据库连接失败');
    } else {
        console.log('数据库连接成功');
    }
});

// 引入模型对象
const Schema = mongoose.Schema;
// 创建约束对象
const Student = new Schema({
    stu_id: { type: String, required: true, unique: true }, // required 必填项 unique 唯一值
    name: { type: String, required: true },
    age: { type: Number, required: true },
    sex: { type: String, required: true },
    hobby: [String],
    info: Schema.Types.Mixed, // 任意类型
    date: { type: Date, default: Date.now() }, // default 默认值
    flag: { type: String, default: '1' }
});

// 创建模型对象
const stuModel = mongoose.model('stuModel', Student, 'students');


 // CRUD

// -------------create
stuModel.create({
    stu_id: '001',
    name: 'demo',
    age: 18,
    sex: '男',
    hobby: ['敲代码'],
    info: 'info',
}, function (err, data) {
        err && console.log(err);
        data && console.log(data);
});

// -------------read

/**
 * 返回数组，如果没有数据则返回空数组
 */
stuModel.find({}, function (err, data) {
    err && console.log(err);
    data && console.log(data);
});

/**
 * 返回一个对象，如果没有数据则返回 null
 */
stuModel.findOne({}, function (err, data) {
    err && console.log(err);
    data && console.log(data);
});

/**
 *  {name: 1, _id: 0} 1:  返回该字段 0：不返回该字段
 */
stuModel.findOne({flag: 1}, {name: 1, _id: 0}, function (err, data) {
    err && console.log(err);
    data && console.log(data);
});


// -------------update

/**
 * 更新数据，更新内容没传的字段不会被覆盖
 */
stuModel.updateOne({ name: 'demo' }, { age: 8 }, function (err, data) {
    err && console.log(err);
    data && console.log(data);
});

// -------------delete

/**
 * 删除单个
 */
stuModel.deleteOne({name: 'demo'}, function (err, data) {
    err && console.log(err);
    data && console.log(data);
})

/**
 * 删除多个
 */
stuModel.deleteMany({flag: '0'}, function (err, data) {
    err && console.log(err);
    data && console.log(data);
})


```