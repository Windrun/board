<?php

namespace board;

use engine;

return (static function () {
    $app = engine\registry::get(engine\app::class);

    $app_name = 'board';

    if ($app->isRegistered($app_name) === false) {
        /**
         * App
         */
        $root_path = realpath(__DIR__) . DIRECTORY_SEPARATOR;
        $composer  = json_decode(file_get_contents($root_path . 'composer.json'), true);

        $app_data = [
            'name'           => $app_name,
            'url'            => '',                               // @deprecated
            'session_start'  => false,
            'folder'         => $root_path,
            'session_prefix' => $app_name,
            'version'        => $composer['version'],
        ];
        $app->registerCustom($app_data);
    }

    return $app->getData($app_name);
})();
