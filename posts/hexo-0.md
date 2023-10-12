---
title: hexo
date: 2020-11-04 23:32:57
tags:
---

Hexo is a fast, simple and powerful blog framework. You write posts in Markdown (or other markup languages) and Hexo generates static files with a beautiful theme in seconds.

<!-- more -->

## Node.js环境

- node环境安装


## hexo-cli安装
```
# 1. 安装hexo包 
npm install hexo-cli -g

# 2. 验证hexo是否安装成功
hexo -v

# 3. 在本地电脑任意位置创建文件夹 blog
mkdir blog

# 4. 初始化hexo博客,进入blog文件夹
hexo init

# 5. 本地启动hexo服务
hexo s

# 6. 新建一篇博客 
hexo new "博客名称"

# 7. 生成博客
hexo g

```

## 将hexo博客部署到github上可以在任何地方访问
1. 登录github新建项目
    * 项目名称必须是：github用户名.github.io

1. 再新建一个hexo分支用于管理文件

1. 在本地hexo项目中安装hexo部署插件

        npm install --save hexo-deployer-git

1. 修改hexo项目配置文件 _config.yml,在文件最后加入以下内容

        deploy:
            type: git
            repo: https://github.com/xxxx/xxxxx.github.io.git
            branch: master

    repo: 填新建的github项目路径。保存退出

- 部署hexo项目到远端
	```
    hexo d
	```
- 在浏览器中直接访问：xxxxx.github.io
    访问成功的话博客就部署完成了。
    
- 如果部署过程中出现问题，直接删除本地目录blog，重新开始即可

- 将本地代码提交到github项目的hexo分支上，这样在任何一台其他电脑上，直接clone下来修改就行



## hexo常用命令(https://hexo.io/docs/commands)

```
# 初始化本地文件夹为网站的根目录
hexo init

# 新建文章，一般可以简写为 
hexo new 或 hexo n

# 生成静态文件
hexo generate 或 hexo g

# 启动本地服务器
hexo server 或 hexo s

# 部署网站
hexo deploy 或 hexo d

# 清理缓存文件，是一个比较常用的命令
hexo clean

```

## hexo个性化设置

1. 主题修改，主题库：https://hexo.io/themes/

    * 安装yilia主题,进入blog/themes


            git clone https://github.com/litten/hexo-theme-yilia.git

    * 修改hexo主题配置，修改blog/_config.yml,搜索 theme，修改为以下内容，保存退出

            theme: yilia


    * 重新生成博客

            hexo clean
            hexo g
            # 本地启服务查看主题是否生效
            hexo s
    
    * 主题生效后重新部署

            hexo d

2. yilia主题美化（待更新）
