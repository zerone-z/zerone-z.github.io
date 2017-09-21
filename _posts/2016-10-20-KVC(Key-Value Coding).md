---
layout: post
title: KVC(Key-Value coding)
motto: null
excerpt: KVC(Key-value coding)是一个可以通过字符串key间接的访问对象属性的机制，而不是通过调用存取器方法或者直接访问实例变量来获取属性值。
tags: [iOS, KVC]
---

<!-- * TOC
{:toc} -->

# Overview
Key-value coding(KVC)和Key-value observing(KVO)是两种能让我们驾驭Objective-C动态特性并简化代码的机制。
# KVC
KVC(Key-value coding)是一个可以通过字符串key间接的访问对象属性的机制，而不是通过调用存取器方法或者直接访问实例变量来获取属性值。
KVC是通过`NSKeyValueCoding`协议实现的，而`NSObject`就实现了这个协议，也就是说Objective-C中几乎所有的对象都支持KVC操作。
KVC不仅可以访问作为Objective-C对象的属性，而且也能访问一些标量（如：int、CGFloat）和struct（如：CGRect、CGPoint）；Cocoa Foundation会对标量和struct进行自动的封装和解封。

## keys
**Key** 是一个用于识别对象中特定的属性的字符串。一般，**Key** 与存取器的方法名（属性名）或者实例变量名保持一致。**Key** 必须为以小写字母开头且不能有空格的 *ASCII* 编码字符串。
主要方法：

 - `valueForKey:` 获取对象中指定的属性值
 - `setValue:forKey:` 给对象中指定的属性赋值

```objc
@property (nonatomic, copy) NSString *name;

// 取值
NSString *n = [object valueForKey:@"name"];

// 设定
[object setValue:@"Daniel" forKey:@"name"];
```

标量的使用实例：

```objc
@property (nonatomic) CGFloat height;

//  取值
CGFloat height = [object valueForKey:@"height"].floatValue;
// 设置
[object setValue:@(20) forKey:@"height"];

```

取值时，如果接收对象没有与指定的 **Key** 相匹配的存取器或实例变量，那么这个接收对象将会调用 `valueForUndefinedKey:`方法。`valueForUndefinedKey:`默认会报`NSUndefinedKeyException`异常，子类可以重写该方法。
`setValue:forKey:`会自动解封封装了标量和structs的`NSValue`对象并分配它们到各自的属性中。如果指定的 **Key** 没有与接收对象相匹配的存取器或实例变量，那么这个接收对象会调用方法`setValue:forUndefinedKey:`  ，该方法同样默认会报`NSUndefinedKeyException`异常，子类同样可以重写该方法并自定义实现方式。
另外，如果调用`setValue:forKey`给对象属性赋`nil`值，而且这个属性不是对象（如：标量、structs），那么这个对象将会调用方法`setNilValueForKey:`。这个方法将会报`NSInvalidArgumentException`异常。我们可以通过重写该方法，替换为一个默认值或标记值，然后调用`setValue:forKey:`方法设置一个新的值。

## Key Paths（键路径）
KVC同样允许我们通过关系来访问对象，这就用到了 **Key Paths** 。 **Key Paths** 是一个以点（“.”）分割 **Key** 的字符串，通过指定一连串的对象属性去获取这个最终的属性。 **Key Paths** 中的第一个 **Key** 是这个接收对象中的属性，后面的每一个 **Key** 又是前一个 **Key** 表示的对象的属性值。

 - `valueForKeyPath:` 获取键路径指定的属性值
 - `setValue:forKeyPath:` 给键路径指定的属性赋值

假设`person`对象有属性`address`，`address`有属性`city`。

```objc
// 取值
[person valueForKeyPath:@"address.city"];
// 设置
[person setValue:@"city" forKeyPath:@"address.city"];
```

`valueForKeyPath:`，如果在一连串的 **key** 表示的对象中，下一个 **key** 没有与这个对象现匹配的存取器或实例变量，那么这个对象将会调用方法`valueForUndefinedKey:`。

## 批量获取／设置属性值
主要用到方法：
 - `dictionaryWithValuesForKeys:`
    该方法返回对象中指定Keys的所有属性值；返回值是一个字典对象`NSdictionary`，  包含所有指定的Key集合，以及每个Key对应的值Value。
    对于Keys集合内的每一个Key都会调用`valueForKey:` 方法去取值，如果该Key没有匹配的存取器或实例变量，默认也会调用方法`valueForUnderfineKey:` ，如果在这个方法中不处理，则会报异常。
 - `setValuesForKeysWithDictionary:`
    通过字典对象批量设置对象的属性值。使用字典的Keys标识属性。对于字典内的每一对key-value都是默认调用`setValue:forKey:`方法，必要的时候会自动替换`nil`为`NSNull`。如果Key没有匹配到合适的存取器或实例变量，则默认会调用方法`setValue:ForUndefinedKey:`，如果不处理则会报异常。

> 集合对象（NSArray、NSSet、NSDictionary）不能包含`nil`值，你应该使用`NSNull`对象代替`nil`值。`dictionaryWithValuesForKeys:`与`setValuesForKeysWithDictionary:`方法默认在`NSNull`与`nil`之间自动转换，所以对象不必明确检验`nil`值。

## KVC存取器方法
为了使方法`valueForKey:`、`setValue:forKey:`、`mutableArrayValueForKey:`、`mutableSetValueForKey:`可以定位到存取器方法，需要实现KVC的存取器方法。

> 提示：后续都以`-set<Key>:`或`-<key>`的形式表示存取模式。`<key>`是属性名称的占位字符串。如，一个属性名称为`name`，`-set<Key>:`的形式为`-setName:`，`-<key>`的形式为`-name`。

###  常用存取模式
`-<key>`表示返回一个属性值的存取器方法格式。`-<key>`方法可以返回Objective-C对象，标量，或者数据结构体。`-is<Key>`作为一个备用模式，是支持布尔属性的。
下面展示了`-<key>`和`-is<Key>`格式返回属性的方法：

```objc
// -<key> 形式
- (BOOL)hidden
{
	return YES;
}

// -is<Key> 形式
- (BOOL)isHidden
{
	return YES;
}
```

为了使属性或一对一关系的属性支持`setValue:forKey:`，必须实现`-set<Key>:`格式的存取器。

```objc
- (void)setHidden:(BOOL)hidden
{
	_hidden = hidden;
}
```

如果这个属性不是一个Objective－C对象，还必须实现一个代表nil值的方法。当给属性试图设置一个nil值时，`-setNilValueForKey:`方法将被调用。在这个方法中，我们可以设置一个默认值，或者处理在这个类中没有存取器方法的key值。
下面的示例展示了当给`hidden`属性设置一个nil值时，默认会设置属性为`YES`。它首先创建了一个包含布尔值的`NSNumber`实例对象，然后调用方法`setValue:forKey:`去设置一个新的值。这样可以保持模型的封装性，同时可以确保设置这个值以外的任何其他额外操作也可以实际执行。这比调用存取器方法或者直接设置实例变量要好的多。

```objc
- (void)setNilValueForKey:(NSString *)key
{
	if([key isEqualToString:@"hidden"]) {
		[self setValue:@YES forKey:@"hidden"];
	} else {
		[super setNilValueForKey:key];
	}
}
```

### 一对多属性的集合存取模式
虽然可以使用`-<key>`和`-set<Key>:`的存取器方式实现一对多的关系属性，但是通常应该仅仅使用这些去设置／获取集合对象。为了操作集合内容，最好执行另外的存取器方法，简称集合存取器方法。然后，你可以使用集合存取器方法，或者通过`-mutableArrayValueForKey:`和`mutableSetValueForKey:`返回一个可变的集合对象。
使用集合存取器方法，代替，或者除了基本的getter方法，有许多的优点：

 - 在可变的一对多的关系下，可以显著的提供性能
 - 通过实现适当的集合存取器，一对多的关系可以区分NSArray、NSSet等集合对象。
   当使用KVC的方法为一个属性实现集合存取器方法时，获取的属性将难以区分是`NSArray`对象、还是`NSSet`对象。
 - 可以直接使用结合存取器方法修改集合的值，并且兼容KVO。

集合存取器有两种变化：

 - 有序的一对多关系（`NSArray`）索引存取器
 - 无序的一对多关系（`NSSet`）无序存取器

#### 索引存取器模式
索引存取器定义了一整套机制，用于在一个有序的关系集合中计数、检索、添加和替换对象。通常，这个关系是一个`NSArray`或`NSMutableArray`实例；然而，任何对象都可以把它自己当成是一个数组（array），去执行这些方法和被操纵。简单的执行这些方法是不受限的，你可以直接调用它们，也可以直接与相关对象交互。

##### Getter 索引存取器
为了支持对有序一对多关系的只读访问，需实现以下方法：

 - `-countOf<Key>`，必须实现。与`NSArray`的方法`-count`相似。
 - `-objectIn<Key>AtIndex:`或`-<key>Atdexes:`，二者必须实现一个。与`NSArray`的方法`-objectAtIndex:`和`-objectsAtIndexes:`类似。
 - `-get<Key>:range:`，可选择是否实现。实现了可提供额外的性能提升。与`NSArray`的方法`-getObjects:range`类似。

下面的代码片段展示了通过方法`-countOf<Key>`返回了一对多的属性`employees`的数量。

```objc
- (NSUInteger)countOfEmployees {
    return [self.employees count];
}
```

`-objectIn<Key>AtIndex:`方法返回了数组中指定索引处的对象。`-<key>AtIndexes:`方法返回指定索引集合的对象数组，入参为`NSIndexSet`对象。这两个方法必须实现一个。示例如下：

```objc
- (id)objectInEmployeesAtIndex:(NSUInteger)index {
    return [employees objectAtIndex:index];
}

- (NSArray *)employeesAtIndexes:(NSIndexSet *)indexes {
    return [self.employees objectsAtIndexes:indexes];
}
```

如果为了提高性能，我们也可以实现方法`-get<Key>:range:`。这个方法的第一个参数是数据的缓冲区，第二个参数是数据缓冲区的取值范围，所以这个方法的返回值应该是在数据缓冲区范围内的值。

```objc
- (void)getEmployees:(Employee * __unsafe_unretained *)buffer range:(NSRange)inRange {
    // 返回提供的缓冲区内指定范围内的数据集合
    [self.employees getObjects:buffer range:inRange];
}
```

虽然只有特殊的情况下我们才会使用这些代理对象有意义，但是在这些情况下代理对象是非常有用的。如果我们有一个很大的数据结构，调用者不需要一次性访问所有的对象。

##### 可变的索引存取器

实现可变的索引存取器方法，我们就可以通过方法`-mutableArrayValueForKey:`很容易且有效的与索引集合交互。此外，实现了这些方法，这个属性将会兼容KVO。

- `-insertObject:in<Key>AtIndex:`或`-insert<Key>:atIndexes:`,必须至少实现一个方法。与`NSMutableArray`中的方法`insertObject:atIndex:`和`insertObjects:atIndexes:`类似
- `-removeObjectFrom<Key>AtIndex:`或`-remove<Key>AtIndexes:`，必须至少实现一个方法。与`NSMutableArray`方法`removeObjectAtIndex:`和`removeObjectsAtIndexes:`方法一致。
- `-replaceObjectIn<Key>AtIndex:withObject:`或`-replace<Key>AtIndexes:with<Key>:`。方法可选是否实现。实现可提高性能。

`-insertObject:in<Key>AtIndex:`方法将在指定索引处插入对象。`-insert<Key>:atIndexes:`方法通过在指定索引集合处（`NSIndexSet`）插入对象集合。只需要实现其中的一个方法。  

```objc
- (void)insertObject:(Employee *)employee inEmployeesAtIndex:(NSUInteger)index {
    [self.employees insertObject:employee atIndex:index];
    return;
}

- (void)insertEmployees:(NSArray *)employeeArray atIndexes:(NSIndexSet *)indexes {
    [self.employees insertObjects:employeeArray atIndexes:indexes];
    return;
}
```

`-removeObjectFrom<Key>AtIndex:`和`-remove<Key>AtIndexes:`与上面的使用方式类似，只不过这两个方法是移除对象或对象集合。也是只需要实现一个方法。

```objc
- (void)removeObjectFromEmployeesAtIndex:(NSUInteger)index {
    [self.employees removeObjectAtIndex:index];
}

- (void)removeEmployeesAtIndexes:(NSIndexSet *)indexes {
    [self.employees removeObjectsAtIndexes:indexes];
}
```

为了提供性能，你可以实现这两个方法（`-replaceObjectIn<Key>AtIndex:withObject:`和`-replace<Key>AtIndexes:with<Key>:`）中的一个或两个。当一个对象在集合中被替换是，这两个方法中的一个将会被调用，而不是简单的做一个移除和插入操作。

```objc
- (void)replaceObjectInEmployeesAtIndex:(NSUInteger)index
                             withObject:(id)anObject {

    [self.employees replaceObjectAtIndex:index withObject:anObject];
}

- (void)replaceEmployeesAtIndexes:(NSIndexSet *)indexes
                    withEmployees:(NSArray *)employeeArray {

    [self.employees replaceObjectsAtIndexes:indexes withObjects:employeeArray];
}
```

#### 无序的存取器

无序的存取器方法提供了一个在一个无序的关系中访问修改对象的机制。如`NSSet`或`NSMutableSet`实例。

##### Getter 无序存取器

Getter无序存取器方法提供了一些简单的访问关系数据的方法。主要有：

- `－countOf<Key>:`,必须实现。与`NSSet`的方法`count`一致，返回集合对象的数量。
- `-enumeratorOf<Key>:`,必须实现。与`NSSet`的方法`objectEnumerator`一致。返回一个枚举去遍历集合对象。
- `-memberOf<Key>:`,必须实现。与`NSSet`的方法`member`相同。与集合中的对象进行比较看他是否存在。

```objc
- (NSUInteger)countOfTransactions {
    return [self.transactions count];
}

- (NSEnumerator *)enumeratorOfTransactions {
    return [self.transactions objectEnumerator];
}

- (Transaction *)memberOfTransactions:(Transaction *)anObject {
    return [self.transactions member:anObject];
}
```

`-countOf<Key>`方法应该简单的放回一个集合中的成员数量。`-enumeratorOf<Key>`方法必须返回一个`NSEnumerator`实例，用于遍历集合中的成员。`-memberOf<Key>:`方法必须让一个作为参数的对象与集合中的成员相比较，如果有相匹配的对象则返回该对象，否责返回`nil`。这个方法的实现可以使用`-isEqual:`去比较对象集合，或者其他的可以比较对象的方式。这个返回的对象可以是成员集合中的一个不同的对象，但他就内容而言应该是等效的。

##### 可变的无序集合存取器

为了支持可变的一对多的关系，需要实现一些额外的方法。我们就可以通过方法`-mutableSetValueForKey:`很容易且有效的与可变无序集合交互。实现了这个方法，该属性就可以兼容KVO。

- `-add<Key>Object:`或`-add<Key>:`，必须至少实现一个。与`NSMutabelSet`的方法`addObject:`类似。
- `-remove<Key>Object:`或`-remove<Key>:`，必须至少实现一个。与`NSMutableSet`的方法`removeObject:`类似。
- `-intersect<Key>:`，可以实现。实现可提供性能。它等效于`NSSet`的方法`intersectSet:`。

`-add<Key>Object:`和`-add<Key>:`方法用于简单的添加一个成员或一套成员到这个集合关系中，仅仅需要实现其中的一个。当添加一套成员到这个集合关系中时，要确保在这个集合关系中没有相同的对象。

```objc
- (void)addTransactionsObject:(Transaction *)anObject {
    [self.transactions addObject:anObject];
}

- (void)addTransactions:(NSSet *)manyObjects {
    [self.transactions unionSet:manyObjects];
}
```

`-remove<Key>Object:`和`-remove<Key>:`则用于移除一个成员或一套成员，也仅需要实现其中的一个方法。

```objc
- (void)removeTransactionsObject:(Transaction *)anObject {
    [self.transactions removeObject:anObject];
}

- (void)removeTransactions:(NSSet *)manyObjects {
    [self.transactions minusSet:manyObjects];
}
```

如果为了提供性能，你也可以实现`-intersect<Key>:`或`-set<Key>:`方法。
`-intersect<Key>:`的执行，可以移除所有不同时存在于这两套关系集合中对象。等同于`NSMutableSet`的方法`intersectSet:`。

```objc
- (void)intersectTransactions:(NSSet *)otherObjects {
    return [self.transactions intersectSet:otherObjects];
}
```

## 键值验证（KVV）

KVC提供了一套确认属性值一致性的API。这个键值验证给一个类提供了一个机会，以接受一个值、提供一个备用值、或者拒绝这个新的属性值并返回一个拒绝的原因。

### 键值验证方法的命名约定

正如存取器方法的命名约定，一个属性验证方法也有命名约定，格式如`validate<Key>:error:`。下面的代码片段展示了属性`name`的验证方法：

```objc
-(BOOL)validateName:(id *)ioValue error:(NSError * __autoreleasing *)outError {
    // Implementation specific code.
    return ...;
}
```

### 实施验证方法

键值方法传递的是两个参数引用：要验证的值和用于返回错误信息的`NSError`。一个验证方法可能有三种结果：

1. 对象值是有效的，返回`YES`，	且不会改变值，也不会回返回错误信息。
2. 对象值是无效的且不能创建和返回一个有效的值。在这种情况下，返回`NO`,并在之前给这个错误参数设置一个`NSError`对象，这个`NSError`对象指明了失败的原因。
3. 创建并返回一个新的对象值。在这种情况下，返回`YES`，并在之前给这个值设置一个新的、有效的值。原样返回错误信息。我们必须返回一个新的对象，而不是仅仅修改传递进来的参数值`ioValue`,即使参数可变。

```objc
-(BOOL)validateName:(id *)ioValue error:(NSError * __autoreleasing *)outError{
    // 验证name不能为nil，且字符长度不能小于2
    if ((*ioValue == nil) || ([(NSString *)*ioValue length] < 2)) {
        if (outError != NULL) {
            NSString *errorString = NSLocalizedString(
                    @"A Person's name must be at least two characters long",
                    @"validation: Person, too short name error");
            NSDictionary *userInfoDict = @{ NSLocalizedDescriptionKey : errorString };
            *outError = [[NSError alloc] initWithDomain:PERSON_ERROR_DOMAIN
                                                    code:PERSON_INVALID_NAME_CODE
                                                userInfo:userInfoDict];
        }
        return NO;
    }
    return YES;
}
```

> 提示：如果返回`NO`，必须要检查`outError`是否为`NULL`，如果不为`NULL`，才应该设置一个有效的`NSError`对象。

### 调用验证方法

我们可以直接调用验证方法，或者调用方法`validateValue:forKey:error:`并指定这个key。`validateValue:forKey:error:`会默认调用名称与`validate<Key>:error:`形式匹配的方法，如果没有与之匹配的验证方法，则会返回`YES`，表明这个值是有效的。

> 警告：为一个属性执行`-set<Key>:`方法，不会调用验证方法。

### 自动验证

通常来说，KVC是不会自动执行验证的——调用验证方法是我们自己的职责。
但是，有些技术在某些情况下会自动执行验证：`Core Data`的管理对象内容被保存的时候，会自动执行验证方法；在OS X系统中，Cocoa绑定允许你指定的验证自动发生。

### 验证标量值

验证方法期望值参数是一个对象，对于非对象的属性，需要使用`NSValue`或`NSNumber`对象包装。下面的代码片段显示了一个标量属性`age`的验证方法：

```objc
-(BOOL)validateAge:(id *)ioValue error:(NSError * __autoreleasing *)outError {

    if (*ioValue == nil) {
        // Trap this in setNilValueForKey.
        // An alternative might be to create new NSNumber with value 0 here.
        return YES;
    }
    if ([*ioValue floatValue] <= 0.0) {
        if (outError != NULL) {
            NSString *errorString = NSLocalizedStringFromTable(
                @"Age must be greater than zero", @"Person",
                @"validation: zero age error");
            NSDictionary *userInfoDict = @{ NSLocalizedDescriptionKey : errorString };
            NSError *error = [[NSError alloc] initWithDomain:PERSON_ERROR_DOMAIN
                code:PERSON_INVALID_AGE_CODE
                userInfo:userInfoDict];
            *outError = error;
        }
        return NO;
    }
    else {
        return YES;
    }
    // ...
}
```

## 确保规范KVC

为了使一个类的一个指定属性兼容KVC，必须使这个类能够通过方法`valueForKey:`和`setValue:forKey:`存取该属性。

### 属性和一对一关系规范

对于属性或一对一关系的属性，要求你的类：

- 实现以`-<key>`或`-is<Key>`形式命名的方法，或者有一个`<key>`或`_<key>`形式的实例变量。
  虽然`key`的命名常常以小写字母开头，但KVC也支持以大写字母开头的命名形式，如：`URL`。
- 如果属性可以被修改，那么它也应该实现方法`-set<Key>:`。
- `-set<Key>:`方法的实施不应该执行验证（KVV）。
- 我们的类应该实施方法`-validate<Key>:error:`，去验证这个`key`的值是否合适。

### 索引一对多关系规范

对于索引一对多关系，KVC要求：

- 实现以`-<key>`形式命名的方法，返回数组。
- 或者有一个以`<key>`或`_<key>`形式定义的数组变量。
- 或者实施了方法`-countOf<Key>`、`objectIn<Key>AtIndex:`或`-<key>AtIndexes:`这两个方法中的一个。
- 可选的，也可以实现方法`-get<Key>:range:`，以提供性能。

对于一个可变的索引一对多关系集合，KVC也要求：

- 实现`-insertObject:in<Key>AtIndex:`或`-insert<Key>:atIndexes:`两个方法中的一个或两个。
- 实现`-removeObjectFrom<Key>AtIndex:`或`-remove<Key>AtIndexes:`两个方法中的一个或两个。
- 可选的，可以实现`-replaceObjectIn<Key>AtIndex:withObject:`或`-replace<Key>AtIndexes:with<Key>:`方法，以提高性能。

### 无序的一对多的关系规范

KVC要求如下：

- 实现以`-<key>`命名形式的方法，返回一个set集合。
- 或者有一个以`<key>`或`_<key>`形式命名的set变量。
- 或者实现方法`-countOf<Key>`、`-enumeratorOf<Key>`、`-memberOf<Key>:`。

对于可变的无序一对多关系，KVC要求如下：

- 实现方法`-add<Key>object:`或`-add<Key>:`两者中的一个，或两个都实现。
- 实现方法`-remove<Key>Object:`或`-remove<Key>:`两者中的一个，或两个都实现。
- 可选的，可以实现方法`-intersect<Key>:`和`-set<Key>:`，以提高性能。

## 支持标量和结构体

KVC提供了对标量和结构体的自动封装和解封操作，`NSNumber`实例变量用于标量，`NSValue`实例变量用于结构体。

### 非对象的值

`valueForKey:`和`setValue:forKey:`方法默认支持非对象数据类型（标量、结构体）的自动封装。
一旦`valueForKey:`确定了具体的访问方法或用于为指定`key`提供值的实例变量，那么它就会检查返回类型或数据类型。如果返回值不是一个对象，那么一个用于包装这个值的`NSNumber`或`NSValue`对象将被创建，并作为结果返回。
同样，通过合适的存取器方法或实例变量，`setValue:forKey:`方法为指定的`key`确定了数据类型。如果这个数据类型不是一个对象，那么将使用合适的`-<type>Value`方法从传递的对象中提取出合适的值。

### 处理`nil`值

当使用`setValue:forKey:`方法为一个非对象的属性设置一个`nil`值是，会有一个额外的问题发生。为一个非对象属性传递一个`nil`值时，接收器会发送一个消息`setNilValueForKey:`。`setNilValueForKey:`默认会发送一个`NSInvalidArgumentException`异常。子类可以重写这个方法以提供一个合适的具体的实施行为。

> 提示：为了向后兼容二进制数据，如果接收器的类已经重写了方法`unableToSetNilForKey:`，则会调用`unableToSetNilForKey:`方法，而不是`setNilValueForKey:`方法。`unableToSetNilForKey:`多用于OS X 10.3以前，现在已废弃。

```objc
- (void)setNilValueForKey:(NSString *)theKey
{
    if ([theKey isEqualToString:@"age"]) {
        [self setValue:[NSNumber numberWithFloat:0.0] forKey:@”age”];
    } else
        [super setNilValueForKey:theKey];
}
```

### 标量的封装与解封

下表列出了可以使用`NSNumber`实例封装数据的标量：

|Data Type|Creation method|Accessor method|
|:----:|:----:|:----:|
|BOOL|numberWithBool:|boolValue|
|char|numberWithChar:|charValue|
|double|numberWithDouble:|doubleValue|
|float|numberWithFload:|floatValue|
|int|numberWithInt:|intValue|
|long|numberWithLong:|longValue|
|long long|numberWithLongLong:|longLongValue|
|short|numberWithShort:|shortValue|
|unsigned char|numberWithUnsignedChar:|unsignedChar|
|unsigned int|numberWithUnsignedInt:|unsignedInt|
|unsigned long|numberWithUnsingedLong:|unsignedLong|
|unsigned long long|numberWithUnsignedLongLong:|unsignedLongLong|
|unsigned short|numberWithUnsignedShort:|unsignedShort|

### 结构体的封装与解封

下表列出了`NSValue`常用的结构体的封装与解封。

|Data type|Creation method|Accessor method|
|:-------:|:-------------:|:-------------:|
|CGPoint|valueWithCGPoint:|CGPointValue|
|CGVector|valueWithCGVector:|CGVectorValue|
|CGSize|valueWithCGSize:|CGSizeValue|
|CGRect|valueWithCGRect:|CGRectValue|
|CGAffineTransform|valueWithCGAffineTransform:|CGAffineTransformValue|
|UIEdgeInsets|valueWithUIEdgeInsets:|UIEdgeInsetsValue|
|UIOffset|valueWithUIOffset:|UIOffsetValue|
|NSRange|valueWithRange:|rangeValue|

自动封装和解封并不受限于以上列出的结构体类型（即，以 *{* 开始的Objective-C类型编码字符串），该结构体类型可以被封装成`NSValue`对象。如下：

```objc
typedef struct {
    float x, y, z;
} ThreeFloats;

@interface MyClass
- (void)setThreeFloats:(ThreeFloats)threeFloats;
- (ThreeFloats)threeFloats;
@end
```

调用`valueForKey:`或`setValue:forKey:`会自动封装解封结构体类型数据。

## 集合操作
集合操作允许在`valueForKeyPath:`方法中使用key path符号执行方法。这些KVC运算符以 **@** 为字符串前缀组成。目前不能自定义集合操作符。
下图显示操作key path的格式。
![keypath](/assets/posts/KVC/keypath.jpg)
Left key path，如果存在可以为Array、Set以及操作对象，；Right key path指定需要操作的集合中对象的属性或者`self`。
以下是KVC所支持的集合运算符，具体可查看[官方文档](https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/KeyValueCoding/Articles/CollectionOperators.html)。

 - 简单集合操作
  - `@avg`
  - `@count`
  - `@max`
  - `@min`
  - `@sum`
 - 对象操作
  - `@distinctUnionOfObjects`
  - `@unionOfObjects`
 - 数组和集合操作
  - `@distinctUnionOfArrays`
  - `@unionOfArrays`
  - `@distinctUnionOfSets`

### 简单的集合运算符
返回的是string、number、或者dates。
`@avg`返回集合对象中指定属性的平均值，值为`NSNumber`。如果值为`nil`，则用`0`取代。

```objc
// 下面两个等价
NSNumber *avg = [another.objects valueForKeyPath:@"@avg.amount"];
NSNumber *avg = [another valueForKeyPath:@"objects.@avg.amount"];
```

`@count`返回对象的数量，值为`NSNumber`。Right key path可以忽略。

```objc
// 下面两个等价
NSNumber *count = [another.objects valueForKeyPath:@"@count"];
NSNumber *count = [another valueForKeyPath:@"objects.@count"]
```

`@max`返回集合对象中指定属性的最大值。这个最大值是通过使用`compare:`方法确定的。所以这个指定的属性必须支持使用该方法进行比较。如果指定的属性为nil，则会忽略掉。

```objc
// 下面两个等价
NSDate *latestDate = [another.objects valueForKeyPath:@"@max.date"];
NSDate *latestDate = [another valueForKeyPath:@"objects.@max.date"];
```

`@min`用法同`@max`，只是返回的是最小值。

```objc
// 下面两个等价
NSDate *earliestDate = [another.objects valueForKeyPath:@"@min.date"];
NSDate *earliestDate = [another valueForKeyPath:@"objects.@min.date"];
```

`@sum`返回集合对象中指定属性的总和。每一数字都会被转换成`double`进行计算总和，然后该总和以`NSNumber`对象返回。如果对象属性为nil，则会忽略。

```objc
// 下面两个等价
NSNumber *sum = [another.objects valueForKeyPath:@"@sum.amount"];
NSNumber *sum = [another valueForKeyPath:@"objects.@sum.amount"];
```

> 可以通过把`self`作为Right key path来获取一个由NSNumber组成的数组后者集合的总值、平均值、最大最小值。

### 对象运算符
返回的是一个数组(NSArray)。
`@distinctUnionOfObjects`返回一个由集合对象中指定的属性组成的集合数组，该集合数组中的属性值完全不同。

```objc
NSArray *distinctNames = [objects valueForKeyPath:@"@distinctUnionOfObjects.name"];
```

`@unionOfObjects`返回一个由集合对象中指定的属性组成的集合数组，该集合数组中重复的属性值没有被移除，还存在。

```objc
NSArray *names = [objects valueForKeyPath:@"@unionOfObjects.name"];
```

### 数组和集合运算符
返回的是一个数组或集合对象。运算的是一个嵌套集合，即集合中的每一个对象包含了另一个集合。
`@distinctUnionOfArrays`返回一个数组，该数组中包含了这个集合中每个数组的对象指定属性不重复的值。

```objc
// 返回所有人的所有朋友的不同姓名
NSArray *names = [persons valueForKeyPath:@"friends.@distinctUnionOfArrays.name"];

// 返回所有人的所有不同宠物名称
NSArray *dogNames = [persons valueForKeyPath:@"@distinctUnionOfArrays.dogName"];
```

`@unionOfArrays`返回一个数组，该数组中包含了这个集合中每个数组的对象指定属性的值。

```objc
// 返回所有人的所有朋友的不同姓名
NSArray *names = [persons valueForKeyPath:@"friends.@unionOfArrays.name"];

// 返回所有人的所有不同宠物名称
NSArray *dogNames = [persons valueForKeyPath:@"@unionOfArrays.dogName"];
```

`@distinctUnionOfSets`用法同`@ddistinctUnionOfArrays`相同，只是该方法操作的是`NSSet`，返回的也是`NSSet`。应该集合不能包含重复的值，所以他只有distinct操作。

```objc
// 返回所有人的所有朋友的不同姓名
NSSet *names = [persons valueForKeyPath:@"friends.@distinctUnionOfArrays.name"];

// 返回所有人的所有不同宠物名称
NSSet *dogNames = [persons valueForKeyPath:@"@distinctUnionOfArrays.dogName"];
```

## 存取器搜索实施细则

在直接访问实例变量之前，KVC试图使用存取器方法获取设置值。下面就是主要说明KVC方法如何以及确定可以访问的值。当知道了存取器的搜索实施细则以后，我们就可以实现一个支持KVC，但是不用`@property`、`@synthesize`或是`synthesize`声明的属性。

### 简单属性（attributes）的存取器搜索模式

#### `setValue:forKey:`默认搜索模式

当为一个属性调用`setValue:forKey:`方法，那么方法`setValue:forKey:`的默认实施将使用下面的搜索模式：

1. 搜索接收器类中名称匹配`set<Key>`样式的存取器方法。
2. 如果没有找到，且接收器的类方法`accessInstanceVariablesDirectly`返回`YES`，则按照一定的 **顺序** 搜索接收器中的一个实例变量，这个 **顺序** 和实例变量的名称匹配样式为`_<key>`，`_is<Key>`，`<key>`，`is<Key>`。
3. 如果有匹配的存取器方法或者有实例变量，则设置值。如有必要，这个值将从对象中提取出非对象的值。
4. 如果没有匹配的存取器方法或者实例变量，接收器的方法`setValue:forUndefinedKey:`将被调用。

#### `valueForKey:`默认搜索模式

当一个接收器调用方法`valueForKey:`的时候，`valueForKey:`方法的默认实施将使用下面的搜索模式：

1. 按照一定的 **顺序** 搜索接收器类中的一个存取器方法，这个 **顺序** 和存取器方法的名称匹配样式为`get<Key>`，`<key>`，`is<Key>`。如果找到这样的方法，则被调用。如果这个方法的返回类型是一个对象指针类型，那么会简单的返回。如果返回类型是一个支持`NSNumber`转换的标量类型之一，那么这个标量将被包装成`NSNumber`对象并返回。否则，转换成`NSValue`对象并返回。任意类型都可以被转换成`NSValue`对象，不仅仅是`NSPoint`，`NSRange`，`NSRect`，`NSSize`类型。
2. 否则（按照上面的方式没有找到），则搜索接收器类中的名称匹配样式为`countOf<Key>`和`objectIn<Key>AtIndex:`（对应于`NSArray`类中定义的原始方法）和`<key>AtIndexes:`（对应于`NSArray`的方法`ObjectsAtIndexes:`）。
	如果搜到了方法`countOf<Key>`和后面两个方法中的至少一个，那么响应所有`NSArray`方法的一个集合代理对象被返回。发送到集合代理对象的每个`NSArray`消息，都将导致`countOf<Key>`，`objectIn<Key>AtIndex:`，`<key>AtIndexes`的组合消息被发送到`valueForKey:`方法的原接收器。如果这个接收器的类也实现了名称匹配样式为`get<Key>:range:`的可选方法，那么该方法将在适当的时候使用，以获得最佳的性能。
3. 否则（按照上面的方式依然没有找到），则搜索接收器类中的三个方法组合，三个方法的名称匹配样式为`countOf<Key>`，`enumeratorOf<Key>`，`memberOf<Key>:`（对应于`NSSet`类定义的原始方法）。
	如果这三个方法都找到了，那么响应所有`NSSet`方法的集合代理对象被返回。发送到集合代理对象的每个`NSSet`消息，都将导致`countOf<Key>`，`enumeratorOf<Key>`，`memberOf<Key>`的组合消息被发送到`valueForKey`方法的原接收器。
4. 否则（依然没有找到），如果接收器的类方法`accessInstanceVariablesDirectly`返回`YES`，那么将按照一定的 **顺序** 搜索接收器中的实例变量，该 **顺序** 和实例变量的名称匹配样式为`_<key>`，`_is<Key>`，`<key>`，`is<Key>`。如果找到了一个这样的实例变量，那么这个实例变量的值将被返回。如果这个返回类型是一个支持被`NSNumber`封装的标量，那么将转换这个标量为`NSNumber`并返回。否则转换成一个`NSValue`对象并返回。任意类型都可以被转换成`NSValue`对象，不仅仅是`NSPoint`，`NSRange`，`NSRect`和`NSSize`类型。
5. 如果以上都没有找到，则默认调用方法`valueForUndefinedKey:`，并把该方法的返回结果作为结果返回。

```objc
- (NSString *)name;
- (void)setName:(NSString *)name;
```

上面的方法完全等同于`@property`的实现方式。

### 有序集合的存取器搜索模式

`mutableArrayValueForKey:`方法的默认搜索模式如下：

1. 搜索接收器类中的一对方法，名称匹配样式为`insertObject:in<Key>AtIndex:`和`removeObjectFrom<Key>AtIndex:`（与`NSMutableArray`的原始方法`insertObject:atIndex:`和`removeObjectAtIndex:`各自相对应），或匹配样式为`insert<Key>:AtIndexes:`和`remove<Key>AtIndexes`（与`NSMutableArray`中方法`insertObjects:AtIndexes:`和`removeObjectsAtIndexes`相一致）。
	如果找到了至少一个插入方法和至少一个移除方法，那么发送到集合代理对象的每一个`NSMutableArray`消息，都将导致`insertObject:in<Key>AtIndex:`，`removeObjectFrom<Key>AtIndex:`，`insert<Key>:atIndexes:`，和`remove<Key>AtIndexes`的组合消息被发送到`mutableArrayValueForKey:`的原接收器。
	如果接收器的类也实现了名称匹配样式为`replaceObjectIn<Key>AtIndex:withObject:`或`replace<Key>AtIndexes:with<Key>:`的可选的替代对象的方法，那么这个方法将在适当的时候使用以使性能最佳。
2. 否则（没有找到），则搜索接收器类中的一个存取器方法，样式为`set<Key>:`。如果找到了这样的一个存取器方法，则发送到集合代理对象的每一个`NSMutableArray`消息，都将导致`set<Key>:`的消息被发送到`mutableArrayValueForKey:`的原接收器。它要比索引存取器方法的实施更有效。
3. 否则，如果接收器的类方法`accessInstanceVariablesDirectly`返回`YES`，那么将按照一定的**顺序** 搜索接收器中的实例变量，该 **顺序** 和名称匹配样式为`_<key>`，`<key>`。
	如果搜到了这样的一个实例变量，那么将转发发送到集合代理对象的`NSMutableArray`的消息到这个变量的值中，该值通常是一个`NSMutableArray`的实例或子类。
4. 否则，每当代理接收到	`NSMutableArray`的消息，都会返回一个可变的集合代理对象，这将使`mutableArrayValueForKey:`的原接收器发送一个`setValue:forUndefinedKey:`的消息。
	`setValue:forUndefinedKey:`的默认实现会报`NSUndefinedKeyException`异常，但是我们可以重写它。

> 提示：在第二步中的描述中，重复`set<Key>:`隐含着一个潜在的性能问题。为了更好的性能，在我们的KVC类中，实现第一步所需要的方法。

### 唯一的有序集合存取器搜索模式

`mutableOrderedSetValueForKey:`的默认实现采用相同的简单存取器方法和有序集合存取器方法为`valueForKey`（看[`valueForKey:`默认搜索模式]()），并且同样遵循直接访问实例变量，但总是返回一个可变的集合代理对象，而不是`valueForKey:`返回的不可变集合。同样，采用的搜索模式如下：

1. 搜索接收器类中名称匹配样式为`insertObject:in<Key>AtIndex:`和`removeObjectFrom<Key>AtIndex:`（与`NSMutableOrderedSet`类中定义的最原始的两个方法一致）的方法，也可以是方法`insert<Key>:atIndexes:`和`remove<Key>AtIndexes:`（与`NSMutableOrderedSet`的方法`insertObjects:atIndexes:`和`removeObjectsAtIndexes:`一致）。
	如果搜到了至少一个插入方法和至少一个移除方法，那么发送到集合代理对象的每一个`NSMutableOrderedSet`消息，都将导致上述提到的4个方法的组合消息被发送到`mutableOrderedSetValueForKey:`的原接收器中。
	如果接收器类实现了可选名称匹配样式为`replaceObjectIn<Key>AtIndex:withObject:`或`replace<Key>AtIndexes:with<Key>:`的方法，那么这个方法将在适当的时候使用以使性能最佳。
2. 否则，搜索接收器类中的存取器方法，名称匹配样式为`set<Key>:`。如果搜到了这样的一个方法，则发送到集合代理对象的每一个`NSMutableOrderedSet`消息，都将导致`set<Key>`消息被发送到`mutableOrderedSetValueForKey:`的原接收器。
3. 否则，如果接收器的类方法`accessInstanceVariablesDirectly`返回`YES`,那么将按照一定的 **顺序** 搜索接收器类中的实例变量，这个 **顺序** 和名称匹配样式为`_<key>`或`<key>`。如果搜到了这样的一个实例变量，那么将转发发送到集合代理对象的每一个`NSMutableOrderedSet`消息到实例变量的值中，这个值通常是一个`NSMutableOrderedSet`的实例变量或子类。
4. 否则，返回一个可变的集合代理对象。发送到集合代理对象的每一个`NSMutableOrderedSet`消息，都将导致`setValue:forUndefinedKey:`消息被发送到`mutableOrderedSetValueForKey:`的接收器中。`setValue:forUndefinedKey:`方法默认报`NSUndefinedKeyException`异常，但是我们可以重写该方法。

> 提示：在第二步中的描述中，重复`set<Key>:`隐含着一个潜在的性能问题。为了更好的性能，在我们的KVC类中，实现第一步提到的插入和移除方法。如果想达到最佳的性能，也可以实现替换的方法。

### 无序集合的存取器搜索模式

`mutableSetValueForKey:`的默认搜索模式如下：

1. 搜索接收器类中名称匹配样式为`add<Key>Object:`和`remove<Key>Object:`（与`NSMutableSet`的原始方法`addObject:`和`removeObject`各自一一对应）和`add<Key>:`和`remove<Key>`（和`NSMutableSet`的方法`unionSet:`和`minusSet:`一致）的方法。如果搜到了至少一个添加方法和至少一个移除方法，则发送集合代理对象的每一个`NSMutableSet`消息，将导致`add<Key>Object:`，`remove<Key>Object:`，`add<Key>:`，和`remove<Key>:`的组合消息发送到`mutableSetValueForKey:`的原接收器中。
	如果接收器类也实现了可选方法，该方法名称匹配样式为`intersect<Key>:`或`set<Key>:`，那么这个方法将在适当的时候使用，以使性能最佳。
2. 如果这个接收器是一个管理对象，那么这个搜索模式将不会继续下去。看在[Core Data Programming Guide](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/CoreData/index.html#//apple_ref/doc/uid/TP40001075)中的管理对象存取器方法，以获取更多信息。
3. 否则，搜索接收器类中名称匹配为`set<Key>:`的存取器方法。如果找到了这样的方法，则发送到集合代理对象中的每一个`NSMutableSet`消息，将被发送到`mutableSetValueForKey:`的原接收器中。
4. 否则，如果接收器的类方法`accessInstanceVariablesDirectly`返回`YES`，那么则按照一定的 **顺序** 搜索这个类中的实例变量，这个 **顺序** 和名称匹配样式为`_<key>`或`<key>`。如果找到了这样的实例变量，则转发发送到集合代理对象中的每一个`NSMutableSet`消息到这个实例变量的值中，因此，这个值通常是一个`NSMutableSet`的实例或子类。
5. 否则，返回一个可变的集合代理对象。发送到集合代理对象中的每一个`NSMutableSet`消息，将导致`setValue:forUndefinedKey:`消息被发送到`mutableSetValueForKey:`的原接收器中。

> 提示：在第3步的描述中，重复`set<Key>:`隐含着一个潜在的性能问题。为了更好的性能，在我们的KVC类中，实现第一步提到方法。

## 描述属性关系

类描述提供了在一个类中描述一对一和一对多属性的方法。对于KVC来说，定义类属性之间的这种关系使得操控这些属性更加智能和灵活。支持 OS X系统。

### 类描述

`NSClassDescription`是一个基类，用于提供获取类的元数据的接口。一个类描述对象记录了一个特定类的对象的可用属性和在那个类的对象和其它对象之间的关系（一对一，一对多和反之）。例如这个`attributes`方法返回了一个类中定义的所有属性清单；`toManyRelationshipKeys`和`toOneRelationshipKeys`方法返回定义了一对多和一对一关系的keys集合；`inverseRelationshipKey:`返回这个关系的名称，这个关系是一个指定key的关系的反转。
例如，假定有一个`Employee`类，这个类有一个`department`的关系名称，`department`是一个`Department`的类对象，这个`Department`有一个对应`Employee`类对象的`employees`的关系名称。

```objc
NSString *inverse = [employee inverseForRelationshipKey:@"department"];
// inverse 为 employees
```

`NSClassDescription`没有定义这个明确关系的方法。具体的子类必须定义这些方法。一旦创建，你就需要使用`NSClassDescription`的类方法`registerClassDescription:forClass:`注册一个类描述。
`NSScriptClassDescription`是Cocoa中提供的`NSClassDescription`的唯一的具体子类。它用于封装一个营业脚本信息。

## 性能注意事项

虽然KVC是效率高的，但是它增加的间接层还是要比直接的方法调用速度稍慢。但你能够从它的灵活性中受益时，你应该使用KVC。
额外的优化时机可能在未来添加，但这不会改变KVC的基本规范。

### 重写KVC方法

KVC方法的默认实现，如`valueForKey:`，缓存Objective-C的运行时信息以提供效率。当你重写这些实现的时候，你应该小心确保不会对你的应用程序产生负面的性能影响。

### 优化一对多的关系

使用索引存取器的形式实现一对多的关系，将会在许多情况下提高性能。
建议我们在一对多的集合中，至少实现最低的索引访问。

参考：[KVC 和 KVO](http://objccn.io/issue-7-3/)   
翻译：[Apple官网](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/KeyValueCoding/Articles/KeyValueCoding.html)
