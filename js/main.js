$(document).ready(function() {
	$(window).load(function(){
		$('.doc-loader').fadeOut('slow');
    });
    addEvents();   
	setHints();
	$(function() {
		if (window.PIE) {
			$('.rounded').each(function() {
				PIE.attach(this);
			});
		}
	});
	jQuery(function($){
		$('ul#items').easyPaginate({
			step:8
		});	
	});  
	//var init = setInterval("scrollBg()", scrollSpeed);
});