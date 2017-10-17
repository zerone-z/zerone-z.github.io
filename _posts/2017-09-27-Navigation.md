---
layout: post
title: iOS导航栏解决方案汇总
motto: null
excerpt: 本篇文章主要讨论导航栏的返回问题，包括其他各种问题的解决方案。
tags: [iOS, UINavigationController, UINavigationBar]
---

<!-- * TOC
{:toc} -->

# 导航栏  

本篇文章主要介绍了导航栏返回按钮的设置、导航栏的显示与隐藏、返回手势等相关问题的解决方案。  

## 设置返回按钮  

我们知道导航栏的返回按钮在默认情况下是这样的：  

![默认导航栏](/assets/posts/navigation/back_default.png)

其返回按钮的标题文本默认为上一个控制器的标题，如果上一个控制器没有标题，则为 **Back** （中文环境为 **返回**）。  
虽然系统已经提供了默认的返回按钮，但是绝大多数情况下，我们都需要根据产品需求自定义我们的返回按钮，包括图片、标题、位置等信息，我这里提供了两种方式来实现。    

 1. 通过属性`leftBarButtonItem`来设置
 2. 通过属性`backBarButtonItem`、`backIndicatorImage`来设置

### 通过属性`leftBarButtonItem`自定义返回按钮  

通过属性`leftBarButtonItem`来替换返回按钮非常简单，只需要在我们显示返回按钮的控制器中创建一个`UIBarButtomItem`对象，设置这个对象的图片、标题，并把这个对象赋值给`leftBarButtonItem`即可。代码如下：  

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    
    self.navigationItem.leftBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav_back")?.withRenderingMode(.alwaysOriginal), style: .plain, target: self, action: #selector(backEvent(_:)));
}
    
@objc private func backEvent(_ sender: UIBarButtonItem) {
    self.navigationController?.popViewController(animated: true);
}
```

![返回按钮设置](/assets/posts/navigation/back_set.png)

有时我们也需要调整返回按钮的位置，第一印象都会想到Frame，但是显然是不行的，因为导航栏是一个比较特殊的View，我们无法调整。  
在低于iOS11的版本上，我们可以利用UIButtonBarItem创建一个特殊的对象，叫作`UIBarButtonSystemItemFixedSpace`，来调整返回按钮的位置。方法如下：  

```swift
override func viewDidLoad() {
    super.viewDidLoad()

    let backItem = UIBarButtonItem(image: UIImage(named: "nav_back")?.withRenderingMode(.alwaysOriginal), style: .plain, target: self, action: #selector(backEvent(_:)));
    
    let spaceItem = UIBarButtonItem(barButtonSystemItem: .fixedSpace, target: nil, action: nil);
    spaceItem.width = -15;
    self.navigationItem.leftBarButtonItems = [spaceItem, backItem];
}

@objc private func backEvent(_ sender: UIBarButtonItem) {
    self.navigationController?.popViewController(animated: true);
}
```

但是在iOS11以后的版本上，设置`UIBarButtonItem`的属性`width`低于零时，该值会无效，所以我们只能通过设置`UIButton`的属性`imageEdgeInsets`来设置返回按钮的位置，但是这样的设置会造成UIButton的显示效果与实际触摸点存在偏差，代码如下：  

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    
    let backButton = UIButton(type: .custom);
    backButton.setImage(UIImage(named: "nav_back")?.withRenderingMode(.alwaysOriginal), for: .normal);
    // 偏移量设置
    backButton.imageEdgeInsets = UIEdgeInsetsMake(0, -15, 0, 0);

    backButton.addTarget(self, action: #selector(backEvent(_:)), for: .touchUpInside);
    
    self.navigationItem.leftBarButtonItem = UIBarButtonItem(customView: backButton);
}

@objc private func backEvent(_ sender: UIButton) {
    self.navigationController?.popViewController(animated: true);
}
```

![返回按钮位置](/assets/posts/navigation/back_position.png)

#### 启用滑动返回手势  

通过`leftBarButtonItem`替换系统的返回按钮，会使滑动返回手势失效。在网上搜到的解决方法很简单，都是添加下面的代码：    

```swift
self.navigationController?.interactivePopGestureRecognizer?.delegate = self;
```

虽然解决方案很简单，只是添加上面的一段代码，但是会产出另一个Bug：在导航栏界面的push过程中，可能会卡死。其复现步骤为：在根控制出现的时候，在其左侧边缘右滑，再点击按钮触发push，这时候通过滑动返回到更控制器，再点击按钮push的时候，Bug就出现了，不行多试几次就好了。  
要想解决卡死的Bug还需要在跟控制器上实现UINavigationController的协议，下面就是完整的解决方案：  

```swift
class ViewController: UIViewController, UIGestureRecognizerDelegate, UINavigationControllerDelegate {

    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationItem.title = "heeh"
       // 设置手势代理，启用手势
        self.navigationController?.interactivePopGestureRecognizer?.delegate = self;
        // 设置导航控制器代理
        self.navigationController?.delegate = self;
    }
    
    func navigationController(_ navigationController: UINavigationController, didShow viewController: UIViewController, animated: Bool) {
        guard let nav = self.navigationController else {
            return;
        }
        // 只有一个根控制器的时候，禁用手势
        nav.interactivePopGestureRecognizer?.isEnabled =  nav.viewControllers.count > 1 ;
    }
}
```

### 通过属性`backBarButtonItem`，`backIndicatorImage`自定义返回按钮  

另外我们还可以使用`backBarButtonItem`属性来设置返回按钮的标题，因为其不会使滑动返回手势失效，我们也不需要设置额外的代理方法。唯一需要注意的是：在当前控制器中设置的返回按钮，会在下个push显示的控制器中生效；换种说话就是：如果想在当前界面中自定义返回按钮，需要在上一个界面中设置`backBarButtonItem`。使用`backIndicatorImage`自定义返回按钮的图片，需要注意的是由于该属性属于`UINavigationBar`，所以这里设置以后，在该导航栏下的所有返回按钮图片都会改变为该设置。代码如下：  

```swift
// 返回按钮设置
self.navigationController?.navigationBar.backIndicatorImage = UIImage(named: "nav_back")?.withRenderingMode(.alwaysOriginal);
self.navigationController?.navigationBar.backIndicatorTransitionMaskImage = UIImage(named: "nav_back")?.withRenderingMode(.alwaysOriginal);
// 标题设置
let backItem = UIBarButtonItem();
backItem.title = "自定义标题";
self.navigationItem.backBarButtonItem = backItem;

self.navigationController?.pushViewController(BViewController(), animated: true);
```

![返回按钮效果](/assets/posts/navigation/back_other_set.gif)

### 全局设置  

这种方法就是通过`[UINavigationBar appearance]`和`[UIBarButtonItem appearance]`来进行全局的设置, 代码如下:  

```swift
// 自定义返回按钮的图片
let navBar = UINavigationBar.appearance();
let backImage = UIImage(named: "nav_back")?.withRenderingMode(.alwaysOriginal);
navBar.backIndicatorImage = backImage;
navBar.backIndicatorTransitionMaskImage = backImage;

// 字体设置
let barItem = UIBarButtonItem.appearance();
navBar.titleTextAttributes = [NSAttributedStringKey.font : UIFont.boldSystemFont(ofSize: 17), NSAttributedStringKey.foregroundColor : UIColor.red];
barItem.setTitleTextAttributes([NSAttributedStringKey.font : UIFont.systemFont(ofSize: 15), NSAttributedStringKey.foregroundColor : UIColor.blue], for: .normal);
barItem.setTitleTextAttributes([NSAttributedStringKey.font : UIFont.systemFont(ofSize: 15), NSAttributedStringKey.foregroundColor : UIColor.gray], for: .disabled);

// 去除返回按钮的标题
if #available(iOS 11, *) {
    barItem.setTitleTextAttributes([NSAttributedStringKey.foregroundColor : UIColor.clear], for: .normal);
    barItem.setTitleTextAttributes([NSAttributedStringKey.foregroundColor : UIColor.clear], for: .highlighted);
} else {
    barItem.setBackButtonTitlePositionAdjustment(UIOffset(horizontal: 0, vertical: -64), for: .default);
}
```

> NOTE: 上面不是真正的移除返回按钮的标题，只是变相的隐藏了标题。其标题仍然占据着导航栏的长度，当这个返回按钮的标题过长，可能会造成导航栏的标题不居中，这时可以使用`backBarButtonItem`设置返回栏的标题为空字符串来移除标题。  

## 导航栏的显示与隐藏  

在开发过程中，经常需要从一个无导航栏的控制器push到一个有导航栏的控制器，或者相反。看似很简单，如果不使用正确的姿势，就会造成很多的坑。先上最终正确代码：  

```swift
override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated);
    // 隐藏导航栏
    self.navigationController?.setNavigationBarHidden(true, animated: animated);
}

override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated);
    // 显示导航栏
    self.navigationController?.setNavigationBarHidden(false, animated: animated);
}
```

上面代码的关键点就是：显示/隐藏导航栏的animated属性要继承viewWillAppear/viewWillDisappear的属性animatied。如果不采用这样的方法，可能会造成如下的问题：  
 
 - 有导航栏的控制器出现时，导航栏会立即出现，而控制器的View是自右向左渐入的
 - 点击返回按钮时，导航栏消失且右侧会出现黑边
 - 在切换UITabBarController的时候，导航栏也会出现显示/隐藏动画

> NOTE：因为我们的animated使用的是继承过来的属性，这样就可以完美的避开需要区分一个界面的显示是否使用动画。


## NavigationBar透明  

```swift
self.navigationController?.navigationBar.setBackgroundImage(UIImage(), for: .default);
self.navigationController?.navigationBar.shadowImage = UIImage();
self.navigationController?.navigationBar.isTranslucent = true;
```
