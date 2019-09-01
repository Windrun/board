<?php

require realpath(__DIR__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'apps' . DIRECTORY_SEPARATOR . 'autoload.php';

$code   = 1;
$html   = null;
$result = null;
$page   = null;
$ajax   = null;

if (isset($_GET['html'])) {
    if (is_string($_GET['html']) && $_GET['html'] === 'board_popup_create_url') {
        $ajax                = [
            'url'    => 'ajax.php?action=board_create_url',
            'type'   => 'post',
            'fields' => [
                'board-popup-url',
                'board-popup-title',
                'board-popup-color',
                'board-popup-row',
                'board-popup-col',
            ],
            'button' => 'board-popup-button',
        ];
        $html[$_GET['html']] = [
            'header' => '
<h2>Board - Создание ссылки</h2>
            ',
            'body'   => '
<div id="board-popup-body" class="">
    <input type="hidden" id="board-popup-row" name="row"/>
    <input type="hidden" id="board-popup-col" name="col"/>
    <div class="row">
        <div class="row-label">
            <label for="board-popup-url">Ссылка</label>
        </div>
        <div class="row-data row-data-input">
            <input type="text" id="board-popup-url" name="url" placeholder="https://windrun.ru"/>
        </div>
    </div>
    <div class="row">
        <div class="row-label">
            <label for="board-popup-url">Заголовок</label>
        </div>
        <div class="row-data row-data-input">
            <input type="text" id="board-popup-title" name="title" placeholder="Самая крутая ссылка интернета"/>
        </div>
    </div>
    <div class="row">
        <div class="row-label">
            <label for="board-popup-color">Цвет ссылки</label>
        </div>
        <div class="row-data row-data-input">
            <input type="text" id="board-popup-color" name="color" value=""/>
        </div>
    </div>
</div>
            ',
            'footer' => '
<div class="popup-controls clearfix">
    <div class="fl_r">
        <button type="button" id="board-popup-button" class="flat_button popup-button board-popup-button">Добавить</button>
    </div>
</div>
            ',
        ];
    }
}

try {
if (isset($_GET['action'])) {
    if ($_GET['action'] === 'board_create_url') {
        $url_class = new board\url\url();

        $row   = engine\request::post('row');
        $col   = engine\request::post('col');
        $color = engine\request::post('color');
        $url   = engine\request::post('url');
        $title = engine\request::post('title');

        $create_url_data = new board\url\save\data();
        if ($row) {
            $create_url_data->setRow($row);
        }
        if ($col) {
            $create_url_data->setCol($col);
        }
        if ($color) {
            $create_url_data->setColor($color);
        }
        if ($url) {
            $create_url_data->setUrl($url);
        }
        if ($title) {
            $create_url_data->setTitle($title);
        }

        if ($url_class->save($create_url_data)) {
            $code = 0;
        }
    }
}
} catch (\Exception $e) {
}

header('Content-Type: application/json; charset=utf-8');

print json_encode([
    'code'   => $code,
    'result' => $result,
    'html'   => $html,
    'page'   => $page,
    'ajax'   => $ajax,
]);