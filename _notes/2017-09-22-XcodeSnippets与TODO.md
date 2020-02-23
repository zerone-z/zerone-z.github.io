---
layout: note
title: Xcode Snippets与TODO
motto: null
excerpt: Xcode中的代码块与TODO标签的使用
tags: [Xcode, TODO]
---

<!-- * TOC-
{:toc} -->

# Xcode Snippets  

Xcode 4 中引入了一个新的特性：代码块（code snippets），Xcode 10 以下在整个界面的右下角，可以通过快捷键 `Cmd + Ctrl + Opt + 2` 调出来，Xcode 10 以后代码块移到了顶部导航栏上，图标都是 **{}** 可以通过快捷键 `Shift + Command + L` 调出来。代码块是一些代码的模版，对于一些常见的编程模式，Xcode代码块可以把这些重复的模式和样板提取出来进行复用。  

## 使用Xcode代码块  

使用快捷键打开代码块窗口，或者点击图标 **{}** 查看代码块仓库。在里面你会看到很多Xcode内置的代码块。  

![代码仓库窗口](/assets/notes/codesnippets/repository.png)

有两种方法将一个代码块插入你的代码。 
其一，直接从代码块仓库中把代码块拖入编辑器里面：  

![拖动使用代码块](/assets/notes/codesnippets/drag.gif)

其二，如果该代码块设置了快捷输入码，可以使用快捷输入码快速输入：  

![快捷键使用代码块](/assets/notes/codesnippets/shortcut.gif)

## 创建Xcode代码块  

Xcode代码块的强大之处还体现在我们可以创建自己的代码块。  
Xcode 10 以前，可以先选中需要当作代码块的代码，然后鼠标左键按住选中区域，当鼠标状态变为指针时，拖动到Xcode右下角代码仓库，松开鼠标，设置快捷键等信息。  

![创建代码块](/assets/notes/codesnippets/create.gif)

Xcode 10 以后，可以先选中要添加到代码块中的代码并 **右击** ，然后在弹出的对话框中选择 `Create Code Snippet` ，然后设置快捷键等信息。  

也可以双击代码仓库中的代码块预览代码块，点击 `Edit` 去编辑代码块（Xcode 10中，单击一下即可），或者设置快捷键等信息。  
![设置代码块](/assets/notes/codesnippets/setup.gif)

具体的每个代码块的设置信息如下：  

 - Title：标题；代码块的名字，出现在代码补全和代码块列表中。
 - Summary：简介；简单描述代码块的作用，只出现在代码块列表中。
 - Platform：平台；限制访问该代码块的平台。目前有iOS、maxOS、tvOS、watchOS、All。
 - Language：语言；限制访问代码块的语言。如：C、Objective-C、C++、Swift。
 - Completion Shortcut：快捷输入码；尽量设置简练，Xcode不会警告冲突／重复的快捷输入码。
 - Completion Scopes：有效范围；限制范围该代码块的范围。下面是其选项范围：  
     - All：全部
     - Class Implementation：类实现
     - Class Interface Methods：类接口方法
     - Class Interface Variables：类接口变量
     - Code Expression：代码表达式
     - Function or Method：函数或方法
     - Preprocessor Directive：预处理指令
     - String or Comment：字符串或注释
     - Top Level：最高层

> NOTE: `~/Library/Developer/Xcode/UserData/CodeSnippets/`目录存放了所有 Xcode 代码段的文件表示。

### 占位符  

在我们使用系统提供的代码块的时候，可能注意到了如下的占位符：  

![占位符](/assets/notes/codesnippets/placeholder.png)

在Xcode中，占位符使用 **<#** 和 **#>** 来分割，中间是占位文本。在上面的创建代码块的演示中，就已经使用了Xcode提供的占位符功能，使用的是 **statements** 作为占位符，完整的形式是`<#statements#>`。  

## 删除代码块  

有时我们不需要这个代码块了，可以在Xcode代码仓库中选中需要删除的代码块，按 **delete** 键删除。  

![删除代码块](/assets/notes/codesnippets/delete.gif)

# 标签  

目前Xcode支持的标签有四种：  
 
 - `// TODO:` 标识将来要完成的内容
 - `// FIXME:` 标识以后要修改或完善的内容
 - `// ???:` 标识有疑问的地方
 - `// !!!:` 标识需要注意的地方

上面介绍了Xcode支持的四种标签，接下来就是编写了，我一般设置的格式如下：  

```objc
// TODO: ToDoList type:<#add modify remove#> taskid:<#taskid#>  author:<#author#>
```

 - **ToDoList** 在4个标签中都会使用，用于全局搜索，可以快速得搜索到使用标签的地方。
 - author：表示作者。
 - taskid：表示需求ID，或者需求的简要描述。
 - type：代表所需要的操作，有add(添加)、modify(修改)、delete(删除)。
