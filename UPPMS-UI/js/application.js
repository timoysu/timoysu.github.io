$(document).ready(function() {
	//Navlinks
	$('#main-menu ul li').on('click', function() {
		var $target = $(this).find('a');
		var link = $target.attr('data-href');
		var title = $target.text();

		$('#home-container').load(link, function() {
			$('title, #current-page-text').text(title);
		});

		toggleMenu();
	});

	//Allow Edit on Details Modal
	$('#edit-btn').on('click', function() {
		enableEdit();
	});

	//Disallow Edit on Details Modal and
	//reload data to revert any changes
	$('#cancel-edit-btn').on('click', function() {
		var $row = $('#' + $('#item-row-details').val());
		loadData($row, 'edit')
	});

});

// Dictionary of texts. Reuse as much as possible
var dictionary = {
	edit_editData : 'Edit Data',
	edit_saveChanges : 'Save Changes',
	edit_cancel : 'Cancel',
	close: 'Close'
}

//Menu Button
function toggleMenu() {
  $('#main-container').toggleClass('shift-right');
  $('#main-menu').toggleClass('shift-show');
}

//Loads data values to the Details modal
function loadData(row, use) {
	var $target = $(row);

	$('#item-row-details').val($target.attr('id'));
	$('#edit-article').val($target.data('uppms-article'));
	$('#edit-description').val($target.data('uppms-description'));
	$('#edit-account-title').val($target.data('uppms-account-title'));
	$('#edit-date-acquired').val($target.data('uppms-date-acquired'));
	$('#edit-prop-number').val($target.data('uppms-prop-number'));
	$('#edit-location').val($target.data('uppms-location'));
	$('#edit-unit-measure').val($target.data('uppms-unit-measure'));
	$('#edit-unit-value').val($target.data('uppms-unit-value'));
	$('#edit-point-person').val($target.data('uppms-point-person'));
	$('#edit-department').val($target.data('uppms-department'));
	$('#edit-ohc-quantity').val($target.data('uppms-ohc-quantity'));
	$('#edit-ohc-as-of').val($target.data('uppms-ohc-as-of'));
	$('#edit-remarks').val($target.data('uppms-remarks'));

	if (use === 'depleted') {
		$('#edit-btn').hide();
	} else {
		$('#edit-btn').show();
	}

	disableEdit();
}

//Allows editing in the details modal
function enableEdit() {
	$('#details-modal input').removeAttr('readonly');
	$('#edit-btn')
		.text(dictionary.edit_saveChanges)
		.addClass('btn-success')
		.attr('type', 'submit');
	$('#cancel-edit-btn').removeClass('hidden');
	$('#modal-close-btn').hide();
}

//Disables editing in the details modal
function disableEdit() {
	$('#details-modal input').attr('readonly', 'readonly');
	$('#edit-btn')
		.text(dictionary.edit_editData)
		.removeClass('btn-success')
		.attr('type', 'button');
	$('#cancel-edit-btn').addClass('hidden');
	$('#modal-close-btn').show();
}