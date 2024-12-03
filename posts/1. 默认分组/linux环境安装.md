---
title: 'linux学习笔记'
date: '2020-01-01'
---
# linux环境安装

linux学习笔记
<!-- more -->
## 网络配置
1. 虚拟机网络设置-桥接
2. dhclient-自动分配网络地址
	```sh
	dhclient
	```
3. 网络配置 vim /etc/sysconfig/network-scripts/ifcfg-xxx
	```
	BOOTPROTO=static 
	ONBOOT=yes
	IPADDR=192.168.X.XX     IP地址
	NETMASK=255.255.255.0   子网掩码
	GATEWAY=192.168.X.1     网关
	DNS1=119.29.29.29       公网DNS地址
	```
4. 重启网卡 
	```sh
	systemctl restart network.service
	```
5. 检查配置结果
6. 开启端口
	```sh
	/sbin/iptables -I INPUT -p tcp --dport 80 -j ACCEPT
	```

## 设置时间同步
```sh
# 1 安装ntpdate工具
yum -y install ntp ntpdate

# 2.设置系统时间与网络时间同步
ntpdate 0.centos.pool.ntp.org

# 3.将系统时间写入硬件时间
hwclock --systohc
```

## 防火墙
```sh
# 1.启动防火墙 
systemctl start firewalld

# 2.禁用防火墙 
systemctl stop firewalld

# 3.设置开机启动 
systemctl enable firewalld

# 4.停止并禁用开机启动
sytemctl disable firewalld

# 5.重启防火墙 
firewall-cmd --reloa
```

## 安装git
```sh
　　yum install curl-devel expat-devel gettext-devel openssl-devel zlib-devel gcc perl-ExtUtils-MakeMaker

　　yum remove git

    wget https://www.kernel.org/pub/software/scm/git/git-2.8.3.tar.gz

    tar -zxvf git-2.8.3.tar.gz

　　cd git-2.8.3

　　./configure prefix=/usr/local/git/

　　make && make install

　　vi /etc/profile
　　
　  //在最后一行加入
　　export PATH=$PATH:/usr/local/git/bin
　　
　　//让该配置文件立即生效
　　source /etc/profile

```