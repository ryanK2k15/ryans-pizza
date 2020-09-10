Stripe.setPublishableKey('pk_test_51HEzR9GJaTt6vUcmOt6kpyGPp4XLDVtJO3MQy2V4gFq4Aq7SaFM5MDWKZiCosv36WJ6hbaJrqHYOSodYKbpFR9JI00VC5PP3Tw');

var $form = $('#checkout-form');
console.log("Tpken created");

var SubmitCheckoutForm = $form.submit(function(event) {
	console.log("Tpken created");
	$form.find('button').prop('disabled', true);
	stripe.card.createToken({
		number: $('#card-number').val(),
		cvc: $('#card-cvc').val(),
		exp_month: $('#card-expiry-month').val(),
		exp_year: $('#card-expiry-year').val(),
		name: $('#card-name').val() 
	}, stripeResponseHandler);
	return false;
});

function stripeResponseHandler(status, response) {
	if(response.error){//Problem!
	console.log("Tpken created");
	//Show errors on the form
	$('#charge-error').text(response.error.message);
	$('#charge-error').removeClass('hidden');;
	$form.find('button').prop('disabled', false);//Re-enable submission
	
	} else { //Token was created!
	
		//Get the token ID:
		var token = response.id;
		console.log("Tpken created");
		//Insert the token into the form so it gets submitted to the server
		$form.append($('<input type="hidded" name="stripeToken" />').val(token));
		
		//submit the form
		$form.get(0).submit();
	}
}

module.exports = SubmitCheckoutForm;
		