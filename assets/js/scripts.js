$(function () {
    'use strict';
    // Change this to the location of your server-side upload handler:
    var url = 'controller.php';
    var fileupload = $('#fileupload').fileupload({
        url: url,
        dataType: 'json',
        formData: {'action': 'upload'},
        disableImageResize : true,
            add: function(e, data) {
            $('.fileinput-button').hide();
            $('.uploading-file').show();
            data.submit();
        },
        done: function (e, data) {
            $.each(data.result.files, function (index, file) {
                $('<p/>').attr('data-rel', file.name).text(file.name).append(' <span class="removeFile">(X Remove Image)</span>').appendTo('#files');
                $('#postFile').val(file.name);
            });

            $('.uploading-file').hide();

            $('.removeFile').on('click', function() {
                var imageName = $(this).parent().attr('data-rel');
                removeImage(imageName);
            });
        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled'); 

    // create angular app
    var validationApp = angular.module('validationApp', []);

    // create angular controller
    validationApp.controller('mainController', function($scope) {
        // function to submit the form after all validation has occurred            
        $scope.submitForm = function() {
            // check to make sure the form is completely valid
            if ($scope.postForm.$valid) {
                // Double check Validation and Text or Image Validation
                // Validate Email
                var email = $('#postEmail').val();
                var valid = true;
                var re = /\S+@\S+\.\S+/;
                valid = re.test(email);
                // Validate Title
                var title = $('#postTitle').val();
                valid = !(title.replace(/^\s+/g, '').length == 0) ;
                // Validate Textarea or Image
                var text = $('#postText').val();
                var filename = '';
                if(text.replace(/^\s+/g, '').length == 0) {
                    filename = $('#postFile').val();
                    if(!filename) { valid = false; $('.imageOrText').show(); }
                }

                // Submit Form 
                if(valid) {
                    $('.formBox form').slideUp(200, function(){
                        $('.sendingPost').show();
                        $.ajax({
                            url: url,
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                'action': 'add_post',      
                                'post_title': title,
                                'post_text':  text,
                                'post_file':  filename,
                                'post_email': email,
                            },
                            success: function(data) {
                                if(data.response == true) {
                                    $('.sendingPost').hide();
                                    $('#postForm')[0].reset();
                                    $('.formBox form').slideDown(200, function(){
                                        $('.fileinput-button').show();
                                        $('.files').html('');
                                    });
                                    $scope.postForm.$invalid = true;
                                    $scope.postForm.$valid = false;
                                    $scope.postForm
                                    console.log($scope.postForm);
                                }
                            }
                        })
                    })
                }    
            }

        };
    });

    // Reset error alerts on input focus
    $("input, textarea").focusin(function() { $('.hidden').hide(); });

    // Remove an uploaded image
    function removeImage(imageName) {
        if(imageName) {
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: { 'action': 'remove_image', 'image_name': imageName },
                success: function(data) {
                    if(data.response == true) {
                        $('.files').html('');
                        $('.fileinput-button').show();
                        $('#postFile').val('');
                    }
                }
            })
        }
    }    
});