$(document).ready(function () {
    // Init
    $('.image-section').hide();
    $('.loader').hide();
    $('#result').hide();

    // Upload Preview
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                //$('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
                $('#imagePreview').hide();
                //$('#imagePreview').fadeIn(650);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    $("#imageUpload").change(function () {
        $('.image-section').show();
        $('#btn-predict').show();
        $('#result').text('');
        $('#result').hide();
	    $('#imagePreview').hide();
        readURL(this);
    });

    // Predict
    $('#btn-predict').click(function () {
        var form_data = new FormData($('#upload-file')[0]);

        // Show loading animation
        $(this).hide();
        $('.loader').show();

        // Make prediction by calling api /predict
        $.ajax({
            type: 'POST',
            url: '/predict',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            async: true,
            success: function (data) {
                // Get and display the result
		console.log(data);
		var infos = data.substr(data.indexOf(' ')+1);
		var urls = data.substr(0, data.indexOf(' '));
		console.log(infos);
		    console.log(urls);
		$('.loader').hide();
                $('#result').fadeIn(600);
                $('#result').text(' Result:  ' + infos);
	//$('.image-section').show()
		 $('#imagePreview').css('background-image', 'url(' + urls+ ')');
                $('#imagePreview').hide();
                $('#imagePreview').fadeIn(650);
                console.log('Success!');
            },
        });
    });

});
