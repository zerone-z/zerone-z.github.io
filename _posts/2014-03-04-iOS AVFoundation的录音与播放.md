---
layout: post
title: iOS AVFoundation的录音与播放
motto: null
excerpt: A ton of text to test readability with image feature.
tags:
  - iOS
  - AVFoundation
  - 录音
commentFlag: true
comments:
  - author:
      type: full
      displayName: myzerone
      url: 'https://github.com/myzerone'
      picture: 'https://avatars.githubusercontent.com/u/7497650?v=3&s=73'
    content: qww
    date: 2016-09-02T18:37:36.335Z
  - author:
      type: full
      displayName: myzerone
      url: 'https://github.com/myzerone'
      picture: 'https://avatars.githubusercontent.com/u/7497650?v=3&s=73'
    content: '1212'
    date: 2016-09-03T13:34:58.571Z
  - author:
      type: full
      displayName: myzerone
      url: 'https://github.com/myzerone'
      picture: 'https://avatars.githubusercontent.com/u/7497650?v=3&s=73'
    content: '1212'
    date: 2016-09-03T13:41:53.837Z

---

> 这是我第一次撰写博客，大部分内容都来自网络，写的不对地方还请多多指教，如果有摘录的地方与原作略有相同还请谅解说明。请多多支持。

# AVAudioSession的使用

AVAudioSession是一个单例模式。在IOS7以前可以不用设置，在IOS7上不设置AVAudioSession则不可以录音。

## 设置AVAudioSession的类别（部分）及开启音频会话

|           Category（类别）           |     作用    |
|:-----------------------------------:|:-----------:|
|    AVAudioSessionCategoryPlayback   |   后台播放   |
|     AVAudioSessionCategoryRecord    |     录音     |
| AVAudioSessionCategoryPlayAndRecord | 后台播放及录音 |

```objc
//录音权限设置
AVAudioSession * audioSession = [AVAudioSession sharedInstance];
//设置类别只支持录音
[audioSession setCategory:AVAudioSessionCategoryRecord error:nil];
//启动音频会话管理，此时会阻断后台音乐的播放
[audioSession setActive:YES error:nil];
```

## 在录音或播放结束后，要关闭音频会话，来延续后台音乐的播放

```objc
AVAudioSession *audioSession = [AVAudioSession sharedInstance];
[audioSession setCategory:AVAudioSessionCategoryPlayback error:nil];
[audioSession setActive:NO error:nil];
```

## 要想启用其他程序的后台音乐播放，则要用如下设置

```objc
AVAudioSession *audioSession = [AVAudioSession sharedInstance];
[audioSession setCategory：AVAudioSessionCategoryPlayback error:nil];
[audioSession setActive:NO withFlags:AVAudioSessionSetActiveFlags_NotifyOthersOnDeactivati​​on error:nil];
```

# AVAudioRecorder的基本使用

## 参数设置

| 参数名称                   | 作用                  | 值   |
|:------------------------ |:---------------------:|:-------|
| AVFormatIDKey            | 录音格式               | 	kAudioFormatMPEG4AAC，kAudioFormatLinearPCM ... |
| AVSampleRateKey          | 录音采样率 影响音频的质量 | 8000,44100,96000 |
| AVNumberOfChannelsKey    | 录音通道数             | 1或2 |
| AVLinearPCMBitDepthKey   | 线性采样位数            | 8,16,24,32 |
| AVEncoderAudioQualityKey | 线性采样位数            | AVAudioQualityMin，AVAudioQualityLow，AVAudioQualityMedium，AVAudioQualityHigh，AVAudioQualityMax |

## 保存路径的网址设置

```objc
// CFUUID每次都会产生一个唯一号
CFUUIDRef cfuuid = CFUUIDCreate（kCFAllocatorDefault）;
NSString *cfuuidString =(NSString *)CFBridgingRelease(CFUUIDCreateString(kCFAllocatorDefault, cfuuid));
NSString *catchPath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) lastObject];
NSString *audioRecordFilePath = [catchPath stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.AAC”，cfuuidString]];
NSURL *url = [NSURL fileURLWithPath：audioRecordFilePath];
```

## AVAudioRecorder初始化

```objc
NSError *error = nil;
AVAudioRecorder *recorder = [[AVAudioRecorder alloc] initWithURL:url settings:recordSetting error:&error];
```

## 完整代码如下

```objc
//录音参数设置设置
NSMutableDictionary *recordSetting = [[NSMutableDictionary alloc] init];
//设置录音格式
[recordSetting setValue:[NSNumber numberWithInt:kAudioFormatMPEG4AAC] forKey:AVFormatIDKey];
//设置录音采样率
[recordSetting setValue:[NSNumber numberWithFloat:44100] forKey:AVSampleRateKey];
//录音通道数
[recordSetting setValue:[NSNumber numberWithInt:1] forKey:AVNumberOfChannelsKey];
//线性采样位数
[recordSetting setValue:[NSNumber numberWithInt:16] forKey:AVLinearPCMBitDepthKey];
//录音的质量
[recordSetting setValue:[NSNumber numberWithInt:AVAudioQualityHigh] forKey:AVEncoderAudioQualityKey];
//录音文件保存的网址
CFUUIDRef cfuuid = CFUUIDCreate(kCFAllocatorDefault);
NSString *cfuuidString = (NSString *)CFBridgingRelease(CFUUIDCreateString(kCFAllocatorDefault, cfuuid));
NSString *catchPath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) lastObject];
NSString *audioRecordFilePath = [catchPath stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.AAC", cfuuidString]];
NSURL *url = [NSURL fileURLWithPath:audioRecordFilePath];
NSError *error = nil;
//初始化AVAudioRecorder
_recorder = [[AVAudioRecorder alloc] initWithURL:url settings:recordSetting error:&error];
if (!error）{
    //NSLog(@"初始化录音错误:%@", error);
} else {
   if ([_recorder prepareToRecord]){
       //录音最长时间设置
       [_recorder recordForDuration:20];
       //委托事件
       _recorder.delegate = self;
       [_recorder record];
       //开启音量检测
       _recorder.meteringEnabled = YES;
       //开启定时器，音量监测
       _timer = [NSTimer scheduledTimerWithTimeInterval:0.05 target:self selector:@selector(volumeMeters:) userInfo:nil repeats:YES];
    }
}
#pragma mark 实时监测音量变化定时器任务
- (void)volumeMeters:(NSTimer *)timer
{
    //刷新音量数据
    [_recorder updateMeters];
    double lowPassResults = POW(10, (0.05 * [_recorder peakPowerForChannel:0]));
    if（0 < lowPassResults && lowPassResults <= 0.14）{

    }else if(0.14 < lowPassResults && lowPassResults <= 0.28){

    }else if(0.28 < lowPassResults && lowPassResults <= 0.42){

    }else if(0.42 < lowPassResults && lowPassResults <= 0.56){

    }else if(0.56 < lowPassResults && lowPassResults <= 0.7){

    }else if(0.7 < lowPassResults && lowPassResults <= 0.84){

    }else if(0.84 < lowPassResults && lowPassResults <= 0.98){

    }else{

    }
}

// AVAudioRecorder委托事件
- (void)audioRecorderDidFinishRecording(AVAudioRecorder *)recorder successfully:(BOOL)flag
{
  //录音结束
}
- (void)audioRecorderEncodeErrorDidOccur:(AVAudioRecorder *)recorder error:(NSError *)error
{
  //录音编码错误
}
```

## AVAudioPlayer的使用

主要用于音频文件的播放，它主要有两个初始化方法：`initWithData`与`initWithContentsOfURL`。两个一般都可以使用，但在使用initWithContentsOfURL时要注意传入文件的文件名的格式，稍有不同，则无法播放，如：aac文件，如果后缀名为大写AAC，则无法播放。

```objc
// initWithContentsOfURL
NSURL * urlAudio = [NSURL fileURLWithPath:audioPath];
AVAudioPlayer * _player = [[AVAudioPlayer alloc] initWithContentsOfURL:urlAudio error:nil];
// initWithData
NSData * dataAudio = [NSData dataWithContentsOfFile:audioPath];
NSError *error = nil;
AVAudioPlayer *_player = [[AVAudioPlayer alloc] initWithData:dataAudio error:&error];
//属性设置
[_player prepareToPlay]; //准备播放
[_player play]; //播放
[_player pause]; //暂停播放
[_player stop]; //停止播放
_player.duration; //播放持续时间，只读
_player.volume = 0.8; //设置音量大小
_player.currentTime = 15.0; //设置当前播放时间
_player.numberOfLoops = 3; //循环播放时间
_player.delegate = self; //委托事件

// AVAudioPlayer委托事件
- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player successfully:(BOOL)flag
{
  //音频文件播放结束
}
- (void)audioPlayerDecodeErrorDidOccur:(AVAudioPlayer *)player error:(NSError *)error
{
  //音频文件解码错误
}
```

ps : 录音类AVAudioRecorder最好设置为全局变量。如果为局部变量，当销毁掉时将结束录音。

附：据此写出的仿[微信录音Demo](https://github.com/xj01/XJAudioRecorder){:target="_blank"}
