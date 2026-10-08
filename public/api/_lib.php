<?php
/**
 * Спільні функції для обробників форм DataTixx (contact.php, survey.php).
 * Напряму не відкривається: .htaccess забороняє доступ до файлів, що починаються з «_».
 *
 * Захист, який дає кожному обробнику:
 *  - лише POST з нашого домену (перевірка Origin)
 *  - пастка для ботів (приховане поле website) + перевірка часу заповнення
 *  - обмеження частоти з однієї IP-адреси
 *  - очищення полів і захист від підміни заголовків листа
 */

declare(strict_types=1);

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(404);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const DTX_LANGS = ['en', 'fr'];

/** Завантажує налаштування і виконує всі перевірки безпеки. Повертає [config, lang]. */
function dtx_guard(string $page): array
{
    $lang = in_array($_POST['lang'] ?? '', DTX_LANGS, true) ? $_POST['lang'] : 'en';

    $configFile = __DIR__ . '/config.php';
    if (!is_file($configFile)) {
        dtx_respond(500, 'not_configured', $lang, $page);
    }
    $config = require $configFile;

    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        dtx_respond(405, 'method_not_allowed', $lang, $page);
    }

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '' && !in_array($origin, $config['allowed_origins'], true)) {
        dtx_respond(403, 'forbidden', $lang, $page);
    }

    // Пастка: людина це поле не бачить. Боту відповідаємо «ok», але нічого не надсилаємо.
    if (trim((string)($_POST['website'] ?? '')) !== '') {
        dtx_respond(200, 'ok', $lang, $page);
    }
    $ts = (int)($_POST['ts'] ?? 0);
    if ($ts > 0 && ((int)(microtime(true) * 1000) - $ts) < 3000) {
        dtx_respond(200, 'ok', $lang, $page);
    }

    if (!dtx_rate_ok($_SERVER['REMOTE_ADDR'] ?? 'unknown', (int)$config['rate_limit_per_hour'])) {
        dtx_respond(429, 'too_many_requests', $lang, $page);
    }

    return [$config, $lang];
}

/** Відповідь: JSON для JS-відправки або редирект назад на сторінку без JS. */
function dtx_respond(int $code, string $status, string $lang = 'en', string $page = 'contact', array $extra = []): never
{
    http_response_code($code);
    $wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

    if (!$wantsJson && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
        $flag = $code === 200 ? 'sent' : 'error';
        $page = preg_replace('/[^a-z-]/', '', $page) ?: 'contact';
        header("Location: /{$lang}/{$page}/?{$flag}=1#form", true, 303);
        exit;
    }

    echo json_encode(['status' => $status] + $extra, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Один рядок тексту: без керівних символів і переносів. */
function dtx_line(string $key, int $max): string
{
    $value = $_POST[$key] ?? '';
    $value = is_string($value) ? $value : '';
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '';
    return mb_substr(trim($value), 0, $max);
}

/** Багаторядковий текст. */
function dtx_text(string $key, int $max): string
{
    $value = $_POST[$key] ?? '';
    $value = is_string($value) ? $value : '';
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/u', '', $value) ?? '';
    return mb_substr(trim($value), 0, $max);
}

function dtx_email(string $key): string
{
    $email = trim((string)($_POST[$key] ?? ''));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 160 || preg_match('/[\r\n]/', $email)) {
        return '';
    }
    return $email;
}

/** Надсилає простий текстовий лист. Reply-To — адреса відвідувача. */
function dtx_mail(array $config, string $subject, array $lines, string $replyTo): bool
{
    $encoded = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $headers = implode("\r\n", [
        'From: ' . $config['mail_from'],
        'Reply-To: ' . $replyTo,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'X-Mailer: datatixx-website',
    ]);
    $body = implode("\n", $lines);
    $ok = mail($config['mail_to'], $encoded, $body, $headers, '-f' . $config['mail_envelope_from']);
    if (!$ok) error_log('[forms] mail() failed: ' . $subject);
    return $ok;
}

function dtx_rate_ok(string $ip, int $limit): bool
{
    $dir = sys_get_temp_dir() . '/dtx-forms';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    $file = $dir . '/' . hash('sha256', $ip . date('YmdH')); // IP не зберігаємо у відкритому вигляді
    $count = is_file($file) ? (int)file_get_contents($file) : 0;
    if ($count >= $limit) return false;
    file_put_contents($file, (string)($count + 1), LOCK_EX);
    return true;
}
