<?php

namespace board;

use engine;
/**
 * Composer
 */
require realpath(__DIR__) . DIRECTORY_SEPARATOR . 'extends' . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';

engine\app::loadAppConf(require 'composer.php');

/**
 * Init site: board
 */
require_once 'config' . DIR_SEP . 'conf.php';