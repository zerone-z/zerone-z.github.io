---
layout: post
title: KVO(Key-Value Observing)
motto: null
excerpt: KVO提供了一种机制——当其它对象的指定属性改变时将通知观察对象。在应用中KVO对于模型层与控制器层的数据交流是尤其有用的。
tags: [iOS, KVO]
---

<!-- * TOC
{:toc} -->

# KVO(Key-Value Observing)
## Overview

`Key-Value Observing`的缩写为KVO，其实是一种观察者模式，当其它对象的指定属性发生改变时将通知观察者对象，并告知改变的内容。

> 重要：想要理解KVO，必须先要理解KVC。

## 总览

KVO提供了一种机制——当其它对象的指定属性改变时将通知观察对象。在应用中KVO对于模型层与控制器层的数据交流是尤其有用的。（在OS X系统中，控制器层的绑定技术很大程度上依赖于KVO）控制器对象通常观察模型对象的属性，试图对象则通过控制器观察一个模型对象的属性。另外，不管怎样，一个模型对象也可以观察其它的模型对象（通常是确定一个依赖的值什么时候改变）或者它自己（再次确定一个依赖的值什么时候改变）。
你可以观察属性（properties），包括简单的属性（attributes）、一对一关系、一对多关系。对多的属性观察者会被通知变更类型，以及改变了哪些对象。
设定属性观察者需要三步。理解了这些步骤，可以对KVO是如何工作的有一个清楚的认识。

1. 首先，看我们当前的场景，KVO是否更好，例如，当一个对象的特定属性有任何改变时，需要通知另一个对象时。
	![kvo_objects](/assets/posts/KVC/kvo_objects.jpg)
	例如，`PersonObject`对象想要知道`BankObject`对象属性`accountBalance`所做的任何更改。
2. 通过方法`addObserver:forKeyPath:options:context:`，`PersonObject`对象必须被注册成为`BankObject`属性`accountBalance`的观察者。
	![kvo_objects_connection](/assets/posts/KVC/kvo_objects_connection.jpg)

	> 提示：`addObserver:forKeyPath:options:context:`方法在这两个对象之间建立了链接。并不是在这两个类之间建立链接，而是在这两个对象实例之间建立链接。
3. 为了响应这个变更的通知，观察者必须实现方法`-observeValueForKeyPath:ofObject:change:context:`。这个方法的实现决定了观察者是如何响应这个变更通知的。在这个方法中，你可以自定义响应被观察属性的变更。
	![kvo_objects_implementation](/assets/posts/KVC/kvo_objects_implementation.jpg)
	下面会详细介绍如何注册以及接收观察的通知。
4. 当一个观察属性的值以符合KVO方式发生变更，或者依赖的`key`发生变更，方法`-observeValueForKeyPath:ofObject:change:context:`会自动调用。
	![kvo_objects_notification](/assets/posts/KVC/kvo_objects_notification.jpg)

KVO的主要好处是：一个属性值每次发生改变，你不必使用自己的方案去通知改变。它对框架的支持很好，这是的它很容易使用，而不必在我们的项目中添加额外的代码。此外，这个架构已经是很全面了，对于单一的属性或依赖的值支持多个观察者也很方便。
[KVO合规]()描述了自动和手动KVO的不同，以及如何实现他们。
不像`NSNotificationCenter`通知，是没有中央对象给所有的观察者发送变更通知的。而是，当变更发生时，直接发送通知到观察者对象。`NSObject`提供了基本的KVO实现，你可以重写这些方法，但是这种情况很少发生。
`KVO实施细则`描述了KVO是如何实现的。

## 注册成为KVO

为了接收到一个属性的KVO通知，必须实现下面的三件事：

- 观察类必须兼容KVO的观察属性。
- 必须为被观察对象注册观察对象，使用方法`addObserver:forKeyPath:options:context:`。
- 观察类必须实现方法`observeValueForKeyPath:ofObject:change:context:`。

> 重要：并不是所有的类多于所有的属性都是兼容KVO的。通过在下面`KVO合规`中的描述，你只能确定你自己的类是兼容的KVO。通常，Apple提供的框架中，属性都是兼容KVO的。

### 注册一个观察者

为了使一个属性的改变可以被通知到，首先需要为一个被观察的对象注册观察对象，使用方法`addObserver:forKeyPath:options:context:`把观察对象和被观察对象属性的键路径传递到被观察对象中。`options`参数指定了当一个属性值被改变，什么时候应该发送改变通知。`NSKeyValueObservingOptionOld`参数指定了把原来的对象值传递给观察者，作为`change`参数字典中的一个键值。`NSKeyValueObservingOptionNew`参数则指定了传递一个新的值，在`change`参数字典中。如果想要接收到这两个值，你需要使用按位`或`去选择这两个常量。

```objc
- (void)registerAsObserver {
    /*
     'inspector'是一个观察者，去接收`account`的属性`openingBalance`的改变通知，并且指定了应该提供`openingBalance`的旧值与新值给观察者
     */
    [account addObserver:inspector
             forKeyPath:@"openingBalance"
                 options:(NSKeyValueObservingOptionNew |
                            NSKeyValueObservingOptionOld)
                    context:NULL];
}
```

当你注册一个对象作为一个观察者的时候，你应该提供一个context指针。当`observeValueForKeyPath:ofObject:change:context:`被调用的时候，context指针就会被传递到这个观察者中。context指针可以是一个C指针，也可以是一个Objective-C对象的引用。context指针可以作为一个唯一的标识符，以确定被观察到的改变值是属于谁的，或者也可以传递一些其它的数据到观察者对象中。

> 提示：KVO方法`addObserver:forKeyPath:options:context:`不持有观察对象，被观察对象以及context的强引用。所以我们应该确保我们持有观察者对象、被观察者、以及context的强引用。

### 接收KVO通知

当一个对象的被观察属性值发生改变时，观察者会收到一个消息`observeValueForKeyPath:ofObject:change:context:`。所有的观察者都必须实现这个方法。
观察者会被传递一个对象和触发观察者通知的键路径，一个包含改变值详情的字典，以及注册观察者时候提供的context指针。
change字典的条目`NSKeyValueChangeKindKey`提供了发生改变的类型的信息。如果被观察对象的值已经改变了，`NSKeyValueChangeKindKey`条目返回`NSKeyValueChangeSetting`。依靠注册观察者对象时指定的`options`参数，change字典中`NSKeyValueChangeOldKey`和`NSKeyValueChangeNewKey`条目包含了这个属性改变前和改变后的值。如果这个属性是一个对象，则这个值直接传递。如果这个属性是一个标量或一个C
的结构体，这个值则会封装成`NSValue`对象。
如果这个被观察对象的属性是一个一对多的关系，`NSKeyValueChangeKindKey`条目也会通过返回值`NSKeyValueChangeInsertion`，`NSKeyValueChangeRemoval`，或`NSKeyValueChangeReplacement`分别指出关系对象是否是被插入，移除，或者替换。
change字典的条目`NSKeyValueChangeIndexesKey`是一个`NSIndexSet`对象，它列举了改变关系的索引集。当注册观察者的时候，如果指定了`NSKeyValueObservingOptionNew`或`NSKeyValueObservingOptionOld`作为options的参数，那么在change字典中`NSKeyValueChangeOldKey`和`NSKeyValueChangeNewKey`条目则是两个集合，这两个个集合分别包含了关联对象改变前以及改变后的值。

```objc
- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary *)change
                       context:(void *)context {

    if ([keyPath isEqual:@"openingBalance"]) {
        [openingBalanceInspectorField setObjectValue:
            [change objectForKey:NSKeyValueChangeNewKey]];
    }
    /*
     如果父类实现了这个方法，这样可以确保父类也会调用该方法。
     NSObject对象不回默认调用。
     */
    [super observeValueForKeyPath:keyPath
                         ofObject:object
                           change:change
                           context:context];
}

```

### 移除KVO

被观察对象通过调用方法`removeObserver:forKeyPath:`，去移除一个KVO观察者。`removeObserver:forKeyPath:`方法需要指定移除的观察者对象和键路径。

```objc
- (void)unregisterForChangeNotification {
    [observedObject removeObserver:inspector forKeyPath:@"openingBalance"];
}
```

如果context是一个对象，你必须持有一个强引用，直到移除这个观察者。在调用`removeObserver:forKeyPath:`方法以后，你在这个方法中所指定的观察对象及键路径，将再也不会收到任何`observeValueForKeyPath:ofObject:change:context:`的消息。

## KVO兼容

为了使一个指定属性兼容KVO，一个类必须确保以下几点：

- 属性在这个类中必须是兼容KVC，与KVC的兼容一致。KVO也像KVC那样支持同样的数据类型。
- 类可以为这个属性发送KVO改变通知。
- 在合适的时候注册依赖key。

有两个技术点可以确保发送变更通知。`NSObject`支持自动发送通知，并作为类中所有属性的默认实现方式。通常，如果我们遵循标准的Cocoa和命名规范，我们就可以使用自动发送通知——我们不必写一些额外的代码。
手动通知提供了额外的控制发送通知的时间，也需要额外的代码。通过实现类方法`automaticallyNotifiesObserversForKey:`，我们可以控制子类的属性是否自动发送通知。

### 自动通知

`NSObject`提供了自动发送键值变更通知的实现方案。使用键值兼容的存取器方法以及KVC方法，键值改变将自动通知变更的观察者。自动通知也支持返回的集合代理对象，例如，方法`mutableArrayValueForKey:`。
下面的示例显示了属性`name`被改变后，都会通知观察者。

```objc
// 存取器方法改变值
[account setName:@"Savings"];

//使用KVC的方式改变值
[account setValue:@"Savings" forKey:@"name"];

// 使用KVC的键值路径改变值
[document setValue:@"Savings" forKeyPath:@"account.name"];

// 获取集合代理对象后改变值
NSMutableArray *transactions = [account mutableArrayValueForKey:@"transactions"];
[transactions addObject:newTransaction];

```

### 手动通知

手动通知提供了更精细的控制方式，应该如何和什么时候发送通知给观察者。这对于帮助减少触发不必要的通知，或者把若干个改变组合成一个单一的通知，都是很有用的。
实现手动通知的类必须重写`NSObject`的方法`automaticallyNotifiesObserversForKey:`。在同一个类中，也是可以同时使用手动和自观察者通知的。对于使用手动通知的属性，子类方法`automaticallyNotifiesObserversForKey:`应该返回`NO`。对于未确认的keys，子类的实现应该调用`super`。下面的示例展示了属性`openingBalance`使用了手动通知，对于其它的属性则由父类决定。

```objc
+ (BOOL)automaticallyNotifiesObserversForKey:(NSString *)theKey {

    BOOL automatic = NO;
    if ([theKey isEqualToString:@"openingBalance"]) {
        automatic = NO;
    }
    else {
        automatic = [super automaticallyNotifiesObserversForKey:theKey];
    }
    return automatic;
}
```

为了实现手动通知，我们要在属性值改变发生前调用`willChangeValueForKey:`，并且在属性值改变发生后调用`didChangeValueForKey:`。

```objc
- (void)setOpeningBalance:(double)theBalance {
    [self willChangeValueForKey:@"openingBalance"];
    _openingBalance = theBalance;
    [self didChangeValueForKey:@"openingBalance"];
}
```

我们可以首先检查这个值是否改变，减少发送不必要的通知。如下：

```objc
- (void)setOpeningBalance:(double)theBalance {
    if (theBalance != _openingBalance) {
        [self willChangeValueForKey:@"openingBalance"];
        _openingBalance = theBalance;
        [self didChangeValueForKey:@"openingBalance"];
    }
}
```

如果一个单一的操作导致多个属性值的改变，我们必须嵌套发送改变通知，如下：

```objc
- (void)setOpeningBalance:(double)theBalance {
    [self willChangeValueForKey:@"openingBalance"];
    [self willChangeValueForKey:@"itemChanged"];
    _openingBalance = theBalance;
    _itemChanged = _itemChanged+1;
    [self didChangeValueForKey:@"itemChanged"];
    [self didChangeValueForKey:@"openingBalance"];
}
```

在有序的一对多的关系下，你必须指定改变属性的`key`、改变的类型以及被调用对象所在索引集合。改变的类型是一个`NSKeyValueChange`值，有`NSKeyValueChangeInsertion`、`NSKeyValueChangeRemoval`、`NSKeyValueChangeReplacement`。影响的对象的索引集合是一个`NSIndexSet`对象。

```objc
- (void)removeTransactionsAtIndexes:(NSIndexSet *)indexes {
    [self willChange:NSKeyValueChangeRemoval
        valuesAtIndexes:indexes forKey:@"transactions"];

    // Remove the transaction objects at the specified indexes.

    [self didChange:NSKeyValueChangeRemoval
        valuesAtIndexes:indexes forKey:@"transactions"];
}
```

## 依赖属性

在许多情况下一个属性的值取决于另一个对象的一个或多个属性。如果一个属性的值改变了，那么这些关联属性的值也应该被标记为改变。你如何确保KVO通知告知了那些依赖于关系基数的属性。

### 一对一关系

要自动触发一对多关系通知，我们应该重写方法`keyPathsForValuesAffectingValueForKey:`，或者实现一个定义了注册依赖key样式的方法。

例如，`person`类中`fullName`是一个依赖于`firstName`和`lastName`的属性。返回`fullName`值的方法如下：

```objc
- (NSString *)fullName {
    return [NSString stringWithFormat:@"%@ %@",firstName, lastName];
}
```

当属性`firstName`或`lastName`改变时，观察`fullName`属性值的应用必须被通知，因为`fullName`的值被影响了。
一个解决方案是重写方法`keyPathsForValuesAffectingValueForKey:`，指定`fullName`的属性值是依赖于属性`firstName`和`lastName`的。

```objc
+ (NSSet *)keyPathsForValuesAffectingValueForKey:(NSString *)key {

    NSSet *keyPaths = [super keyPathsForValuesAffectingValueForKey:key];

    if ([key isEqualToString:@"fullName"]) {
        NSArray *affectingKeys = @[@"lastName", @"firstName"];
        keyPaths = [keyPaths setByAddingObjectsFromArray:affectingKeys];
    }
    return keyPaths;
}
```

我们的重写通常应该调用`super`并且返回一个包含集合中的任意成员的的`NSSet`对象，这样做可以不妨碍父类中方法的重写。
通过实现一个遵循`keyPathsForValuesAffecting<Key>`命名规范的类方法，你也可以取得同样的效果，其中`<Key>`是依赖值的属性的名称（首字母大写）。

```objc
+ (NSSet *)keyPathsForValuesAffectingFullName {
    return [NSSet setWithObjects:@"lastName", @"firstName", nil];
}
```

使用`category`为一个已存在的类添加一个属性时，我们不能重写方法`keyPathsForValuesAffectingValueForKey:`，因为在`category`中是不支持重写方法的。在这种情况下，可是使用匹配`keyPathsForValuesAffecting<Key>:`的类方法。

> 提示：通过实现`keyPathsForValuesAffectingValueForKey:`方法，我们不能设置依赖于一对多的关系。相反，我们必须观察一对多集合中的每一个对象的合适属性，并通过更新依赖的`key`值响应他们的改变值。

### 一对多关系

`keyPathsForValuesAffectingValueForKey:`方法不支持键路径，包括一对多的关系。例如，假定我们有一个带有一对多关系`employees`属性的`Department`对象，`employees`是`Employee`对象集合，并且`Employee`有一个`salary`属性。我们希望`Department`对象有一个`totalSalary`属性，`totalSalary`属性依赖于集合`employees`中的所有`employee`属性`salary`。你不能使用方法`keyPathsForValuesAffectingTotalsalary`并且返回`employees.salary`作为key。
在下面的两种情况下，有以下两种解决方案：

1. 我们可以使用KVO去注册这个parent（`Department`）作为所有children（`Employees`）相关属性的观察者。当child对象从关系中被添加或移除时，parent必须作为child观察者添加或移除。在`observeValueForKeyPath:ofObject:change:context:`方法中我们可以针对被依赖现的变更更新依赖的值。

```objc
- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context {

    if (context == totalSalaryContext) {
        [self updateTotalSalary];
    }
    else
    // deal with other observations and/or invoke super...
}

- (void)updateTotalSalary {
    [self setTotalSalary:[self valueForKeyPath:@"employees.@sum.salary"]];
}

- (void)setTotalSalary:(NSNumber *)newTotalSalary {

    if (totalSalary != newTotalSalary) {
        [self willChangeValueForKey:@"totalSalary"];
        _totalSalary = newTotalSalary;
        [self didChangeValueForKey:@"totalSalary"];
    }
}

- (NSNumber *)totalSalary {
    return _totalSalary;
}
```

2. 如果使用了Core Data，你可以在应用程序的notification center中将parent注册为其managed object context的观察者。parent应该响应相关的变更通知，这些通知是children以类似于KVO的形式发出去的。
