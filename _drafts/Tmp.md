---
layout: post
title: tmp
motto: null
excerpt: 
tags: [Markdown]
---

<!-- * TOC
{:toc} -->

```objc
// 将得到的deviceToken传给SDK
    // 方式1

    NSMutableString *deviceTokenString1 = [NSMutableString string];

    const char *bytes = deviceToken.bytes;

    int iCount = deviceToken.length;

    for (int i = 0; i < iCount; i++) {

        [deviceTokenString1 appendFormat:@"%02x", bytes[i]&0x000000FF];

    }

    NSLog(@"方式1：%@", deviceTokenString1);



    // 方式2

    NSString *deviceTokenString2 = [[[[deviceToken description] stringByReplacingOccurrencesOfString:@"<"withString:@""]

                                     stringByReplacingOccurrencesOfString:@">" withString:@""]

                                    stringByReplacingOccurrencesOfString:@" " withString:@""];

    NSLog(@"方式2：%@", deviceTokenString2);
```


测试
