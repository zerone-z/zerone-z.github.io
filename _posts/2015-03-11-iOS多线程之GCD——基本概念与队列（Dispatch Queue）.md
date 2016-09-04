---
layout: post
title:  iOS多线程之GCD——基本概念与队列（Dispatch Queue）
motto: null
tags: [iOS, Objective-c, 多线程, GCD, 调度队列]
commentFlag: true
project: false
excerpt: 'iOS中多线程GCD的使用，基本概念以及队列'
---

# 介绍

Grand Central Dispatch简称GCD，是Apple开发的一个多核编程的解决方法。GCD包括了语言特性、运行时库和系统改进，这项改进为并发代码在iOS和OS X的多核硬件上提供了系统全面的支持。GCD帮助系统和你的应用运行更快，更有效率，并且提高了响应速度。GCD是在系统级上操作的，可以更好地适应所有运行中的程序的需求，以平衡的方式使它们匹配可利用系统资源。

GCD API支持执行系统Unix级别的异步操作。你可以使用GCD API来管理响应文件描述符、Mach ports（用于OS X上的进程间通信）、进程、信号、和计时器。在OS X v10.7或更高版本上，你也可以使用GCD去处理通用的异步I/O操作的文件描述符。

# GCD对象和自动引用计数

当使用Objective-C编译器构建你的应用程序时，所有的GCD对象都是Objective-C对象。因此，当启用自动引用计数器（ARC）时，GCD对象就想其他的Objective-C对象那样自动保留和释放。当关闭ARC时，使用dispatch_retain和dispatch_release函数（或Objective-C语法）去保留和释放你的GCD对象。你不能使用Core Foundation框架的retain/release函数。

如果你需要在ARC应用中使用retain/release语法部署目标（为了维护现有代码的兼容性）,你可以通过添加DOS_OBJECT_USE_OBJC=0到你的编译器标志中去禁用基于Objective-C的GCD对象。

# 创建和管理队列

GCD编程的核心就是调度队列（dispatch queue）。dispatch queue是一个FIFO（先进先出）的队列，它保证了GCD任务按照FIFO的顺序执行，即第一个添加到dispatch queue中的任务，第一个执行，第二个添加到dispatch queue中的任务第二个执行，如此直到终点。所有的dispatch queue都是线程安全的，你能从多个线程中并行的访问他们。

## 获取主队列

```objc
dispatch_get_main_queue();
```

返回与主线程相关的串行队列，是一个主队列。这个主队列在main()函数被调用前就已经在主线程中被创建了。你的应用程序可以使用下面的三种方式去调用并提交这个主队列中的所有block。

1. 调用 dispatch_main
2. 调用UIApplicationMain（iOS）或NSApplicationMain（OS X）
3. 在主线程中使用CFRunLoopRef

值得注意的是，这个函数返回的主队列与全局并行队列一样无法响应dispatch_suspend，dispatch_resume，dispatch_set_context方法，即无法执行暂停、继续及设置内容。

## 获取全局串行队列

```objc
dispatch_get_global_queue(long identifier, unsigned long flags);
```

返回系统定义好的全局并行队列，可以指定执行的服务质量。dispatch_suspend，dispatch_resume，和dispatch_set_context对于这个函数返回的全局队列是无效的。

在这个全局队列中的任务是按照并行的方式一个一个执行的。

identifier，指定全局队列的服务质量（QOS）。你可以指定这些值：QOS_CLASS_USER_INTERACTIVE，QOS_CLASS_USER_INQOS_CLASS_USER_INITIATED，QOS_CLASS_UTILITY，QOS_CLASS_BACKGROUND。运用user-interactive或user-initiated任务的全局队列要比一般在后台运行的任务优先级要高。

你也可以指定dispatch_queue_priority_t（DISPATCH_QUEUE_PRIORITY_HIGH，DISPATCH_QUEUE_PRIORITY_DEFAULT，DISPATCH_QUEUE_PRIORITY_LOW，DISPATCH_QUEUE_PRIORITY_BACKGROUND）中的值，这些值映射为一个适合QOS的级别。

flags，Flags是为未来使用的保留值。目前这个参数始终为0。

注意：在iOS7及低于iOS7的版本中，identifier一般指定的值为dispatch_queue_priority_t。为了兼容iOS8以前及以后的版本，可以指定identifier的值为0。

## 创建队列

```objc
dispatch_queue_create(const char *label, dispatch_queue_attr_t attr);
```

返回一个用于提交block的新的队列。被提交到一个串行队列中block要按照FIFO（先进先出）的顺序一次只执行一个block。然而，记住，被提交到独立不同队列中的block可以相对于彼此同时地执行。被提交到一个串行队列中的block也需要按照FIFO的顺序出列，但是在资源可利用的情况下也是可以同时运行的。

当你的应用不再需要调度队列的时候，你需要使用dispatch_release函数释放掉这个队列。任何被提交到一个队列中还没有执行的block都有这个队列的引用，所以这个队列是不会被释放掉的，直到所有还没有执行的block都完成以后才会被释放掉。

label，一个字符串，被附加到队列中用于标识队列的唯一性。由于应用、库和框架都可以创建他们自己的调度队列，所以推荐采用反转DNS（com.example.myqueue）的命名方式。label这个参数是可选的，也可以是NULL。

attr，在OS X v10.7及以后或iOS 4.3及以后的版本中，指定DISPATCH_QUEUE_SERIAL（或NULL）去创建一个串行队列，指定DISPATCH_QUEUE_CONCURRENT去创建一个并行队列。在更早的版本中，这个歌参数只能被指定为NULL。

## 创建队列所需要的属性

```objc
dispatch_queue_attr_make_with_qos_class(dispatch_queue_attr_t attr, dispatch_qos_class_t qos_class, int_relative_priority);
```

返回一个属性，适用于创建一个想要的服务质量信息的调度队列。主要用于dispatch_queue_create函数。适用于OS X v10.10及以后或iOS v8.0及以后的版本。

当你想要创建一个指定服务质量（QOS）级别的GCD队列的时候，在调用dispatch_queue_create函数之前先要调用本函数。这个函数结合了你指定的QOS信息的调度队列类型属性，并且返回了一个可以传递到dispatch_queue_create函数中的值。你通过这个函数指定了这个QOS的值，这个值要优先于从调度队列目标队列中继承的优先级。

全局队列的优先级与QOS的等级映射关系如下：

DISPATCH_QUEUE_PRIORITY_HIGH  <===>  QOS_CLASS_USER_INITIATED

DISPATCH_QUEUE_PRIORITY_DEFAULT    <===> QOS_CLASS_UTILITY

DISPATCH_QUEUE_PRIORITY_LOW  <===> QOS_CLASS_UTILITY

DISPATCH_QUEUE_PRIORITY_BACKGROUND  <===>  QOS_CLASS_BACKGROUND

attr，一个结合了服务质量级别的队列属性值。指定attr为DISPATCH_QUEUE_SERIAL让这些提交的任务一个一个的运行，或者指定为DISPATCH_QUEUE_CONCURRENT让这些任务同时运行。如果你指定为NULL，则这个函数创建一个串行队列。

qos_class，你想要在这个队列中执行任务的服务质量（QOS）。QOS帮助我们确定这个队列中的任务执行优先级。可以指定QOS_CLASS_USER_INTERACTIVE，QOS_CLASS_USER_INITIATED，QOS_CLASS_UTILITY或QOS_CLASS_BACKGROUND中的一个。操作user-interactiver或user-initiated任务的队列要比其他一般在后台运行的任务队列有更高的优先级。

relative_priority，一个在QOS等级内的相对优先级。这个值是一个支持给定QOS调度优先级最大值的负偏差，。这个值必须大于0并且要小于QOS_MIN_RELATIVE_PRIORITY。

## 获取队列标签

```objc
dispatch_queue_get_label(dispatch_queue_t queue);
```

返回已经创建队列的指定标签。如果队列在创建过程中没有提供标签，则可能返回NULL。

## 给队列设置目标队列

```objc
dispatch_set_target_queue(dispatch_object_t object, dispatch_queue_t queue);
```

给GCD对象设置目标队列，这个目标队列负责处理这个对象。目标对象决定了它是调用对象的终结器对象。此外，修改某些对象的目标队列可以改变它们的行为：

调度队列：

一个调度队列的优先级是继承自它的目标队列的。使用dispatch_get_global_queue函数去获得一个合适的目标队列，这个目标队列就是你所需的优先级。

如果你提交一个block到一个串行队列中，并且这个串行队列的目标队列是一个不同的串行队列，那么这个block将不会与其他被提交到这个目标队列的block或者任何其他有相同目标队列的队列同时调用。

注意：如果你修改这个这个队列的目标队列，你一定要小心避免造成队列等级上的循环。

GCD数据源：

一个GCD数据源的目标队列指定了它的事件处理者的block和取消事件处理的block。

GCD I/O通道：

一个GCD I/O通道的目标队列指定了被执行的I/O操作。这可能会影响I/O操作结果的优先级。例如，如果这个通道的目标队列的优先级被设置为DISPATCH_QUEUE_PRIORITY_BACKGROUND，那么当有I/O操作争夺的时候，任何在这个队列上通过dispatch_io_read或dispatch_io_write执行的I/O操作都会被压制。

object，将要被修改的GCD对象。这个参数不能为NULL。

queue，GCD对象的新的目标队列。这个队列被保留，如果这个对象原来有目标队列，那么原来的目标队列将被释放。不能为NULL。

## 执行主队列上的block

```objc
dispatch_main();
```

执行主队列上被提交的所有block。这个函数是为主线程而存在的并且等待执行提交到主队列中的block。在主线程中调用了UIApplicationMain(iOS) ，NSApplicationMain(OS X)，或者CFrunLoopRun的应用程序一定不要调用dispatch_main。

```objc
int main(int argc, const char * argv[])
{

    @autoreleasepool {
        dispatch_async(dispatch_get_main_queue(), ^{
            NSLog(@"等待1。。。。");
        });
        dispatch_async(dispatch_get_main_queue(), ^{
            NSLog(@"等待1。。。。");
        });
        dispatch_main();
    }
    return 0;
}
```

如上：如果不调用dispatch_main()函数，则不会打印出结果。

# 管理时间

苹果提供了两个默认时间:

DISPATCH_TIME_NOW：表示当前的时间

DISPATCH_TIME_FOREVER：表示一个无穷大的时间，代表永远。

## 创建时间`dispatch_time`

```objc
dispatch_time_t dispatch_time(dispatch_time_t when, int64_t delta);
```

创建一个相对于默认时钟的dispatch_time_t，或者修改一个现有的dispatch_time_t。默认时钟是依据mach_absolute_time。该方法主要用于计算相对时间，表示在指定时间（when）单位纳秒（delta）后的时间。。

when，一个基础的时间。通过DISPATCH_TIME_NOW创建一个相对于现在时间的值。

delta，纳秒，在when参数的基础上添加纳秒。

```objc
// 创建一个当前时间后的两秒的时间
dispatch_time_t time = dispatch_time(DISPATCH_TIME_NOW, (int64_t)2 * NSEC_PER_SEC);
NSDate *startDate = [NSDate date];
dispatch_after(when, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSTimeInterval lengtn = [[NSDate date] timeIntervalSinceDate:startDate];
    NSLog(@"时间长度：%lf", lengtn);
});

// 2015-04-08 16:29:05.921 GCD[7866:690245] 时间长度：2.000157
```

## 创建时间`dispatch_walltime`

```objc
dispatch_time_t dispatch_walltime(const struct timespec *when, int64_t delta);
```

创建一个依据挂钟（wall clock）的绝对时间dispatch_time_t。这个挂钟（wall clock）是依据gettimeofday。主要用于计算绝对时间

when，在struct timespec上添加时间。如果为NULL，则该函数使用gettimeofday的结果值，一般为当前值。

delta，要添加的纳秒。

```objc
// 创建一个当前时间后的2秒的时间
dispatch_time_t when1 = dispatch_walltime(NULL, (int64_t)2 * NSEC_PER_SEC);
NSDate *startDate = [NSDate date];
dispatch_after(when1, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSTimeInterval lengtn = [[NSDate date] timeIntervalSinceDate:startDate];
    NSLog(@"时间长度：%lf", lengtn);
});

// 2015-04-08 16:25:16.868 GCD[7849:685894] 时间长度：2.000052

// 指定的时间(2015-04-08 16:26:00)执行
NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
[dateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
NSDate *date = [dateFormatter dateFromString:@"2015-04-08 16:26:00"];

NSTimeInterval interval = [date timeIntervalSince1970];
double second,subsecond;
subsecond = modf(interval, &second);

struct timespec baseWhen;
baseWhen.tv_sec = second;
baseWhen.tv_nsec = subsecond*NSEC_PER_SEC;

dispatch_time_t when2 = dispatch_walltime(&baseWhen, 0);

dispatch_after(when2, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSLog(@"时间：%@", [dateFormatter stringFromDate:[NSDate date]]);
});

// 2015-04-08 16:26:00.000 GCD[7849:686104] 时间：2015-04-08 16:26:00
```

# 调度队列任务

GCD提供并管理FIFO队列，你的应用程序可以以block对象的形式提交任务。提交到调度队列中的block在一个完全由系统管理的线程池中运行。不能保证一个任务是在某个线程上执行。GCD提供了三种队列：

主队列：在应用程序的主线程上串行执行任务。

并行队列：任务以FIFO的顺序出列，但是可以同时运行多个任务，并且可以在任何一个顺序上完成任务。

串行队列：任务按照FIFO的顺序一次只执行一个。

主队列是被系统自动创建的，且与应用程序的主线程有关。应用程序使用下面三种方式中的一种（只能一种）去调用提交到主队列中的block。

调用dispatch_main()函数

调用UIApplicationMain(iOS)或NSApplicationMain(OS X)

在主线程中使用一个CFRunLoopRef

可以使用并发队列同时执行大量的任务。GCD自动创建了四种并发调度队列（在iOS5／OS X v0.7以前有三种），这些队列在应用程序中时全局的，且只能通过他们的优先级进行区分。应用程序可以使用dispatch_get_global_queue函数获取这些队列。由于这些队列在你的程序中是全局的，所以你不需要retain和release它们；即使retain和release它们，也会被忽略。在OS X v0.7及以后或iOS 4.3及以后的版本中，你也可以使用你自己的代码模块创建额外的并发队列。

使用串行队列去确保任务以一种可确定的顺序执行。对于每一个串行队列来说确定一个明确的目的是一个好的做法，例如保护资源或同步关键进程。你的程序必须明确的创建和管理串行队列。你可能不可避免的会创建多个串行队列，但是如果仅仅为了同时执行多个任务，应该避免使用它们，而应该使用并行队列。

注：GCD一个C语言级别的API；它没有高级语言的捕获异常功能。在被提交到调度队列的block返回之前，你的应用程序必须捕获所有的异常。

## 异步disaptch_async，执行block

```objc
dispatch_async(dispatch_queue_t queue, ^(void)block)
```

提交一个block到异步执行的调度队列中，立即返回。这个函数是把block提交到调度队列中的基本办法。在这个block被提交之后，调用这个方法总是立即返回，并且从不会等待调用block。目标队列决定了这个block与队列中的其他block是串行的调用还是并行调用。各自独立的串行队列相对于彼此并行处理。

queue，用于提交block。这个队列被系统保留，直到block运行完毕。不可以为NULL。

block，提交到目标调度队列。这个函数代表调用者执行Block_copy和Block_release。不可以为NULL。

## 异步dispatch_async_f，执行C语言函数

```objc
dispatch_async_f(dispatch_queue_t queue, void *context, dispatch_function_t work)
```

提交一个应用程序定义的函数到异步执行的调度队列中，立即返回。这个函数是把应用程序定义的函数提交到调度队列中的基本方法。在这个函数被提交之后，调用这个函数总是立即返回，不会等待这个函数被调用。目标队列决定了这个函数与队列中的其他任务是串行调用还是并行调用。各自独立的串行队列相对于彼此是并行处理的。

queue，用于提交函数的队列。这个队列被系统保留，直到函数运行完成。不可以为NULL。

context，用于把应用程序定义好的context传递到work中。

work，在目标队列调用这个应用程序定义的函数 （work）。传递到这个函数中的第一个参数是context参数的值。不可以为NULL。

```objc

// 全局并行队列的执行
dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"全局并行队列一：%d", i);
    }
});

dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"全局并行队列二：%d", i);
    }
});
2015-03-26 21:48:00.798 GCD[19241:509194] 全局并行队列2：0
2015-03-26 21:48:00.797 GCD[19241:509195] 全局并行队列1：0
2015-03-26 21:48:00.799 GCD[19241:509194] 全局并行队列2：1
2015-03-26 21:48:00.799 GCD[19241:509195] 全局并行队列1：1
2015-03-26 21:48:00.799 GCD[19241:509194] 全局并行队列2：2
2015-03-26 21:48:00.799 GCD[19241:509195] 全局并行队列1：2

// 主线程执行，UI更新操作必须在主线程中执行,常嵌套在其他线程中，如下
dispatch_async(dispatch_get_main_queue(), ^{
    NSLog(@"主线程");
});

dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSLog(@"异步线程:%d", [NSThread isMultiThreaded]);
    dispatch_async(dispatch_get_main_queue(), ^{
        NSLog(@"主线程:%d", [NSThread isMainThread]);
    });
});
2015-03-26 21:49:57.555 GCD[19266:511529] 主线程
2015-03-26 21:49:57.614 GCD[19266:511459] 异步线程:0
2015-03-26 21:49:57.615 GCD[19266:511459] 主线程:1

// 自定义串行队列
dispatch_queue_t queueSerial = dispatch_queue_create("com.example.serial", DISPATCH_QUEUE_SERIAL);
dispatch_async(queueSerial, ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"自定义串行队列1：%d", i);
    }
});
dispatch_async(queueSerial, ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"自定义串行队列2：%d", i);
    }
});
2015-03-26 21:51:42.241 GCD[19326:513942] 自定义串行队列1：0
2015-03-26 21:51:42.244 GCD[19326:513942] 自定义串行队列1：1
2015-03-26 21:51:42.244 GCD[19326:513942] 自定义串行队列1：2
2015-03-26 21:51:42.245 GCD[19326:513942] 自定义串行队列2：0
2015-03-26 21:51:42.245 GCD[19326:513942] 自定义串行队列2：1
2015-03-26 21:51:42.245 GCD[19326:513942] 自定义串行队列2：2

// 自定义并行队列
dispatch_queue_t queueConcurrent = dispatch_queue_create("com.example.concurrent", DISPATCH_QUEUE_CONCURRENT);
dispatch_async(queueConcurrent, ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"自定义并行队列1：%d", i);
    }
});
dispatch_async(queueConcurrent, ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"自定义并行队列2：%d", i);
    }
});
2015-03-26 21:52:59.896 GCD[19352:515388] 自定义并行队列1：0
2015-03-26 21:52:59.897 GCD[19352:515389] 自定义并行队列2：0
2015-03-26 21:52:59.898 GCD[19352:515388] 自定义并行队列1：1
2015-03-26 21:52:59.898 GCD[19352:515389] 自定义并行队列2：1
2015-03-26 21:52:59.898 GCD[19352:515388] 自定义并行队列1：2
2015-03-26 21:52:59.898 GCD[19352:515389] 自定义并行队列2：2
```

## 同步dispatch_sync，执行block

```objc
dispatch_sync(dispatch_queue_t queue, ^(void)block)
```

提交一个block对象到一个调度队列中执行，等待blcok执行完成后返回。提交一个block到一个调度队列中同步执行。不像dispatch_async，这个函数直到block执行完成以后才返回。调用这个函数并在当前队列中将导致僵持。

不像dispatch_async，目标队列不会执行retain。由于调用这个函数是同步的，它拥有这个调用者的引用。此外，block不会执行Block_copy。

作为优化，这个函数调用在当前线程上的block是可以的。

queue，用于提交block。不可以为NULL。

block，在目标队列上被执行。不可以为NULL。

## 同步dispatch_sync_f，执行C语言函数

```objc
dispatch_sync_f(dispatch_queue_t queue, void *context, dispatch_function_t work)
```

提交一个应用程序定义的函数到调度队列中同步执行。同dispatch_sync。

queue，用于提交函数。不可以为NULL。

context，用于把应用程序定义好的context传递到work中。

work，在目标队列中调用系统定义好的函数（work）。传递到这个函数的第一个参数适context参数的值。不可以为NULL。

```objc
dispatch_sync(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"同步执行队列1：%d", i);
    }
});

dispatch_sync(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"同步执行队列2：%d", i);
    }
});

dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    dispatch_sync(dispatch_get_main_queue(), ^{
        NSLog(@"回到主线程同步执行");
    });
});
2015-03-26 22:27:24.618 GCD[19822:547127] 同步执行队列1：0
2015-03-26 22:27:24.619 GCD[19822:547127] 同步执行队列1：1
2015-03-26 22:27:24.619 GCD[19822:547127] 同步执行队列1：2
2015-03-26 22:27:24.619 GCD[19822:547127] 同步执行队列2：0
2015-03-26 22:27:24.620 GCD[19822:547127] 同步执行队列2：1
2015-03-26 22:27:24.620 GCD[19822:547127] 同步执行队列2：2
2015-03-26 22:27:24.673 GCD[19822:547127] 回到主线程同步执行
```

## 延迟执行dispatch_after

```objc
dispatch_after(dispatch_time_t when, dispatch_queue_t queue, dispatch_block_t block)
```

在指定的时间上排队执行一个block。这个函数一直等到指定的时间，然后异步添加block到指定的队列中。

使用DISPATCH_TIME_NOW作为when参数是被支持的，但是取代调用dispatch_async是不理想的。使用DISPaTCH_TIME_FOREVER在时间上是不确定的。

when，由时间函数dispatch_time或dispatch_walltime返回。

queue，用于提交block的队列。这个队列被系统保留，直到block运行完毕。不可以为NULL。

block，提交到队列中的block，这个函数代表调用者执行Block_copy和Block_release。

## 延迟执行dispatch_after_f

```objc
dispatch_after_f(dispatch_time_t when, dispatch_queue_t queue, void *context, dispatch_function_t work)
```

用法同上介绍。

```objc
__block NSTimeInterval beginTime = [[NSDate date] timeIntervalSince1970];
dispatch_time_t when = dispatch_time(DISPATCH_TIME_NOW, (int64_t)2 * NSEC_PER_SEC);
dispatch_after(when, dispatch_get_main_queue(), ^{
    NSTimeInterval endTime = [[NSDate date] timeIntervalSince1970];
    NSLog(@"延迟2秒执行:%lf",(endTime - beginTime));
});
2015-03-26 22:54:36.918 GCD[20055:566159] 延迟2秒执行:2.000500
```

## 迭代执行dispatch_apply

```objc
dispatch_apply(size_t iterations, dispatch_queue_t queue, void (^block)(size_t))
```

提交一个需要多次调用的block到调度队列中,直到所有的任务block迭代完成以后才返回。如果这个目标队列是一个通过dispatch_get_global_queue获取的并行队列，这些循环的block可以被同时调用，因此他是重入安全的 （reentrant-safe）。使用这个函数且是并行队列作为一种有效的平行的for循环是有用的。

当前的迭代索引将被传递到block的每一次调用中。

iterations，block执行的迭代数量。

queue，用于提交block的队列。不可以为NULL。

block，提交应用程序定义的函数。不可以为NULL。

## 迭代执行dispatch_apply_f

```objc
dispatch_apply_f(size_t iterations, dispatch_queue_t queue, void *context, void (*work)(void *, size_t))
```

用法同上。

```objc
// 串行迭代调用
dispatch_queue_t queueSerial = dispatch_queue_create("com.example.serial", DISPATCH_QUEUE_SERIAL);
dispatch_apply(3, queueSerial, ^(size_t index) {
    for (int i = 0; i < 2; i++) {
        NSLog(@"串行迭代%zu：%d",index, i);
    }
});
2015-03-26 23:04:26.597 GCD[20168:575489] 串行迭代0：0
2015-03-26 23:04:26.598 GCD[20168:575489] 串行迭代0：1
2015-03-26 23:04:26.598 GCD[20168:575489] 串行迭代1：0
2015-03-26 23:04:26.598 GCD[20168:575489] 串行迭代1：1
2015-03-26 23:04:26.599 GCD[20168:575489] 串行迭代2：0
2015-03-26 23:04:26.599 GCD[20168:575489] 串行迭代2：1

// 并行迭代调用
dispatch_queue_t queueConcurrent = dispatch_queue_create("com.example.concurrent", DISPATCH_QUEUE_CONCURRENT);
dispatch_apply(3, queueConcurrent, ^(size_t index) {
    for (int i = 0; i < 2; i++) {
        NSLog(@"并行迭代%zu：%d",index, i);
    }
});
2015-03-26 23:06:03.850 GCD[20194:577242] 并行迭代0：0
2015-03-26 23:06:03.850 GCD[20194:577287] 并行迭代1：0
2015-03-26 23:06:03.851 GCD[20194:577242] 并行迭代0：1
2015-03-26 23:06:03.850 GCD[20194:577288] 并行迭代2：0
2015-03-26 23:06:03.851 GCD[20194:577287] 并行迭代1：1
2015-03-26 23:06:03.851 GCD[20194:577288] 并行迭代2：1
```

## 执行一次（且仅有一次）dispatch_once

```objc
dispatch_once(dispatch_once_t *predicate, dispatch_block_t block)
```

在应用程序的生命周期内只执行一次（且仅有一次）block对象。在一个应用程序中初始化一个全局数据（单例），这个函数是非常有用的。使用或测试由block初始化的变量之前，请务必调用这个函数。

如果从多个线程中同时调用这个函数，那么会同步等待，直到block执行完成。

predicate必须指向一个储存在全局或静态范围内的变量。以自动或动态存储（包括Object-C实例变量）predicate的方式，结果是无法预知的。

predicate，指向dispatch_once_t结构的指针，被用来检验这个block是否已经执行完毕。

block，该block对象仅执行一次。

## 执行一次（且仅有一次）dispatch_once_f

```objc
dispatch_once_f(dispatch_once_t *predicate, void *context, dispatch_function_t function)
```

用法同上。

```objc
for (int i = 0; i < 3; i++) {
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
        NSLog(@"只执行一次");
    });
}
2015-03-26 23:10:58.714 GCD[20229:582692] 只执行一次

// 常用于构建单例模式, 且是线程安全的
+ (id)sharePredicate
{
    static Singleton *singleton = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
        singleton = [[Singleton alloc] init];
    });
    return singleton;
}
```

带有“_f”后缀的使用例子如下：

```objc
void work(void *context)
{
    NSLog(@"work:%@", context);
}
dispatch_async_f(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), @"测试调用C函数", work);
2015-03-26 23:23:18.771 GCD[20320:595186] work:测试调用C函数

void work(void *context, size_t t)
{
    NSLog(@"%@%zu", context, t);
}
dispatch_apply_f(3, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), @"迭代调用", work);
2015-03-27 11:28:15.331 GCD[3656:154470] 迭代调用2
2015-03-27 11:28:15.331 GCD[3656:154420] 迭代调用0
2015-03-27 11:28:15.331 GCD[3656:154472] 迭代调用1
```

# GCD让程序在后台长久运行

在没有GCD的时候，App最多在后台最多有5秒钟的时间做一些保存和清理资源的工作。但在使用GCD后，App可以有10分钟的时间在后台长久运行，在该时间段内可以清理缓存，及发送统计数据等工作。

```objc
// AppDelegate.h
@property (nonatomic, assign) UIBackgroundTaskIdentifier backgroudUndateTask;

// AppDelegate.m
- (void)applicationDidEnterBackground:(UIApplication *)application
{
    [self beginBackgroundUpdateTask];
    // 长久运行的代码
    [self endBackgroundUpdateTask];
}

- (void)beginBackgroundUpdateTask
{
    self.backgroudUndateTask = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^{
        [self endBackgroundUpdateTask];
    }];
}

- (void)endBackgroundUpdateTask
{
    [[UIApplication sharedApplication] endBackgroundTask:self.backgroudUndateTask];
    self.backgroudUndateTask = UIBackgroundTaskInvalid;
}
```
