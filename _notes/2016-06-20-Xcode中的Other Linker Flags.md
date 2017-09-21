---
layout: note
title: Xcode中的Other Linker Flags
motto: null
excerpt: Xcode中的Other Linker Flags的使用
tags: [Mac]
---
 
<!-- * TOC
{:toc} -->

source：[关于Xcode的Other Linker Flags](http://my.oschina.net/u/728866/blog/194741)

# 链接器

`Other Linker Flags`就是`ld`命令除了默认参数外的其它参数。`ld`命令实现的是链接器的工作，详细说明可以在终端`man ld`查看。  
一个程序从简单易读的代码到可执行文件往往要经历以下步骤：  

> 源代码 > 预处理器 > 编译器 > 汇编器 > 机器码 > 链接器 > 可执行文件  

源文件经过一系列处理以后，会生成对应的.obj文件，然后一个项目必然会有许多.obj文件，并且这些文件之间会有各种各样的联系，例如函数调用。链接器做的事就是把这些目标文件和所用的一些库链接在一起形成一个完整的可执行文件。具体可看：[链接器做了什么](http://www.dutor.net/index.php/2012/02/what-linkers-do/)  

# 为什么会闪退

苹果官方Q&A上有这么一段话：  

> The "selector not recognized" runtime exception occurs due to an issue between the implementation of standard UNIX static libraries, the linker and the dynamic nature of Objective-C. Objective-C does not define linker symbols for each function (or method, in Objective-C) - instead, linker symbols are only generated for each class. If you extend a pre-existing class with categories, the linker does not know to associate the object code of the core class implementation and the category implementation. This prevents objects created in the resulting application from responding to a selector that is defined in the category.  

大概意思就是`Objective-C`的链接器并不会为每个方法建立符号表，而是仅仅为类建立了符号表。这样的话，如果静态库中定义了已存在的一个类的分类，链接器就会以为这个类已经存在，不会把分类和核心类的代码合起来。这样的话，在最后的可执行文件中，就会缺少分类里的代码，这样函数调用就失败了。  

# 解决方法

解决方法就是在`Other Linker Flags`里加上所需的参数，主要有以下3个：  

- `-Objc`
- `-all_load`
- `-force_load`

## `-Objc`

一般情况下，使用这个参数足够解决前面提到的问题了，苹果官方说明如下：  

> This flag causes the linker to load every object file in the library that defines an Objective-C class or category. While this option will typically result in a larger executable (due to additional object code loaded into the application), it will allow the successful creation of effective Objective-C static libraries that contain categories on existing classes.  

简单说来，加了这个参数后，链接器就会把静态库中所有的Objective-C类和分类都加载到最后的可执行文件中，虽然这样可能会因为加载了很多不必要的文件而导致可执行文件变大，但是这个参数很好地解决了我们所遇到的问题。但是：  

> Important: For 64-bit and iPhone OS applications, there is a linker bug that prevents -ObjC from loading objects files from static libraries that contain only categories and no classes. The workaround is to use the -allload or -forceload flags.  

当静态库中只有分类而没有类的时候，`-ObjC`参数就会失效了。这时候，就需要使用`-all_load`或者`-force_load`了。  

`-all_load`会让链接器把所有找到的目标文件都加载到可执行文件中，但是千万不要随便使用这个参数！假如你使用了不止一个静态库文件，然后又使用了这个参数，那么你很有可能会遇到`ld: duplicate symbol`错误，因为不同的库文件里面可能会有相同的目标文件，所以建议在遇到`-ObjC`失效的情况下使用`-force_load`参数。  

`-force_load`所做的事情跟`-all_load`其实是一样的，但是`-force_load`需要指定要进行全部加载的库文件的路径，这样的话，你就只是完全加载了一个库文件，不影响其余库文件的按需加载。  
