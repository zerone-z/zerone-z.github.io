# shell 常用命令汇总

# Automator 中 Shell 脚本，传递输入选择：作为自变量，可把文本内容传递脚本中
# $@ 获取所有变量，遍历变量值，写入文本文件，或者使用 $1 $2 $3... 读取变量
echo $1
for f in "$@"
do
	echo "$f" > /Users/LuPengDa/Desktop/tmp_crm_qas_npm.sh
done
# 通过上面的方式可自动生成脚步文件
# 在通过 AppleScript 运行该脚步文件

# 格式化日期到毫米
echo $(date +%s)

# 变量设置
SVNDirectory="/Users/LuPengDa/WorkSpace/CTTQH5/trunk-DEV/framework_Plan"
SVNUnommit="/Users/LuPengDa/Desktop/svn_dev_tmp/uncommit.txt"
SVNTemp="/Users/LuPengDa/Desktop/svn_dev_tmp"
# 使用变量
cd $SVNDirectory
# 或者
# cd ${SVNDirectory}

# 移动文件夹下所有文件到指定目录中
cp -r /Users/LuPengDa/WorkSpace/CTTQH5/Vue-CRM-DingTalk/dist/. /Users/LuPengDa/WorkSpace/CTTQH5/trunk-DEV/CRM-DingTalk/
# 删除目录
rm -rf $SVNTemp
# 删除目录下的所有文件，包括隐藏文件
rm -rf /Users/LuPengDa/WorkSpace/CTTQH5/trunk-QAS-dingTalk/cvue/CRM-WebApp/{.[^.],}*
# 删除目录下的所有文件，不包括隐藏文件
rm -rf /Users/LuPengDa/WorkSpace/CTTQH5/trunk-QAS-dingTalk/cvue/CRM-WebApp/*
# 创建目录
mkdir -p $SVNTemp
# 更新 SVN 项目
svn update ${SVNDirectory}

# SVN 文件状态写入文件中
svn status ${SVNDirectory} > ${SVNUnommit}
# 读取文件的每一行数据
cat ${SVNUncommit}| while read LINE
do
	status=${LINE:0:1}
	file=${LINE:8}

	if [[ $file = *.orig ]]; then
		# orig 对比备份文件，移动到临时目录
		rm -rf $file
	else
		if [ $status = "?" ]; then
			# 未加入版本控制的文件，加入到版本控制中
			svn add $file
		elif [ $status = "!" ]; then
			# 遗失不存在的文件则从版本控制中删除
			svn delete --force $file
		fi
	fi
done

# 遍历文件夹下的所有文件，包括隐藏文件
for file in /Users/LuPengDa/WorkSpace/CTTQH5/Vue-CRM-DingTalk/{.[^.],}*
do
	# 文件名称对比
	if [ `basename $file` != 'dist' ] && [ `basename $file` != 'node_modules' ] && [ `basename $file` != '.git' ] && [ `basename $file` != '.DS_Store' ]
	then
    	# 复制文件到文件夹中
		cp -r $file /Users/LuPengDa/WorkSpace/CTTQH5/trunk-QAS-dingTalk/cvue/CRM-WebApp/ 
	fi
done

# 判断文件是否存在，不存在则创建
AutomatorLog="/Users/LuPengDa/Desktop/AutomatorLog"
if [ ! -d $AutomatorLog ]; then 
 mkdir $AutomatorLog
fi

# 字符串处理命令：${}
# '#'：表示从左边算起第一个
# '%'：表示从右边算起第一个
# '##'：表示从左边算起最后一个
# '%%'：表示从右边算起最后一个
# '*'：表示要删除的内容，对于#和##的情况，表于删除指定字符及其左边的内容；对于%和%%的情况，表示删除指定字符及其右边的内容

var=/div1/dir2/file.tar.gz
echo ${var##*/}  # file.tar.gz
echo ${var##*.}  # gz
echo ${var#*.}  # tar.gz
echo ${var%/*}  # /div1/dir2
echo ${var%%.*}  # /div1/dir2/file

# 字符串替换：${变量/查找/替换值}  一个'/'表示替换第一个'//'表示替换所有，当查找出中出现了："/"需要转移成"\/"
test='/windows/boot'
echo ${test/windows/mac} # /mac/boot

# basename 和 dirname 命令
var=/div1/dir2/file.tar.gz
echo $(basename $var) # file.tar.gz
echo $(basename $var .gz) # file.tar

dirname $var # /div1/dir2

# $() 与 `` （反引号）都是用来做命令替换
# 即完成 `` 或者$() 里面的 命令，将其结果替换出来，再重组命令行
Result $(curl https://www.baidu.com)  # 获取百多网页
