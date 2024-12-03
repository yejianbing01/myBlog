---
title: 'DOM笔记'
date: '2023-10-16'
---

# Document

document
文档对象，用于操作页面元素
location
地址对象，用于操作URL地址
navigator
浏览器对象，用于获取浏览器版本信息
history
历史对象，用于操作浏览历史
screen
屏幕对象，用于操作屏幕宽度高度

## Location
代表浏览器的地址信息，通过Location可以获取到地址栏信息，或者浏览器跳转页面

如果直接打印location,则可以获取到地址栏的信息（当前页面的完整路径）

如果直接将location属性修改为一个完整的路径，或者相对路径，则页面会自动跳转到该路径，并且会生成相应的历史记录
*常用属性：

- location.search：返回当前URL的查询部分。即’?'号之后的部分

- location.hash：返回URL中’#'开始的内容

- location.host：返回URL中的主机名和端口号

- location.hostname：返回URL中的主机名和端口号

- location.href：返回完整的URL

- location.pathname:返回路径名

- location.port：返回端口号

- location.protocol：返回网络协议

- location.assign():用来跳转到其他的页面，作用和直接修改location一样

- location.reload():重新加载当前页面，作用和刷新界面按钮一样,如果在方法中传递一个true作为参数，则会强制晴空缓存刷新页面

- location.replace():可以使用一个新的页面替换当前页面，调用完毕也会跳转页面;不会生成历史记录，不能使用回退按钮回退

## History
- 代表浏览器的历史记录，可以通过对象来操作浏览器的历史记录
- 由于隐私原因，该对象不能获取到具体的历史记录，只能操作浏览器向前或者向后翻页，而且该操作只在当次访问时有效
- history.length属性:可以获取到当前访问的链接数量
- history.back():可以用来回退到上一个页面，作用和浏览器的回退按钮一样
- history.forward():可以跳转下一个页面。作用和浏览器的前进按钮一样
- history.go():可以用来跳转到指定的页面。他需要一个整数作为参数
- 1：表示向前跳转一个页面 相当于forward()
- 2：表示向前跳转两个页面
- -1：表示向后跳转一个页面 相当于back()
- -2：表示向后跳转两个页面

## window对象常用方法
- alert() 提示对话框
- confirm() 判断对话框
- prompt() 输入对话框
- open() 打开窗口
- close() 关闭窗口
- setTimeout() 开启“一次性”定时器
- clearTimeout() 关闭“一次性”定时器
- setInterval() 开启“重复性”定时器
- clearInterval() 关闭“重复性”定时器

- document.getElementById() 通过id获取元素
- document.getElementsByTagName() 通过标签名获取元素
- document.getElementsByClassName() 通过class获取元素
- document.getElementsByName() 通过name获取元素
- document.querySelector() 通过选择器获取元素，只获取第1个
- document.querySelectorAll() 通过选择器获取元素，获取所有
- document.createElement() 创建元素节点
- document.createTextNode() 创建文本节点
- document.write() 输出内容
- document.writeln() 输出内容并换行