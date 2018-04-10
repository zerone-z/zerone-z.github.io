---
layout: post
title: UILabel解决方案汇总
motto: null
excerpt: 主要记录了，在开发过程中遇到的各种奇葩问题已经解决方案
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
