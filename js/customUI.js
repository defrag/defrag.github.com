
$(document).ready(function() {		
	var newImg = '<img src="images/wave.png" alt="fly_01" />';
	for (i= 0; i < 3; i++) {
		$('.sprite').append($(newImg));
	};
});

var scrollSpeed = 60; 		// Speed in milliseconds
step = 1; 				// How many pixels to move per step
current = -1440;							
restartPosition = 0;

function scrollBg(){
	current += step;
	if (current == restartPosition){
		current = -1440;
	}
	$('.sprite').css("left", current+"px");	
}

var addEvents = function() {
	$('.floating-monster').everyTime(10, function () {
		$(".floating-monster").animate({
			top: "+=10",
			left: "+=5"
		}, 1000, 'linear').animate({
			top: "-=10",
			left: "-=5"
		}, 1000, 'linear');
	});	
	
	$(function() {	
		$(".roll").css("opacity","0");
		$(".roll").hover(function () {
				$(this).stop().animate({opacity: .7}, "slow");
			},
			function () {
				$(this).stop().animate({opacity: 0}, "slow");
			});
	});
}
var setHints = function() {
	$('input#name').attachHint('Your name:');
    $('input#email').attachHint('E-mail address:');
    $('input#subject').attachHint('Subject:');
    $('textarea#message').attachHint('Message:');
};