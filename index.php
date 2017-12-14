<?php
define('in_access', 1);
// LOAD THE MODEL
require('./model/model.php');
// Load posts
$json_posts = new Model('model/posts.json');
$posts = array_reverse($json_posts->read());

$json_words = new Model('model/word_occurance.json');
$words = array_slice(array_reverse($json_words->read()), 0, 5);

?>
<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">

  <title>The HTML5 Herald</title>
  <meta name="description" content="E-Com Front-End Assignment">
  <meta name="author" content="Giuliano Alexandru Visan">

  <!-- CSS -->
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/libraries/arc/css/arc.css">
  <!-- CSS to style the file input field as button and adjust the Bootstrap progress bars -->
  <link rel="stylesheet" href="/assets/css/jquery.fileupload.css">

  <!--[if lt IE 9]>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script>
  <![endif]-->
</head>

<body>
  <div class="row container">
    <div class="row header">
      <h1>My spectacular blog</h1>
      <h4><em>A totally false statement</em></h4>
    </div>

    <div class="row formBox box" ng-app="validationApp" ng-controller="mainController">
      <div class="sendingPost large-12 centered hidden"><img src="/assets/img/icon-loading-grey.gif"> Sending form... </div>
      <form name="postForm" id="postForm" ng-submit="submitForm()" novalidate>

        <!-- Label  Section/Row -->
        <div class="row">
          <div class="large-4 columns"><h4>New blog post</h4></div><div class="large-8 columns"></div>
        </div>
        <!-- Title, Content and Email Section/Row -->
        <div class="row">
          <div class="large-8 columns padding_0">
            <div class="row">
              <div class="small-12 large-12 columns">
                <input type="text" name="name" placeholder="*My post title [required]" id="postTitle" class="form-control" ng-model="user.name" required>
              </div>
            </div>
            <div class="row">  
              <div class="small-12 large-12 columns">
                <textarea id="postText"></textarea> 
              </div>
            </div>
            <div class="row">  
              <div class="small-6 large-6 columns">
                <input type="email" name="email" class="form-control" placeholder="*Email [required]" id="postEmail" ng-model="user.email" required>
                </div>
            </div>  
          </div>
          <div class="large-4 columns">
            <button type="submit" class="customButton" ng-disabled="postForm.$invalid">Submit</button>
            <p ng-show="postForm.name.$invalid && !postForm.name.$pristine" class="help-block error">Post Title is required.</p>
            <p ng-show="postForm.email.$invalid && !postForm.email.$pristine" class="help-block error">Please, enter a valid email.</p>
            <p class="help-block error hidden imageOrText">You need to enter a description or an image.</p>
            <p class="generalError"></p>
            <p class="successSubmit">Post submited successfully.</p>
          </div>
        </div> 
        <!-- File upload Section/Row -->
        <div class="row boxFile">
          <div class="hidden floatL text-small uploading-file large-2 medium-2 columns">
            <img src="/assets/img/icon-loading-grey.gif"> Uploading the file... 
          </div>
          <!-- The container for the uploaded files -->
          <div id="files" class="files large-6 medium-8 columns"></div>
           <!-- The fileinput-button span is used to style the file input field as button -->
          <span class="btn btn-success fileinput-button large-4 medium-3 columns">
              <i class="glyphicon glyphicon-plus"></i>
              <span class="customButton">Select files...</span>
              <!-- The file input field used as target for the file upload widget -->
              <input id="fileupload" type="file" name="files[]" multiple />
          </span>
        </div>
        <input type="hidden" name="postFile" id="postFile"/>
      </form>
    </div>

    <div class="row marginTop40"></div>

    <div class="row">
      <div class="large-4 small-12 large-push-8 columns">
        <div class="row box tagsBox">
          <div class="large-12 medium-4 columns">
            <span>Most used words here:</span>
          </div>  
          <div class="large-12 medium-8 columns">
            <dl class="tags">
              <?php foreach ($words as $key=>$word) {
               echo '<li>'.ucfirst($key).'<span class="hiddenComma">, </span></li>';
              } ?>
            </dl>
          </div> 
        </div>
      </div>
      <div class="posts large-8 small-12 large-pull-4 columns">
        <?php 
          foreach ($posts as $post) { ?>
            <div class="row box postBox marginBottom20">
              <span class="postDate"><?php echo $post['date']; ?></span>
              <div class="row">
                <div class="large-12 small-9 columns postTitle"><h4><?php echo $post['title']; ?></h4></div>
              </div>
              <div class="row marginTop5">
                <div class="large-12 columns">
                  <p style="float:left">
                    <?php if(isset($post['file'])) { echo '<img style="float:left" src="./uploads/thumbnail/'.$post["file"].'" width="200"/>'; } ?>
                    <?php if(isset($post['text'])) { echo $post['text']; } ?>
                  </p>
                </div>
              </div>
            </div>
          <?php }
        ?>
      </div>

      </div>
    </div> 
  </div>

  <!-- JS Scripts -->
  <script src="assets/libraries/arc/js/lib/jquery.js"></script>
  <script src="assets/js/scripts.js"></script>
  <script src="assets/libraries/jquery-ui.js"></script>
  <!-- File Upload -->
  <script src="/assets/libraries/file_uploader/jquery.fileupload.js"></script>
  <script src="/assets/libraries/file_uploader/jquery.iframe-transport.js"></script>
  <script src="/assets/libraries/file_uploader/jquery.ui.widget.js"></script>
  <!-- Angular is used only for FRONT END validation -->
   <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.14/angular.min.js"></script>

</body>
</html>