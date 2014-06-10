<?php

abstract class CSV
{
    protected $handle;
    protected $headers;
    protected $data;

    public function __construct($file)
    {
        $this->parseFile($file);
    }

    protected function parseFile($file)
    {
        if (($this->handle = fopen($file, "a+")) !== FALSE) {
            $data = fgetcsv($this->handle, 1000, ",");

            if ($data) {
                $this->headers = $data;
            }
            
            while (($data = fgetcsv($this->handle, 1000, ",")) !== FALSE) {
                foreach ($data as $key => $value) {
                    $temp[$this->headers[$key]] = $value;
                }
                $this->data[] = $temp;
            }
        }
    }
}
