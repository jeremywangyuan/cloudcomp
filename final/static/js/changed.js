
$(document).ready(function () {
    
    
    // Init
    $('.image-section').hide();
    $('.loader').hide();
    $('#chartmain').hide();
    $('#Ramnit').hide();
    $('#Vundo').hide();
    $('#botnet').hide();
    $('#Lollipop').hide();
    $('#Simda').hide();
    $('#Tracur').hide();
    $('#Obfuscator').hide();
    $('#Gatak').hide();

    $('#result').hide();

    // function check () {
    //     var box = document.getElementById('.chartmain');
    //     box.style.visibility = box.style.visibility === "" ? "hidden" : "";
    //     if (box.style.display === "") {  
    //         box.style.display = "block"     
    //         }else {
    //         box.style.display = "";  
    //         }
        

    // }

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
	$('#imagePreview').hide();
        $('#btn-predict').show();
        $('#result').text('');
        $('#result').hide();
        readURL(this);
    });

    // Predict
    var xdatas;
    var ydatas;
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
                var infos = data.substr(data.indexOf(' ')+1);
                var urls = data.substr(0, data.indexOf(' '));
		console.log('Infos');
		    console.log(infos);
		    console.log('Urls');
		    console.log(urls);
		    $('.loader').hide();
                $('#result').fadeIn(600);
                $('#result').text(' Result:  ' + infos.split(" ")[0]);
                $('#chartmain').show();
                xdatas = infos.split(" ").slice(0,5);
                ydatas = infos.split(" ").slice(5,10);

                var label = infos.split(" ")[0];
                var y5 = parseInt(ydatas[5])/100;
                var y6 = parseInt(ydatas[6])/100;
                var y7 = parseInt(ydatas[7])/100;
                var y8 = parseInt(ydatas[8])/100;
                var y9 = parseInt(ydatas[9])/100;

                console.log(xdatas);
                console.log(ydatas);
                console.log(data);
        // $('.image-section').show()
		    $('#imagePreview').css('background-image', 'url(' + urls+ ')');
                $('#imagePreview').show();
                $('#imagePreview').fadeIn(650);
                var option = {
                    title:{
                        text:'Top 5 Probability'
                    },
                    tooltip:{},
                    legend:{
                        data:['Probability %']
                    },
                    xAxis:{
                        data:xdatas
                    },
                    yAxis:{
            
                    },
                    series:[{
                        name:'Probability %',
                        type:'bar',
                        data:ydatas
                    }]
                };
                myChart.setOption(option);
                if (label == 'Ramnit') {
                    $('#Ramnit').show();
                }
                if (label == 'Vundo') {
                    $('#Vundo').show();
                }
                if (label == 'Lollipop') {
                    $('#Lollipop').show();
                }
                if (label == 'Kelihos_ver3') {
                    $('#botnet').show();
                }
                if (label == 'Kelihos_ver1') {
                    $('#botnet').show();
                }
                if (label == 'Simda') {
                    $('#Simda').show();
                }
                if (label == 'Tracur') {
                    $('#Tracur').show();
                }
                if (label == 'Obfuscator') {
                    $('#Obfuscator').show();
                }
                if (label == 'Gatak') {
                    $('#Gatak').show();
                }
            },
            
        });
        
        
    });

});
