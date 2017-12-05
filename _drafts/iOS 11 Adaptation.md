---
layout: note
title: iOS 11适配汇总
motto: null
excerpt: 记录iOS 11开发/适配过程中遇到的问题及解决方案。
tags: [iOS 11]
---

<!-- * TOC
{:toc} -->

# UIScrollView  

## UIScrollView内容下移  

在iOS 11以前，如果想要禁用UIScrollView的自动下移，需要设置ViewController的属性`automaticallyAdjustsScrollViewInsets`。但是在iOS 11中该属性已被废弃了，我们可以使用UIScrollView新增的属性`contentInsetAdjustmentBehavior`来禁用自动下移。  

```objc
if (@available(iOS 11.0, *)) {
    [_scrollView setContentInsetAdjustmentBehavior:UIScrollViewContentInsetAdjustmentNever];
}
```

## tableView使用分组类型空间变大且设置无效  

我们知道tableView使用UITableViewStyleGrouped类型，默认tableView的每组头部和底部之间是有间距的。  
在iOS 11以前，可以通过实现`heightForHeaderInSection`方法（返回一个较小的值：0.1）来去除头部的间距，底部可以使用方法`heightForFooterInSection`来去除。  
但是，在iOS 11上，只实现上面的方法是无效的，必须也要同时实现`viewForHeaderInSection`和`viewForFooterInSection`方法。只实现高度，而没有实现view，那样是不规范的，但代码这样写在iOS 11之前是没有问题的。iOS 11是由于开启了估算行高机制引起了Bug。添加上`viewForHeaderInSection`和`viewForFooterInSection`方法后，问题得以解决。或者使用如下方法关闭估算行高，也可以解决问题。  

```objc
_tableView.estimatedRowHeight = 0;
_tableView.estimatedSectionHeaderHeight = 0;
_tableView.estimatedSectionFooterHeight = 0;
```
