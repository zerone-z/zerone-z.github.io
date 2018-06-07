---
layout: post
title: UILabel解决方案汇总
motto: null
excerpt: 主要记录了，UILabel在开发过程中遇到的各种奇葩问题以及解决方案
tags: [UILabel]
---

<!-- * TOC
{:toc} -->

# UILabel  

## attributedText  

很多时候我们绘制UI界面的时候，往往需要使用到富文本，比如：设置不同文字的色值、间距啊等。这时我们就需要用的UILabel的属性attributedText了。  
但是我们设置了该属性以后，文字如果超出后，省略号就不显示了，且也切掉了多余的内容。  
解决方案也很简单就是在我们每次设置完attributedText之后，设置属性lineBreakMode。  

```swift
label.attributedText = attributedText;
label.lineBreakMode = .byTruncatingTail;
```

## 多行文本的约束问题  

切记在用Autolayout对 `UILabel` 多行排版时，左右约束一定要用等于，如果不用（使用小于等于/大于等于），一定要设置 `preferredMaxLayoutWidth` ，否则App可能会崩溃，特别是在iOS10.2中。还有如果不指定该属性的值 `preferredMaxLayoutWidth` 系统可能计算不出正确的 UILabel的宽度及高度。  

在 `UIView` 中可以在如下方法中利用Autolayout自动计算出 `preferredMaxLayoutWidth` 的值，如UITableViewCell：  

```objc
// 已经约束确认好了位置
// 在layoutSubviews中确认label的preferredMaxLayoutWidth值
- (void)layoutSubviews 
{
    [super layoutSubviews];
    [self.contentView layoutIfNeeded];
    // 使布局约束生效之后，label的frame有值之后设置preferredMaxLayoutWidth
    self.label.preferredMaxLayoutWidth = CGRectGetWidth(self.label.bounds);
    // 设置preferredLayoutWidth后，调用更新布局
    [super layoutSubviews];
}
```

在 `UIViewController` 中可以在下面的方法中利用Autolayout自动计算出 `preferredMaxLayoutWidth` 的值：  

```objc
- (void)viewDidLayoutSubviews
{
    [super viewDidLayoutSubviews];
    // 获取设置lable的属性值 preferredMaxLayoutWidth
    [self.label setPreferredMaxLayoutWidth:CGRectGetWidth(self.label.bounds)];
    // 设置 preferredLayoutWidth 后，调用更新布局
    [self.view layoutIfNeeded];
}
```

## 设计图上的行距与代码之间的间距问题  

在实际开发过程中，如果我们按照设计图上的间距进行设置，仔细看会发现，实际呈现出来的间距会比设计图上的间距大，别小看这点间距，最终会造成视觉上的差距，与设计图可能就是天差地别了，我们是要负责的。那要怎么才能计算出正确的间距呢？我参考了如下的文章。  
[Text Kit学习日记–02–字体](https://wbuntu.com/p/85)，我们可以了解到iOS中字体的组成与各种属性构成。当然也可以看看iOS的官方文档[Cocoa Text Architecture Guide](https://developer.apple.com/library/content/documentation/TextFonts/Conceptual/CocoaTextArchitecture/Introduction/Introduction.html#//apple_ref/doc/uid/TP40009459-CH1-SW1)。  
其中官方文档中有个Font metrics，通过这个图，我们可以初步了解一下字体结构。  
![目录](/assets/notes/UILabel/font.png)
通过上面的文章，我们知道 UIFont 中各属性的值的意义。  
 - pointSize ： 按点计算的尺寸，等于字体尺寸的大小
 - lineHeight ： 行高，即字体实际占用的高度

这样我们就可以使用下面的方法计算出字体的留白空间了（多出的间距）。  

```objc
CGFloat offset = -(font.lineHeight - font.pointSize) * 0.5;
```

然后在实际使用过程中，我们只要使设计图中的标注间距减去该间距 `offset`，就是我们代码中使用的间距，这样的视觉效果就会和设计图上的完全一致了。  
