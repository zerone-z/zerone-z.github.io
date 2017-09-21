---
layout: post
title: 使用CocoaPods做iOS程序的依赖管理
motto: null
excerpt: 主要介绍了CocoaPods的安装以及使用。
tags: [iOS, CocoaPods]
---

<!-- * TOC
{:toc} -->

# CocoaPods简介  

[CocoaPods](https://cocoapods.org/)是为iOS程序提供依赖管理的工具，就像Java语言的Maven，Nodejs的npm一样。CocoaPods的[项目源码](https://github.com/CocoaPods/CocoaPods)在Github上管理。我们在开发iOS项目的时候，不可避免地要使用第三方的开源库，CocoaPods的出现使得我们可以节省设置和更新第三方开源库的时间。  
在使用CocoaPods以前，我们需要：  

 1. 把这些第三方开源库的源码文件复制到项目中，或者设置成git的submodule。
 2. 对这些开源库需要依赖的一些framework，我们需要手工将这些framework增加到项目依赖中。
 3. 对某些开源库，还需要设置`-licucore`或者`-fno-objc-arc`等编译参数。
 4. 需要手动管理这些依赖包的更新。

这些虽然简单，但是毫无技术含量并且浪费时间。但是，在我们使用CocoaPods之后，我们就可以很轻松的进行管理了。

# CocoaPods安装 

在安装CocoaPods之前，首先要在本地安装好Ruby环境（Mac下自带ruby）。  
假如你在本地已经安装好Ruby环境，那么下载和安装CocoaPods将十分简单。  

首先打开终端。  

然后输入以下命令更新gem。如果已是最新的可跳过该步骤个。  

```vim
$ sudo gem update --system
```

如果上面的更新Gem出错，可使用如下命令更新。(OS X 10.11后苹果升级了安全策略)  

```vim
$ sudo gem update -n /usr/local/bin --system
```

更新完以后，输入以下命令安装CocoaPods。   

```vim
$ sudo gem install cocoapods                # 安装最新版本
$ sudo gem install cocoapods -v 1.0.0       # 安装指定版本
$ sudo gem install cocoapods --pre          # 安装最新的release beta版本
```

但是，且慢。如果你在天朝，在终端中敲入这个命令之后，会发现半天没有任何反应。原因无他，因为那堵墙阻挡了cocoapods.org。建议更换成Ruby-China的源，参考[https://gems.ruby-china.org/](https://gems.ruby-china.org/)。按照下面的顺序在终端中敲入依次敲入命令：

```vim
$ gem sources --remove https://rubygems.org/
# 等有反应之后再敲入以下命令
$ gem sources -a https://gems.ruby-china.org/
```

为了验证你的Ruby镜像是否更换成功，可以用以下命令查看：

```
$ gem sources -l
```

只有在终端中出现下面文字才表明你上面的命令是成功的：

```
*** CURRENT SOURCES ***

        https://gems.ruby-china.org/
```

这时候，你再次在终端中运行：

```
// 安装CocoaPods（OS X 10.11以前）
$ sudo gem install cocoapods
// 安装CocoaPods（OS X 10.11后苹果升级了安全策略）
$ sudo gem install -n /usr/local/bin cocoapods
```

等上十几秒钟，CocoaPods就可以在你本地下载并且安装好了。  

如果突然有一天不想用CocoaPods了，想卸载掉，那么就执行如下命令：  

```vim
$ sudo gem uninstall cocoapods
```

接下来使用如下命令，下载更新CocoaPods的本地Podspec索引文件。本步骤可以跳过，不需要手动执行，因为在你执行`pod install`或者`pod update`命令的时候，会自动执行该命令。虽然可以跳过该命令，但是强烈建议调用该命令，手动执行更新本地索引文件，因为如果本地索引文件不是最新，在你搜索、更新、安装的过程中，下载的第三方库可能不是最新的。  

```vim
$ pod setup
```

CocoaPods中所有的项目Podspec索引文件都托管在[CocoaPods的github网站](https://github.com/CocoaPods/Specs.git)。第一次执行`pod setup`时， CocoaPods会见这些`podspec`索引文件更新到本地的`~/.cocoapods/`目录下。这个文件比较大，所以第一次更新的时候非常慢，需要耐心等待，我们也可以通过CD命令进入`~/.cocoapods/repos`目录，然后使用命令`$ du -sh *`来查看下载文件的大小。  
通过命令行下载很慢，我们可以通过手动下载podspec索引文件，然后在放到`~/.cocoapods/`目录下，步骤如下：  
 
 1. 进入[CocoaPods的github网站](https://github.com/CocoaPods/Specs.git)，下载下来所需的文件。
 2. 将下载下来的压缩文件解压，文件夹重命名为`master`。
 3. 进入目录`~/.cocoapods/repos`。
 4. 把下载下来的重命名为`master`的文件拖入目录`~/.cocoapods/repos`中。

# CocoaPods使用  

首先，我们需要在我们的项目中加入CocoaPods的支持。为了确定我们所需要的第三方库（如AFNetworking）是否支持CocoaPods，可以用CocoaPods的搜索功能验证一下。在终端中输入：  

```
$ pod search AFNetworking
```

过几秒钟之后，你会在终端中看到你所搜索的第三方类库的一些信息。这说明，第三方库是支持CocoaPods，所以我们可以利用CocoaPods将第三方库导入你的项目中。下面就具体的介绍以下步骤，以第三方库AFNetworking为例。    

首先利用Xcode在桌面上创建一个名字为`CocoaPodsDemo`的项目。  
打开终端，在终端中输入如下命令，进入项目`CocoaPodsDemo`所在的目录。  

```vim
$ cd ~/Desktop/CocoaPodsDemo
```

运行如下命令创建Podfile文件（文件名必须是Podfile）。  

```vim
$ vim Podfile
```

然后在Podfile文件中，输入以下内容：  

```vim
platform :ios, '7.0'
  pod "AFNetworking", "~> 2.0"
```

 > NOTE: 这两句文字的意思是，当前AFNetworking支持的iOS最高版本是iOS 7.0, 要下载的AFNetworking版本是2.0。

然后保存退出。在Podfile处于编辑状态下，先按`ESC`键，再按`shift + :`组合键，输入命令： `:wq`保存退出。
这时候你会发现在你的项目目录中，出现了一个名字为`Podfile`的文本文件，而且文件内容就是刚刚输入的内容。注意，Podfile文件应该和工程文件`.xcodeproj`在同一个目录下。  
有了该文件，我们就可以运行如下命令执行Cocoapods安装了。  

```vim
$ pod install
```

在使用CocoaPods的时候，如果出现`Updating local specs repositories`的情况，一只等待着下载，就是不见有反应，可以使用如下命令，跳过更新本地仓库的步骤。  

```vim
$ pod install --verbose --no-repo-update
```

其实出现上面的情况，就是在执行命令`pod install`的时候，默认执行了`pod setup`进行更新本地仓库。如果我们确认本地仓库已经是最新的了，是不需要每次都检查更新的，所以可以执行下面的那个安装命令。   
到这里CocoaPodsDemo项目就做好了CocoaPods的依赖管理了。下面就可以打开我们的项目进行开发了。但是有两点需要记住：  

 1. 我们需要使用CocoaPods生成的`*.xcworkspace`文件来打开工程，而不是以前的`*.xcodeproj`文件。  
 2. 每次更改了Podfile文件，我们都需要重新执行一次`$ pod update`命令。


> NOTE: 新手注意了哦，也许我们会在Github上找到一份代码项目，下载下来一编译，发现各种错误，缺失了各种其他第三方类库。这时候莫慌，你再仔细一看，会发现你下载的代码包含了Podfile。那就容易了，打开终端，进入项目所在的目录，也就是和Podfile在同一目录下，输入以下命令（由于已经有Podfile，所以不需要再创建Podfile）：`$ pod update`。  

> NOTE：这里有个小问题，如果刚刚你不是输入`$ pod update`，而是输入`$ pod install`，会发现类库导入不成功，并且终端出现提示。提示的大概意思是Podfile文件过期，类库有升级，但是Podfile没有更改。`$ pod install`只会按照Podfile的要求来请求类库，如果类库版本号有变化，那么将获取失败。但是`$ pod update`会更新所有的类库，获取最新版本的类库。而且你会发现，如果用了 `$ pod update`，再用 `$ pod install`就成功了。那你也许会问，什么时候用 `$ pod install`，什么时候用 `$ pod update` 呢，我又不知道类库有没有新版本。好吧，那你每次直接用` $ pod update`算了。或者先用 `$ pod install`，如果不行，再用 `$ pod update`。 

## 关于Podfile.lock  

当你执行`pod install`之后，除了 Podfile 外，CocoaPods 还会生成一个名为`Podfile.lock`的文件，`Podfile.lock` 应该加入到版本控制里面，不应该把这个文件加入到`.gitignore`中。因为`Podfile.lock`会锁定当前各依赖库的版本，之后如果多次执行`pod install`不会更改版本，要`pod update`才会改`Podfile.lock`。这样多人协作的时候，可以防止第三方库升级时造成大家各自的第三方库版本不一致。 

## Swift项目中的Podfile  

在Swift项目中，Podfile文件需要加入`use_frameworks!`,且在文件最后需要加入如下代码：  

```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_VERSION'] = '3.0'
    end
  end
end
```

最终配置如下：  

```ruby
platform :ios, '9.0'

use_frameworks!

pod 'SnapKit'
pod 'RealmSwift'
pod 'Toast-Swift'
pod 'Charts'

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_VERSION'] = '3.0'
    end
  end
end
```
