<?php

function parse_string(string $message)
{
    $result  = [
        'amount'   => null,
        'purse'    => null,
        'password' => null,
    ];
    $reg_exp = [
        'amount'   => '/[\d]+[.,][\d]*/',
        'purse'    => '/[\d]{15}/',
        'password' => '/[\d]{4,6}/',
    ];

    preg_match($reg_exp['amount'], $message, $m_money);
    preg_match($reg_exp['purse'], $message, $m_purse);
    preg_match($reg_exp['password'], $message, $m_password);
    if (isset($m_money[0])) {
        $result['amount'] = (float) $m_money[0];
    }
    if (isset($m_purse[0])) {
        $result['purse'] = (int) $m_purse[0];
    }
    if (isset($m_password[0])) {
        $result['password'] = (int) $m_password[0];
    }

    return $result;
}

$message = '<div class="margin-top answer">Пароль: 1536<br>Спишется 1240,21р.<br>Перевод на счет 410011789657220</div>';
$result  = parse_string($message);
var_export($result);

exit();