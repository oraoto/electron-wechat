/*
* @Author: Administrator
* @Date:   2016-12-26 14:57:08
* @Last Modified by:   Administrator
* @Last Modified time: 2016-12-28 10:22:25
*/

// 'use strict';


$(function(){
	$('.chatContact .chat_item').click(function(event) {
		$(this).addClass('active').parent().siblings().children('.chat_item').removeClass('active');
	});


	$('.tab .tab_item').click(function(event) {
		$(this).addClass('on').siblings().removeClass('on');
		var num = $(this).index();
		$('.nav_view').eq(num).show().siblings('.nav_view').hide();
	});

	$('.ngdialog .ngdialog-close').click(function(event) {
		$('#fzbox').hide();
	});
	$('.ngdialog .btn_default').click(function(event) {
		$('#fzbox').hide();
	});

	// 右上角菜单
	$('.nickname .web_wechat_add').toggle(function() {
		$('.system_menu').show();
	}, function() {
		$('.system_menu').hide();
	});

	$('.friend_item').click(function(event) {
		$(this).addClass('active').siblings().removeClass('active')
	});
	
})


