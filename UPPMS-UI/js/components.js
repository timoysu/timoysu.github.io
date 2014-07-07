$(document).ready(function() {

	//For checkboxes to use icons
	$('.table-checkbox-input').on('change', function() {
		if ($(this).prop('checked')) {
			$(this).siblings('span').addClass('glyphicon-ok');
		} else {
			$(this).siblings('span').removeClass('glyphicon-ok');
		}
	});

	//For checkboxes to automatically trigger select all checkbox
	$('label[for^=checkbox-], tr>td:first-child').on('click', function(event) {
		event.stopPropagation();
		var check = $('input[id^=checkbox-]:checked').length === $('input[id^=checkbox-]').length ?
			true : false;
		$('#select-all-checkbox')
			.prop('checked', check)
			.trigger('change');
	});

	//For Select All Checkbox
	$('label[for=select-all-checkbox]').on('click', function() {
		var check = $('#select-all-checkbox').prop('checked') ? true : false;
		$('input[id^=checkbox-]')
			.prop('checked', check)
			.trigger('change');
	});

});