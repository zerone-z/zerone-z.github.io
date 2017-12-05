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
