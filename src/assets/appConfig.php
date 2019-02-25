<?php
session_start();
if (!isset($_SESSION['token']))
{
	$_SESSION['token'] = md5(uniqid(rand(), TRUE));
	$_SESSION['token_time'] = time();
}
header("access-control-expose-headers: X-XSRF-TOKEN");
header('X-XSRF-TOKEN: ' .  $_SESSION['token']);

echo file_get_contents('appConfig.json');
?>