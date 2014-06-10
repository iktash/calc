<?php

require_once 'CSV.php';

class CSVReader extends CSV
{
    public function findRow($fields)
    {
        foreach ($this->data as $row) {
            foreach ($fields as $key => $value) {
                if ($row[$key] != $value) {
                    continue 2;
                }
            }

            return $row;
        }

        return null;
    }
}
