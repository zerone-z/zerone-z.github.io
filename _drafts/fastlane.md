---
layout: post
title: fastlane 使用
motto: null
excerpt: 主要介绍了 fastlane 的安装以及使用。
tags: [iOS, fastlane]
---

<!-- * TOC
{:toc} -->

## fastlane 简介  

[fastlane](https://fastlane.tools/) 直译过来就是快车道的意思，顾名思义，它可以让我们通过很简单的方式配置流程顺序，并可通过非常简单的命令执行这个流程。我们可以组合fastlane内的一系列流程，通过简单的命令实现诸如截图、获取证书、编译、测试、导出安装包、提及iTunesConnect、供应配置文件管理、 dsym 上传/下载至主要奔溃报告平台等一系列操作。它同时支持iOS、Android、MacOS。  

fastlane 是用 Ruby 语言编写的一套开源自动化工具集和框架，每一个工具实际都对应一个Ruby脚本，用来执行某一个特定的任务，而fastlane核心框架则允许使用者通过类似配置文件的形式，将不同的工具有机而灵活的结合在一起，从而形成一个个完整的自动化流程。目前已开源到[Github fastlane](https://github.com/fastlane/fastlane)上，详细使用方式可以查看官方文档 [fastlane docs](https://docs.fastlane.tools/)。  

## xcode-select 安装  

在安装使用 fastlane 之前需要先使用如下方式安装 **xcode-select**。  
在终端执行如下命令进行安装。  

```shell
xcode-select --install
```

如果弹出如下弹框，表明你安装了 Xcode ，直接点击 安装 -> 同意 等待安装完成即可。  

![xcode-select](/assets/posts/fastlane/xcode_select_alert.png)  
![xcode-select](/assets/posts/fastlane/xcode_select_agree.png)  

如果显示如下信息，则表明你已经安装了 xcode-select 。  

```shell
xcode-select: error: command line tools are already installed, use "Software Update" to install updates
```

如果显示如下信息，则需要更新xcode，然后在使用安装命令。

```shell
can’t install the software because it is not currently available from the software update server
```

## fastlane 安装  

在安装 fastlane 之前，首先要在本地安装好Ruby环境（ Mac 下自带 ruby ）。  
假如你在本地已经安装好Ruby环境，那么下载和安装 fastlane 将十分简单。  

首先打开终端。  

然后输入以下命令更新gem。如果已是最新的可跳过该步骤个。  

```shell
sudo gem update --system
```

如果上面的更新Gem出错，可使用如下命令更新(OS X 10.11后苹果升级了安全策略)。  

```shell
sudo gem update -n /usr/local/bin --system
```

更新完以后，输入以下命令安装 fastlane 。  

```shell
sudo gem install fastlane                # 安装最新版本
sudo gem install fastlane -v 1.0.0       # 安装指定版本
sudo gem install fastlane --pre          # 安装最新的release beta版本
```

如果上面的安装 fastlane 出错，可使用如下命令安装(OS X 10.11后苹果升级了安全策略)。  

```shell
sudo gem install -n /usr/local/bin fastlane                # 安装最新版本
sudo gem install -n /usr/local/bin fastlane -v 1.0.0       # 安装指定版本
sudo gem install -n /usr/local/bin fastlane --pre          # 安装最新的release beta版本
```

但是，且慢。如果你在天朝，在终端中敲入这个命令之后，会发现半天没有任何反应。原因无他，因为那堵墙阻挡了rubygems.org。建议更换成Ruby-China的源，参考[https://gems.ruby-china.com/](https://gems.ruby-china.com/)。按照下面的顺序在终端中敲入依次敲入命令：

```shell
# 更换Ruby源
gem sources --remove https://rubygems.org/
# 等有反应之后再敲入以下命令
gem sources -a https://gems.ruby-china.com/

# 或者直接使用如下命令
gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
```

为了验证你的Ruby镜像是否更换成功，可以用以下命令查看：

```shell
gem sources -l
```

只有在终端中出现下面文字才表明你上面的命令是成功的：

```shell
*** CURRENT SOURCES ***

        https://gems.ruby-china.com/
```

这时候，你再次在终端中输入命令安装 fastlane。
顺利的话，等上十几秒钟， fastlane 就会安装好了。在终端输入如下命令，如果可以看到版本信息，则表示安装成功。  

```shell
fastlane --version
```

如果突然有一天不想用 fastlane 了，想卸载掉，那么就执行如下命令：  

```shell
sudo gem uninstall fastlane
# OS X 10.11 or later 使用下面的命令卸载
sudo gem uninstall -n /usr/local/bin fastlane
```

## fastlane(iOS) 使用  

### 初始化操作  

这里以iOS项目为例。  
首先打开终端，导航到项目文件夹下（即cd到工程目录，与 xcodeproj 文件同级）。

```shell
cd ~/Desktop/FastlaneDemo
```

执行如下代码，进行初始化操作。  

```shell
fastlane init
```

在终端中，你会看到如下信息：

```vim
What would you like to use fastlane for? (你想要fastlane做什么？)
1. 📸  Automate screenshots（自动截屏）
2. 👩‍✈️  Automate beta distribution to TestFlight（自动发布 beta 版本到TestFlight）
3. 🚀  Automate App Store distribution（自动发布到App Store）
4. 🛠  Manual setup - manually setup your project to automate your tasks（手动设置）
```

这里我们选择手动设置，输入 `4` 回车，你会看到如下信息，等待更新完成。  

```vim
------------------------------------------------------------
--- Setting up fastlane so you can manually configure it ---
------------------------------------------------------------
Installing dependencies for you...
bundle update
```

> ps: 如果在这里bundle update卡住无响应，可以使用 `sudo fastlane init` 命令执行初始化操作。

稍等一会，出现信息，然后一路 **回车** 就结束了你的第一次初始化操作。  
回到项目所在文件加下，你就会看到多出了几个文件：

```shell
|-- Gemfile                # 指定需要依赖Gem及版本号  
|-- Gemfile.lock           # 记录依赖 Gem 以及它们所依赖 Gem 的确切名称和版本号  
|-- fastlane  
    |-- Appfile            # 用于存放公共信息，比如： app ID、 Apple ID。  
    |-- Fastfile           # 用于管理所有的lane任务，lane则会调用 action  
```

### Appfile文件  

Appfile 用于存放 fastlane 需要的信息，包括Apple ID、App ID、Team ID...。  
如下示例，我们设置了 App ID 和 Apple ID：  

```vim
app_identifier "com.myzerone.FastlaneDemo"  # 应用的 Bundle ID
apple_id "myzerone@outlook.com"             # Apple 的 email 地址
```

如果你在多个开发团队中，可以使用下面的配置指定团队：  

```vim
app_identifier "com.myzerone.FastlaneDemo"  # 应用的Bundle ID
apple_id "myzerone@outlook.com"             # Apple 的 email 地址

# 指定开发团队
team_name "myzerone"          # 团队名称
team_id   "Q2CBPJ58CA"        # 团队ID

# App Store Connect团队
itc_team_name "Company Name"
itc_team_id   "18742801"
```

>ps: 开发团队的获取：登陆 [Apple开发者网站](https://developer.apple.com/account)，右上角切换开发团队，左侧选择 **Membership**，就可以看到 **Team Name** 和 **Team ID** ，填入即可。

如果你的 App Store Connect 和 Apple Developer Portal 是不同的证书，你可以使用下面的配置信息。  

```vim
app_identifier "com.myzerone.FastlaneDemo"        # 应用的Bundle ID

apple_dev_portal_id "myzerone@outlook.com"        # Apple开发者账号
itunes_connect_id "myzerone1@outlook.com"         # App Store Connect账号

team_id "Q2CBPJ58CA"                              # 开发者团队ID
itc_team_id "18742801"                            # App Store Connect 团队 ID
```

如果你的项目对于每一种环境（比如beta、app store）都有不同的Bundle ID，可以使用 `for_platform` 和/或 `for_lane` 来定义不同的配置。  

```vim
app_identifier "com.myzerone.FastlaneDemo"
apple_id "myzerone@outlook.com"
team_id "Q2CBPJ58CC"

for_platform :ios do                    # 定义在 iOS 平台下
  team_id "123"                         # 在 iOS 平台下的团队 ID
  for_lane :test do                     # 定义 lane 名称为 test 下的配置
    app_identifier "com.myzerone.test"   # 在该 lane 下的 bundle id
  end
end
```

如果在 `Fastfile` 文件中使用了 `platform [platform_name]`，你则只需要使用 `for_platform` 即可。  
如果你定义了 `for_lane` 的值，那么就会使用 `for_lane` 下对应的值，否则，将会使用最前面配置的默认值。因此，当运行 `:test` lane 时，就会使用下面的配置：  

```vim
app_identifier "com.myzerone.test"
apple_id "myzerone@outlook.com"
team_id "123"
```

配置好以后，我们就可以在 `Fastfile` 中通过如下的方式访问这些值了：  

```vim
identifier = CredentialsManager::AppfileConfig.try_fetch_value(:app_identifier)
team_id = CredentialsManager::AppfileConfig.try_fetch_value(:team_id)
```

更多的信息可以点击 [Appfile](https://docs.fastlane.tools/advanced/Appfile/#appfile) 查看。  

### 自动截图  

#### 优点  

- 使截图与最新应用内设计保持一致  
- 如果你的应用支持多种语言，则会自动截取每种语言的图片  
- 自动针对不同的屏幕尺寸，截取不同的内容  
- 可以避免在截图中显示加载指示器  
- 一人仅需配置一次，其他人就可以使用  
- 可以生产一个网页，显示不同的设备和不同语言的截图  

#### 抓取图片  

自动截图是利用 UI Tests 功能进行截图。fastlane 主要使用了两个工具 `snapshot` 和 `frameit` ， `snapshot` 负责对应用截图， `frameit` 负责对图片进行加工。  

1. 首先在我们的 Xcode 项目中创建一个 UI Tests target，我这里命名为 `FastlaneDemoUITests`。  

    ![ui tests](/assets/posts/fastlane/ui_tests.png)

2. 在命令行中 `cd ~/Desktop/FastlaneDemo` 到项目根目录下，然后运行如下命令:  

    ```shell
    # 使用 fastlane init 初始化成功，使用下面的命令
    fastlane snapshot init
    # 使用 sudo fastlane init 初始化成功，则使用如下命令
    sudo fastlane snapshot init
    ```

    稍等一会，看到如下信息，表明初始化成功

    ```vim
    ✅  Successfully created SnapshotHelper.swift './fastlane/SnapshotHelper.swift'
    ✅  Successfully created new Snapfile at './fastlane/Snapfile'
    -------------------------------------------------------
    Open your Xcode project and make sure to do the following:
    1) Add a new UI Test target to your project
    2) Add the ./fastlane/SnapshotHelper.swift to your UI Test target
       You can move the file anywhere you want
    3) Call `setupSnapshot(app)` when launching your app

      let app = XCUIApplication()
      setupSnapshot(app)
      app.launch()

    4) Add `snapshot("0Launch")` to wherever you want to trigger screenshots
    5) Add a new Xcode scheme for the newly created UITest target
    6) Add a Check to enable the `Shared` box of the newly created scheme
    ```

    回到项目目录中，你会发现在 `./fastlane` 文件夹下，新增了两个文件 `Snapfile` 和 `SnapshotHelper.swift` 。  

3. 把 `SnapshotHelper.swift` 文件添加到项目的 UI Tests Target下（该文件可以随意变更目录）。  
4. 创建新的 Scheme 。  

   使用 Xcode 打开该项目，点击菜单栏的 `Product -> Scheme -> New Scheme` ，选择上面创建好的 UI Tests Target （即：FastlaneDemoUITests），随便输入 Scheme 名称，比如： FastlaneDemoUITests 。  

   ![xcode new scheme](/assets/posts/fastlane/xcode_new_scheme.png)

5. 编辑 Scheme 。  

   点击菜单栏 `Product -> Scheme -> FastlaneDemoUITests` 以激活 Scheme；  

   ![xcode activity scheme](/assets/posts/fastlane/xcode_activity_scheme.png)

   点击菜单栏 `Product -> Scheme -> Edit Scheme...` 以编辑激活的 Scheme；  

   ![xcode edit scheme](/assets/posts/fastlane/xcode_edit_scheme.png)

   在 Scheme 编辑界面，选择左侧的 **Build** ， 然后在目标上勾选上 **Run** 这一列，在最下面勾选上 **Shared** 。  

   ![xcode set scheme](/assets/posts/fastlane/xcode_set_scheme.png)

6. 如果是用的 **Objective-C** 语言，需要进行如下设置，否则，可跳过该步骤。  

    选中 `Target -> FastlaneDemoUITests -> Build Settings -> Defines Module` 设置为 `YES`。  

    ![xcode defines module](/assets/posts/fastlane/xcode_defines_module.png)

    在 UI Tests 类中引入桥接的头文件，这个桥接头文件是由 UI Tests Target 名称拼接上 `-Swift.h` 组合而成。具体名称，可以通过选中 `Target -> FastlaneDemoUITests -> Build Settings -> Objective-C Generated Interface Header Name` 查看。  

    ![xcode oc generated header](/assets/posts/fastlane/xcode_oc_generated_interface_header_name.png)

    这个文件是由系统自动生产，没有智能提示，保证 `#import "target名称-Swift.h"` 正确即可。 然后按 `Command + B` 组合键编译一下项目，确保没有报错。  

    ![xcode oc bridging header](/assets/posts/fastlane/xcode_oc_bridging_header.png)

7. 添加如下代码到 UI Tests 类的 `setUp()` 方法中。  

    ```Swift
    // Swift中使用如下代码
    let app = XCUIApplication()
    setupSnapshot(app)
    app.launch()
    ```

    ```Objective-C
    // Objective-C 中使用如下代码
    XCUIApplication *app = [[XCUIApplication alloc] init];
    [Snapshot setupSnapshot:app];
    // 按照官方文档使用上面的方法，但是我使用该方法一直报错，后来使用如下的方法
    // [Snapshot setupSnapshot:app waitForAnimations: true];
    [app launch];
    ```

8. 开启录制。  

    首先需要把 Activaty Scheme 设置回运行 Application Target 的 Scheme。  

    ![xcode activity app](/assets/posts/fastlane/xcode_activity_app.png)

    打开 UI Tests 类文件，鼠标放在 `testExample` 方法中，点击左下角的录制按钮，这样就会自动启动模拟器。  

    ![xcode ui tests record](/assets/posts/fastlane/xcode_ui_tests_record.png)

    > 如果需要截取多语言，需要在代码或者 Interface Builder 中设置交互控件的 `accessibility identifier` 比如： `self.view.accessibilityIdentifier = "mainView"`，因为如果不设置，启动录制后，UI Tests 获取到的只是录制时所在语言的控件名称，但是不同语言中控件的名称是不一样的，这就导致在其他的语言中截图失败。  

9. 模拟器启动以后，只需要在自动生成的交互代码位置添加如下代码即可：

    ```Swift
    // Swift中使用如下代码
    snapshot("01LoginScreen")
    ```

    ```Objective-C
    // Objective-C 中使用如下代码
    [Snapshot snapshot:@"01LoginScreen" timeWaitingForIdle:10];
    ```

10. 修改 `Snapfile` 文件，根据需要可以设置截屏的设备、支持的语言、运行的Scheme等等。  

    ```vim
    # 需要截屏的设备列表
    devices([
      "iPhone 8",
      "iPhone 8 Plus",
      "iPhone SE",
      "iPhone X",
      "iPad Pro (12.9-inch)",
      "iPad Pro (9.7-inch)",
      "Apple TV 1080p"
    ])
    # 需要截取的语言
    languages([
      "en-US",
      "de-DE",
      "it-IT",
      ["pt", "pt_BR"]
    ])
    # Xcode中运行的 Scheme 名称
    scheme("FastlaneDemoUITests")
    # 截图的存储位置
    output_directory("./screenshots")
    # 清除上次存储的截图
    clear_previous_screenshots(true)
    # 设置App启动时的运行参数，具体可看 <https://docs.fastlane.tools/actions/snapshot/#launch-arguments>
    # launch_arguments(["-favColor red"])
    ```

11. 打开终端， `cd ~/Desktop/FastlaneDemo` 到项目根目录下，然后运行如下命令:  

    ```shell
    fastlane snapshot
    ```

    运行成功以后， fastlane 会自动打开网页，我们可以看到截取的图片。

    > WARNING: 再 Xcode 中运行测试是不会创建截图的，只能通过上面的命令行进行创建。  

#### 添加手机外壳  

抓取到不同设备、语言的图片以后，可能我们还想要美化一下这些图片，比如：给图片添加上多种iPhone的外壳、给图片设置背景、添加文本等等，这时我们就需要使用 `frameit` 工具了。

##### 依赖库安装  

`frameit` 依赖于 `imagemagick` 工具去做图像处理，我们可以通过 `homebrew` 工具进行安装：  
```shell
brew install libpng jpeg imagemagick
```

在安装 `imagemagick` 的时候，如果看到如下错误消息。

```vim
mogrify: no decode delegate for this image format `PNG'
```

可以使用如下命令，重新安装和构建。  

```shell
brew uninstall imagemagick
brew install libpng jpeg
brew install imagemagick --build-from-source
```

##### 使用  

如果只想给图片简单的添加设备外壳，只需要使用如下命令即可：  

```shell
# 进入图片所在目录，
cd ~/Desktop/FastlaneDemo/screenshots
# 图片加壳，会处理目录即子目录下的所有图片
fastlane frameit
```

如果你想要设置标题和背景，则必须设置 `Framefile.json`，可以点击 [这里](https://docs.fastlane.tools/actions/frameit/#titles-and-background-optional) 查看更多信息。  

我们知道每年都会有新的机型出现，可以使用如下命令获取最新的设备外壳图片， 当然第一次会自动下载设备外壳。  

```shell
fastlane frameit setup
```

#### 上传到App Store  

#### 
