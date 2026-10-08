<?php
/**
 * Форма зв'язку (сторінки Contact і Partners). Захист — у _lib.php.
 */
declare(strict_types=1);
require __DIR__ . '/_lib.php';

$page = in_array($_POST['page'] ?? '', ['contact', 'partners'], true) ? $_POST['page'] : 'contact';
[$config, $lang] = dtx_guard($page);

$topics = ['demo', 'partnership', 'provider', 'press', 'support'];

$firstName = dtx_line('firstName', 80);
$lastName  = dtx_line('lastName', 80);
$email     = dtx_email('email');
$subject   = dtx_line('subject', 160);
$topic     = in_array($_POST['topic'] ?? '', $topics, true) ? $_POST['topic'] : '';
$message   = dtx_text('message', 4000);
$consent   = ($_POST['consent'] ?? '') === '1';

$errors = [];
if ($firstName === '') $errors[] = 'firstName';
if ($lastName === '')  $errors[] = 'lastName';
if ($email === '')     $errors[] = 'email';
if ($subject === '')   $errors[] = 'subject';
if (mb_strlen($message) < 10) $errors[] = 'message';
if (!$consent) $errors[] = 'consent';
if ($errors) dtx_respond(422, 'invalid', $lang, $page, ['fields' => $errors]);

$sent = dtx_mail($config, "Website ({$page}): {$subject}", [
    "Name:    {$firstName} {$lastName}",
    "Email:   {$email}",
    "Topic:   " . ($topic ?: '—'),
    "Subject: {$subject}",
    "Page:    {$page} ({$lang})",
    "Date:    " . gmdate('Y-m-d H:i') . ' UTC',
    '',
    $message,
], $email);

dtx_respond($sent ? 200 : 502, $sent ? 'ok' : 'send_failed', $lang, $page);
