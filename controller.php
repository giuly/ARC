<?php
error_reporting(E_ALL | E_STRICT);

// FILE UPLOAD
ini_set('memory_limit', '1024M');
require('libraries/UploadHandler.php');

// ACTIONS - UPLOAD, REMOVE
$action = (isset($_POST["action"])) ? $_POST["action"] : null;

switch ($action) {
	case 'upload':
		$options = array ('upload_dir' => dirname(__FILE__) . '/uploads/');
		$upload_handler = new UploadHandler($options);
		break;

	case 'remove_image':
		//remove file
		$fileName = $_POST['image_name'];
		if(!file_exists(realpath("./uploads").'/'.$fileName)) { echo '{"response": "error", "code": "file_not_found"}'; exit(); }
		$delFile = unlink(realpath("./uploads").'/'.$fileName);
		if(!$delFile) { echo '{"response": "error", "code": "disk_del_error"}'; exit(); }
		echo '{"response": true}';
		break;

	case 'add_post':
		sleep(2);
		echo '{"response": true}';
		break;

	
	default:
		# code...
		break;
}

function x($x) {
	echo '<pre>';
	print_r($x);
	echo '</pre>';
}