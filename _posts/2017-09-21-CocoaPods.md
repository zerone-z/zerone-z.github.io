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
# 安装CocoaPods（OS X 10.11以前）
$ sudo gem install cocoapods
# 安装CocoaPods（OS X 10.11后苹果升级了安全策略）
$ sudo gem install -n /usr/local/bin cocoapods
```

等上十几秒钟，CocoaPods就可以在你本地下载并且安装好了。  

如果突然有一天不想用CocoaPods了，想卸载掉，那么就执行如下命令：  

```vim
$ sudo gem uninstall cocoapods
```

接下来使用如下命令，下载更新CocoaPods的本地Podspec索引文件。CocoaPods 1.0版本以前本步骤可以跳过，不需要手动执行，因为在你执行`pod install`或者`pod update`命令的时候，会自动执行该命令。但是在CocoaPods 1.0及以后的版本中，不会自动更新本地Podspec索引文件，不更新成为默认行为，如果想要更新需要加入参数`--repo-update`，完整的命令是`pod install --repo-update`。所以这里强烈建议调用该命令，更新本地索引文件，因为如果本地索引文件不是最新，在你搜索、更新、安装的过程中，下载的第三方库可能不是最新的。  

```vim
$ pod setup --verbose
```

CocoaPods中所有的项目Podspec索引文件都托管在[CocoaPods的github网站](https://github.com/CocoaPods/Specs.git)。第一次执行`pod setup`时， CocoaPods会将这些`podspec`索引文件更新到本地的`~/.cocoapods/`目录下。这个文件比较大，所以第一次更新的时候非常慢，需要耐心等待，我们也可以通过CD命令进入`~/.cocoapods/repos`目录，然后使用命令`$ du -sh *`来查看下载文件的大小。  
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
$ pod init  # 可以不使用该命令创建Podfile文件
$ vim Podfile
```

> 可以跳过命令`pod init`，直接使用`vim Podfile`来创建Podfile文件。但是如果使用了`pod init`命令，CocoaPod会在Podfile中写入一些默认内容，而不是一个空文件。

然后在Podfile文件中，输入以下内容：  

```ruby
platform :ios, '9.0'

target 'CocoaPodsDemo' do
  pod 'AFNetworking', '~> 0.9.0'
end
```

 > NOTE: 这两句文字的意思是，当前AFNetworking支持的iOS最高版本是iOS 9.0, 要下载的AFNetworking版本是0.9.0。

然后保存退出。在Podfile处于编辑状态下，先按`ESC`键，再按`shift + :`组合键，输入命令： `:wq`保存退出。
这时候你会发现在你的项目目录中，出现了一个名字为`Podfile`的文本文件，而且文件内容就是刚刚输入的内容。注意，Podfile文件应该和工程文件`.xcodeproj`在同一个目录下。  
有了该文件，我们就可以运行如下命令执行Cocoapods安装了。  

```vim
$ pod install
```

在CocoaPods 1.0版本以前，如果出现`Updating local specs repositories`的情况，一只等待着下载，就是不见有反应，可以使用如下命令，跳过更新本地仓库的步骤。  

```vim
$ pod install --verbose --no-repo-update
```

其实出现上面的情况，就是在执行命令`pod install`的时候，CocoaPods 1.0版本以前默认执行了`pod setup`进行更新本地仓库。如果我们确认本地仓库已经是最新的了，是不需要每次都检查更新的，所以可以执行上面的那个安装命令。   
到这里CocoaPodsDemo项目就做好了CocoaPods的依赖管理了。下面就可以打开我们的项目进行开发了。但是有两点需要记住：  

 1. 我们需要使用CocoaPods生成的`*.xcworkspace`文件来打开工程，而不是以前的`*.xcodeproj`文件。  
 2. 每次更改了Podfile文件，我们都需要重新执行一次`$ pod update`命令。


> NOTE: 新手注意了哦，也许我们会在Github上找到一份代码项目，下载下来一编译，发现各种错误，缺失了各种其他第三方类库。这时候莫慌，你再仔细一看，会发现你下载的代码包含了Podfile。那就容易了，打开终端，进入项目所在的目录，也就是和Podfile在同一目录下，输入以下命令（由于已经有Podfile，所以不需要再创建Podfile）：`$ pod update`。  

> NOTE：这里有个小问题，如果刚刚你不是输入`$ pod update`，而是输入`$ pod install`，会发现类库导入不成功，并且终端出现提示。提示的大概意思是Podfile文件过期，类库有升级，但是Podfile没有更改。`$ pod install`只会按照Podfile的要求来请求类库，如果类库版本号有变化，那么将获取失败。但是`$ pod update`会更新所有的类库，获取最新版本的类库。而且你会发现，如果用了 `$ pod update`，再用 `$ pod install`就成功了。那你也许会问，什么时候用 `$ pod install`，什么时候用 `$ pod update` 呢，我又不知道类库有没有新版本。好吧，那你每次直接用` $ pod update`算了。或者先用 `$ pod install`，如果不行，再用 `$ pod update`。  

## Swift项目中的Podfile  

想要在Swift项目中使用CocoaPods，Podfile文件必须明确写入`use_frameworks!`来选择使用框架，否则会报错，且在文件最后需要加入如下代码：  

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

target 'CocoaPodsDemo' do
    pod 'SnapKit'
    pod 'RealmSwift'
    pod 'Toast-Swift'
    pod 'Charts'
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_VERSION'] = '3.0'
    end
  end
end
```

## Podfile文件  

对于我们来说，使用CocoaPods打交道最多的就是Podfile文件，我们知道CocoaPods是用ruby实现的，因此Podfile文件的语法就是ruby语法。Podfile文件定义了项目所需要使用的第三方库。下面就简要的介绍一下Podfile，若要了解更多相关信息，请查阅 [Podfile指南](https://guides.cocoapods.org/syntax/podfile.html)。  

### Podfile文件存放位置  

通常情况下我们都推荐Podfile文件都放在工程根目录下。  

![Podfile文件位置](/assets/posts/CocoaPods/Podfile_Address.png)

事实上Podfile文件可以放在任意一个目录下，需要做的是在Podfile文件中指定工程路径，和原来相比，Podfile文件就在最开始的位置增加了一行内容，具体如下：  

```ruby
project '~/Desktop/CocoaPodsDemo/CocoaPodsDemo.xcodeproj'

platform :ios, '9.0'
  
pod 'AFNetworking', '~> 0.9.0'
```

指定路径使用的是`project`关键字，此后进入Podfile文件所在的路径，执行CocoaPods命令就和之前的一样，而且生成的相关文件都放在了Podfile所在的目录下。  

![项目生成位置](/assets/posts/CocoaPods/Xcworkspace_Address.png)

### Podfile和target  

Podfile的本质上是用来描述Xcode工程中的targets用的。在CocoaPods 1.0版本以后明确要求Pods依赖库必须指定target。    
如果想在一个Podfile中同时描述项目中的多个target，根据需求的不同，可以有不同的实现方式。我们在原工程的基础上在建立一个`Second`的target。  

![项目生成位置](/assets/posts/CocoaPods/target.png)

#### 多个target使用相同的Pods依赖库  

比如名称为CocaoPodsDemo和Second的target都需要使用Alamofire、SnapKit这两个Pods依赖库，在CocoaPods 1.0版本以前，可以使用 `link_with` 关键字来实现两个不同的target共用相同的Pods依赖库，Podfile写成如下方式：  

```ruby
link_with 'CocoaPodsDemo', 'Second'
platform :ios, '9.0'

pod 'SnapKit', '~> 4.0'
pod 'Alamofire', '~> 4.5'
```

在CocoaPods 1.0及以后的版本中，`link_with`已经被废弃了，且必须明确指名target。不过，不用担心，我们可以使用`abstract_target`这个特性定义一个抽象target，方便被所有继承target使用。  

```ruby
# 这里定义的shared是一个抽象的target，也就是说在项目中并没有这个target
abstract_target 'shared' do
    use_frameworks!
    pod 'SnapKit', '~> 4.0'
    pod 'Alamofire', '~> 4.5'
    
    # 这里的CocoaPodsDemo继承自shared中引入的库
    target 'CocoaPodsDemo' do
    end
    
    # 这里的Second继承自shared中引入的库
    target 'Second' do
    end
end
```

#### 不同的target使用完全不同的Pods依赖库  

有时在同一个项目中多个target可能依赖的库完全不同，比如：CocoaPodsDemo使用Alamofire、SnapKit两个依赖库，但Second使用RealmSwift这个库，这时可以使用`target`关键字来实现不同的target使用不同的Pods依赖库。  

```ruby
platform :ios, '9.0'

target 'CocoaPodsDemo' do
    use_frameworks!
    pod 'SnapKit', '~> 4.0'
    pod 'Alamofire', '~> 4.5'
end

target 'Second' do
    use_frameworks!
    pod 'RealmSwift', '3.0.0-rc.1'
end
```

#### 多个target使用部分相同的Pods依赖库  

有时也会遇到多个多个target中部分依赖的库相同，但是又有一部分不同，比如：CocoaPodsDemo和Second都使用Alamofire、SnapKit两个依赖库，另外CocoaPodsDemo又使用SwiftyJSON库，Second使用RealmSwift库，这时可以使用`def`关键字来定义一个共享的依赖库，让后在两个target中引用这个共享的依赖库。  

```ruby
platform :ios, '9.0'

def shared
    pod 'SnapKit', '~> 4.0'
    pod 'Alamofire', '~> 4.5'
end

target 'CocoaPodsDemo' do
    use_frameworks!
    shared
    pod 'SwiftyJSON', '2.2.0'
end

target 'Second' do
    use_frameworks!
    shared
    pod 'RealmSwift', '3.0.0-rc.1'
end
```

在CocoaPods 1.0及以后的版本中，我们也可以使用`abstract_target`的特性来实现。  

```ruby
# 这里定义的shared是一个抽象的target，也就是说在项目中并没有这个target
abstract_target 'shared' do
    use_frameworks!
    pod 'SnapKit', '~> 4.0'
    pod 'Alamofire', '~> 4.5'
    
    # 这里的CocoaPodsDemo继承自shared中引入的库，另外也会引入SwiftyJSON库
    target 'CocoaPodsDemo' do
        pod 'SwiftyJSON', '2.2.0'
    end
    
    # 这里的Second继承自shared中引入的库，另外也会引入RealmSwift库
    target 'Second' do
        pod 'RealmSwift', '3.0.0-rc.1'
    end
end
```

### 其他配置项  

1. Source：指定pod仓库的来源
   如果不指定source，默认使用CocoaPods官方source，这里建议使用默认位置。  

    ```ruby
    # 使用其他来源地址
    source 'https://github.com/artsy/Specs.git'
    # 使用官方默认地址（默认）
    source 'https://github.com/CocoaPods/Specs.git'
    ```

2. platform：指定应建立的静态库的平台，其默认配置有： 
    
    - iOS, 4.0
    - OS X, 10.6
    - tvOS, 9.0
    - watchOS, 2.0
    
    使用实例：`platform :ios, '9.0'`

3. inhibit_all_warnings!：屏蔽所有来自与CocoaPods依赖库的警告。
    
    - 可以全局定义：在Podfile文件前面加入这样的一行代码
    - 可以在target里面定义：在每个target中加入这样的一行代码
    - 可以指定某个库：`pod 'SnapKit', '~> 4.0', :inhibit_warnings => true`

4. workspace：指定生成的`*.xcworkspace`工程空间名称，默认不需要指定，和工程名称保持一致。
    在Podfile文件中加入这样的一行`workspace 'MyWorkspace'`

5. use_frameworks!：要求生成的是framework而不是静态库
6. pod：指定项目的依赖项。
   在上面我们已经使用pod来引入第三方库。pod的格式是由库的名称和一个可选的版本组合在一起的。一般会有以下几种组合：  
   
   - `pod 'SnapKit'`：不写依赖库版本号，那么CocoaPods会默认选择最新版本。
   - `pod 'SnapKit', '4.0'`：指定特定的版本号，CocoaPods会使用特定版本的库。
   - `pod 'SnapKit', '~> 4.0'`：指定版本范围，有以下几种:  
        
        - `> 4.0`：高于4.0版本（不包含4.0版本）的任一版本
        - `>= 4.0`：高于等于4.0版本的任一版本
        - `< 4.0`：低于4.0版本（不包含4.0版本）的任一版本
        - `<= 4.0`：低于等于4.0版本的任一版本
        - `~> 4.1.2`：从4.1.2到4.2.0的任一版本，不包含4.2.0版本，当包括4.1.2版本。

最终的配置如下：  

```ruby
# 指定参考来源
source 'https://github.com/CocoaPods/Specs.git'
# 指定项目位置
project '~/Desktop/CocoaPodsDemo/CocoaPodsDemo.xcodeproj'
# 指定静态库平台
platform :ios, '9.0'
# 指定生成的工程空间名称
workspace 'MyCocoaPods'
# 忽略警告
inhibit_all_warnings!

abstract_target 'shared' do
    # 要求生成的是framework而不是静态库
    use_frameworks!
    # 该库忽略警告
    pod 'SnapKit', '~> 4.0' :inhibit_warnings => true
    # 该库不忽略警告
    pod 'Alamofire', '~> 4.5' :inhibit_warnings => false

    target 'CocoaPodsDemo' do
        pod 'SwiftyJSON', '2.2.0'
    end
    
    target 'Second' do
        pod 'RealmSwift', '3.0.0-rc.1'
    end
end
```

## 关于Podfile.lock  

当你执行`pod install`之后，除了 Podfile 外，CocoaPods 还会生成一个名为`Podfile.lock`的文件，`Podfile.lock` 应该加入到版本控制里面，不应该把这个文件加入到`.gitignore`中。因为`Podfile.lock`会锁定当前各依赖库的版本，之后如果多次执行`pod install`不会更改版本，要`pod update`才会改`Podfile.lock`。这样多人协作的时候，可以防止第三方库升级时造成大家各自的第三方库版本不一致。 

## 版本控制和冲突  

CocoaPods使用 [语义化版本控制](http://semver.org/lang/zh-CN/) 命名约束来解决对版本的依赖。由于冲突解决系统建立在非重大变更的补丁版本之间，这使得解决依赖关系变得容易很多。例如，两个不同的库依赖于AFNetworking的连个版本，假设一个依赖于2.3.1，另一个依赖于2.3.3，此时冲突解决系统可以使用最新的版本2.3.3，因为该版本先后兼容2.3.1。当然，如果一个依赖于1.2.5，另一个依赖于2.3.3，那么只能用户明确指定使用某个版本来解决冲突。  
在Podfile文件中，我们写入了`pod "AFNetworking", "~> 0.9.0"`这样的一段，其中的数字`0.9.0`被定义为主要的，次要的和补丁版本号。  

![语义化版本号](/assets/posts/CocoaPods/version.png)

当主要的（major）版本号数字增加是，意味着做了一些不能兼容旧版本的更新。当我们将依赖库升级到下一个主要版本时，我们可能需要修复编译错误，否则依赖库可能跟之前的表现不太一样。  
当次要的（minor）版本号增加时，意味着增加了新功能，但同时兼容旧版本。当我们决定升级时，我们可能需要或不需要新功能，但是该依赖库不会引起错误或改变现有功能。  
当补丁（patch）版本号增加的时候，意味着做了Bug修复，但是没有增加也没有改变功能。一般来说，我们会希望尽快更新补丁版本到最新版本，以便使用最新稳定的版本库。  
最高版本号（major > minor > patch）必须按照以上规则逐步增加，而较低的版本号必须从0开始。  
