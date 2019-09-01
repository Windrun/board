<?php

require realpath(__DIR__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'apps' . DIRECTORY_SEPARATOR . 'autoload.php';

if ($route === '') {
    header('Location: /board');
}

$projects = [
    'board' => 'board',
];

/**
 * Project: Board
 */
$url = new board\url\url();
$board_data_cells = $url->getAll();
if (count($board_data_cells) === 0) {
    $board_data_cells['12_13'] = [
        'color'       => 'red',
        'url'         => 'https://www.youtube.com/watch?v=LuhLADcx2s8',
        'title'       => 'RTX 2070 SUPER vs GTX 1080 Ti Test in 10 Games',
        'description' => '',
    ];
}
$board_data = [
    'cells' => $board_data_cells,
];

/**
 * TEMPLATE
 */
include 'index.phtml';