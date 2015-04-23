jQuery(document).ready(function ($) {

	/*
	http://stackoverflow.com/a/28624367/1414881
	https://www.googleapis.com/pagespeedonline/v3beta1/mobileReady?key=AIzaSyDkEX-f1JNLQLC164SZaobALqFv4PHV-kA&screenshot=true&snapshots=true&locale=en_US&url=http%3A%2F%2Ffacebook.com%2F&strategy=mobile&filter_third_party_resources=false&callback=_callbacks_._Ce2bYp0wchLY
	 */

	var myFirebaseRef = new Firebase('https://mobile-friendly-test.firebaseio.com/'),
		apiEnpoint = 'https://www.googleapis.com/pagespeedonline/v3beta1/mobileReady?key=AIzaSyDkEX-f1JNLQLC164SZaobALqFv4PHV-kA&screenshot=true&snapshots=true&locale=en_US&strategy=mobile&filter_third_party_resources=false&url=',
		form = $('#mobilefriendly'),
		output = $('#output'),
		phone = $('#phone'),
		submit = $('#submit');

	form.on('submit', function (event) {
		event.preventDefault();

		// Get the website URL
		var url = $('#url').val();

		// Update the UI
		submit.prop('disabled', true).text('Processing...');
		$('.default').fadeOut('fast', function () {
			$(this).addClass('hidden');
			$('.loading').removeClass('hidden');
		});

		// Geolocation Data
		var geoData;
		$.getJSON('//www.telize.com/geoip?callback=?', function (json) {
			geoData = json;
		});

		/*
		Serializes a form into a JavaScript Object
		https://github.com/marioizquierdo/jquery.serializeJSON
		https://github.com/macek/jquery-serialize-object
		 */
		var formData = form.serializeJSON();

		// AJAX
		$.getJSON(apiEnpoint + encodeURIComponent(url), function (json) {

			// Save Data to Firebase
			var postRef = myFirebaseRef.push();
			var additionalData = {
				mobileFriendly: json.ruleGroups.USABILITY.pass,
				geolocation: geoData,
				timeStamp: $.now()
			};
			$.extend(true, formData, additionalData);
			postRef.set(formData);

			// Send summary to client by email

			// Update the UI			
			submit.prop('disabled', false).text('Check Now');
			output.removeClass('hidden');

			// Convert to valid base64
			// http://stackoverflow.com/a/1374794/1414881
			var safeb64 = json.screenshot.data.replace(/_/g, '/').replace(/-/g, '+');
			var dynamicItems = '';

			if (json.ruleGroups.USABILITY.pass === true) {

				output.html('<div class="alert alert-success" role="alert">Your site is mobile friendly. Congrats!</div>');
				phone.html('').append('<img src="data:' + json.screenshot.mime_type + ';base64,' + safeb64 + '" width="' + json.screenshot.width + '" height="' + json.screenshot.height + '" alt="">');

			} else {

				$.each(json.formattedResults.ruleResults, function (index, val) {
					dynamicItems += '<li id=' + index + '>' + val.localizedRuleName + '</li>';
				});

				output.html('<div class="alert alert-danger" role="alert"><strong>Oh snap!</strong> Your website is not mobile friendly.</div>');
				output.append('<ul>' + dynamicItems + '</ul>');
				phone.html('').append('<img src="data:' + json.screenshot.mime_type + ';base64,' + safeb64 + '" width="' + json.screenshot.width + '" height="' + json.screenshot.height + '" alt="">');

			}

		});
	});
});