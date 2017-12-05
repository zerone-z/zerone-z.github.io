---
layout: post
title: iOS APP真机调试发布过程介绍
motto: null
excerpt: 作为一名开发人员，真机调试、打包、上架APP是必须要会的，否则都不好意思说自己是iOS开发人员。本篇文章就介绍了APP打包上线的详细流程。 
tags: [iOS, 发布]
---

<!-- * TOC
{:toc} -->

# 介绍  

作为一名开发人员，真机调试、打包、上架APP是必须要会的，否则都不好意思说自己是iOS开发人员。但是这些过程要远比我们想象的复杂麻烦的多，一不小心就会掉进坑里。下面就介绍一下我是如何一步一步实现的以及遇到的坑。  
作为一名iOS开发人员，我相信都会有一个苹果开发者账号，如果没有，那就去申请一个吧。  
只要按照步骤一步一步来，我们就能很快的完成。主要涉及以下的内容：  

1. 证书创建
2. 真机调试
3. 发布/生产
4. 打包

# 具体操作  

## 准备工作  

首先登陆[开发者中心网站](https://developer.apple.com/account/)

![apple account](/assets/posts/app_certificate/apple_account.png)

输入开发者账户和密码，点击 **Sign in**登陆，会看到下面的界面。

![apple account overview](/assets/posts/app_certificate/apple_account_overview.png)

### CSR文件的创建  

在开发证书、生产证书以及APNs推送证书的配置过程中，都会用到Certificate Signing Request（也就是CSR）文件。CSR文件的生成不分先后，可以在需要的时候在生成。  
首先，在Mac中找到并打开应用程序 **钥匙串访问.app**。  

![apple csr keychain](/assets/posts/app_certificate/apple_csr_keychain.png)

App打开后，在菜单栏中选择 钥匙串访问->证书助理->从证书颁发机构请求证书 。  

![apple csr keychain request](/assets/posts/app_certificate/apple_csr_keychain_request.png)

填上邮箱地址和常用名，可以随便填，**常用名** 需要记一下，会用到，然后选择保存到磁盘就好了。  

![apple csr keychain info](/assets/posts/app_certificate/apple_csr_keychain_info.png)

点击继续，选择好存储位置，保存。  

![apple csr keychain path](/assets/posts/app_certificate/apple_csr_keychain_path.png)

然后点击完成。

![apple csr keychain over](/assets/posts/app_certificate/apple_csr_keychain_over.png)

去到我们保存CSR的文件夹，就可以看到该文件了。

![apple csr overview](/assets/posts/app_certificate/apple_csr_overview.png)

至此我们的CSR文件就做好了。下面如果有需要用到CSR文件的地方，可以依照此流程申请创建一个CSR文件，以便使用。  

### App ID的创建  

App ID不管是在真机调试，还是后面创建发布文件，以及创建APP时都会用到。下面就介绍一下App ID的创建过程。  
在上面，我们已经登陆了Apple开发者中心网站，点击 **Certificates，Identifers&Profiles** 进入如下界面。  

![apple overview](/assets/posts/app_certificate/apple_overview.png)

默认显示的是 **Certificates** 下面的所有证书，我们可以选择 **Identifiers->App IDs** 查看所有的App ID。  

![apple app ids](/assets/posts/app_certificate/apple_app_ids.png)

点击 **+** 号，进入如下界面。  

![apple app ids add](/assets/posts/app_certificate/apple_app_ids_add.png)

![apple app ids add1](/assets/posts/app_certificate/apple_app_ids_add1.png)

然后点击 **Continue** 进入下一个界面，检查一下名称、Bundle ID以及服务是否有问题。  

![apple app ids review](/assets/posts/app_certificate/apple_app_ids_review.png)

如果确认没有问题，点击 **Register** 即可完成创建。回到 App IDs 即可看到我们创建的App ID了。  

![apple app ids done](/assets/posts/app_certificate/apple_app_ids_done.png)

至此App ID的创建就完成了。  

## 证书创建  

在准备阶段，我们已经登陆了Apple开发者中心网站，点击 **Certificates，Identifers&Profiles** 进入如下界面。

![apple overview](/assets/posts/app_certificate/apple_overview.png)

默认显示的是 **Certificates** 下面的所有证书，如果不是在这个界面可以点击 **Certificates** 下的 **All** 查看所有证书；点击 **+** 图标创建新的证书。  

![apple certificates add](/assets/posts/app_certificate/apple_certificates_add.png)

然后我们根据用途，选择需要创建的证书类型。这里我们以测试证书为例，介绍一下证书的创建流程。所以这里我们选择 **iOS App Development** 选项，再把界面拉到底部，点击 **Continue** 继续。  

![apple certificates type](/assets/posts/app_certificate/apple_certificates_type.png)

> 如果是企业账号生产证书的类型或略有不同。公司账号因为要上线App Store，所以会有 App Store and Ad Hoc 选项；而企业账号不需要上线App Store，所以没有 App Store and Ad Hoc 选项，但是会多出 In-House and Ad Hoc 选项用作发布证书。  

接下来会进入如下界面，要求我们申请一个CSR文件。这个界面也介绍了申请创建CSR文件的过程。  

![apple csr into](/assets/posts/app_certificate/apple_csr_intro.png)

CSR文件创建好以后(准备阶段有介绍CSR文件的创建过程)，点击 **Continue** 继续，会看到如下界面，要求我们上传刚刚传教好的CSR文。点击 **Choose File...**  选择刚刚创建的CSR文件。  

![apple csr upload](/assets/posts/app_certificate/apple_csr_upload.png)

文件选择好以后，此时就可以点击 **Continue** 以创建证书了。

![apple certificates generate](/assets/posts/app_certificate/apple_certificates_generate.png)

等待几秒后，就可以看到如下界面，我们的证书就创建好了，此时可以点击 **Download** 下载该证书。  

![apple certificates download](/assets/posts/app_certificate/apple_certificates_download.png)

我们也可以在 **Certificates** 下面找到我们刚刚创建的证书进行下载/撤销操作。  

![apple certificates operate](/assets/posts/app_certificate/apple_certificates_operate.png)

下载的证书如下。  

![apple certificates overview](/assets/posts/app_certificate/apple_certificates_overview.png)

然后双击该证书文件，会自动在钥匙串中添加该秘钥，我们就可以在钥匙串中找到我们的证书了。  

![apple certificates keychain](/assets/posts/app_certificate/apple_certificates_keychain.png)

至此证书的创建过程就完成了，我们可以据此过程，选择不同的证书类型，创建出APNs推送测试/生产证书及App的发布证书。  

### 共享证书  

我们证书创建好以后，由于其私钥信息只保存在当前电脑上，那么也就是说只有这一台电脑可以使用该证书。假如我想要其他的电脑也能使用该证书（或者把该证书共享给别人使用），那要怎么办呢？很简单，只要把该证书导出为包含私钥的Personal Information Exchange(.p12)文件(导出时可以创建密码)，然后其他人在导入Personal Information Exchange(.p12)文件，此时就可使用该证书了。  
Personal Information Exchange简称p12，p12文件实际包含了证书和私钥信息，所以才可以分发给其他人使用。  

#### 导出p12文件  

打开钥匙串访问，找到我们的专用秘钥（专用秘钥的名称就是我们在最开始生成CSR请求的时候填写的常用名）。  

![apple p12 special](/assets/posts/app_certificate/apple_p12_special.png)

右击专用秘钥，选择导出，输入文件名称。  

![apple p12 name](/assets/posts/app_certificate/apple_p12_name.png)

选择 **存储** ，会要求输入一个密码对文件进行加密，这个密码必须铭记，切记。再导入p12文件的时候会用到。  

![apple p12 pwd](/assets/posts/app_certificate/apple_p12_pwd.png)

点击 **好** 以继续，然后会要求输入电脑的登陆密码。  

![apple p12 pwd mac](/assets/posts/app_certificate/apple_p12_pwd_mac.png)

点击 **允许** 后，p12文件就被保存到文件夹中了。  

![apple p12 review](/assets/posts/app_certificate/apple_p12_review.png)

至此我们的p12文件就被完整的导出了，下面会简单介绍一下，p12文件的导入。  

#### 导入p12文件  

p12文件的导入很简单，因为我只有一台电脑，为了看到效果，我先在钥匙串访问中删除该证书和秘钥，删除后只有7个证书。  

![apple p12 input delete](/assets/posts/app_certificate/apple_p12_input_delete.png)

然后双击导出的p12文件，会弹出如下界面，要求你输入p12文件的密码。  

![apple p12 input pwd](/assets/posts/app_certificate/apple_p12_input_pwd.png)

点击 **好** 后，如果密码无误，即可成功安装。我们可以在钥匙串访问中找到该证书和秘钥，会发现比原来多了一个证书文件，共8个。  

![apple p12 input review](/assets/posts/app_certificate/apple_p12_input_review.png)

至此，我们已成功导入p12文件。  

## 真机调试  

在准备阶段，我们已经登陆了Apple开发者中心网站，点击 **Certificates，Identifers&Profiles** 进入如下界面。

![apple overview](/assets/posts/app_certificate/apple_overview.png)

### 添加测试设备  

> Apple对测试设备的添加/删除有严格的限制，每种设备只能添加100台。如果想要删除设备，需要Agent账号（创建团队的根账号）联系客服，客服确认可以处理，就会把账号的机器列表重置为可以删除机器的状态，然后就可以做机器的清理了。另外在新的会员资格年度开始时，团队代理或管理员会获得相应的选项，以移除不需要的测试设备。    

选择 **Devices->All** 可以查看所有的测试设备。  

![apple devices list](/assets/posts/app_certificate/apple_devices_list.jpeg)

在该界面中点击 **+** 按钮，去添加设备。在新的界面中有两种方式添加设备，第一种：在界面中输入设备名称和设备的UDID；第二种：创建一个txt文件，在该文件中写入设备的UDID及设备名称，然后上传该文件，即可添加设备，该种方式可实现批量添加设备。  

![apple devices add](/assets/posts/app_certificate/apple_devices_add.png)

点击 **Continue** 按钮，进入设备信息确认界面。

![apple devices review](/assets/posts/app_certificate/apple_devices_review.png)

如果设备信息确认无误，点击 **Register** 即可完成添加。  

设备的UDID，可以通过 **Xcode->Window->Devices and Simulators** 进行查看，也可以通过iTunes、iTools等工具查看。  

![apple udid xcode](/assets/posts/app_certificate/apple_udid_xcode.png)

![apple udid itunes](/assets/posts/app_certificate/apple_udid_itunes.png)

当然，我们也可以通过Xcode自动添加的测试设备中。这里就不多做介绍了。  

### 创建配置文件  

选择 **Provisioning Profiles -> All** 查看所有的配置文件。  

![apple profiles all](/assets/posts/app_certificate/apple_profiles_all.png)

点击右上角的 **+** 号创建新的配置文件。根据用途的不同，选择不同的配置项，我们这里是用于真机调试的，所以选择 **iOS App Development**。  

![apple profiles develop](/assets/posts/app_certificate/apple_profiles_develop.png)

点击 **Continue** 继续。接下来选择我们在准备阶段创建好的App ID（com.myzerone.iostest）。  

> 如果是企业账号生产环境的配置文件类型或略有不同。公司账号因为要上线App Store，所以会有 App Store 选项；而企业账号不需要上线App Store，所以没有 App Store 选项，但是会多出 In-House 选项用作发布配置文件。 

![apple profiles select appid](/assets/posts/app_certificate/apple_profiles_select_appid.png)

App ID选择好以后，点击 **Continue** 继续。这一步主要是选择我们在 **证书创建** 那里创建好的证书，或者以前就创建好的证书。这里选择的证书只会出现符合条件的证书，即测试配置文件只可选择测试证书，发布配置文件，只可选择发布证书。我们这里就可以全部勾选上。  

![apple profiles select certificates](/assets/posts/app_certificate/apple_profiles_select_certificates.png)

点击 **Continue** 继续。因为创建的是测试配置文件，所以这里会多一个选择测试设备的步骤，只要勾选我们会用到的测试设备就可以了。省事的话，只需要点击 **Select All** 前的复选框就可以了。  

![apple profiles select devices](/assets/posts/app_certificate/apple_profiles_select_devices.png)

点击 **Continue** 继续。给配置文件取个名称，可以随便填，最好是项目名称，方便辨识。  

![apple profiles name](/assets/posts/app_certificate/apple_profiles_name.png)

点击 **Continue** 稍等片刻，生成配置文件。  

![apple profiles done](/assets/posts/app_certificate/apple_profiles_done.png)

点击 **Download** 下载该配置文件。或者回到配置文件列表点击 **Download** 下载配置文件。  
　
![apple profiles download](/assets/posts/app_certificate/apple_profiles_download.png)

文件下载下来以后，双击以安装给配置文件。至此配置文件的创建就完成了。  

### 工程项目配置  

Xcode 8以后默认采用自动的管理方式，大大简化了工程配置方式。Xcode会根据Bundle ID自动下载所需要的证书文件及配置文件，而不需要现以前一样需要自己去选择。再次强调要保持Bundle ID与App ID一致。    

![apple xcode debug auto](/assets/posts/app_certificate/apple_xcode_debug_auto.png)

也可以自己管理，只要取消勾选 **Automatically manage signing** 就可以了。  

![apple xcode debug manual](/assets/posts/app_certificate/apple_xcode_debug_manual.png)

选择手动管理，需要自己去配置测试/发布文件，这里以测试为例。生产的配置文件与此配置方式相同。  

![apple xcode debug config](/assets/posts/app_certificate/apple_xcode_debug_config.png)

配置好后，效果如下。  

![apple xcode debug over](/assets/posts/app_certificate/apple_xcode_debug_over.png)

如上都配置好以后，就可以连上并选择真机，运行进行调试了。  

## 发布/生产  

首先根据 **证书创建** 一节的介绍创建生产证书。在证书类型的选择中，我们只要选择 **App Store and Ad Hoc** 选项，其他的按照流程即可。完成以后，我就就可以在钥匙串中看到如下信息。  

![apple certificates keychain product](/assets/posts/app_certificate/apple_certificates_keychain_product.png)

证书创建以后，因为我们上面已经创建好了App ID，所以这里就不需要创建了，如果没有，请创建App ID。  

### 创建配置文件  

生产的配置文件创建基本与真机调试一节中介绍配置文件的创建相同。首先也是选择 **Provisioning Profiles -> All** 查看所有的配置文件。  

![apple profiles all](/assets/posts/app_certificate/apple_profiles_all.png)

然后点击右上角的 **+** 号创建新的配置文件。我们这里是用于生产发布，所以选择 **App Store**。  

![apple profiles distribution](/assets/posts/app_certificate/apple_profiles_distribution.png)

> 如果是企业账号生产环境的配置文件类型或略有不同。公司账号因为要上线App Store，所以会有 App Store 选项；而企业账号不需要上线App Store，所以没有 App Store 选项，但是会多出 In-House 选项用作发布配置文件。 

点击 **Continue** 继续。接下来选择我们在准备阶段创建好的App ID（com.myzerone.iostest）。  

![apple profiles select appid](/assets/posts/app_certificate/apple_profiles_select_appid.png)

App ID选择好以后，点击 **Continue** 继续。这一步主要是选择我们在 **证书创建** 那里创建好的证书，或者以前就创建好的证书。这里选择的证书只会出现符合条件的证书，即测试配置文件只可选择测试证书，发布配置文件，只可选择发布证书。我们这里就选择刚刚创建的发布生产证书。  

![apple profiles select certificates dist](/assets/posts/app_certificate/apple_profiles_select_certificates_dist.png)

点击 **Continue** 继续。给配置文件取个名称，可以随便填，最好是项目名称，方便辨识。  

![apple profiles name dist](/assets/posts/app_certificate/apple_profiles_name_dist.png)

点击 **Continue** 稍等片刻，生成配置文件。  

![apple profiles done dist](/assets/posts/app_certificate/apple_profiles_done_dist.png)

点击 **Download** 下载该配置文件。或者回到配置文件列表点击 **Download** 下载配置文件。  
　
![apple profiles download dist](/assets/posts/app_certificate/apple_profiles_download_dist.png)

文件下载下来以后，双击以安装给配置文件。至此配置文件的创建就完成了。  

###  工程项目配置  

生产发布的项目配置基本与真机调试一节介绍的项目配置相同。下面是自动管理的设置。  

![apple xcode debug auto](/assets/posts/app_certificate/apple_xcode_debug_auto.png)

手动管理，只要取消勾选 **Automatically manage signing** 就可以了。  

![apple xcode debug manual](/assets/posts/app_certificate/apple_xcode_debug_manual.png)

需要自己去配置发布文件。  

![apple xcode release config](/assets/posts/app_certificate/apple_xcode_release_config.png)

配置好后，效果如下。  

![apple xcode release over](/assets/posts/app_certificate/apple_xcode_release_over.png)

如上都配置好以后，接下来我们就可以打包了，如果是公司账号，可以上架App Store，企业账号，可以分发给用户安装了。  

## 打包  

在打包之前，需要针对证书说件事，用测试证书打包，只能安装在测试设备上。只有生产证书才能用于上线发布APP。  

首先，需要在我们的开发者账号中下载测试/发布证书（或者从钥匙串中导出的p12）和配置文件，分别双击进行安装，不清楚的请参考 **证书创建** 和 **创建配置文件** 。  
然后，用Xcode打开工程项目，请参考 **真机调试** 和 **发布/生产** 两节中的 **工程项目配置** 进行设置。  
以上配置好以后，就可以使用Xcode进行打包了。找到如下位置并设置为 **Gneric iOS Device** 或者真机，这里不能选择模拟器。  

![apple archive device](/assets/posts/app_certificate/apple_archive_device.png)

然后选择菜单 **Product->Archive** 进行Archive操作。  

![apple archive archive](/assets/posts/app_certificate/apple_archive_archive.png)

然后需要稍等一会，根据项目的规模的不同，等待时间也不一样。当Archive完成以后，会弹出如下界面。  

![apple archive archive over](/assets/posts/app_certificate/apple_archive_archive_over.png)

按照打包目的的不同选择不同的操作即可，下面主要介绍一下 **Export** 的后续操作。我们点击 **Export** 。  

![apple archive export](/assets/posts/app_certificate/apple_archive_export.png)

这里出现好几个打包类型，我们以App Store为例，选择以后，点击 Next。由于语言或者配置的不同可能看到的略有区别。  

![apple archive options](/assets/posts/app_certificate/apple_archive_options.png)

然后我们按需勾选就可以了，点击 Next。  

![apple archive sign](/assets/posts/app_certificate/apple_archive_sign.png)

在这里签名证书的管理有两种选择：自动和手动。选择手动方式，在点击 **Next** 后会多出下面一步，进行选择签名证书。  

![apple archive sign manual](/assets/posts/app_certificate/apple_archive_sign_manual.png)

选择好打包证书和配置文件以后，点击 **Next** 继续，稍等，直到生成App，如下界面。  

![apple archive generated](/assets/posts/app_certificate/apple_archive_generated.png)

然后点击 **Export** 导出App到桌面，即完成打包。  

![apple archive ipa](/assets/posts/app_certificate/apple_archive_ipa.png)
