<?php
/**
 * Анкета для торгових палат і мовних компаній (сторінка Partners — Chambers). Захист — у _lib.php.
 */
declare(strict_types=1);
require __DIR__ . '/_lib.php';

$page = 'chambers';
[$config, $lang] = dtx_guard($page);

$f = [
    'country'      => dtx_line('country', 2),
    'province'     => dtx_line('province', 120),
    'city'         => dtx_line('city', 120),
    'district'     => dtx_line('district', 120),
    'postcode'     => dtx_line('postcode', 20),
    'organisation' => dtx_line('organisation', 160),
    'address'      => dtx_line('address', 240),
    'phone'        => dtx_line('phone', 40),
    'email'        => dtx_email('email'),
    'websiteUrl'   => dtx_line('websiteUrl', 200),
    'registration' => dtx_line('registration', 80),
    'affiliations' => dtx_line('affiliations', 240),
    'comments'     => dtx_text('comments', 4000),
];
$consent = ($_POST['consent'] ?? '') === '1';

$required = ['country', 'city', 'district', 'postcode', 'organisation', 'address', 'phone', 'email', 'registration'];
$errors = array_values(array_filter($required, fn($k) => $f[$k] === ''));
if ($f['country'] !== '' && !preg_match('/^[A-Z]{2}$/', $f['country'])) $errors[] = 'country';
if ($f['phone'] !== '' && !preg_match('/^[0-9 +().\-]{5,40}$/', $f['phone'])) $errors[] = 'phone';
if ($f['websiteUrl'] !== '' && !filter_var($f['websiteUrl'], FILTER_VALIDATE_URL)) $errors[] = 'websiteUrl';
if (!$consent) $errors[] = 'consent';
if ($errors) dtx_respond(422, 'invalid', $lang, $page, ['fields' => array_values(array_unique($errors))]);

$lines = ["Market survey ({$lang}) — " . gmdate('Y-m-d H:i') . ' UTC', ''];
foreach ($f as $k => $v) {
    if ($k === 'comments') continue;
    $lines[] = str_pad($k . ':', 14) . ($v !== '' ? $v : '—');
}
$lines[] = '';
$lines[] = $f['comments'] !== '' ? $f['comments'] : '(no comments)';

$sent = dtx_mail($config, "Market survey: {$f['organisation']} ({$f['country']})", $lines, $f['email']);
dtx_respond($sent ? 200 : 502, $sent ? 'ok' : 'send_failed', $lang, $page);
