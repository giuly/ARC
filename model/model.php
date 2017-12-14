<?php

Class Model {

  private $file;

  function __construct($filename) {
    $this->file = $filename;
  }

  public function read() {
    try{
      $json_data = file_get_contents($this->file, true);
      // Converts json data into array
      $arr_data = json_decode($json_data, true);
      return $arr_data;
    } catch(Exception $e) {
      echo 'Caught exception: ',  $e->getMessage(), "\n";
    }
  }

  public function write($arr_data) {
    try {
      $jsondata = json_encode($arr_data, JSON_PRETTY_PRINT);
     //write json data into data.json file
      file_put_contents($this->file, $jsondata);
    } catch(Exception $e) {
      echo 'Caught exception: ',  $e->getMessage(), "\n";
    }
  }

}