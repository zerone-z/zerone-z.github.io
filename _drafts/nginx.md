# NGINX

## Mac 配置

```Shell
$ sudo vim /usr/local/etc/nginx/nginx.conf
```

## 运行 NGINX 服务

```Shell
$ sudo nginx
```

## 其他命令

```Shell
$ sudo nginx -s reload  # 重新加载配置
$ sudo nginx -s reopen  # 重启
$ sudo nginx -s stop    # 停止
$ sudo nginx -s quit	# 退出
```

## 其他

### 获取 nginx 进程号

输入如下命令获取进程号， 注意：是找到 `nginx:master` 的进程号

```Shell
$ ps -ef|grep nginx
```

结果如下：

```Shell
501 15800     1   0 12:17 上午 ??         0:00.00 nginx: master process /usr/local/Cellar/nginx/1.8.0/bin/nginx -c /usr/local/etc/nginx/nginx.conf  
501 15801 15800   0 12:17 上午 ??         0:00.00 nginx: worker process  
501 15848 15716   0 12:21 上午 ttys000    0:00.00 grep nginx
```

这里的进程号就是：15800

### 结束进程

```Shell
$ kill -QUIT 15800  # 从容的停止，即不会立刻停止
$ kill -TERM 15800  # 立刻停止
$ kill -INT 15800   # 和上面一样，也是立刻停止
```
