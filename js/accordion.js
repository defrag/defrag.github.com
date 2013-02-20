
var activeNavItemClass = 'nav-active';
var plusActive = 'plus-active';

$(document).ready(function(){

	(function($) {
		  
		var activePanel = $('.accordion .container .first');
  		var allPanels = $('.accordion .container .hide').hide();
  		var firstPanel = $('.accordion .container .first').show(); 
 
  		$('.accordion .container h2').click(function() {
			activePanel.slideUp();
			activePanel = $(this).next().next();
			$('h2').toggleClass(activeNavItemClass, false);
			$(this).toggleClass(activeNavItemClass, true);
			$('.title-icon-plus').toggleClass(plusActive, false);
			$(this).next().toggleClass(plusActive, true);
			$(this).next().next().slideToggle();
    		return false;
		});
  
  		$('.accordion .container .title-icon-plus').click(function() {
			activePanel.slideUp();
			activePanel = $(this).next();
			$('.title-icon-plus').toggleClass(plusActive, false);
			$(this).toggleClass(plusActive, true);
			$('h2').toggleClass(activeNavItemClass, false);
			$(this).prev().toggleClass(activeNavItemClass, true);
			$(this).next().slideToggle();
    		return false;
  		});
  
  		$('.button').click(function() {
			activePanel.slideUp();
			activePanel =  $('.accordion .container .freelance');
			$('h2').toggleClass(activeNavItemClass, false);
			$('.accordion .last h2').toggleClass(activeNavItemClass, true);
			$('.title-icon-plus').toggleClass(plusActive, false);
			$('.accordion .last .title-icon-plus').toggleClass(plusActive, true);
			$('.accordion .container .freelance').slideToggle();
    		return false;
  		});
	})(jQuery);
});

