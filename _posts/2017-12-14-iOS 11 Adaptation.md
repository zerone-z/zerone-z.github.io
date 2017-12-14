---
layout: post
title: iOS 11适配汇总
motto: null
excerpt: 记录iOS 11开发/适配过程中遇到的问题及解决方案。
tags: [iOS 11]
---

<!-- * TOC
{:toc} -->

# Xcode 9  

## 新增版本判断  
Xcode 9版本现在有了简单的API用于判断版本，Objective-C也开始支持swift的 `@available` 语法，现在再要区分版本就可以使用如下的方法。  

```objc
if (@available(iOS 11.0, *)) {
    // 版本适配
}
```

Xcode 9以下的版本判断。  

```objc
// iOS版本 > 11.0
 if ([[NSProcessInfo processInfo] isOperatingSystemAtLeastVersion:(NSOperatingSystemVersion){.majorVersion = 11, .minorVersion = 0, .patchVersion = 0}]) {
     // 版本适配
 }
```

## 访问权限变更  

Xcode 9上，如果想将图片保存到系统相册，需要在plist文件中新增 `NSPhotoLibraryAddUsageDescription` 权限。  

## 1024 Icon 

在Xcode 9上，更新适配版本时，也需要适配一个 1024*1024 的App Icon，否则在上传ipa包的时候会有警告提示，且不能提交审核。  

![1024 icon](/assets/posts/Adaptation/adaptation_app_icon.png)

# 安全区域  

iOS 11 引入了安全区域的概念，默认情况下安全区域是指 NavigationBar 以下 TabBar 以上的区域（iPhoneX 则不包括底部的虚拟 Home 区域），也就是说 StatusBar、NavigationBar、TabBar、虚拟 Home 都不是安全区域）。为了帮助开发者判断各个 view 与安全区域的距离关系，iOS 11 在 UIView 加入了一个属性：  

```objc
@property (nonatomic,readonly) UIEdgeInsets safeAreaInsets API_AVAILABLE(ios(11.0),tvos(11.0));
```

需要注意的是这个属性是描述 view 与页面安全区域的距离关系，如果 view 的某个方向超过了安全区域则这个方向的数值为正数，如果 view 完全在安全区域内则 safeAreaInsets 的值全为 0。在一个控制器中，安全区域并不是固定不变的，可以通过 ViewController 的 `additionalSafeAreaInsets` 方法来修改页面的安全区域，如果此时将安全区域上延 11 个点，可以使用如下的方法。  

```objc
self.additionalSafeAreaInsets = UIEdgeInsetsMake(-11, 0, 0, 0);
```

## AutoLayout的使用  

在 AutoLayout 布局中，可以使用 view 的属性 `safeAreaLayoutGuide` 进行布局。  

```objc
UIView *view = [UIView new];
[view setBackgroundColor:[UIColor blueColor]];
[self.view addSubview:view];
[view setTranslatesAutoresizingMaskIntoConstraints:NO];
// iOS 11以前的布局方案
// NSLayoutConstraint *topLayoutConstraint = [NSLayoutConstraint
//                                            constraintWithItem:view
//                                            attribute:NSLayoutAttributeTop
//                                            relatedBy:NSLayoutRelationEqual
//                                            toItem:self.topLayoutGuide
//                                            attribute:NSLayoutAttributeTop
//                                            multiplier:1
//                                            constant:0];

// iOS 11的布局方案
NSLayoutConstraint *topLayoutConstraint = [NSLayoutConstraint
                                           constraintWithItem:view
                                           attribute:NSLayoutAttributeTop
                                           relatedBy:NSLayoutRelationEqual
                                           toItem:self.view.safeAreaLayoutGuide
                                           attribute:NSLayoutAttributeTop
                                           multiplier:1
                                           constant:0];

[self.view addConstraints:@[topLayoutConstraint]];
```

# UIScrollView  

iOS 11 中新增了两个属性 `adjustedContentInset` 和 `contentInsetAdjustmentBehavior` 。 `adjustedContentInset` 是用来调整 scrollView 内容边距的属性，这个属性实际上是 `contentInset` 和 `safeAreaInsets` 在各个方向上的加和，即 `contentInset+safeAreaInsets` 。 `contentInsetAdjustmentBehavior` 是控制采取何种策略来控制调整边距的属性，默认为 `UIScrollViewContentInsetAdjustmentAutomatic` 。在 iOS 11 之前，控制是否自动调整内边距的属性是 UIViewController 的 `automaticallyAdjustsScrollViewInsets` ，但是这个属性现在已经废弃，取而代之的是 UIScrollView 的 `contentInsetAdjustmentBehavior` 。 `contentInsetAdjustmentBehavior` 共有四种设置:  

```objc
UIScrollViewContentInsetAdjustmentAutomatic, // 在一个带有导航栏且 automaticallyAdjustsScrollViewInsets = YES 的控制器中调整那边距
UIScrollViewContentInsetAdjustmentScrollableAxes, // 可滑动的scrollView中调整内边距
UIScrollViewContentInsetAdjustmentNever, // 从不调整
UIScrollViewContentInsetAdjustmentAlways, // 总是调整
```

如果 `UIScrollView` 需要调整内容边距则加上安全区域的偏移，即 `adjustedContentInset = contentInset+safeAreaInsets` ，如果不调整则 `safeAreaInsets` 不参与到计算中，即 `adjustedContentInset = contentInset` 。简而言之， `contentInsetAdjustmentBehavior`  就是告诉 `UIScrollView` 在计算 `adjustedContentInset` 时要不要加上 `safeAreaInsets` 。

## UIScrollView内容下移  

在iOS 11以前，如果想要禁用UIScrollView的自动下移，需要设置ViewController的属性`automaticallyAdjustsScrollViewInsets`。但是在iOS 11中该属性已被废弃了，我们可以使用UIScrollView新增的属性`contentInsetAdjustmentBehavior`来禁用自动下移。  

```objc
if (@available(iOS 11.0, *)) {
    [_scrollView setContentInsetAdjustmentBehavior:UIScrollViewContentInsetAdjustmentNever];
}
```

## tableView使用分组类型空间变大且设置无效  

我们知道tableView使用UITableViewStyleGrouped类型，默认tableView的每组头部和底部之间是有间距的。  
在iOS 11以前，可以通过实现`heightForHeaderInSection`方法（返回一个较小的值：0.1）来去除头部的间距，底部可以使用方法`heightForFooterInSection`来去除。  
但是，在iOS 11上，只实现上面的方法是无效的，必须也要同时实现`viewForHeaderInSection`和`viewForFooterInSection`方法。只实现高度，而没有实现view，那样是不规范的，但代码这样写在iOS 11之前是没有问题的。iOS 11是由于开启了估算行高机制引起了Bug。添加上`viewForHeaderInSection`和`viewForFooterInSection`方法后，问题得以解决。或者使用如下方法关闭估算行高，也可以解决问题。  

```objc
_tableView.estimatedRowHeight = 0;
_tableView.estimatedSectionHeaderHeight = 0;
_tableView.estimatedSectionFooterHeight = 0;
```

# 导航返回文本  

原开发为了隐藏系统的默认返回文本，是使用的下面的方法。  

```objc
[UIBarButtonItem.appearance setBackButtonTitlePositionAdjustment:UIOffsetMake(0, -64) forBarMetrics:UIBarMetricsDefault];
```

上面的方法其实是有缺陷的，当返回按钮的文本过长，会致使导航栏上的标题偏右，无法居中。而在iOS 11中，这种缺陷进一步扩大了，使得返回按钮向下偏移了。  
所以这里我使用了 Category + Runtime 的特性，修改了导航栏 push 方法实现，在 push 之前先自定义一下返回按钮的样式，把返回文本置空，这样也同时解决了上面提到的缺陷。  

 **.h** 文件如下：  

```objc
/// 去除导航控制器的默认返回文本
@interface UINavigationController (BackEmptyTitle)

@end
```

**.m** 文件如下

```objc
#import "UINavigationController+BackEmptyTitle.h"
#import <objc/runtime.h>

@implementation UINavigationController (BackEmptyTitle)

+ (void)load
{
    Class originalClass = [self class];
    SEL originalSelector = NSSelectorFromString(@"pushViewController:animated:");
    Class swizzledClass = [self class];
    SEL swizzledSelector = @selector(swizzle_pushViewController:animated:);
    Method originalMethod = class_getInstanceMethod(originalClass, originalSelector);
    Method swizzledMethod = class_getInstanceMethod(swizzledClass, swizzledSelector);
    
    BOOL didAddMethod = class_addMethod(originalClass, originalSelector, method_getImplementation(swizzledMethod), method_getTypeEncoding(swizzledMethod));
    if (didAddMethod) {
        class_replaceMethod(originalClass, swizzledSelector, method_getImplementation(originalMethod), method_getTypeEncoding(originalMethod));
    }
    else {
        method_exchangeImplementations(originalMethod, swizzledMethod);
    }
}

- (void)swizzle_pushViewController:(UIViewController *)viewController animated:(BOOL)animated
{
    UIBarButtonItem *backBarButtonItem = [[UIBarButtonItem alloc]init];
    [backBarButtonItem setTitle:@""];
    self.visibleViewController.navigationItem.backBarButtonItem = backBarButtonItem;
    [self swizzle_pushViewController:viewController animated:animated];
}

@end
```
