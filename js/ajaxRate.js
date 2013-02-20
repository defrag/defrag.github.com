
$(document).ready(function(){
	$('.self-rate').each(function(i) {
		var widget = this;
		var out_data = {
			'widget_id' : $(widget).attr('id'), 
			'action' : 'rate'
		};
		$.ajax({
            url: 'php/mainHandler.php',
            type: 'POST',
            traditional: true,
            data: out_data,
            success: function(response){
				if(response){
					var responseObj = jQuery.parseJSON(response);
					if(responseObj.ResponseData) {
						if(responseObj.ResponseData.Box_Num) {
							set_ratings(widget, responseObj.ResponseData.Box_Num);
							
						}
					}
				}
			}
		});
	});
});

function set_ratings(widget, box_num) {
	$(widget).find('.box-' + box_num).prevAll().andSelf().addClass('ratings-self-appraisal');
	$(widget).find('.box-' + box_num).nextAll().removeClass('ratings-self-appraisal'); 
}