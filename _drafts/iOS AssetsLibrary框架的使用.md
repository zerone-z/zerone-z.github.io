---
layout: page
title: iOS AssetsLibrary框架的使用
categorys: iOS, AssetsLibrary, 图片, 视频
---

# iOS AssetsLibrary框架的使用

`AssetsLibrary`框架提供了访问“照片”应用程序下的图片和视频。你可以使用该框架检索资源列表，也可以保存照片或视频到照片相册下。该框架的层次结构为:

ALAssetsLibrary-->ALAssetsGroup-->ALAsset-->ALAssetRepresentation

## ALAssetsLibrary

ALAssetsLibrary代表系统中的整个资源库，可以读取所有的相册数据，即ALAssetsGroup列表。使用ALAssetsLibrary可以访问资源库中的照片和视频，也可以保存照片和视频。

### authorizationStatus

获取访问照片列表的授权状态，用于判断当前应用是否可以访问资源库，是一个类方法。支持IOS6.0及以后的系统。其返回值类型有：

```objc
```
