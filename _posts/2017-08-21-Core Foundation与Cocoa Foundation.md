---
layout: post
title: Core Foundation与Cocoa Foundation之间的转换内存管理
motto: null
excerpt: 主要介绍了Core Foundation与Cocoa Foundation数据之间的转换的内存管理问题。
tags: [iOS]
---

<!-- * TOC
{:toc} -->

# Core Foundation

Core Foundationy框架（CoreFoundation.framework）是一组C语言接口，他们为iOS应用程序提供基本数据管理和服务功能。下面列举该框架支持进行管理的数据以及可提供的服务：

 - 群体数据类型 (数组、集合等)
 - 程序包
 - 字符串管理
 - 日期和时间管理
 - 原始数据块管理
 - 偏好管理
 - URL及数据流操作
 - 线程和RunLoop
 - 端口和soket通讯

Core Foundation框架和Cocoa Foundation框架紧密相关，它们为相同功能提供接口，但Cocoa Foundation框架提供Objective-C接口。如果您将Cocoa Foundation对象和Core Foundation类型掺杂使用，则可利用两个框架之间的 “toll-free bridging”。所谓的Toll-free bridging是说您可以在某个框架的方法或函数同时使用Core Foundatio和Cocoa Foundation 框架中的某些类型。很多数据类型支持这一特性，其中包括群体和字符串数据类型。每个框架的类和类型描述都会对某个对象是否为 toll-free bridged，应和什么对象桥接进行说明。

# Core Foundation 内存管理

由于Core Foundation框架是有C语言实现的，所以如果用到Core Foundation，就需要手动管理内存，ARC是无能为力的。当然由于Core Foundation和Cocoa Foundation之间的友好关系，他们之间的管理权也是可以移交的。
ARC仅管理Cocoa Foundation对象（retain、release、autorelease），不管理Core Foundation对象，Core Foundation对象由人工管理，手动调用`CFRetain`和`CFRelease`来管理。
注：Core Foundation中没有autorelease

## 非ARC的内存管理

不使用ARC，手动管理内存，思路比较清晰，使用完，release转换后的对象即可。

```objc
//NSString 转 CFStringRef
CFStringRef aCFString = (CFStringRef) [[NSString alloc] initWithFormat:@"%@", string];
//...
CFRelease(aCFString);

//CFStringRef 转 NSString
CFStringRef aCFString = CFStringCreateWithCString(kCFAllocatorDefault,
                                                  bytes,
                                                  NSUTF8StringEncoding);
NSString *aNSString = (NSString *)aCFString;
//...
[aNSString release];
```

## ARC 管理内存

ARC下Cocoa Foundation与Core Foundation对象相互转换的时候，需要考虑对象所有权的归属，必须让编译器知道，到底由谁来负责释放对象，否则交给ARC处理，只有正确的处理，才能避免内存泄漏和double free导致程序崩溃。
根据不同的需求，有以下三种转换方式：

 - `__bridge`   不改变对象所有权，仅仅是转换
  - 从Cocoa转换到Core，需要人工`CFRetain`，否则，Cocoa指针释放后，传出去的指针无效
  - 从Core转换到Cocoa，需要人工`CFRelease`，否则，Cocoa指针释放后，对象引用计数仍为1，不会被销毁
 - `__bridge_retained`或者`CFBridgingRetain()`  解除ARC所有权
  - 转换后自动调用`CFRetain`，帮助解决从Cocoa转换到Core的情形
 - `__bridge_transfer`或者`CFBridgingRelease()` 给予ARC所有权
  - 转换后自动调用`CFRelease`，帮助解决从Core转换到Cocoa的情形

### `__bridge_retained`或者`CFBridgingRetain()`

 `__bridge_retained`或者`CFBridgingRetain()`将Cocoa Foundation对象转换为Core Foundation对象，把对象所有权桥接给Core Foundation对象，同时剥夺ARC的管理权，后续需要开发者使用`CFRelease`或者相关方法手动来释放对象。

 ```objc
  - (void)viewDidLoad
  {
      [super viewDidLoad];
      NSString *aNSString = [[NSString alloc] initWithFormat:@"test"];
      CFStringRef aCFString = (__bridge_retained CFStringRef) aNSString;
      (void)aCFString;
      //正确的做法应该执行CFRelease,不执行将造成内存泄漏
      //CFRelease(aCFString);
  }
 ```

 `CFBridgingRetain()` 是`__bridge_retained`的宏方法，下面两行代码等价：

 ```objc
 CFStringRef aCFString = (__bridge_retained CFStringRef) aNSString;
 CFStringRef aCFString = (CFStringRef) CFBridgingRetain(aNSString);
 ```

### `__bridge_transfer`或者`CFBridgingRelease()`
`__bridge_transfer`或者`CFBridgingRelease()`将Core Foundation对象转换为Cocoa Foundation对象，同时将对象的管理权交给ARC，开发者无需管理内存。

```objc
- (void)viewDidLoad
{
    [super viewDidLoad];
    NSString *aNSString = [[NSString alloc]initWithFormat:@"test"];
    CFStringRef aCFString = (__bridge_retained CFStringRef) aNSString;
    aNSString = (__bridge_transfer NSString *)aCFString;
}
```

`CFBridgingRelease()`是`__bridge_transfer`的宏方法，下面两行代码等价:

```objc
aNSString = (__bridge_transfer NSString *)aCFString;
aNSString = (NSString *)CFBridgingRelease(aCFString);
```

### `__bridge`

`__bridge`只做类型转换，不改变对象所有权，是我们最常用的转换符。

从Cocoa Foundation转Core Foundation，ARC管理内存，不需要释放：

```objc
- (void)viewDidLoad
{
    [super viewDidLoad];

    NSString *aNSString = [[NSString alloc]initWithFormat:@"test"];
    CFStringRef aCFString = (__bridge CFStringRef)aNSString;

    (void)aCFString;
}
```

从Core Foundation转Cocoa Foundation，需要开发者手动释放，不归ARC管：

```objc
- (void)viewDidLoad
{
    [super viewDidLoad];

    CFStringRef aCFString = CFStringCreateWithCString(NULL, "test", kCFStringEncodingASCII);
    NSString *aNSString = (__bridge NSString *)aCFString;

    (void)aNSString;

    CFRelease(aCFString);
}
```
