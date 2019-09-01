<?php

namespace board\url;

use engine;

class url
{
    protected $save_class;

    protected $data;
    protected $file = 'url.json';

    public function __construct()
    {
        $this->file = engine\path::get('board_storage') . $this->file;

        $this->load();
    }

    /**
     *
     */
    protected function load()
    {
        $data = is_file($this->file) ? file_get_contents($this->file) : null;
        if ($data !== null) {
            $data = json_decode($data, true);
        }
        if (!is_array($data)) {
            $data = [];
        }

        $this->data = $data;
    }

    /**
     * @return bool
     * @throws \Exception
     */
    public function write()
    {
        $data = json_encode($this->data);
        return engine\file::write($this->file, $data);
    }

    /**
     * @return mixed
     */
    public function getAll()
    {
        if (count($this->data) === 0) {
            $this->data['12_13'] = [
                'color'       => 'red',
                'url'         => 'https://www.youtube.com/watch?v=LuhLADcx2s8',
                'title'       => 'RTX 2070 SUPER vs GTX 1080 Ti Test in 10 Games',
                'description' => '',
            ];
        }

        return $this->data;
    }

    /**
     * @param save\data $data
     *
     * @return bool
     * @throws \Exception
     */
    public function save(save\data $data)
    {
        $data_arr = $data->getAll();
        $this->data[$data->getRow() . '_' . $data->getCol()] = $data_arr;

        return $this->write();
    }
}
