---
title: 'Docker学习笔记'
date: '2020-12-27 15:33:57'
---

## Docker基本组成
- 仓库(repository):

    用于存放镜像，分为公有仓库和私有仓库。例如DockerHub

- 镜像(images)：

    docker镜像就好比是一个模板，可以通过模板来创建容器服务。通过这个镜像可以创建多个容器

- 容器(container):

    通过镜像创建得到，可以部署应用。容器中包含了linux系统基本文件，和需要的应用

<!-- more -->

![alt](/images/docker架构.png)
## Docker安装
> 基于CentOS7安装, [docker官方文档](https://docs.docker.com/engine/install/centos/)
```sh
# 1. 卸载旧的版本
    yum remove docker \
                docker-client \
                docker-client-latest \
                docker-common \
                docker-latest \
                docker-latest-logrotate \
                docker-logrotate \
                docker-engine

# 2. 需要的安装包
    yum install -y yum-utils

# 3. 设置镜像仓库
    yum-config-manager \
        --add-repo \
        https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 4. 更新yum软件包索引
    yum makecache fast

# 5. 安装docker(docker-ce社区版)
    yum install docker-ce docker-ce-cli containerd.io -y

# 6. 检查安装结果
    docker version

# 7. 启动docker
    systemctl start docker

# 8. docker更换国内镜像源
    vi /etc/docker/daemon.json
    {
        "registry-mirrors": ["https://2l5j7ihl.mirror.aliyuncs.com"]
    }
    
    systemctl daemon-reload
    systemctl restart docker

# 8. 运行hello-world测试
    docker run hello-world

# 9. 卸载docker 
    yum remove docker-ce docker-ce-cli containerd.io

    rm -rf /var/lib/docker
```

## Docker基本命令
---
### 帮助命令

```sh
docker version              # 显示docker的版本信息
docker info                 # 显示docker的系统信息，包括镜像和容器的数量
docker 命令 --help          # 帮助命令
```

### 镜像命令

* docker images【查看本机上的docker镜像】
  ```
  docker images [OPTIONS] [REPOSITORY[:TAG]]
  Options:
    -a, --all             Show all images 
    -q, --quiet           Only show image IDs
  ```
* docker search【在docker仓库中搜索镜像】
  ```
  docker search [OPTIONS] TERM
  Options:
    -f, --filter filter   Filter output based 
  ```
* docker pull【下载镜像】
  ```
  docker pull [OPTIONS] NAME[:TAG|@DIGEST]
  Options:
    -a, --all-tags                Download all 
    -q, --quiet                   Suppress verbose output
  ```

* docker rmi【删除镜像】
  ```
  docker rmi [OPTIONS] IMAGE [IMAGE...]
  Options:
    -f, --force      Force removal of the image

  Exp:
  docker rmi -f $(docker images -aq)  # 删除所有镜像
  ```
* docker commit【提交容器为新的镜像】【建议使用dockerFile构建镜像】
  ```sh
  docker commit -m="备注信息" -a="作者" 容器id github账号/容器名称:TAG
  ```
* docker build【使用dockerFile构建镜像】
  ```sh
  # 进入dockerFile同级目录执行命令,注意最后的 “.”表示dockerFile在当前目录
  docker build -t github账号/容器名称:TAG .
  ```
* docker tag【设置镜像标签】
  ```sh
  docker tag [容器id/容器名称] [github账号/容器名称:TAG] 
  ```
* docker history【查看镜像创建记录】
  ```sh
  docker history 容器id
  ```
* docker login【登录docker仓库】
* docker push【推送docker镜像到仓库】
  ```sh
  docker push [仓库地址]/仓库用户名/镜像名:TAG
  ```

### 容器命令

* docker run【启动容器 **重点** 】
  ```
  docker run [OPTIONS] IMAGE [执行的命令COMMAND] [参数...]
  Options:
    -d                            后台方式运行，**启动后如果没有前台应用就会停止容器**
    -it                           i:使用交互方式运行 t:分配一个新终端
    --name="name"                 容器名称，用来区分容器
    -p                            指定容器端口 1122:8080 主机端口号:容器端口号
    -P                            随机端口映射，容器内部暴露端口映射到宿主随机端口
    -v [宿主机路径]:容器路径         挂载(绑定)一个卷，不带宿主机路径则为：匿名挂载
    --dns 8.8.8.8                 指定容使用的DNS服务器，默认和宿主机一样
    -e username="xxx"             设置环境变量
    -m                            设置容器内存最大值
    --link=[]                     链接到另外一个容器
    --network="xxx"               加入到指定docker网络

    Exp: docker run -it --name="myCentOS" -p 5555:5555 -v /etc/xxx:/etc/xxxx centos /bin/bash
  ```

* docker ps【列出所有运行的容器】
  ```
  docker ps [-aq] # -a:列出所有运行过的容器  -q:只显示容器id 
  ```
* docker logs【获取容器的日志】
  ```
  docker logs [OPTIONS] CONTAINER
  Options:
    -f: 追踪日志输出
    -n/--tail :显示多少条最新的日志
    -t:显示时间戳
  ```
* docker port【列出指定容器的端口映射情况】
  ```sh
  docker port CONTAINER[/80] # 带端口表示查看指定端口映射情况
  ```
* docker top【查看容器内部的进程信息】
  ```sh
  docker top CONTAINER [ps OPTIONS]
  ```
* docker inspect【查看容器元数据】
  ```sh
  docker inspect [OPTIONS] NAME|ID [NAME|ID...]
  Options:
    -f:指定返回模板:go语音模板
  ```
* docker wait【阻塞进程直到容器停止，然后打印退出码】
  ```sh
  docker wait CONTAINER
  ```
* exit/Ctrl + P + Q【退出容器】
  ```sh
  exit                    退出并停止容器
  Ctrl + P + Q            容器不停止退出
  ```
* docker rename【容器重命名】
  ```sh
  docker rename CONTAINER NEW_NAME
  ```
* docker update【更新容器】
  ```
  docker update [OPTIONS] CONTAINER [CONTAINER...]
  Options:
    -m, --memory bytes               Memory limit
        --restart string             Restart policy to apply when a container exits
  ```
* docker exec/attach【进入正在运行的容器】
  ```
  docker exec [-it/d] CONTAINER COMMAND [ARG...]
  docker attach CONTAINER # 进入当前正在运行的容器，进入正在执行的终端

  Exp:
    docker exec -it 9010942b00ff /bin/bash
    docker attach 9010942b00ff
  ```

* docker start/restart/stop/kill/rm【启动/重启/停止/强制停止/删除 容器】
  ```
  docker start 容器id                     启动容器
  docker restart 容器id                   重启容器
  docker stop 容器id                      停止当前运行的容器
  docker kill 容器id                      强制停止当前运行的容器
  docker rm [-f]                         删除容器 -f:强制删除
  ```
* docker cp【容器和宿主机之间文件复制】
  ```
  # 将主机/www/runoob目录拷贝到容器96f7f14e99ab的/www目录下。
  docker cp /www/runoob 96f7f14e99ab:/www/

  # 将主机/www/runoob目录拷贝到容器96f7f14e99ab中，目录重命名为www。
  docker cp /www/runoob 96f7f14e99ab:/www

  # 将容器96f7f14e99ab的/www目录拷贝到主机的/tmp目录中。
  docker cp  96f7f14e99ab:/www /tmp/
  ```
* **使用数据卷/具名挂载和匿名挂载**
  ```
  docker run -it -v 主机目录:容器目录

  # 容器停止后主机修改了挂载目录的数据，容器内的数据也会同步。

  docker run -d -P --name nginx01 -v /etc/nginx nginx

  # 查看所有的volume情况
  docker volume

  docker volume COMMAND
  Commands:
  create      Create a volume
  inspect     Display detailed information on one or more volumes
  ls          List volumes
  prune       Remove all unused local volumes
  rm          Remove one or more volumes
  ```
* 拓展
    ```
    docker run -d -P --name nginx01 -v test-nginx:/etc/nginx:ro nginx

    docker run -d -P --name nginx01 -v test-nginx:/etc/nginx:ro nginx

    ro    readonly  # 只读
    rw    readwrite # 可读可写
    ```
### 容器实例

* 部署 ES + kibana
  ```
  # es十分消耗内存
  docker run -d --name elasticsearch --net somenetwork -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:tag

  # 增加内存限制，修改配置文件 -e 环境配置修改
  docker run -d --name elasticsearch  -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node"  -e ES_JAVA_OPTS="-xms64m -Xmx512m" elasticsearch:tag

  # docker stats 查看docker机器状态
  ```
* 部署 MySql
  ```
  docker pull mysql:5.7

  docker run -d -p 3306:3306 -v E:\docker\mysq\confl:/etc/mysql/conf.d -v E:\docker\mysql\data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 --name mysql01 mysql:5.7

  # -v 目录挂载 主机目录:容器目录
  # -e 环境配置 mysql root用户密码
  ```
* 安装mongoDB
  ```sh
  docker pull mongo

  docker run --name mongodb -p 27017:27017 -v mongo:/data/db -d mongo --auth

  docker run -d --name mongo_pre  -v ~/mnt/docker/mongo_pre:/data/db -p 37000:27017 -e MONGO_INITDB_ROOT_USERNAME=ecool -e MONGO_INITDB_ROOT_PASSWORD=ecool mongo --auth

  # --auth 开启权限认证
  # -v mongo:/data/db 具名挂载
  ```

## DockerFile
![alt](/images/dockerFile.png)
* 栗子【Dockerfile 是一个用来构建镜像的文本文件，文本内容包含了一条条构建镜像所需的指令和说明。】
  ```sh
  # This my first nginx Dockerfile
  # Version 1.0

  # Base images 基础镜像
  FROM centos

  #MAINTAINER 维护者信息
  MAINTAINER tianfeiyu 

  #ENV 设置环境变量
  ENV PATH /usr/local/nginx/sbin:$PATH

  #ADD  文件放在当前目录下，拷过去会自动解压
  ADD nginx-1.8.0.tar.gz /usr/local/  
  ADD epel-release-latest-7.noarch.rpm /usr/local/  

  #RUN 执行以下命令 
  RUN rpm -ivh /usr/local/epel-release-latest-7.noarch.rpm
  RUN yum install -y wget lftp gcc gcc-c++ make openssl-devel pcre-devel pcre && yum clean all
  RUN useradd -s /sbin/nologin -M www

  #WORKDIR 相当于cd
  WORKDIR /usr/local/nginx-1.8.0 

  RUN ./configure --prefix=/usr/local/nginx --user=www --group=www --with-http_ssl_module --with-pcre && make && make install

  RUN echo "daemon off;" >> /etc/nginx.conf

  #EXPOSE 映射端口
  EXPOSE 80

  #CMD 运行以下命令
  CMD ["nginx"]
  ```
  ```sh
  FROM：指定基础镜像，必须为第一个命令
  MAINTAINER: 维护者信息
  RUN：构建镜像时执行的命令
  ADD：将本地文件添加到容器中，tar类型文件会自动解压(网络压缩资源不会被解压)，可以访问网络资源，类似wget
  COPY：功能类似ADD，但是是不会自动解压文件，也不能访问网络资源
  ENTRYPOINT：配置容器，使其可执行化。配合CMD可省去"application"，只使用参数。
  CMD：构建容器后调用，也就是在容器启动时才进行调用。
  LABEL：用于为镜像添加元数据
  ENV：设置环境变量
  EXPOSE：指定于外界交互的端口
  VOLUME：用于指定持久化目录
  WORKDIR：工作目录，类似于cd命令
  USER:指定运行容器时的用户名或 UID，后续的 RUN 也会使用指定用户。使用USER指定用户时，可以使用用户名、UID或GID，或是两者的组合。当服务不需要管理员权限时，可以通过该命令指定运行用户。并且可以在之前创建所需要的用户
  ARG：用于指定传递给构建运行时的变量
  ONBUILD：用于设置镜像触发器
  ```

使用 ARG 增加构建灵活性，ARG 可以在 docker build 时通过 --build-arg xxx=yyy 传入，在 dockerfile 中生效，可以使构建过程更灵活。如果是想定义运行时可以访问的变量，可以通过 ENV 定义环境变量，值使用 ARG 传入

```sh
FROM node:18-alpine3.14

ARG aaa
ARG bbb

WORKDIR /app

COPY ./test.js .

ENV aaa=${aaa} \
    bbb=${bbb}

CMD ["node", "/app/test.js"]
```

```sh
docker build --build-arg aaa=3 --build-arg bbb=4 -t arg-test -f 333.Dockerfile .
```

## Docker 网络


## Docker Compose
- 安装
  ```sh
  curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  ```

- 国内加速安装
  ```sh
  curl -L https://get.daocloud.io/docker/compose/releases/download/1.24.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  ```
- docker-compose --version

## docker迁移
安装完Docker后，默认存储路径在/var/lib/docker目录，如果服务器挂载的硬盘不是根目录的话，可能会造成资源不够用。这时候就需要迁移docker默认的目录。
1.停止docker服务
	systemctl stop docker
2.创建docker新目录
	mkdir -p /data/docker/lib
3.安装迁移软件包
	yum install rsync -y
4.开始迁移
	rsync -avzP /var/lib/docker /data/docker/lib/
5.修改docker配置文件docker.service
	vi /lib/systemd/system/docker.service
	在ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock后添加--graph=/data/	docker/lib/docker
6.重启docker
	systemctl daemon-reload
	systemctl restart docker
7.确认docker没有问题，删除原目录
	rm -rf /var/lib/docker

## Kubernetes 