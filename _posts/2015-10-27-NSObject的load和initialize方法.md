---
layout: post
title: NSObject的load和initialize方法
tags: [iOS, load, initialize]
excerpt: '在Objective-C的类被加载和初始化的时候，有时，我们需要在适当的情况下做一些定制处理。而这正是load和initialize方法可以帮我们做到的'
---

原文地址：[NSObject的load和initialize方法](http://www.molotang.com/articles/1929.html)

# `NSObject` 的 `load` 和 `initialize` 方法

在Objective-C中，NSObject是根类，其中有两个类方法： `load` 和 `initialize` 。  

## Overview

Objective-C作为一门面向对象语言，有类和对象的概念。编译后，类相关的数据结构会保留在目标文件中，在运行时得到解析和使用。在应用程序运行起来的时候，类的信息会有加载和初始化过程。     
其实在Java语言中也有类似的过程，JVM的ClassLoader也对类进行了加载、连接、初始化。    
就像Application有生命周期回调方法一样，在Objective-C的类被加载和初始化的时候，也可以收到方法回调，可以在适当的情况下做一些定制处理。而这正是load和initialize方法可以帮我们做到的。  

```objc
+ (void)load;
+ (void)initialize;
```

可以看到这两个方法都是以“+”开头的类方法，返回为空。通常情况下，我们在开发过程中可能不必关注这两个方法。如果有需要定制，我们可以在自定义的NSObject子类中给出这两个方法的实现，这样在类的加载和初始化过程中，自定义的方法可以得到调用。  

从如上声明上来看，也许这两个方法和其它的类方法相比没什么特别。但是，这两个方法具有一定的“特殊性”，这也是这两个方法经常会被放在一起特殊提到的原因。详细请看如下几小节的整理。    

## `load`和`initialize`的共同点

 - 在不考虑开发者主动使用的情况下，系统最多会调用一次
 - 如果父类和子类都被调用，父类的调用一定在子类之前
 - 都是为了应用运行提前创建合适的运行环境
 - 都是为了应用运行提前创建合适的运行环境

## `load`方法相关要点

 - 调用时机比较早，运行环境有不确定因素。具体说来，在iOS上通常就是App启动时进行加载，但当load调用的时候，并不能保证所有类都加载完成且可用，必要时还要自己负责做auto release处理。
 - 补充上面一点，对于有依赖关系的两个库中，被依赖的类的load会优先调用。但在一个库之内，调用顺序是不确定的。
 - 对于一个类而言，没有load方法实现就不会调用，不会考虑对NSObject的继承。
 - 一个类的load方法不用写明[super load]，父类就会收到调用，并且在子类之前。
 - Category的load也会收到调用，但顺序上在主类的load调用之后。
 - 不会直接触发initialize的调用。

## `initialize`方法相关要点

 - initialize的自然调用是在第一次主动使用当前类的时候（lazy，这一点和Java类的“clinit”的很像）。
 - 在initialize方法收到调用时，运行环境基本健全。
 - initialize的运行过程中是能保证线程安全的。
 - 和load不同，即使子类不实现initialize方法，会把父类的实现继承过来调用一遍。注意的是在此之前，父类的方法已经被执行过一次了，同样不需要super调用。

由于initialize的这些特点，使得其应用比load要略微广泛一些。可用来做一些初始化工作，或者单例模式的一种实现方案。

## 原理

“源码面前没有秘密”。最后，我们来看看苹果开放出来的部分源码。从中我们也许能明白为什么load和initialize及调用会有如上的一些特点。  

其中load是在objc库中一个load_images函数中调用的，先把二进制映像文件中的头信息取出，再解析和读出各个模块中的类定义信息，把实现了load方法的类和Category记录下来，最后统一执行调用。  

其中的prepare_load_methods函数实现如下：  

```objc
void prepare_load_methods(header_info *hi)
{
   size_t count, i;

   rwlock_assert_writing(&runtimeLock);

   classref_t *classlist =
       _getObjc2NonlazyClassList(hi, &count);
   for (i = 0; i < count; i++) {
       schedule_class_load(remapClass(classlist[i]));
   }

   category_t **categorylist = _getObjc2NonlazyCategoryList(hi, &count);
   for (i = 0; i < count; i++) {
       category_t *cat = categorylist[i];
       Class cls = remapClass(cat->cls);
       if (!cls) continue;  // category for ignored weak-linked class
       realizeClass(cls);
       assert(cls->ISA()->isRealized());
       add_category_to_loadable_list(cat);
   }
}
```

这大概就是主类中的load方法先于category的原因。再看下面这段：  

```objc
static void schedule_class_load(Class cls)
{
   if (!cls) return;
   assert(cls->isRealized());  // _read_images should realize

   if (cls->data()->flags & RW_LOADED) return;

   // Ensure superclass-first ordering
   schedule_class_load(cls->superclass);

   add_class_to_loadable_list(cls);
   cls->setInfo(RW_LOADED);
}
```

这正是父类load方法优先于子类调用的原因。  

再来看下initialize调用相关的源码。objc的库里有一个_class_initialize方法实现，如下：    

```objc
void _class_initialize(Class cls)
{
   assert(!cls->isMetaClass());

   Class supercls;
   BOOL reallyInitialize = NO;

   supercls = cls->superclass;
   if (supercls  &&  !supercls->isInitialized()) {
       _class_initialize(supercls);
   }

   monitor_enter(&classInitLock);
   if (!cls->isInitialized() && !cls->isInitializing()) {
       cls->setInitializing();
       reallyInitialize = YES;
   }
   monitor_exit(&classInitLock);

   if (reallyInitialize) {
       _setThisThreadIsInitializingClass(cls);

       if (PrintInitializing) {
           _objc_inform("INITIALIZE: calling +[%s initialize]",
                        cls->nameForLogging());
       }

       ((void(*)(Class, SEL))objc_msgSend)(cls, SEL_initialize);

       if (PrintInitializing) {
           _objc_inform("INITIALIZE: finished +[%s initialize]",
                        cls->nameForLogging());
       }

       monitor_enter(&classInitLock);
       if (!supercls  ||  supercls->isInitialized()) {
           _finishInitializing(cls, supercls);
       } else {
           _finishInitializingAfter(cls, supercls);
       }
       monitor_exit(&classInitLock);
       return;
   }

   else if (cls->isInitializing()) {
       if (_thisThreadIsInitializingClass(cls)) {
           return;
       } else {
           monitor_enter(&classInitLock);
           while (!cls->isInitialized()) {
               monitor_wait(&classInitLock);
           }
           monitor_exit(&classInitLock);
           return;
       }
   }

   else if (cls->isInitialized()) {
       return;
   }

   else {
       _objc_fatal("thread-safe class init in objc runtime is buggy!");
   }
}
```

在这段代码里，我们能看到initialize的调用顺序和线程安全性。  
