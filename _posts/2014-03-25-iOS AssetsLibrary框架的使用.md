---
layout: post
title: iOS AssetsLibrary框架的使用
motto: null
excerpt: AssetsLibrary框架的简单使用介绍，主要类的使用方式，实现图片／视频资源的访问
tags: [iOS, AssetsLibrary, 图片, 视频]
---

# iOS AssetsLibrary框架的使用

`AssetsLibrary`框架提供了访问“照片”应用程序下的图片和视频。你可以使用该框架检索资源列表，也可以保存照片或视频到照片相册下。该框架的层次结构为:

ALAssetsLibrary-->ALAssetsGroup-->ALAsset-->ALAssetRepresentation

## ALAssetsLibrary

ALAssetsLibrary代表系统中的整个资源库，可以读取所有的相册数据，即ALAssetsGroup列表。使用ALAssetsLibrary可以访问资源库中的照片和视频，也可以保存照片和视频。

### authorizationStatus

获取访问照片列表的授权状态，用于判断当前应用是否可以访问资源库，是一个类方法。支持IOS6.0及以后的系统。其返回值类型有：

```objc
typedef NS_ENUM(NSInteger, ALAuthorizationStatus) {
    ALAuthorizationStatusNotDetermined = 0, // 用户还没有做出选择这个应用程序的问候
    ALAuthorizationStatusRestricted,        // 这个应用程序没有被授权访问照片数据。当前用户不能改变应用程序的状态，是受限制的。如家长控制权限
    ALAuthorizationStatusDenied,            // 用户已拒绝该应用程序访问照片数据
    ALAuthorizationStatusAuthorized         // 用户已授权该应用可以访问照片数据
}
int authorStatus=[ALAssetsLibrary authorizationStatus];
```

### disableSharedPhotoStreamsSupport

关闭检索和通知共享照片流的信息，是一个类方法。支持IOS6.0及以后的系统。

```objc
[ALAssetsLibrary disableSharedPhotoStreamsSupport];
```

### 初始化

```objc
ALAssetsLibrary *assetsLibrary=[[ALAssetsLibrary alloc]init];
```

### 获取ALAsset和ALAssetsGroup

```objc
//通过URL地址获取在相册中ALAsset，该方法是异步的
[assetsLibrary assetForURL:[NSURL URLWithString:@""] resultBlock:^(ALAsset *asset) {
        //成功返回ALAsset
    } failureBlock:^(NSError *error) {
        //获取失败
    }];
//通过URL地址获取相册ALAssetsGroup，该方法是异步的
[assetsLibrary groupForURL:[NSURL URLWithString:@""] resultBlock:^(ALAssetsGroup *group) {
        //成功返回ALAssetsGroup
    } failureBlock:^(NSError *error) {
        //获取失败
    }];
```

资源类型有：

```objc
enum {
    ALAssetsGroupLibrary        = (1 << 0),         // The Library group that includes all assets.
    ALAssetsGroupAlbum          = (1 << 1),         // All the albums synced from iTunes or created on the device.
    ALAssetsGroupEvent          = (1 << 2),         // All the events synced from iTunes.
    ALAssetsGroupFaces          = (1 << 3),         // All the faces albums synced from iTunes.
    ALAssetsGroupSavedPhotos    = (1 << 4),         // The Saved Photos album.
#if __IPHONE_5_0 <= __IPHONE_OS_VERSION_MAX_ALLOWED
    ALAssetsGroupPhotoStream    = (1 << 5),         // The PhotoStream album.
#endif
    ALAssetsGroupAll            = 0xFFFFFFFF,       // The same as ORing together all the available group types,
};
```

### 创建一个相册到资源相册中

```objc
//创建一个名为“test”的相册，该方法是异步的
[assetsLibrary addAssetsGroupAlbumWithName:@"test" resultBlock:^(ALAssetsGroup *group) {
      //创建成功后，返回group；如果已经存在了名为“test”的相册，则返回一个nil的group
    } failureBlock:^(NSError *error) {
      //创建失败，可能原因有：1、用户没有授权 2、创建的资源名，时不可获得的
}];
```

### 保存照片或视频到系统默认相册中

#### 保存照片或视频到系统默认相册中

```obcj
[assetsLibrary writeImageDataToSavedPhotosAlbum:imageData metadata:nil completionBlock:^(NSURL *assetURL, NSError *error) {
       //保存后返回assetUrl；如果error等于nil，则保存成功
    }];
```

#### 保存图片到默认的相册中，以CGImageRef的形式

```objc
[assetsLibrary writeImageToSavedPhotosAlbum:cgImageRef metadata:nil completionBlock:^(NSURL *assetURL, NSError *error) {
    //保存后返回assetUrl；如果error等于nil，则保存成功
 }];
```

#### 保存图片到默认的相册中，以CGImageRef的形式，并选择旋转方向

```objc
[assetsLibrary writeImageToSavedPhotosAlbum:cgImageRef orientation:ALAssetOrientationDown completionBlock:^(NSURL *assetURL, NSError *error) {
      //保存后返回assetUrl如果error等于nil，则保存成功
 }];
//旋转方向
typedef NS_ENUM(NSInteger, ALAssetOrientation) {
 ALAssetOrientationUp,             //方向向上 默认
 ALAssetOrientationDown,           // 方向向下
 ALAssetOrientationLeft,           // 方向向左
 ALAssetOrientationRight,          // 方向向右
 ALAssetOrientationUpMirrored,     // 图像沿水平方向，向上翻转
 ALAssetOrientationDownMirrored,   // 图像沿水平方向，向下翻转
 ALAssetOrientationLeftMirrored,   // 图像沿垂直方向，向左翻转
 ALAssetOrientationRightMirrored,  // 图像沿垂直方向，向右翻转
};
```

#### 保存视频到默认的相册中

```objc
//在保存视频之前，先验证一下该视频文件是否与该相册资源相匹配
if ([assetsLibrary videoAtPathIsCompatibleWithSavedPhotosAlbum:[NSURL fileURLWithPath:videoPath]]) {
    //保存视频到默认相册中
    [assetsLibrary writeVideoAtPathToSavedPhotosAlbum:[NSURL fileURLWithPath:videoPaht] completionBlock:^(NSURL *assetURL, NSError *error) {
        //保存后返回视频资源的url；如果error等于nil，则保存成功
 }]; }
```

## ALAssetsGroup

ALAssetsGroup代表资源库中的每一个资源集合。即每一个ALAssetsGroup就是用户在“照片”应用程序中所看到的相册集合。

### 属性editable

editable，是一个只读属性。如果返回值为YES，表示该资源集合可以编辑，反之，则不可以编辑。支持IOS5.0及以后的系统。

### `addAsset：`

添加已存在的资源(ALAsset)到该集合中，在添加之前应该先判断，该资源集合是否允许编辑啊。

```objc
if (self.assetsGroup.editable) {
    if ([self.assetsGroup addAsset:asset]) {
        NSLog(@"资源添加成功！");
    }else{
        NSLog(@"资源添加失败");//除了该资源集合不允许编辑导致添加失败以外，还有可能就是该资源本身不允许添加到该资源集合中
    }
}
```

### `valueForProperty：`

返回该资源集合的属性值，支持IOS4.0及以后

```objc
NSLog(@"资源集合相册的名称：%@",[assetsGroup valueForProperty:ALAssetsGroupPropertyName]);
NSLog(@"资源集合相册的类型：%@",[assetsGroup valueForProperty:ALAssetsGroupPropertyType]);
NSLog(@"资源集合相册的存储ID：%@",[assetsGroup valueForProperty:ALAssetsGroupPropertyPersistentID]);
NSLog(@"资源集合相册的存储地址URL：%@",[assetsGroup valueForProperty:ALAssetsGroupPropertyURL]);
```

### `setAssetsFilter:`

用于筛选资源集合，其参数为ALAssetsFilter。同一时间，只能有一个筛选条件有效。

```objc
[assetsGroup setAssetsFilter:[ALAssetsFilter allPhotos]];
```

ALAssetsFilter用于资源集合的筛选条件，它只有3个类方法：

```objc
[ALAssetsFilter allPhotos]; //在资源集合中获取图片
[ALAssetsFilter allVideos]; //在资源集合中获取视频
[ALAssetsFilter allAssets]; //获取所有资源
```

### posterImage、numberOfAssets

posterImage获取的是该资源集合及相册的封面，返回值为CGImageRef。numberOfAssets获取的是该资源集合过滤后的的资源数量，如果没有过滤则获取的是所有的资源数量。

```objc
//获取封面图片
CGImageRef imageRef=[self.assetsGroup posterImage];
UIImage *posterImage=[UIImage imageWithCGImage:imageRef];
//获取资源数量
NSInteger *assetCount=[self.assetsGroup numberOfAssets];
```

### 遍历资源数组

遍历资源数组获取资源，ALAssetsGroup提供了3中方法：1、普通的遍历，2、指定操作方式遍历，3、指定操作方式及指定索引集遍历资源。

```objc
//enumerateAssets都是同步的，所以我放在了一个线程中执行遍历
NSMutableArray *arrayAsset=[[NSMutableArray alloc]init];
// 获取全局调度队列,后面的标记永远是0
dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
// 创建调度群组
dispatch_group_t group = dispatch_group_create();
// 向调度群组添加异步任务，并指定执行的队列
dispatch_group_async(group, queue, ^{
    [self.assetsGroup enumerateAssetsUsingBlock:^(ALAsset *result, NSUInteger index, BOOL *stop) {
        //result不为nil则存在资源，继续遍历；为nil则不存在资源，结束遍历
        //index为该资源在资源集合中的索引
        //stop为一个指针，当给其赋值YES时，停止遍历
        if (result) {
            [arrayAsset addObject:result];
        }else{
            dispatch_async(dispatch_get_main_queue(), ^{
                NSLog(@"回到主线程");
            });
        }
    }];
});
//指定操作方式的，遍历。操作方式有：
//NSEnumerationConcurrent：同步的方式遍历
//NSEnumerationReverse：倒序的方式遍历
[self.assetsGroup enumerateAssetsWithOptions:NSEnumerationReverse usingBlock:^(ALAsset *result, NSUInteger index, BOOL *stop) {
   //同上
}];
NSMutableIndexSet *indexes=[NSMutableIndexSet indexSetWithIndex:1];
[indexes addIndex:2];
//同上一个操作方式
//Indexes是一个索引集合，ALAssetsGroup将会取出在该索引集合中的资源
[self.assetsGroup enumerateAssetsAtIndexes:indexes options:NSEnumerationReverse usingBlock:^(ALAsset *result, NSUInteger index, BOOL *stop) {
   //同上
}];
```

## ALAsset

ALAsset代表相册中的每一个资源，可以通过ALAsset获取该资源的信息，也可以修改资源文件。

### `valueForProperty:`

返回该资源集合的属性值，支持IOS4.0及以后。

```objc
//valueForProperty的属性值无效将返回：ALErrorInvalidProperty
NSLog(@"资源类别：%@",[asset valueForProperty:ALAssetPropertyType]);//有三种资源类别：ALAssetTypePhoto(图片), ALAssetTypeVideo(视频),ALAssetTypeUnknown(未知)
NSLog(@"资源拍摄地点：%@",[asset valueForProperty:ALAssetPropertyLocation]);
NSLog(@"视频持续时间：%@",[asset valueForProperty:ALAssetPropertyDuration]);
NSLog(@"资源方向：%@",[asset valueForProperty:ALAssetPropertyOrientation]);//值为枚举类型：ALAssetOrientation
NSLog(@"资源创建时间：%@",[asset valueForProperty:ALAssetPropertyDate]);
NSLog(@"资源UTI数组：%@",[asset valueForProperty:ALAssetPropertyRepresentations]);
NSLog(@"资源URL：%@",[asset valueForProperty:ALAssetPropertyAssetURL]);
NSLog(@"资源key-value集合：%@",[asset valueForProperty:ALAssetPropertyURLs]);//key:为uti；value:为url
```

### defaultRepresentation与representationForUTI

defaultRepresentation返回的是默认的资源详细信息类(ALAssetRepresentation)，representationForUTI则是通过UTI值来获取资源信息类。关于ALAssetRepresentation下面将会介绍到。

```objc
ALAssetRepresentation *rep=[asset defaultRepresentation];
ALAssetRepresentation *rep=[asset representationForUTI:@"public.jpeg"];
```
### thumbnail与aspectRatioThumbnail

thumbnail是以正方形截取的一个缩略图，aspectRatioThumbnail则是一个等比例缩略图。它们都是适合该系统的且方向都没有问题。返回值为CGImageRef。

```objc
UIImage *thumbnail=[UIImage imageWithCGImage:[asset thumbnail]];
UIImage *aspectThumbnail=[UIImage imageWithCGImage:[asset aspectRatioThumbnail]];
```

### editable与originalAsset

editable，是一个只读属性。如果返回值为YES，表示该资源可以编辑，反之，则不可以编辑。应用仅允许编辑最开始写入的资源。originalAsset ，如果另存了一个修改后的资源，则返回一个资源，否则返回nil。 支持IOS5.0及以后的系统。

```objc
BOOL editAble=asset.editable;
ALAsset *originalAset=asset.originalAsset;
```

### `setImageData:metadata:completionBlock`与`setVideoAtPath:completionBlock:`

setImageData:metadata:completionBlock:用于替换掉原来的资源图片为给定的图片，setVideoAtPath:completionBlock:用于替换掉原来的资源视频为给定的视频。两者在使用之前，应该要先检查属性editable。

```objc
//在替换愿资源图片时，应该先要检查该资源是否可以编辑
if (asset.editable) {
    [asset setImageData:imageData metadata:nil completionBlock:^(NSURL *assetURL, NSError *error) {
         //如果替换成功，则返回一个资源的url，否则，assetURL为nil
    }];
}
//在替换愿资源视频时，应该先要检查该资源是否可以编辑
if (asset.editable) {
    [asset setVideoAtPath:videoUrl completionBlock:^(NSURL *assetURL, NSError *error) {
          //如果替换成功，则返回一个资源的url，否则，assetURL为nil
    }];
}
```

### 保存资源的默认相册中

```objc
//保存一个新的图片资源，重新生成一个图片
[asset writeModifiedImageDataToSavedPhotosAlbum:imageData metadata:nil completionBlock:^(NSURL *assetURL, NSError *error) {
      //成功后，返回一个新的图片URL
}];
//保存一个新的视频资源，重新生成一个视频
[asset writeModifiedVideoAtPathToSavedPhotosAlbum:videoUrl completionBlock:^(NSURL *assetURL, NSError *error) {
      //成功后，返回一个新的图片URL
}];
```

## ALAssetRepresentation

ALAssetRepresentation代表资每一个资源文件的详细信息。获取ALAssetRepresentation的一种方式如下：

```objc
ALAssetRepresentation *representation=[asset defaultRepresentation];
```

### 基本属性介绍

```objc
NSLog(@"资源文件的UTI：%@",[representation UTI]); //唯一标识符
NSLog(@"资源图片宽高：%@",NSStringFromCGSize([representation dimensions])); //不存在则返回CGSizeZero
NSLog(@"资源文件容量大小：%lld",[representation size]);
NSLog(@"资源文件的URL：%@",[representation url]);
NSLog(@"资源文件的旋转方向：%d",[representation orientation]); //值为上面介绍的方向枚举类型中的一个
NSLog(@"资源图片的缩放比例：%f",[representation scale]);
NSLog(@"资源文件的名称：%@",[representation filename]);
NSLog(@"资源文件的元数据：%@",[representation metadata]); //返回一个字典，如果不存在则返回nil
UIImage *resolutionImage=[UIImage imageWithCGImage:[representation fullResolutionImage]]; //资源图片高清图，不存在则返回NULL
UIImage *fullScreenImage=[UIImage imageWithCGImage:[representation fullScreenImage]];     //资源图片的全屏图，不存在则返回NULL
```

### `getBytes:fromOffset:length:error:`

该方法可以把资源指定的部分，写入缓冲区即内存中保存，返回保存成功后的文件大小。注意：用该方法，文件太大容易是程序的查处内存上限，程序容易闪退。

```objc
Byte *fileBuffer = (Byte*)malloc((long)representation.size); //开辟内存空间，最为缓冲区
NSUInteger bufferSize = [representation getBytes:fileBuffer fromOffset:0 length:(long)representation.size error:nil]; //把资源文件写入缓冲区
NSData *data = [NSData dataWithBytesNoCopy:fileBuffer length:bufferSize freeWhenDone:YES];//把该缓冲区的文件指向NSData
```

### `CGImageWithOptions:`

该方法，我没有用过，不是很熟，大概用法是：定义一个获取方式字典options，调用该方法返回CGImageRef的图片。哪位大神知道的还请指教。

```objc
#import <ImageIO/ImageIO.h>
NSDictionary *options = [NSDictionary dictionaryWithObjectsAndKeys:
            (id)kCFBooleanTrue, kCGImageSourceCreateThumbnailWithTransform,
            (id)kCFBooleanTrue, kCGImageSourceCreateThumbnailFromImageAlways,
            (id)[NSNumber numberWithFloat:200], kCGImageSourceThumbnailMaxPixelSize,
            nil];
CGImageRef optionsThumbnail = [representation CGImageWithOptions:options];
UIImage *thumbnailImage = [UIImage imageWithCGImage:optionsThumbnail];
```

AssetsLibrary框架介绍到此结束。有不对的地方，请各位大神指正，谢谢！

ps:据此写的一个媒体（图片／视频）浏览起框架：[点击打开链接](https://github.com/myzerone/XJAssetsPicker){:target="_blank"}
