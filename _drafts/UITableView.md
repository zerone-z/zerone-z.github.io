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
// iOS7以前的代码
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

// iOS7以后的代码：
_tableView.separatorInset = UIEdgeInsetsZero;
_tableView.separatorStyle = UITableViewCellSeparatorStyleSingleLine;
```

## UITableViewCell使用AutoLayout自动计算高度  

```objc
// iOS10.2以下可使用如下方法：
[tableView layoutIfNeeded];
CGFloat contentWidth = CGRectGetWidth(tableView.frame);

UITableViewCell *cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleValue1 reuseIdentifier:nil];

[cell.contentView mas_makeConstraints:^(MASConstraintMaker *make) {
    make.width.mas_equalTo(contentWidth);
}];

// cell的属性赋值
[cell.textLabel setText:cellDTO.text];
[cell.detailTextLabel setText:cellDTO.detailText];
CGFloat height = roundf([cell.contentView systemLayoutSizeFittingSize:UILayoutFittingCompressedSize].height + 0.5);
return height;

// iOS10.2及以上系统需使用如下方法
[tableView layoutIfNeeded];
CGFloat contentWidth = CGRectGetWidth(tableView.frame);

UITableViewCell *commonCell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleValue1 reuseIdentifier:nil];

[commonCell.contentView mas_makeConstraints:^(MASConstraintMaker *make) {
    make.width.mas_equalTo(contentWidth).priorityHigh();
    make.edges.equalTo(commonCell);
}];

// cell的属性赋值
[commonCell.textLabel setText:cellDTO.text];
[commonCell.detailTextLabel setText:cellDTO.detailText];

CGFloat height = roundf([commonCell.contentView systemLayoutSizeFittingSize:UILayoutFittingCompressedSize].height + 0.5);
return height;
```

## UITableViewHeaderFooterView AutoLayout布局  

在 `UITableViewHeaderFooterView` 的子类，使用AutoLayout布局时，需要在iOS 8及以下的版本中设置 `UITableViewHeaderFooterView` 的 `contentView` 的属性 `translatesAutoresizingMaskIntoConstraints` 为 `NO` 。否则会报约束冲突（simultaneously satisfy constraints）。  

```objc
[self.contentView setTranslatesAutoresizingMaskIntoConstraints:NO];

// 兼容iOS7～iOS10，需加入如下代码：
[self.contentView mas_makeConstraints:^(MASConstraintMaker *make) {
    make.edges.equalTo(self.contentView.superview);
}];
```
