---
layout: post
title: Objective-C新特性(Xcode7)
tags: [iOS, Xcode7, Nullability, Lightweight Generics, __kindof]
commentFlag: true
project: false
excerpt: '自WWDC 2015推出和开源 Swift 2.0 后，在大家羡慕使用Swift的新特性同时，也有许多像我这样仍需坚守Objective-C的开发者们，本篇文章就主要介绍一下Objective-C中的新特性：可空注释、轻量级泛型、__kindof'
---

# Objective-C新特性 #
## Overview ##
主要有三个特性：

- **Nullability Annotations（可空注释）**
- **Lightweight Generics（轻量级泛型）**
- **__kindof**

## Nullability Annotations（可空注释） ##

Nullability在编译器层面提供了空值的类型检查，在类型不符时给出warning，方便开发者第一时间发现潜在问题。不过我想更大的意义在于能够更加清楚的描述接口，是主调者和被调者间的一个协议，比多少句文档描述都来得清晰。
不仅是属性和方法中的对象，对于局部的对象、甚至 c 指针都可以用带双下划线的修饰符，可以理解成能用 const 关键字的地方都能用 Nullability。
所以 Nullability 总的来说就是，写着丑B，用着舒服。
Nullability并不算新特性了，从上一个版本llvm 6.1 （Xcode 6.3）就已经支持了。主要关键词如下：

- **__nullable & nullable** 表示可以为nil或NULL
- **__nonnull & nonnull** 表示不可以为nil或NULL
- **__null_unspecified && null_unspecified** 表示是否为nil或NULL不确定
- **null_resettable**
- **NS\_ASSUME\_NONNULL\_BEGIN & NS\_ASSUME\_NONNULL\_END**

### nullable、nonnull、null_unspecified ###
关键词前面有双下划线“__”的用于修饰一个变量，仅用于指针类型上。使用方式如下：

```objc
@property (strong, nonatomic) NSString * __nullable name;
@property (strong, nonatomic) NSString * __nonnull sex;
@property (strong, nonatomic) NSString * __null_unspecified age;
- (NSString * __nonnull)personDescription:(NSString * __nonnull)description;
```
关键词前面没有双下划线“__”的，使用方式如下：

```objc
@property (nullable, strong, nonatomic) NSString *name;
@property (nonnull, strong, nonatomic) NSString *sex;
@property (null_unspecified, strong, nonatomic) NSString *age;
- (nonnull NSString *)personDescription:(nonnull NSString *)description;
```
在使用过程中，使用不当会有编译警告：
![图一](/assets/posts/Objective-C_New_Feature/图一.png)
### null_resettable ###
`null_resettable`属性专用，表示该属性永远都有非nil默认值，即使传入nil。即使你setter一个nil值，但getter到的是一个非nil值，可以为默认值。最直观的例子是UIViewController中的View属性：

```objc
@property(null_resettable, nonatomic,strong) UIView *view;
```
它可以被设成nil，但是调用getter时会触发`[self loadView]`从而创建并返回一个非nil的view。
### 审查区域（Audited Regions） ###
如果需要每个属性或每个方法都去指定`nonnull`和`nullable`，是一件非常繁琐的事。苹果为了减轻我们的工作量，专门提供了两个宏：`NS_ASSUME_NONNULL_BEGIN`和`NS_ASSUME_NONNULL_END`。在这两个宏之间的代码，所有简单指针对象都被假定为`nonnull`，因此我们只需要去指定那些`nullable`的指针。如下代码所示：

```objc
NS_ASSUME_NONNULL_BEGIN

@interface Person : NSObject

@property (nullable, strong, nonatomic) NSString *name;
@property (strong, nonatomic) NSString *sex;
@property (null_unspecified, strong, nonatomic) NSString *age;

- (nullable NSString *)personDescription:(NSString *)description;

@end

NS_ASSUME_NONNULL_END
```
审查区域在使用过程中，还需要遵循如下几条：

- `typedef`定义的类型的nullability特性通常依赖于上下文，即使是在审查区域中，也不能假定它为nonnull。
- 复杂的指针类型(如`id *`)必须显示去指定是`nonnull`还是`nullable`。例如，指定一个指向`nullable`对象的`nonnull`指针，可以使用`__nullable id * __nonnull`。
- 我们经常使用的`NSError **`通常是被假定为一个指向nullable NSError对象的nullable指针。

ps: 全部使用关键字修饰的另外一个原因在于如果有一个指针使用了关键字，那么编辑器就会重新编译这个文件，对于没有使用关键字的指针报出警告，为了消除这些警告，不得不使用关键字修饰所有的指针。

## Lightweight Generics（轻量级泛型） ##
泛型是程序设计语言的一种特性。允许程序员在强类型程序设计语言中编写代码时定义一些可变部分，那些部分在使用前必须作出指明。将类型参数化以达到代码复用提高软件开发工作效率的一种数据类型。使用泛型具有如下好处:

- 不会强行对值类型进行装箱和拆箱，或对引用类型进行向下强制类型转换，所以性能得到提高。
- 通过知道使用泛型定义的变量的类型限制，编译器可以在一个高得多的程度上验证类型假设，所以泛型提高了程序的类型安全。
- 它允许程序员将一个实际的数据类型的规约延迟至泛型的实例被创建时才确定。
- 泛型为开发者提供了一种高性能的编程方式，能够提高代码的重用性，并允许开发者编写非常优雅的解决方案。

Lightweight Generics 轻量级泛型，轻量是因为这是个纯编译器的语法支持（llvm 7.0），和 Nullability 一样，没有借助任何 objc runtime 的升级，也就是说，这个新语法在 Xcode 7 上可以使用且完全向下兼容（更低的 iOS 版本)。

### 带泛型的容器 ###
可以指定容器类中对象的类型。示例如下:

```objc
@property (nullable, strong, nonatomic) NSMutableArray<Person *> *array;
@property (nullable, strong, nonatomic) NSMutableDictionary<NSString *, NSNumber *> *dictionary;
```
假如向泛型容器中加入错误的对象，编译器会警告：
![图二](/assets/posts/Objective-C_New_Feature/图二.png)
### 自定义泛型类 ###
先看示例代码：

```objc
@interface Stack<ObjectType> : NSObject

- (void)pushObject:(ObjectType)object;
- (ObjectType)popObject;

@property (nonatomic, readonly) NSArray<ObjectType> *allObjects;

@end
```
上面代码中的`ObjectType`是传入类型的placeholder，这个`ObjectType`名称可以随便取，也可以使用`T`，它只能在@interface上定义（类声明、类扩展Extend、类目Category），这个`ObjectType`类型只能在`@interface`和`@end`区间的作用域有效，可以把它作为入参、出参、甚至内部NSArray属性的泛型类型。我们也可以给`OjbectType`增加类型限制，如下：

```objc
// 只接受 NSNumber * 的泛型
@interface Stack<ObjectType: NSNumber *> : NSObject
// 只接受满足 NSCopying 协议的泛型
@interface Stack<ObjectType: id<NSCopying>> : NSObject

```
若什么都不加，表示接受任意类型（id）；当类型不满足时编译器将产生错误。
![图三](/assets/posts/Objective-C_New_Feature/图三.png)
对于多参数的泛型，用逗号隔开，其他都一样，可以参考 NSDictionary 的头文件。
### 协变性和逆变性 ###
当类支持泛型后，它们的 Type 发生了变化，比如下面三个对象看上去都是 Stack，但实际上属于三个 Type：

```objc
Stack *stack; // Stack *
Stack<NSString *> *stringStack; // Stack<NSString *>
Stack<NSMutableString *> *mutableStringStack; // Stack<NSMutableString *>
```
当其中两种类型做类型转化时，编译器需要知道哪些转化是允许的，哪些是禁止的，比如，默认情况下：
![图四](/assets/posts/Objective-C_New_Feature/图四.jpg)
我们可以看到，不指定泛型类型的 Stack 可以和任意泛型类型转化，但指定了泛型类型后，两个不同类型间是不可以强转的，假如你希望主动控制转化关系，就需要使用泛型的协变性和逆变性修饰符了：

- `__covariant` 协变性，子类型可以强转到父类型（里氏替换原则）
- `__contravariant ` 逆变性，父类型可以强转到子类型（WTF?）

协变:

```objc
@interface Stack<__covariant ObjectType> : NSObject
```
效果：
![图五](/assets/posts/Objective-C_New_Feature/图五.jpg)
逆变:

```objc
@interface Stack<__contravariant ObjectType> : NSObject
```
效果：
![图六](/assets/posts/Objective-C_New_Feature/图六.jpg)
## __kindof ##
使用`__kindof`声明的对象，表示该对象属于某个类，告知编译器在传参数的时候，需要使用该类或者子类对象。使用`__kindof`比使用明确的类型声明更灵活，比使用`id`更明确。
`__kindof`修饰符解决了一个长期以来的小痛点，那原来的`UITableView`的这个方法来说：

```objc
- (id)dequeueReusableCellWithIdentifier:(NSString *)identifier;
```
使用时前面基本会使用 UITableViewCell 子类型的指针来接收返回值，所以这个 API 为了让开发者不必每次都蛋疼的写显式强转，把返回值定义成了 id 类型，而这个 API 实际上的意思是返回一个 UITableViewCell 或 UITableViewCell 子类的实例，于是新的 __kindof 关键字解决了这个问题：

```objc
- (nullable __kindof UITableViewCell *)dequeueReusableCellWithIdentifier:(NSString *)identifier;
```
既明确表明了返回值，又让使用者不必写强转。再举个带泛型的例子，UIView 的 subviews 属性被修改成了：

```objc
@property(nonatomic,readonly,copy) NSArray<__kindof UIView *> *subviews;
```
这样，写下面的代码时就没有任何警告了：
```objc
UIButton *button = view.subviews.lastObject;
```

参考：
- [2015 Objective-C 新特性](http://blog.sunnyxx.com/2015/06/12/objc-new-features-in-2015/)  
- [会报编译器警告的Xcode 6.3新特性：Nullability Annotations](http://www.cocoachina.com/ios/20150603/11989.html)
- [New Features in Xcode 7](https://developer.apple.com/library/prerelease/ios/documentation/DeveloperTools/Conceptual/WhatsNewXcode/Articles/xcode_7_0.html)
