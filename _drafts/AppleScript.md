# AppleScript 脚本命令汇总
# 设置文件地址到变量中
set deviceSupport to folder (POSIX file "/Users/LuPengDa/Library/Developer/Xcode/iOS DeviceSupport")
# 删除文件夹下所有文件
delete (every file of deviceSupport)
# 123 LeftArrow
# 124 RightArrow
# 125 DownArrow
# 126 UpArrow
# 36 Enter
# 使用 key code 或者 keystroke 模拟点击键盘
tell application "System Events"
    key code 124
    keystroke "w"
    # 使用 using 模拟组合键
    keystroke "w" using command down
    key code 124 using {command down, option down, control down}
end tell
# 延迟 6 秒后执行
delay 6
# try...catch
try
   # 运行的脚本
on error errMsg
   # log errMsg
   display dialog errMsg
end try
# 设置变量，数组
set theApps to {"1", "2", "3", "4", "5"}
# 遍历数组
repeat with theApp in theApps
    
end repeat
# 运行应用 App
tell application "Atom" to launch
tell application "Atom"
    launch
end tell
# 退出应用 App
tell application "Atom" to quit
# 激活应用窗口
tell application "Atom" to activate
tell application "Atom"
    activate
end tell
# 关闭所有应用程序窗口
tell application "System Events"
    set theVisibleApps to (name of application processes where visible is true)
end tell
repeat with thisApp in theVisibleApps
    # log thisApp
    if (thisApp as string) = "DingTalk" or (thisApp as string) = "RTX" then
        try
            tell application thisApp to activate
            tell application "System Events"
                keystroke "w" using command down
            end tell
        on error errMsg
            #display dialog errMsg
        end try
        delay 0.3
        #exit repeat
    end if
end repeat
# 获取指定程序所有 UI 元素
tell application "System Events"
    tell process "WeChat" -- 告诉 WeChat
        entire contents -- 获取所有 UI 元素
    end tell
end tell
tell application "System Events"
    tell process "WeChat" -- 告诉 WeChat
        tell window 1 -- 再告诉 WeChat 的第一个窗口
            entire contents -- 获取所有 UI 元素
        end tell
    end tell
end tell
# 获取应用的所有窗口的所有按钮 
set allbuttons to {}
tell application "System Events"
    tell process "WeChat"
        repeat with win in windows
            log name of win as string
            with timeout of 0 seconds
                set telements to entire contents of win
            end timeout
            repeat with i in telements
                if class of i is button then set end of allbuttons to contents of i
            end repeat
        end repeat
    end tell
end tell
allbuttons
# 点击程序界面上指定的 UI 元素
try
    tell application "System Events"
        tell process "SmartSVN"
            click the button "OK" of window 1
        end tell
    end tell
on error errMsg
end try
## 调用 Terminal 运行脚步文件
tell application "Terminal"
    do script ("sh /Users/LuPengDa/Desktop/tmp_crm_qas_npm.sh")
end tell
tell application "Terminal" to activate
delay 25
## 关闭终端窗口
tell application "Terminal"
    activate
    close window 1
end tell
