---
title: git学习笔记
date: 2020-10-14 19:45:54
tags: git
---
```sh
git config --global user.name "your name"

git config --global user.email "your email"
```

<!-- more -->


[参考文档](https://mp.weixin.qq.com/s/B0git9cp7UxjwfD5LYx5HQ)

## config 的作用域
```sh
git config --local # 只对某有个仓库有效 --list 查看当前配置

git config --global # 对当前用户所有仓库有效 --list 查看当前配置

git config --system # 对系统所有登录用户有效 --list 查看当前配置

```
### 分支说明

- master——主分支(受保护),日常构建集成使用，禁止直接提交代码
- hotfix——热修分支,分支以'yy_MM_dd'日期格式命名,用于修复主分支bug，修复后合并至master与develop，并删除
- develop——开发分支(受保护),禁止直接提交代码
- feature——新功能分支
- release——发布定期要上线的功能，创建后进行一轮构建，修复问题，修复后执行'npm run release'更新版本号与changeLog.md，合并至master与develop,并删除





![image.png](https://cdn.nlark.com/yuque/0/2020/png/421125/1590147659018-127d1630-3229-491a-a498-37f043105f17.png#align=left&display=inline&height=380&margin=%5Bobject%20Object%5D&name=image.png&originHeight=380&originWidth=614&size=43457&status=done&style=none&width=614)


### 备注

1. 完成feature分支后需要按以下流程进行,
   1. 需要先合并develop至当前feature，并解决可能产生的冲突
   1. 在gitlab上创建merge request,进行代码review
2. 完成hotfix也需要在gitlab上创建merge request,进行代码review
2. 提交代码时，会有[eslint](https://hzecool.yuque.com/rmobir/va1385/nk2ayu)进行静态代码检查和[commitLint](https://hzecool.yuque.com/rmobir/va1385/dpn9i5)提交规范检查，不符合规范会禁止提交





### 在sourcetree中使用git flow

1. 使用git flow初始化仓库
   1. mac

仓库-> git flow或hg flow -> 初始化仓库
b. windows
点击右上角git工作流 初次使用会提示使用git flow初始化此仓库，点击确认即可

