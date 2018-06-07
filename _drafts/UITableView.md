---
layout: post
title: UITableView解决方案汇总
motto: null
excerpt: 主要记录了，在开发过程中遇到的各种奇葩问题已经解决方案
tags: [UITableView]
---

<!-- * TOC
{:toc} -->

# UITableView  

## UITableViewStylePlain不显示多余的单元格  

在tableView数据未能占满屏幕的时候，会显示多余的单元格和分割线，我们可以在创建tableView的时候给 `tableFooterView` 属性设置一个空的view

```objc
tableView.tableFooterView = [UIView new];
```

## 分割线内边距设置  

默认tableView的分割线都是与左侧有间距的，但是有时候我们不需要这个间距，此时可以使用如下的方法设置间距。  

```objc
// tableView创建的使用使用
if ([_tableView respondsToSelector:@selector(setSeparatorInset:)]) {
    [_tableView setSeparatorInset:UIEdgeInsetsZero];
}
if ([_tableView respondsToSelector:@selector(setLayoutMargins:)]) {
    [_tableView setLayoutMargins:UIEdgeInsetsZero];
}

// UITableViewDelegate方法中设置
- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath
{
    if ([cell respondsToSelector:@selector(setSeparatorInset:)]) {
        [cell setSeparatorInset:UIEdgeInsetsZero];
    }
    if ([cell respondsToSelector:@selector(setLayoutMargins:)]) {
        [cell setLayoutMargins:UIEdgeInsetsZero];
    }
}
```
