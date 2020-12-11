---
layout: note
title: Mac Launchd 定制唤醒任务
motto: null
excerpt: 有时我们需要根据环境变化自动化的处理一些事情，比如：当 WIFI 改变时，自动判断是在公司、家里、或者其他地方，然后自动切换电脑的使用环境；或者当文件夹下出现图片后，自动上传的云端，或者定时定点的处理事情。这时，我们就可以使用 Launchd 来监听触发条件。
tags: [Mac, Launchd]
---

<!-- * TOC
{:toc} -->

# Launchd  

## 简介  

Launchd 是一套统一的开源服务管理框架，它用于启动、停止以及管理后台程序、应用程序、进程和脚本。Launchd 由苹果公司的 Dave Zarzycki 所编写，在 OS X Tiger 系统中首次引入并且获得 Apache 授权的许可证。事实上，Launchd 是 mac OS 第一个启动的进程，它的 PID 为 1，整个系统的其他进程都是由它创建的。
当 Launchd 启动后，它会扫描硬盘指定目录下的配置文件，来完成启动任务。这些文件为 plist，本质上是 XML。每一个 plist 文件，都是一个任务。当然启动加载了任务，不代表就会运行 plist 文件中所描述的服务，只有当符合 plist 中配置的条件发生了，才会触发运行服务。  
更多详细的内容，可以点击查看官方文档 [Daemons and Services Programming](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/Introduction.html)。

## 配置目录  

当我们开机后，系统会启动 launchd 进程，然后 launchd 会在合适的时机加载下面五个目录下的 plist 文件，以启动任务。  

|     类型     |              位置              |    操作用户    |
| :----------: | :----------------------------: | :------------: |
| 用户 Agents  |    ~/Library/LaunchAgents/     | 仅当前登录用户 |
| 全局 Agents  |     /Library/LaunchAgents/     |   管理员用户   |
| 全局 Daemons |    /Library/LaunchDaemons/     |   管理员用户   |
| 系统 Agents  | /System/Library/LaunchAgents/  |      系统      |
| 系统 Daemons | /System/Library/LaunchDaemons/ |      系统      |

`/System/Library/` 目录下存放的是系统本身的文件，我们不用管。  
`/Library/` 目录下是系统管理员为所有用户存放的任务项。只有管理员才能修改该目录下的文件，且修改后，是对所有用户开放的，所有登陆后的用户都可使用下面的任务项。  
`~/Library/` 目录下是当前用户为自己存放的任务项。该目录下的任务项，只有当前登陆用户可用，其他登陆用户，无法运行任务。  
`LaunchDaemons` 目录下的任务是用户未登陆前就启动的服务（守护进程），开机时加载。
`LaunchAgents` 目录下的任务是用户登陆后启动的服务（守护进程），登陆时才会加载。

## Plist 配置  

可以随意进入上面提到的 5 个配置目录中，原地随意复制一份 plist 出来，然后将内容改为你需要的：  

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>com.zerone.test</string>
	<key>Program</key>
	<string>/Applications/zerone.app/Contents/MacOS/zerone</string>
	<key>WatchPaths</key>
	<array>
		<string>~/Downloads/</string>
	</array>
</dict>
</plist>
```

修改完成后，将 plist 的文件放入合适的配置目录中，我这里放入 `~/Library/LaunchAgents/` 。

下面列举一下常用的配置关键字：

|        关键字         |    Plist 类型    |                使用说明                |
| :-------------------: | :--------------: | :------------------------------------: |
|         Label         |      String      | 标识符，必填项，用来表示该任务的唯一性 |
|        Program        |      String      |  程序名称，用来说明运行哪个程序、脚本  |
|   ProgramArguments    |  Array[String]   |   数组程序名，同上，可以运行多个程序   |
|      WatchPaths       |  Array[String]   |  监控路径，当路径文件有变化是运行程序  |
|       RunAtLoad       |     Boolean      |          是否在加载的同时启动          |
| StartCalendarInterval | Dict/Array[Dict] |                运行时间                |
|     StartInterval     |     Integer      |           时间间隔，单位为秒           |

如果想了解更多的关键字，可以参考查看 **launchd.plist** 手册。打开终端，输入如下命令即可查看：  

```shell
$ man launchd.plist
```

### 两种指定执行命令的方法  

 - **Program** 和 **ProgramArguments** 两个同时存在，或者只有 **Program** 时。  

  **Program** ：设置运行的命令文件路径，或者要执行的文件路径。
  **ProgramArguments** ：设定执行时，传入到命令或者执行文件的参数。

  注意：如果这里要运行的文件为 app 时，不能只是到 app 地址（ `/Applications/zerone.app` ），而是要到 app 中的执行文件（ `/Applications/zerone.app/Contents/MacOS/zerone` ）。  

 - **ProgramArguments** 只有该关键字， 没有 **Program** 时。  

  此时 **ProgramArguments** 中的每个参数设置的都是要执行的命令或者执行文件路径，其他的参数为传入参数。

### 设置执行时间  

 - **StartCalendarInterval** 设置指定执行时间

  可以使关键字 **Minute** , **Hour** , **Day** , **Month** , **Weekday** 来设置指定时间。如：  

  ```xml
  <!-- 每天的 9:30 执行 -->
  <key>StartCalendarInterval</key>
  <dict>
    <key>Minute</key>
    <integer>30</integer>
    <key>Hour</key>
    <integer>9</integer>
  </dict>
  ```

  - **StartInterval** 设置执行的时间间隔，单位为秒。

  ```xml
  <!-- 每隔一小时执行一次 -->
  <key>StartInterval</key>
  <integer>3600</integer>
  ```

## launchctl 命令

**launchctl** 是 **launchd** 的管理工具，它用于管理 plist 文件对应服务的启动、停止、重启等等。正常情况下，我们是不需要使用命令行的，系统会自动帮我们管理好任务的加载/卸载。但是我们在开始创建任务，刚刚添加 plist 文件，需要验证 plist 文件是否有效且能够执行，我们可以通过 **launchctl** 命令手动管理 plist 文件任务的加载/卸载。  

注意：操作时前面可以带上 `sudo` ，不然只能操作当前用户的服务，会出现无法操作一些 root 用户的服务的问题。  

使用 `launchctl help` 查看更多用法。  

### 加载任务到启动列表

```shell
# 加载任务，-w 选项会将 plist 文件中无效的 key 覆盖掉，建议加上
$ sudo launchctl load -w ~/Library/LaunchAgents/com.zerone.test.plist
# 启动服务
$ sudo launchctl start com.zerone.test
```

如果在执行 `launchctl load` 命令加载失败，出现 `Path had bad ownership/permissions` 错误，那是因为 root 和 group wheel 没有该 plist 文件的所有权。可以执行如下命令使 root 和 group wheel 用户拥有该 plist 文件。 

```shell
$ sudo chown root ~/Library/LaunchAgents/com.zerone.test.plist
$ sudo chgrp wheel ~/Library/LaunchAgents/com.zerone.test.plist
```

或者也可以把上面两条命令行简化成下面一行命令：  

```shell
$ sudo chown root:wheel ~/Library/LaunchAgents/com.zerone.test.plist
```

### 查看任务

```shell
# 查看所有任务列表
$ sudo launchctl list
# 查看任务列表，使用 grep '任务部分名字' 过滤
$ sudo launchctl list | grep 'com.zerone.test'
# PID  Status  label
  -    78      com.zerone.test # 错误结果
  -    0       com.zerone.test # 正确结果
```

其中 PID 是 `-` 开头表示加载了任务，但是未启动；如果是数字开头，表示已启动且这个数字就是他的 PID。

如果在执行 `launchctl list` 命令时出现错误结果，则需要检查下，plist 文件是否配置正确，执行命令或者文件内容是否无误。

### 卸载任务命令

```shell
# 停止服务
$ sudo launchctl stop com.zerone.test
# 杀死启动的服务（PID 是数字）
# sudo launchctl stop com.zerone.test
# 卸载任务
$ sudo launchctl unload -w ~/Library/LaunchAgents/com.zerone.test.plist
```
