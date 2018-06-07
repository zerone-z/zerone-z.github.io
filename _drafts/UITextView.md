---
layout: post
title: UITextView解决方案汇总
motto: null
excerpt: 主要记录了，UITextView在开发过程中遇到的各种奇葩问题以及解决方案
tags: [UITextView]
---

<!-- * TOC
{:toc} -->

# UITextView  

## 行间距等相关属性的设置  

如果textView的内容是静态的显示，只需使用 `attributedText` 属性即可。  

```objc
NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init]; 
[paragraphStyle setLineSpacing: 10];// 字体的行间距 
[paragraphStyle setAlignment:textView.textAlignment]; // 对齐方式
 
NSDictionary *attributes = @{NSParagraphStyleAttributeName:paragraphStyle, NSFontAttributeName:textView.font};
textView.attributedText = [[NSAttributedString alloc] initWithString:@"静态显示的内容" attributes:attributes];
```

如果是想在输入内容的时候就按照设置的行间距进行动态改变，有三种方案：

1. 使用textView的 `typingAttributes` 属性，用于设置用户输入的新文本的值。  

```objc
NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init];
[paragraphStyle setLineSpacing:10];// 字体的行间距 
[paragraphStyle setAlignment:textView.textAlignment];// 对齐方式
NSDictionary *attributes = @{NSParagraphStyleAttributeName:paragraphStyle, NSFontAttributeName:textView.font};

textView.typingAttributes = attributes;
```

但是使用上面的方法会有光标扩大的问题。可以重写UITextView，重写方法 `caretRectForPosition:` 来设置光标frame。  

```objc
- (CGRect)caretRectForPosition:(UITextPosition *)position {
    CGRect originalRect = [super caretRectForPosition:position];

    originalRect.size.height = self.font.lineHeight + 2;
    originalRect.size.width = 3;

    return originalRect;
}
```

2. 使用textView的delegate方法 `textViewDidChange:`  

```objc
- (void)textViewDidChange:(UITextView *)textView
{
    NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init];
    [paragraphStyle setLineSpacing:10]; // 字体的行间距 
    [paragraphStyle setAlignment:textView.textAlignment]; // 对齐方式
    NSDictionary *attributes = @{NSParagraphStyleAttributeName:paragraphStyle, NSFontAttributeName:textView.font};
    
    textView.attributedText = [[NSAttributedString alloc] initWithString:textView.text attributes:attributes];
}
```

以为这样就没有问题了吗？不！当我们使用中文输入的时候，会出现如下的问题：  

    - 输入中文，会同时出现英文字母
    - 光标会在每次插入文字后重新定位到最后
    - 在字符串中间输入的时候会自动滚动到最后，目前没有好的解决方案

中英文同时出现的问题，我们可以使用textView的属性 `markedTextRange` 来获取候选标记字符的位置。如果存在则说明处于中文输入状态，此时不需要设置间距；如果不存在，则代表没有候选字符，不处于中文输入状态，此时可以设置间距。  
光标定位的问题，可以使用 `selectedTextRange` 属性获取/设置光标位置。  

```objc
- (void)textViewDidChange:(UITextView *)textView
{
    if (!textView.markedTextRange) {
        NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init];
        [paragraphStyle setLineSpacing:10]; // 字体的行间距 
        [paragraphStyle setAlignment:textView.textAlignment]; // 对齐方式
        NSDictionary *attributes = @{NSParagraphStyleAttributeName:paragraphStyle, NSFontAttributeName:textView.font};
        
        // 获取光标位置
        UITextRange *range = textView.selectedTextRange;
        textView.attributedText = [[NSAttributedString alloc] initWithString:textView.text attributes:attributes];
        // 设置光标位置
        [textView setSelectedTextRange:range];
    }
}
```

3. 使用textView的delegate方法 `textViewShouldBeginEditing:` 

我们可以利用textView将要编辑的时候，设置行间距，之后的输入内容就都有了行间距这一特性。无字符时要先添加一个临时字符，在设置属性，否则无效。

```objc
- (BOOL)textViewShouldBeginEditing:(UITextView *)textView {
    // 当没有字符时要先临时填充一个字符, 再设置属性才能有效
    BOOL tmpFlag = NO;
    if (textView.text.length < 1) {
        [textView setText:@"间距"];
        tmpFlag = YES;
    }
    NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init];
    [paragraphStyle setLineSpacing:10]; // 字体的行间距
    [paragraphStyle setAlignment:textView.textAlignment]; // 对齐方式
    NSDictionary *attributes = @{NSParagraphStyleAttributeName:paragraphStyle, NSFontAttributeName:textView.font, NSForegroundColorAttributeName: [UIColor redColor]};
    
    textView.attributedText = [[NSAttributedString alloc] initWithString:textView.text attributes:attributes];
    // 删除临时字符
    if (tmpFlag) {
        textView.attributedText = [[NSAttributedString alloc] initWithString:@"" attributes:attributes];//主要是把“间距”两个字给去了。
    }
    return YES;
}
```

或者我们可以在创建UITextView对象的时候，设置临时字符的属性，然后删除临时字符，也会有相同的效果。  
使用这个方法不会出现上面两种方法中的问题，也不会有其他的特殊问题，基本和原来的效果一致，所以推荐使用此种方法。  

## 光标位置  

获取光标位置：  

```objc
- (NSRange)cursorRange{
    //开始位置
    UITextPosition* beginning = textView.beginningOfDocument;
    //光标选择区域
    UITextRange* selectedRange = textView.selectedTextRange;
    //选择的开始位置
    UITextPosition* selectionStart = selectedRange.start;
    //选择的结束位置
    UITextPosition* selectionEnd = selectedRange.end;
    //选择的实际位置
    NSInteger location = [textView offsetFromPosition:beginning toPosition:selectionStart];
    //选择的长度
    NSInteger length = [textView offsetFromPosition:selectionStart toPosition:selectionEnd];
    return NSMakeRange(location, length);
}
```

设置光标选择范围：  

```objc
- (void)setCursorRange:(NSRange)range
{
    UITextPosition* beginning = textView.beginningOfDocument;
    UITextPosition* startPosition = [textView positionFromPosition:beginning offset:range.location];
    UITextPosition* endPosition = [textView positionFromPosition:beginning offset:range.location + range.length];
    UITextRange* selectionRange = [textView textRangeFromPosition:startPosition toPosition:endPosition];
    [textView setSelectedTextRange:selectionRange];
}
```
