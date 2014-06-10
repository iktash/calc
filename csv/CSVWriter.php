<?php

require_once 'CSV.php';

class CSVWriter extends CSV
{
    public function writeRow($fields)
    {
        foreach ($this->data as $row) {
            if (! array_diff($row, $fields)) {
                return false;
            }
        }

        return fputcsv($this->handle, array_values($fields));
    }
}
