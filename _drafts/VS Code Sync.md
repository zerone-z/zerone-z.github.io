---
layout: post
title: VS Code同步插件和配置
motto: null
excerpt: 当VS Code的扩展越装越多，配置也越来越偏离系统的默认设置时，一旦电脑重装需要复原当前的配置和扩展，或者在多台电脑上使用统一配置和扩展时，这将是一件比较头疼的事。本篇文章就介绍一个VS Code配置和插件的备份同步以及恢复的方法。
tags: [VS Code, Settings Sync]
---

<!-- * TOC
{:toc} -->

# 简述  

当VS Code的扩展越装越多，配置也越来越偏离系统的默认设置时，一旦电脑重装需要复原当前的配置和扩展，或者在多台电脑上使用统一配置和扩展时，这将是一件比较头疼的事。下面就分享一个VS Code配置和插件的备份同步以及恢复的方法。那就是VS Code的插件 `Settings Sync` ，我们可以利用该插件实现同步VS Code的设置文件、自定义快捷键、用户风格、初始化脚步及代码片段，还支持已安装的插件同步。  

# Settings Sync  

在使用Settings Sync做同步之前，我们需要满足以下两个条件：  

 - 在VS Code内已安装 `Settings Sync` 插件。  
 - 拥有一个GitHub账号。 

## 安装  

首先打开VS Code的 Preferences->Extensions->搜索 **Settings Sync** 插件，然后安装。  

![search](/assets/posts/vscode/vscode_sync_install.png)

## 配置  

### **Personal Access Token** 创建  

首先登陆自己的[Github](http://github.com/)，找到 **Settings** 项。  

![github setting](/assets/posts/vscode/vscode_github_setting.png)

进入Github的设置界面，找到左侧菜单项 **Developer settings** 。  

![github developer settigns](/assets/posts/vscode/vscode_github_developer.png)

点击菜单 **Developer settings** 进入下一界面，找到并点击 **Personal access tokens** 菜单项。  

![github personal access tokens](/assets/posts/vscode/vscode_github_person_access_tokens.png)

点击 **Generate new token** 创建一个新的 **token** 。  

![github pat new](/assets/posts/vscode/vscode_github_pat_new.png)

**Token description** 名称随便填写，需要勾选 **gist** 选项。然后点击 **Generate token** 生成token。  

![github pat done](/assets/posts/vscode/vscode_github_pat_done.png)

> 这里要注意这个Personal Access Token只会显示这一次，必须要复制保存下来，下次进来就看不到该Token了，只会显示你在Token description中填写的名称。  

### vscode配置

打卡vscode，菜单 view->command palette ，在弹出输入sync，选择上传设置（按 `alt+shift+u` 组合键）。窗口顶部就会出现一个小提示，输入刚才github中生产的 **Personal Access Token**。

![github token](/assets/posts/vscode/vscode_github_token.png)

回车，就会在输出里面看到配置文件，里面有我们生产的 **Personal Access Token** 以及Gist。  

![github token](/assets/posts/vscode/vscode_configuration.png)

这样就会自动备份vscode的插件及各种配置了。

记好里面的 **GitHub Token** 和 **GitHub Gist** ，换台电脑或者重装vscode后，需要下载配置时，需要用到这两个东西。

## 使用  

### 重置Sync Token

打卡vscode，菜单 view->command palette ，在弹出输入sync，选择重置设置。

![github token](/assets/posts/vscode/vscode_sync_reset.png)

### 下载设置

打卡vscode，菜单 view->command palette ，在弹出输入sync，选择下载设置。

按照要求输入 GitHub Token 和 GitHub Gist 就可以下载你需要的配置了。

### 自动下载/上传

该插件默认是没有启用自动上传或下载功能的，需要我们自己选择是否开启该功能。

打卡vscode，菜单 view->command palette ，在弹出输入sync，选择高级选项。

![github token](/assets/posts/vscode/vscode_sync_advanced_options.png)

然后选择开启自动上传和自动下载。

![github token](/assets/posts/vscode/vscode_sync_auto.png)
