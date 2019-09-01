<?php

namespace board\url\save;

use engine;

class data extends engine\data\data
{
    /**
     * @param string $url
     */
    public function setUrl(string $url)
    {
        if (engine\checker::isUrl($url)) {
            $this->set('url', $url);
        }
    }

    /**
     * @param string $col
     */
    public function setCol(string $col)
    {
        if (trim($col)) {
            $this->set('col', $col);
        }
    }

    /**
     * @param string $row
     */
    public function setRow(string $row)
    {
        if (trim($row)) {
            $this->set('row', $row);
        }
    }

    /**
     * @param string $color
     */
    public function setColor(string $color)
    {
        if (trim($color)) {
            $this->set('color', $color);
        }
    }

    /**
     * @param string $title
     */
    public function setTitle(string $title)
    {
        if (trim($title)) {
            $this->set('title', $title);
        }
    }

    /**
     * @return mixed
     */
    public function getRow()
    {
        return $this->data['row'];
    }

    /**
     * @return mixed
     */
    public function getCol()
    {
        return $this->data['col'];
    }

    /**
     * @return mixed
     */
    public function getTitle()
    {
        return $this->data['title'];
    }

    /**
     * @return mixed
     */
    public function getUrl()
    {
        return $this->data['url'];
    }

    /**
     * @return mixed
     */
    public function getColor()
    {
        return $this->data['color'];
    }
}
