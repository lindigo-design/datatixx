<?php
/**
 * Обробник форми зв'язку DataTixx.
 * Працює на хостингу IONOS (PHP 8.1+). Налаштування — у config.php поруч (не в Git!).
 *
 * Захист:
 *  - приймає тільки POST з нашого домену (перевірка Origin)
 *  - пастка для ботів (приховане поле website) + перевірка часу заповнення
 *  - обмеження частоти: не більше N листів з однієї IP-адреси за годину
 *  - перевірка і очищення всіх полів на сервері
 *  - захист від підміни заголовків листа (header injection)
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    respond(500, 'not_configured');
}
$config = require $configFile;

// --- 1. Лише POST -----------------------------------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, 'method_not_allowed');
}

// --- 2. Лише з нашого сайту ------------------------------------------------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, $config['allowed_origins'], true)) {
    respond(403, 'forbidden');
}

// --- 3. Пастка і час --------------------------------------------------------
if (trim((string)($_POST['website'] ?? '')) !== '') {
    respond(200, 'ok'); // бот: робимо вигляд, що все добре, але нічого не надсилаємо
}
$ts = (int)($_POST['ts'] ?? 0);
$elapsed = (int)(microtime(true) * 1000) - $ts;
if ($ts > 0 && $elapsed < 3000) {
    respond(200, 'ok'); // заповнено швидше ніж за 3 секунди — майже напевно бот
}

// --- 4. Обмеження частоти ---------------------------------------------------
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (!rateLimitOk($ip, (int)$config['rate_limit_per_hour'])) {
    respond(429, 'too_many_requests');
}

// --- 5. Перевірка полів -----------------------------------------------------
$lang      = in_array($_POST['lang'] ?? '', ['en', 'fr'], true) ? $_POST['lang'] : 'en';
$firstName = cleanLine($_POST['firstName'] ?? '', 80);
$lastName  = cleanLine($_POST['lastName'] ?? '', 80);
$email     = trim((string)($_POST['email'] ?? ''));
$company   = cleanLine($_POST['company'] ?? '', 120);
$message   = cleanText($_POST['message'] ?? '', 4000);
$consent   = ($_POST['consent'] ?? '') === '1';

$errors = [];
if ($firstName === '') $errors[] = 'firstName';
if ($lastName === '')  $errors[] = 'lastName';
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 160 || preg_match('/[\r\n]/', $email)) {
    $errors[] = 'email';
}
if (mb_strlen($message) < 10) $errors[] = 'message';
if (!$consent) $errors[] = 'consent';

if ($errors) {
    respond(422, 'invalid', ['fields' => $errors], $lang);
}

// --- 6. Відправка -----------------------------------------------------------
$subject = '=?UTF-8?B?' . base64_encode("Website: {$firstName} {$lastName}" . ($company ? " ({$company})" : '')) . '?=';

$body = implode("\n", [
    "Name:    {$firstName} {$lastName}",
    "Email:   {$email}",
    "Company: " . ($company ?: '—'),
    "Lang:    {$lang}",
    "Date:    " . gmdate('Y-m-d H:i') . ' UTC',
    '',
    $message,
]);

$headers = implode("\r\n", [
    'From: ' . $config['mail_from'],
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: datatixx-website',
]);

$sent = mail($config['mail_to'], $subject, $body, $headers, '-f' . $config['mail_envelope_from']);

if (!$sent) {
    error_log('[contact] mail() failed');
    respond(502, 'send_failed', [], $lang);
}

respond(200, 'ok', [], $lang);


// ===========================================================================

function respond(int $code, string $status, array $extra = [], string $lang = 'en'): never
{
    http_response_code($code);
    $wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

    if (!$wantsJson && $_SERVER['REQUEST_METHOD'] === 'POST') {
        // Відправка без JavaScript: повертаємо людину на сторінку контактів
        $flag = $code === 200 ? 'sent' : 'error';
        header("Location: /{$lang}/contact/?{$flag}=1#main", true, 303);
        exit;
    }

    echo json_encode(['status' => $status] + $extra, JSON_UNESCAPED_UNICODE);
    exit;
}

function cleanLine(mixed $value, int $max): string
{
    $value = is_string($value) ? $value : '';
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '';
    return mb_substr(trim($value), 0, $max);
}

function cleanText(mixed $value, int $max): string
{
    $value = is_string($value) ? $value : '';
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/u', '', $value) ?? '';
    return mb_substr(trim($value), 0, $max);
}

function rateLimitOk(string $ip, int $limit): bool
{
    $dir = sys_get_temp_dir() . '/dtx-contact';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    $file = $dir . '/' . hash('sha256', $ip . date('YmdH')); // IP не зберігаємо у відкритому вигляді
    $count = is_file($file) ? (int)file_get_contents($file) : 0;
    if ($count >= $limit) return false;
    file_put_contents($file, (string)($count + 1), LOCK_EX);
    return true;
}
