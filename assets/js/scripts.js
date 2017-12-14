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
    });

    // create angular app
    var validationApp = angular.module('validationApp', []);

    // create angular controller
    validationApp.controller('mainController', function($scope) {
      // function to submit the form after all validation has occurred            
      $scope.submitForm = function() {
        // check to make sure the form is completely valid
        if ($scope.postForm.$valid) {
          // Double check Validation and Text or Image Validation
          var valid = true;
          // Validate Email
          var email = $('#postEmail').val();
          var re = /\S+@\S+\.\S+/;
          valid = re.test(email);
          // Validate Title
          var title = $('#postTitle').val();
          valid = !(title.replace(/^\s+/g, '').length == 0) ;
          // Validate Textarea or Image
          var text = $('#postText').val();
          var filename = $('#postFile').val();
          if(text.replace(/^\s+/g, '').length == 0) {
              if(!filename) { valid = false; $('.imageOrText').show(); }
          }
          // Submit Form 
          if(valid) {
            $('.formBox form').slideUp(300, function(){
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
                    if(data) {
                      $('.sendingPost').hide();
                      $('#postForm')[0].reset();
                      $('.formBox form').slideDown(300, function(){
                          $('.fileinput-button').show();
                          $('.files').html('');
                      });
                      $scope.postForm.$invalid = true;
                      $scope.postForm.$valid = false;
                      $scope.$apply();
                      if(data.response == false) {
                        $('.generalError').html(data.err);
                      } else {
                        $(".successSubmit").fadeIn('slow').animate({opacity: 1.0}, 1500).effect("pulsate", { times: 2 }, 800).fadeOut('slow');
                        var date = dateNow();
                        // Add new post to the view
                        $('.posts').prepend(_template(title, text, filename, date));
                        // Rebuild word occurances
                        if(data.wordsOccurance) {
                          $('dl.tags').html('');
                          $.each(data.wordsOccurance, function(word, occurances) {
                            $('dl.tags').append('<li>'+word+'<span class="hiddenComma">, </span></li>');
                          });
                        }
                      }
                      // Reset validation 
                      valid = false;
                    }
                  }
              })
            })
          }    
        }
      };
    });

    // Reset error alerts on input focus
    $("input, textarea").focusin(function() { $('.hidden').hide(); $('.generalError').html(''); });

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

    function dateNow() {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var hh = today.getHours();
      var ii = today.getMinutes();

      var yyyy = today.getFullYear();
      if(dd<10){
          dd='0'+dd;
      } 
      if(mm<10){
          mm='0'+mm;
      } 
      return  yyyy+'/'+mm+'/'+dd+' '+hh+':'+ii;
    }

    function _template(title, text, filename, date) {
      var img = (filename) ? '<img style="float:left" src="./uploads/thumbnail/'+filename+'" width="200">' : '';
      return '<div class="row box postBox marginBottom20">'+
          '<span class="postDate">'+date+'</span>'+
          '<div class="row">'+
            '<div class="large-12 small-9 columns postTitle"><h4>'+title+'</h4></div>'+
          '</div>'+
          '<div class="row marginTop5">'+
            '<div class="large-12 columns">'+
              '<p style="float:left">'+
                img+''+text+'</p>'+
            '</div>'+
          '</div>'+
        '</div>';
    }   
});