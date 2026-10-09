<?php
/**
 * Форма зв'язку (сторінки Contact і Partners). Захист — у _lib.php.
 */
declare(strict_types=1);
require __DIR__ . '/_lib.php';

$page = in_array($_POST['page'] ?? '', ['contact', 'partners'], true) ? $_POST['page'] : 'contact';
[$config, $lang] = dtx_guard($page);

// Ключ теми з форми → назва для нас у листі (ключі — як у ContactForm.astro)
$topics = [
    'demo'        => 'Platform demo',
    'partnership' => 'Partnership',
    'provider'    => 'Territorial representative',
    'press'       => 'Press',
    'support'     => 'Support',
];

$firstName = dtx_line('firstName', 80);
$lastName  = dtx_line('lastName', 80);
$email     = dtx_email('email');
$subject   = dtx_line('subject', 160);
$topic     = $topics[(string)($_POST['topic'] ?? '')] ?? '';
$message   = dtx_text('message', 4000);

$errors = [];
if ($firstName === '') $errors[] = 'firstName';
if ($lastName === '')  $errors[] = 'lastName';
if ($email === '')     $errors[] = 'email';
if ($subject === '')   $errors[] = 'subject';
if (mb_strlen($message) < 10) $errors[] = 'message';
if ($errors) dtx_respond(422, 'invalid', $lang, $page, ['fields' => $errors]);

// Тема — на початку теми листа: видно одразу у списку листів, зручно для фільтрів пошти.
// На Partners вибору теми немає — там позначаємо сторінку.
$tag = $topic !== '' ? $topic : ($page === 'partners' ? 'Partners page' : 'No topic');

$sent = dtx_mail($config, "[Website · {$tag}] {$subject}", [
    "Topic:   {$tag}",
    "Name:    {$firstName} {$lastName}",
    "Email:   {$email}",
    "Subject: {$subject}",
    "Page:    {$page} ({$lang})",
    "Date:    " . gmdate('Y-m-d H:i') . ' UTC',
    '',
    $message,
], $email);

if ($sent) dtx_confirm($config, $email, $firstName, $lang);

dtx_respond($sent ? 200 : 502, $sent ? 'ok' : 'send_failed', $lang, $page);
