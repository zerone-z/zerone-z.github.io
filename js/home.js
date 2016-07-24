var isShowContent = true;

$(function(){
  $("pre").addClass("prettyprint linenums").attr('style', 'overflow:auto;');
  // 换行
  // white-space:pre;white-space:pre-wrap;word-break:break-all;word-wrap:break-word;

  // 窗口大小改变事件
  windowResize();
  $(window).resize(windowResize);

  // 目录
  $("#js-btn-content").click(showContent);
});

// 宽度计算
function surplusWidth() {
  var blogBodyWidth = $(document.body).width();
  if (isShowContent) {
    blogBodyWidth = blogBodyWidth - 300;
    blogBodyWidth = blogBodyWidth > 0 ? blogBodyWidth : 0;
  }
  return blogBodyWidth;
}

// 窗口大小改变事件
function windowResize() {
  var blogBodyWidth = surplusWidth();

  $(".blog-body-header").width(blogBodyWidth - 40);
  $(".blog-body").width(blogBodyWidth - 40 * 2);
}

// 目录显示设置
function showContent() {
  // 隐藏目录
  if (isShowContent) {
    isShowContent = false;
    var width = surplusWidth();
    $("#js-contents-show").animate({left: '-300px'}, 'fast');
    $(".blog-body").animate({left: '0px', width: width - 40 * 2}, 'fast');
    $(".blog-body-header").animate({left: '0px', width: width - 40}, 'fast');
  // 显示目录
  } else {
    isShowContent = true;
    var width = surplusWidth();
    $("#js-contents-show").animate({left: '0px'}, 'fast');
    $(".blog-body").animate({left: '300px', width: width - 40 * 2}, 'fast');
    $(".blog-body-header").animate({left: '300px', width: width - 40}, 'fast');
  }
}
