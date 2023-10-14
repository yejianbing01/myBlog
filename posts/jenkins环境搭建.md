---
title: 'jenkins环境搭建'
date: '2020-10-14 16:27:27'
---

![alt](/images/jenkins.png)

<!-- more -->

# **1.普通搭建**
1. 获取安装列表
yum -y list java*
2. 安装JDK环境
yum -y install java
3. 测试JDK是否安装成功
java -version
4. 下载Jenkins和maven
查看版本 http://pkg.jenkins-ci.org/redhat-stable/
wget http://repos.fedorapeople.org/repos/dchen/apache-maven/epel-apache-maven.repo -O /etc/yum.repos.d/epel-apache-maven.repo
wget http://pkg.jenkins-ci.org/redhat-stable/jenkins-2.7.3-1.1.noarch.rpm
5. 安装maven
yum -y install apache-maven
6. 安装Jenkins
rpm -ivh jenkins-2.7.3-1.1.noarch.rpm
7. 修改启动端口
vim /etc/sysconfig/jenkins
8. 重启服务
service jenkins restart
9. 查看jenkins密码并复制
vim /var/lib/jenkins/secrets/initialAdminPassword

# **2. 基于Docker安装Jenkins环境**

1. 使用docker 安装jenkins

```sh
docker run -it --name jenkins -e TZ=Asia/Shanghai \
	-p 8080:8080 -p 50000:50000 \
	-v ~/mnt/jenkins/jenkins_home:/var/jenkins_home \
	jenkins/jenkins
```

# **3.使用tomcat，jenkins.war包安装jenkins**

- java环境安装
    ```sh
    # jdk下载地址： https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
    
    # 安装java
    mkdir /usr/local/java

    tar -xvf jdk-8u291-linux-x64.tar -C /usr/local/java

    vi /etc/profile
    # 添加以下内容
    export JAVA_HOME=/usr/local/java/jdk1.8.0_291
    export JAVA_BIN=/usr/local/java/jdk1.8.0_291/bin　　
    export PATH=$PATH:$JAVA_HOME/bin
    export CLASSPATH=:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
    export PATH=$JAVA_HOME/bin:$JRE_HOME/bin:$PATH
    
    # 立即生效
    source /etc/profile
    ```
- maven环境安装
   ```sh
   # 下载地址
   https://maven.apache.org/download.cgi
   # 解压 
   tar -zxvf apache-maven-3.8.2-bin.tar.gz -C /usr/local
   # 配置maven仓库位置，存放maven下载的内容
   cd /usr/local/apache-maven-3.8.2
   mkdir repository
   vi conf/settings.xml
   找到·localRepository下面复制一行加上<localRepository>/usr/local/apache-maven-3.8.2/repository</localRepository>
   # 配置阿里云加速下载
   vi conf/settings.xml
   找到mirror 加上阿里的仓库配置
    <mirror>
      <id>alimaven</id>
      <name>aliyun maven</name>
       <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
      <mirrorOf>central</mirrorOf>
    </mirror>
   # 配置环境变量
   vi /etc/profile
   export MAVEN_HOME=/usr/local/apache-maven-3.8.2
   export PATH=$PATH:$MAVEN_HOME/bin
   # 立即生效
   source /etc/profile
   ```
- node环境安装
    ```sh
    # 安装nvm
    wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash

    source ~/.bashrc

    nvm install v16.0.0 #安装 16.0.0 版本 

    nvm alias default v16.0.0 #设置默认 node 版本为 v16.0.0
    ```

- tomcat安装
    ```sh
    # 下载tomcat
    tar -xvf /root/pkg/apache-tomcat-8.5.64.tar -C /usr/local
    
    cd /usr/local/

    mv apache-tomcat-8.5.64/ tomcat_8.5

    # 将 jenkins.war 文件复制到 webapps 文件下
    cp pkg/jenkins.war /usr/local/tomcat_8.5/webapps/

    vi conf/server.xml
    # Host标签下添加如下代码，docBase为war包名称。
    <Context path="/" docBase="jenkins.war" debug="0" privileged="true" reloadable="true"/>
    # 如果需要部署war包到Tomcat根目录访问，删除tomcat webapps/ROOT 下的所有内容后加入以下内容
    <Context path="" docBase="/usr/local/tomcat_8.5/webapps/jenkins" debug="0" privileged="true" reloadable="true"/>

    # 启动tomcat 启动后访问http://xxx.xxx.xxx.xxx:8080/jenkins
    sh startup.sh

    ```

- jenkins配置
    1. Jenkins修改默认目录 /root/.jenkins ( 需要时修改)
        ```sh
        # linux下安装Jenkins（jenkins的war包，tomcat启动）后，默认目录为：/root/.jenkins
        # 1. 打开tomcat的bin目录，编辑catalina.sh文件。 
        # 2. 在 OS specific support. $var must be set to either true or false. 上面添加:
        export JENKINS_HOME="xxxx/xxxx"
        # 3. 修改linux系统环境变量 profile文件
        vim /etc/profile
            # 加入
            export JENKINS_HOME=/xxx/xx/xx
        # 4. 立即生效
        source /etc/profile
        # 5. 重启tomcat
        ```
    6. jenkins 修改登录用户
    ```sh
    vim /etc/sysconfig/jenkins
    ```
    7. jenkins添加全局凭证-ssh拉取git代码
    ```sh
    cd ~/.ssh
    # 如果没有文件则，需要新生成ssh秘钥
    ssh-keygen -t rsa -C “登录gitlab的邮箱”
    # id_rsa.pub：公钥，复制到gitlab平台配置ssh-key
    # id_rsa：私钥，复制到jenkins平台配置jenkins凭据
    ```
    8. jenkins域名地址配置
    ```sh
    # 系统管理/系统配置/Jenkins URL
    ```

# **4. Jenkins插件**

1. 汉化插件：[Localization: Chinese (Simplified)](https://wiki.jenkins-ci.org/display/JENKINS/Localization+zh+cn+Plugin) 
2. 用户权限插件：Role-based
3. 测试报告插件：Allure
   - 安装完成后需要配置maven下载

# **5. 环境变量配置**
1. 全局环境变配置
   ```sh
   # 系统管理/系统配置/全局属性
   键: NODE_HOME
   值: /usr/local/node
   键: PATH
   值: $NODE_HOME/bin:$PATH
   ```
2. 单节点环境变量配置
   ```sh
   # 系统管理/节点管理/设置/节点属性/
   键: NODE_HOME
   值: /usr/local/node
   键: PATH
   值: $NODE_HOME/bin:$PATH
   ```

# 6. 全局属性

 1. 工具位置
    ```sh
    # 系统管理/系统配置/全局属性
    (Allure Commandline) allure
    /usr/local/jenkins_home/tools/ru.yandex.qatools.allure.jenkins.tools.AllureCommandlineInstallation/allure
    ```


# 7. 配置gitlab,webhook

1. 安装插件
   - [Generic Webhook Trigger Plugin](https://plugins.jenkins.io/generic-webhook-trigger)
   - [GitLab Plugin](https://plugins.jenkins.io/gitlab-plugin)
2. GitLab创建Personal Access Tokens
	- 个人头像/setting/Access Tokens/Scopes-api
3. Jenkins配置GitLab信息
   - 系统管理/系统配置/GitLab
   - 配置项目仓库url
   - 添加凭证GitLab API Token
4. Jenkins工程添加构建触发器
   - 复制GitLab webhook URL: xxxxxx 
   - 高级 > 可设置触发分支
   - 将GitLab webhook URL添加到GitLab WebHook中

# 8. 常见错误
> ERROR: Step ‘Allure Report’ aborted due to exception: 
com.fasterxml.jackson.core.io.JsonEOFException: Unexpected end-of-input in field name
at [Source: (ZipFileInflaterInputStream); line: 1537127, column: 22]

错误原因：日志内容太大，增加tomcat内存。
```sh
vi catalina.bat
# 第一行加入
set JAVA_OPTS="-Xms1024m -Xmx4096m -Xss1024K -XX:PermSize=512m -XX:MaxPermSize=2048m"
# 重启tomcat
```
防止allure生成报告的进程未停止，占用allure-results目录
```sh
ALLURE_PID_LIST=$(ps -ef | grep 'allure' | grep -v 'grep' | awk '{print $2}')

for ALLURE_PID in $ALLURE_PID_LIST;
do
   kill -9 $ALLURE_PID
done;
```

定时构建不发送邮件
```sh
user="Timer Trigger"
debug=false
if [ "$BUILD_USER" = "$user" ]
then
	debug=true
fi


cd ./node

rm -rf allure-results

npm run slh1 -- --env=slh1_adev1 --debug=$debug
```
