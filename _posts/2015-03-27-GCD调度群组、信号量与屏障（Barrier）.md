---
layout: post
title:  GCD调度群组、信号量与屏障（Barrier）
motto: null
tags: [iOS, 多线程, GCD, 群组, 信号量, 屏障]
commentFlag: true
project: false
excerpt: 'iOS中多线程GCD的使用，包括调度群组、信号量与屏障'
---

# GCD调度群组

组合block可以实现聚合同步。你的应用可以提交多个block，也可以跟踪这些block完成的时刻，尽管它们可能运行在不同的队列中。当我们遇到所有指定的任务完成以后程序才能接着执行的时候，这种方式是很有用的。

## 创建群组

```objc
dispatch_group_t dispatch_group_create();
```

创建新的群组，用于关联block对象(通过dispatch_group_async函数)。调度群组保存了它自己未执行相关联任务的数量，当一个新的任务被关联时增加它的计数，但一个任务执行完毕的时候减少它的计数。当所有与群组相关联的任务已经完成的时候，如dispatch_group_notify和dispatch_group_wait函数通过使用计数器确定你的应用程序继续执行。那时，应用程序可以采取任务适当的行为。
但你的程序不再需要群组的时候，你应该使用dispatch_release函数去释放掉它引用的群组对象，并最终释放掉它的内存。

当创建群组对象失败的时候，则会返回NULL。

## 分组异步执行dispatch_group_async

```objc
dispatch_group_async(dispatch_group_t group, dispatch_queue_t queue, dispatch_block_t block);
```

提交一个block到调度队列中，并且使该block与指定的调度群组相关联。这个调度群组可以被用于等待它引用所有block对象执行完成。即实现监听所有的任务是否完成，完成通知执行其他的操作。
group，一个调度群组，与被提交的block对象相关联。这个群组被系统保留，直到这个block运行完毕。不可以为NULL。

queue，调度队列，用于提交block对象，是异步调用的。这个队列被系统保留，直到这个block运行完毕。不可以为NULL。

block，该block异步执行。这个函数代表调用者执行Block_copy和Block_release。

## 分组异步执行dispatch_group_async_f（C语言函数）

```objc
dispatch_group_async_f(dispatch_group_t group, dispatch_queue_t queue, void *context, dispatch_function_t work);
```

提交一个应用程序中定义好的函数到调度队列中，并与指定的调度群组相关联。这个调度群组被用于等待它引用所有应用程序中定义好的函数执行完毕。
group，调度群组，与被提交的函数相关联。该群组被系统保留，直到应用程序中定义好的函数执行完毕。不可以为NULL。

queue，调度队列，用于提交系统定义好的函数，异步调用。该队列被系统保留，直到应用程序定义好的函数执行完毕。不可以为NULL。

context，是由程序定义的，用于传递给work的参数。

work，应用程序定义的函数，在目标队列中调用。work的第一个参数值是context。

## 增加群组计数器dispatch_group_enter

```objc
dispatch_group_enter(dispatch_group_t group);
```

明确指出已经进入一个block中了。调用这个函数将会增加当前群组中未执行任务的计数。使用这个函数（与dispatch_group_leave）允许你的应用程序妥善管理这个任务引用的计数，如果它明确地增加并移除了这个群组的任务，那么则与使用dispatch_group_async函数是一个意义。调用了这个函数，为了平衡必须要调用dispatch_group_leave。在同一时间，你可以使用此函数与一个群组以上的block相关联。

group，被更新计数器的调度群组。不可以为NULL。

## 减少群组计数器dispatch_group_leave

```objc
dispatch_group_leave(dispatch_group_t group);
```

明确指出在群组中的block已经完成。调用这个函数将会减少当前群组中未执行任务的计数。使用这个函数（与dispatch_group_enter）允许你的应用程序妥善管理这个任务引用的计数，如果它明确地增加并移除了这个群组的任务，那么则与使用dispatch_group_asynce函数是一个意义。调用这个函数，为了平衡必须调用dispatch_group_enter。调用该函数的次数超过dispath_group_enter的次数是无效的，这将会出现一个负的计数器。

group，被更新计数器的调度群组。不可以为NULL。

## 群组中任务执行完毕后的操作dispatch_group_notify

```objc
dispatch_group_notify(dispatch_group_t group, dispatch_queue_t queue, dispatch_block_t block);
```

当事先与这个群组相关联的所有block完成以后，安排一个block对象提交的一个指定的队列中执行。如果这个group是空的（没有block对象与这个调度群组相关联），这个通知block对象将会立即被提交。
当这个通知block被提交以后，这个群组时空的。这时，这个群组既可以使用dispatch_release释放掉，也可以添加block对象重新使用。

group，被观察的调度群组。这个群组被系统保留，直到这个block运行完成。不可以为NULL。

queue，当群组任务完成以后，用于提供block的队列。这个队列被系统保留，直到这个block完成。不可以为NULL。

block，当群组任务完成以后，用于提交到queue的block。这个函数代表调用者执行Block_copy和Block_release。不可以为NULL。

## 群组中任务完成后的操作dispatch_group_notify_f，执行C函数

```objc
dispatch_group_notify_f(dispatch_group_t group, dispatch_queue_t queue, void *context, dispatch_function_t work);
```

用法同上。

## 等待群组任务完成disaptch_group_wait

```objc
long dispatch_group_wait(dispatch_group_t group, dispatch_time_t timeout);
```

同步等待事先提交到群组中的任务完成。在指定的超时期限过去之前，返回这些block是否完成。当发生超时时，这个群组将恢复到原来的状态。
如果这个调度群组是空的（没有block与这个群组相关联），这个函数立即返回。

在这个函数成功返回之后，这个调度群组是空的。它既可以使用dispatch_release释放掉，也可以重新添加block。

成功（在指定的超时期限内，所有与群组相关联的block完成）将返回零。失败（超时发生）返回非零。

group，等待完成的调度群组。不可以为NULL。

timeout，超时时间（参考dispatch_time）。常量DISPATCH_TIME_NOW和DISPATCH_TIME_FOREVER被提供使用很方便。

## 群组队列基本使用示例

```objc
dispatch_group_t group = dispatch_group_create();
dispatch_queue_t queueSerial = dispatch_queue_create("com.example.serial", DISPATCH_QUEUE_SERIAL);
// dispatch_group_async 使用
dispatch_group_async(group, queueSerial, ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"分组串行队列1:%d",i);
    }
});
dispatch_group_async(group, queueSerial, ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"分组串行队列2:%d",i);
    }
});

// dispatch_group_wait使用
dispatch_group_wait(group, DISPATCH_TIME_FOREVER);
NSLog(@"dispatch_group_wait执行完毕");

dispatch_queue_t queueCurrent = dispatch_queue_create("com.example.concurrent", DISPATCH_QUEUE_CONCURRENT);
dispatch_group_async(group, queueCurrent, ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"分组并行队列1:%d",i);
    }
});
dispatch_group_async(group, queueCurrent, ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"分组并行队列2:%d",i);
    }
});
// dispatch_group_notify使用
dispatch_group_notify(group, dispatch_get_main_queue(), ^{
    NSLog(@"dispatch_group_notify执行完毕");
});
2015-03-29 21:29:46.686 GCD[10809:602605] 分组串行队列1:0
2015-03-29 21:29:46.687 GCD[10809:602605] 分组串行队列1:1
2015-03-29 21:29:46.687 GCD[10809:602605] 分组串行队列1:2
2015-03-29 21:29:46.687 GCD[10809:602605] 分组串行队列2:0
2015-03-29 21:29:46.688 GCD[10809:602605] 分组串行队列2:1
2015-03-29 21:29:46.688 GCD[10809:602605] 分组串行队列2:2
2015-03-29 21:29:46.688 GCD[10809:602561] dispatch_group_wait执行完毕
2015-03-29 21:29:46.688 GCD[10809:602605] 分组并行队列1:0
2015-03-29 21:29:46.688 GCD[10809:602603] 分组并行队列2:0
2015-03-29 21:29:46.688 GCD[10809:602605] 分组并行队列1:1
2015-03-29 21:29:46.689 GCD[10809:602603] 分组并行队列2:1
2015-03-29 21:29:46.689 GCD[10809:602605] 分组并行队列1:2
2015-03-29 21:29:46.689 GCD[10809:602603] 分组并行队列2:2
2015-03-29 21:29:46.841 GCD[10809:602561] dispatch_group_notify执行完毕
```

```objc
// dispatch_group_enter 与 dispatch_group_leave
dispatch_group_t group = dispatch_group_create();
for (int i = 0; i < 3; i++) {
    dispatch_group_enter(group);
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        for (int j = 0; j < 3; j++) {
            NSLog(@"分组队列%d：%d", i, j);
        }
        dispatch_group_leave(group);
    });
}

// 用dispatch_group_wait 或者使用dispatch_group_notify
dispatch_group_wait(group, DISPATCH_TIME_FOREVER);
NSLog(@"Enter／leave执行完毕");

2015-03-29 21:37:55.749 GCD[10873:609484] 分组队列1：0
2015-03-29 21:37:55.749 GCD[10873:609485] 分组队列0：0
2015-03-29 21:37:55.751 GCD[10873:609484] 分组队列1：1
2015-03-29 21:37:55.750 GCD[10873:609483] 分组队列2：0
2015-03-29 21:37:55.751 GCD[10873:609485] 分组队列0：1
2015-03-29 21:37:55.752 GCD[10873:609484] 分组队列1：2
2015-03-29 21:37:55.752 GCD[10873:609483] 分组队列2：1
2015-03-29 21:37:55.752 GCD[10873:609485] 分组队列0：2
2015-03-29 21:37:55.753 GCD[10873:609483] 分组队列2：2
2015-03-29 21:37:55.753 GCD[10873:609424] Enter／leave执行完毕
```

# GCD信号量

调度信号是一个有效的传统的计数信号装置。当调用线程需要被阻塞时，调度信号才调用到内核。如果响应信号不需要被阻塞，则不需要调用内核。主要作用：

1. 使用信号量可以使多个异步不同队列的线程串行执行。
2. 可以控制并发线程的数量。

## 创建信号量dispatch_semaphore_create

```objc
dispatch_semaphore_t dispatch_semaphore_create(long value);
```

创建一个带有初始值的信号量。通过设置value为零，可以使两个线程协调完成一个特定的事件。通过设置一个大于零的value，可以限定线程池的大小，该线程池的大小即为该值value。

当你的程序不再需要信号量的时候，你应该调用dispatch_release函数释放掉引用信号量的对象，并最终释放掉它的内存。

如果失败则返回NULL。value必须大于等于零，否则失败返回NULL。

value，信号量的初始值。设置小于零的值，则返回NULL。

## 发送信号dispatch_semaphore_signal

```objc
long dispatch_semaphore_signal(dispatch_semaphore_t dsema);
```

发送信号，增加信号的计数量。如果以前的值小于零，则这个函数将唤醒当前正在dispatch_semaphore_wait这里等待的线程。

如果一个线程被唤醒则返回非零，否则返回零。

dsema，信号量。不可为NULL。

## 等待信号dispatch_semaphore_wait

```objc
long dispatch_semaphore_wait(dispatch_semaphore_t dsema, dispatch_time_t timeout);
```

等待一个信号，递减信号的计数量。如果信号量小于零，则在返回值之前，这个函数以FIFO的顺序等待一个信号的发生。

成功返回零。如果超时，则返回非零。

dsema，信号量。不可为NULL。

timeout，超时时间。可以使用常量DISPATCH_TIME_NOW和DISPATCH_TIME_FOREVER。

## 使用示例

多个异步不同队列的串行执行：

```objc
dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);

dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"并行队列信号1:%d", i);
    }
    dispatch_semaphore_signal(semaphore);
});

dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);

dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"并行队列信号2:%d", i);
    }
});

2015-03-30 21:58:48.278 GCD[26556:1091627] 并行队列信号1:0
2015-03-30 21:58:48.298 GCD[26556:1091627] 并行队列信号1:1
2015-03-30 21:58:48.299 GCD[26556:1091627] 并行队列信号1:2
2015-03-30 21:58:48.300 GCD[26556:1091627] 并行队列信号2:0
2015-03-30 21:58:48.301 GCD[26556:1091627] 并行队列信号2:1
2015-03-30 21:58:48.301 GCD[26556:1091627] 并行队列信号2:2
```

控制并发线程数量:

```objc
// 并发线程数量控制为3
dispatch_semaphore_t semaphore = dispatch_semaphore_create(3);

for (int i = 0; i < 11; i++) {
    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSLog(@"并发线程数量：%d",i);
        sleep(5);
        dispatch_semaphore_signal(semaphore);
    });
}

2015-03-30 22:05:56.434 GCD[26590:1096558] 并发线程数量：0
2015-03-30 22:05:56.434 GCD[26590:1096557] 并发线程数量：1
2015-03-30 22:05:56.434 GCD[26590:1096556] 并发线程数量：2

2015-03-30 22:06:01.439 GCD[26590:1096557] 并发线程数量：4
2015-03-30 22:06:01.439 GCD[26590:1096558] 并发线程数量：3
2015-03-30 22:06:01.439 GCD[26590:1096556] 并发线程数量：5

2015-03-30 22:06:06.445 GCD[26590:1096558] 并发线程数量：7
2015-03-30 22:06:06.445 GCD[26590:1096556] 并发线程数量：8
2015-03-30 22:06:06.444 GCD[26590:1096557] 并发线程数量：6

2015-03-30 22:06:11.448 GCD[26590:1096556] 并发线程数量：9
2015-03-30 22:06:11.448 GCD[26590:1096557] 并发线程数量：10
// 从上面的时间间隔可以看出每次的并发数量为3。
```

# 使用屏障函数（Barrier）

调度屏障允许你在一个并行的调度队列中创建一个同步点。当遇到一个屏障点的时候，并发队列延迟barrier block（或任何下面block）的执行，直到在屏障点前提交的所有block执行完成。在那个屏障点上，这个屏障block独自执行。在屏障点完成以后，这个队列重新开始正常的执行行为。使用屏障函数的情况：

1. 自定义串行队列：屏障函数无效。因为串行队列本来就是一次只执行一个任务，在这里使用屏障函数将没有任何帮助。
2. 全局并行队列：不推荐使用。因为你不确定其他的第三方框架或其他的人是否在使用全局并行队列，而你也不能延迟它们的执行，只为你执行。
3. 自定义并行队列：这对于原子或临界区代码来说是极佳的选择。任何你在设置或实例化的需要线程安全的事物都是使用障碍的最佳候选。在并行的队列中，使用串行执行的解决方案。

## 异步屏障（dispatch_barrier_async）

```objc
dispatch_barrier_async(dispatch_queue_t queue, dispatch_block_t block);
```

提交一个屏障block到一个异步线程中并且立即返回。调用这个函数提交屏障block，总是立即返回并且不会等待这个block被调用。当一个私有并行队列中的任务运行到这个屏障block的时候，它不会立即执行。而是等待这个队列中先于屏障block提交的并行block执行完成后才会执行屏障block。在这个屏障点上，这个屏障block独自执行。任何在这个屏障block之后提交的block直到这个屏障block执行完成后才执行。

你指定的队列应该是你使用dispatch_queue_create函数创建的并行队列。如果你传递给这个函数的队列是一个串行队列或者是全局并行队列中的一个，那么这个函数的行为将和dispatch_async函数相似。

queue，执行屏障block的调度队列。该队列被系统保留，直到这个block运行完成。不可以为NULL。

block，屏障block，提交到目标调度队列中。这个block被复制和保留，直到它运行完成，才被释放。不可以NULL。

## 异步屏障dispatch_barrier_async_f（执行C函数）

```objc
dispatch_barrier_async_f(dispatch_queue_t queue, void *context, dispatch_function_t work);
```

用法同上。

## 同步屏障dispatch_barrier_sync

```objc
dispatch_barrier_sync(dispatch_queue_t queue, dispatch_block_t block);
```

提交一个屏障block去执行，一直等到block执行完毕后返回。提交一个屏障block到一个调度队列中同步执行。不像dispatch_barrier_async，这个函数直到屏障block完成以后才返回。调用这个函数并针对当前队列将导致僵持。当在私有并行队列中的任务运行到屏障block的时候，它不会立即执行。而是等待这个队列中的先于屏障block提交的并行block执行完成后才会执行屏障block。这个屏障点上，这个队列对子执行屏障block。任何在屏障block之后提交的block都会等到屏障block执行完毕，才会执行。

你指定的队列应该是你使用dispatch_queue_create函数创建的并行队列。如果你传递给这个函数的队列是一个串行队列或者是全局并行队列中的一种，那么这个函数的行为则与dispatch_sync函数相似。

不像dispatch_barrier_async函数，该函数没有对目标队列执行retain。因为调用这个函数是同步的，它借（“borrows”）用了这个调用者的引用。而且对于block也没有执行Block_copy。

作为一个优化点，这个函数尽可能的在并行线程中调用屏障block。

queue，调度队列，执行屏障block。不可以为NULL。

block，在调度队列中执行的屏障block。不可以为NULL。

## 同步屏障dispatch_barrier_sync_f（执行C函数）

```objc
dispatch_barrier_sync_f(dispatch_queue_t queue, void *context, dispatch_function_t work);
```

用法同上。

```objc
dispatch_queue_t queueConcurrent = dispatch_queue_create("com.example.concurrent", DISPATCH_QUEUE_CONCURRENT);
dispatch_async(queueConcurrent, ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"先于  屏障函数1：%d",i);
    }
});
dispatch_async(queueConcurrent, ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"先于  屏障函数2：%d",i);
    }
});

// 或者使用dispatch_barrier_sync
dispatch_barrier_async(queueConcurrent, ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"屏障函数：%d",i);
    }

});


dispatch_async(queueConcurrent, ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"后于 屏障函数1：%d",i);
    }
});
dispatch_async(queueConcurrent, ^{
    for (int i = 0; i < 3; i++) {
        NSLog(@"后于 屏障函数2：%d",i);
    }
});

2015-04-08 14:09:51.974 GCD[7092:528770] 先于  屏障函数2：0
2015-04-08 14:09:51.974 GCD[7092:528772] 先于  屏障函数1：0
2015-04-08 14:09:51.975 GCD[7092:528770] 先于  屏障函数2：1
2015-04-08 14:09:51.975 GCD[7092:528772] 先于  屏障函数1：1
2015-04-08 14:09:51.975 GCD[7092:528770] 先于  屏障函数2：2
2015-04-08 14:09:51.975 GCD[7092:528772] 先于  屏障函数1：2
2015-04-08 14:09:51.976 GCD[7092:528772] 屏障函数：0
2015-04-08 14:09:51.976 GCD[7092:528772] 屏障函数：1
2015-04-08 14:09:51.976 GCD[7092:528772] 屏障函数：2
2015-04-08 14:09:51.976 GCD[7092:528772] 后于 屏障函数1：0
2015-04-08 14:09:51.976 GCD[7092:528770] 后于 屏障函数2：0
2015-04-08 14:09:51.976 GCD[7092:528772] 后于 屏障函数1：1
2015-04-08 14:09:51.976 GCD[7092:528770] 后于 屏障函数2：1
2015-04-08 14:09:51.976 GCD[7092:528772] 后于 屏障函数1：2
2015-04-08 14:09:51.977 GCD[7092:528770] 后于 屏障函数2：2
```
