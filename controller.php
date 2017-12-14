<?php
if (!defined('in_access') && !isset($_POST['action']) ) { die('err: not allowed'); }
// Error messages according to their code
$err_code = array(
	"invalid_account" => "Submission Failed [error: Invalid Account]",
	"invalid_ext"     => "Submission Failed [error: Invalid File Extension]",
	"invalid_referer" => "Submission Failed [error: Invalid File Request]"
);

// FILE UPLOAD LIBRARY
require('./libraries/UploadHandler.php');

// IMAGE RESIZE LIBRARY
require('./libraries/ImageResize.php');

// LOAD THE MODEL
require('./model/model.php');

// ACTIONS - UPLOAD, REMOVE
$action = (isset($_POST["action"])) ? $_POST["action"] : null;

switch ($action) {
	case 'upload':
		$options = array (
			'upload_dir' => dirname(__FILE__) . '/uploads/',
			'image_file_types' => '/\.(jpe?g|png)$/i',
			'image_versions' => array(
        'thumbnail' => array(
          'max_width' => 200,
          'max_height' => 200
        )
      )
		);
		$upload_handler = new UploadHandler($options);
		break;

	case 'remove_image':
		//remove file
		$delFile = remove_image($_POST['image_name']);
		if(!$delFile) { echo '{"response": "error", "code": "disk_del_error"}'; exit(); }
		echo '{"response": true}';
		break;

	case 'add_post':
		// Back End Validation
		/**
		 * The Email address submitted equals the one of the blog owner
		 * The uploaded file is of a supported type: either jpg or png
		 * The post was submitted by an authorized source, i.e. the blog frontend
		 */
		$params = array(
			'title' => (isset($_POST['post_title'])) ? trim($_POST['post_title']) : null,
			'text'  => (isset($_POST['post_text'])) ? trim($_POST['post_text']) : null,
			'email' => (isset($_POST['post_email'])) ? trim($_POST['post_email']) : null,
			'file'  => (isset($_POST['post_file'])) ? trim($_POST['post_file']) : null,
		);

		$invalid = validate($params);
		if($invalid) {
			// Validation didn't pass. Return apropiate error message
			remove_image($params['file']);
			echo '{"response": false, "err": "'.$invalid['err'].'"}'; exit();
		} else {			
			$date = date('Y/m/d H:i');
			$params['date'] = $date;
			// Save post to "db"
			save_post($params);
			echo '{"response": true}';
		} 
		break;

	
	default:
		# code...
		break;
}

/**
 * Validate params according to requirements
 * @param array
 * @return boolean
 */
function validate($params) {

	// This is not a good practice, but for the sake of this demo..
	global $err_code;
	$file = new Model('model/accounts.json');
	$emails = $file->read();
	// Check email account
	if(!in_array($params['email'], $emails[0])) {
		return array('err' => $err_code['invalid_account']);
	}
	// Check if the file extension is JPG or PNG
	if($params['file'] != null) {
		$filename = explode('.', $params['file']);
		$extension = strtolower(end($filename));

		if(!in_array($extension, ['png', 'jpg'])) {
			return array('err' => $err_code['invalid_ext']);
		}
	}
	// [Not configured] Check request source
	$headers = getallheaders();
	if(!in_array($headers['Referer'], [/*here should be a white list of referers*/]) && false) {
		return array('err' => $err_code['invalid_referer']);
	}

	return false;
}

function save_post($params) {
	// Check if image is resized - if not resize it and remove original
	if($params['file'] != null) { check_image_size($params['file']); }

	// Save all the words that are longer than 4 characters
	if($params['text'] != null) { save_words_longer_than_x($params['text'], 4); }

	// Save post
	$file = new Model('model/posts.json');
	$posts = $file->read();
	if(!empty($posts)) {
		array_push($posts, $params);
		$file->write($posts);
	} else {
		$file->write(array($params));
	}

}

/**
 * Remove an image and its thumbnail
 * @param string - image name
 * @return boolean	
 */
function remove_image($fileName, $thumb=true) {
	if(file_exists(realpath("./uploads").'/'.$fileName)) {
		$delFileOriginal = unlink(realpath("./uploads").'/'.$fileName);
		if($thumb) { $delFileThumb = unlink(realpath("./uploads").'/thumbnail/'.$fileName); } else { $delFileThumb = true; }
		return $delFileThumb && $delFileOriginal;
	}
	return false;
}

/************************************************************************* Helpers/Utility ***************************************************************************************

/**
 * I didn't use PHP built in getallheaders because it doesn't support NGINX
 * @return array - header details
 */
function getallheaders() { 
	$headers = []; 
	foreach ($_SERVER as $name => $value) { 
		if (substr($name, 0, 5) == 'HTTP_') { 
			$headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value; 
		} 
	} 
	return $headers;  
}

/**
 * Check if the image has a with of 200px.
 * This should be true because the image was resized at upload
 * @param string - image name
 * @return boolean
 */
function check_image_size($filename) {
	try {
		$base_url = './uploads/thumbnail/';
		$image_props = getimagesize($base_url . $filename);
		if($image_props[0] != 200) {
			// Resize image to width 200px
			resize_image($base_url . $filename, 200);
		}
		// Remove original image
		remove_image($filename, false);
	} catch(Exception $e) {
		echo 'Caught exception: ',  $e->getMessage(), "\n";
	}
	
}

/**
 * Resize an image at $maxDim
 * @param string filename
 * @param int width
 * @return boolean
 */
function resize_image($filename, $maxDim) {
	$image = new ImageResize($filename);
	$image->resizeToWidth(200);
	$image->save($filename);
}

/**
 *
 */
function save_words_longer_than_x($text, $length) {
	$unique_words = array();
	$all_words = str_word_count($text, 1);
	foreach ($all_words as $word) {
		if(strlen($word) > $length) {
			if( isset($unique_words[$word]) ) { $unique_words[$word]++; } else { $unique_words[$word] = 1; }
		}
	}
	if(!empty($unique_words)) {
		$file = new Model('model/word_occurance.json');
		$occurances = $file->read();
		if(empty($occurances)) {
			$file->write($unique_words);
		} else {
			foreach ($unique_words as $key => $value) {
				if(isset($occurances[$key])) {
					$occurances[$key] += $unique_words[$key];
				} else {
					$occurances[$key] = $unique_words[$key];
				}
			}
			asort($occurances);
			$file->write($occurances);
		}
	}
}

function x($x) {
	echo '<pre>';
	print_r($x);
	echo '</pre>';
}