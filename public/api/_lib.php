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

// Помилки — лише в журнал сервера, ніколи у відповідь (шляхи на сервері, зламаний JSON)
ini_set('display_errors', '0');
ini_set('log_errors', '1');

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
    // ts — скільки мілісекунд форма була відкрита (рахує браузер, тож годинник відвідувача не важливий).
    // Без JS поле порожнє — тоді перевірку пропускаємо.
    $elapsed = (string)($_POST['ts'] ?? '');
    if (ctype_digit($elapsed) && (int)$elapsed < 3000) {
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
    if (!dtx_domain_accepts_mail(substr($email, strrpos($email, '@') + 1))) {
        return '';
    }
    return $email;
}

/**
 * Чи може домен приймати пошту (перевірка DNS, без листа на скриньку).
 * MX-запис → так (крім «null MX» — домен явно каже «пошту не приймаю»).
 * Немає MX → як і поштові сервери, пробуємо A/AAAA (RFC 5321).
 * Збій самого DNS → пропускаємо, щоб не відхилити живу людину.
 */
function dtx_domain_accepts_mail(string $domain): bool
{
    $fqdn = rtrim(strtolower($domain), '.') . '.'; // крапка в кінці — без підстановки локального домену
    $mx = @dns_get_record($fqdn, DNS_MX);
    if ($mx === false) return true;
    if ($mx) {
        foreach ($mx as $r) {
            if (!in_array($r['target'] ?? '', ['', '.'], true)) return true;
        }
        return false;
    }
    return checkdnsrr($fqdn, 'A') || checkdnsrr($fqdn, 'AAAA');
}

/**
 * Одна скринька — один ключ для лічильника: Ivan+1@Gmail.com, i.van@gmail.com → ivan@gmail.com.
 * Лише для підрахунку, лист іде на адресу як є.
 */
function dtx_mailbox_key(string $email): string
{
    [$local, $domain] = explode('@', strtolower($email), 2);
    $local = explode('+', $local, 2)[0];
    if ($domain === 'googlemail.com') $domain = 'gmail.com';
    if ($domain === 'gmail.com') $local = str_replace('.', '', $local);
    return $local . '@' . $domain;
}

/** Надсилає простий текстовий лист. Reply-To — адреса відвідувача. */
function dtx_mail(array $config, string $subject, array $lines, string $replyTo): bool
{
    $encoded = mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n");
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

/**
 * Короткий лист-підтвердження відвідувачу: «Ми отримали ваше повідомлення».
 *
 * Безпека: текст листа фіксований. Ми НЕ копіюємо в нього повідомлення чи тему,
 * які ввів відвідувач — інакше форму можна використати, щоб розсилати спам
 * від імені DataTixx на чужі адреси. Єдине, що підставляємо, — ім'я, і лише якщо
 * воно складається з літер (без посилань і символів).
 * Обмеження: не більше 2 підтверджень на одну скриньку за добу (варіанти адреси з «+» і крапками
 * в Gmail рахуються як одна) і не більше confirmations_per_day на весь сайт.
 * Якщо лист не пішов — відвідувач однаково бачить «надіслано»: наш лист уже в скриньці DataTixx.
 */
function dtx_confirm(array $config, string $to, string $firstName, string $lang): void
{
    if (empty($config['send_confirmation'])) return;
    if (!dtx_rate_ok('confirm:' . dtx_mailbox_key($to), 2, 'Ymd')) return;
    if (!dtx_rate_ok('confirm:*', (int)($config['confirmations_per_day'] ?? 50), 'Ymd')) {
        error_log('[forms] daily confirmation limit reached');
        return;
    }

    $name = preg_match("/^[\p{L}][\p{L}' \-]{0,39}$/u", $firstName) ? $firstName : '';

    if ($lang === 'fr') {
        $subject = 'Nous avons bien reçu votre message — DataTixx';
        $lines = [
            $name !== '' ? "Bonjour {$name}," : 'Bonjour,',
            '',
            'Merci de nous avoir écrit. Votre message est bien arrivé chez DataTixx.',
            'Nous vous répondrons rapidement à cette adresse e-mail.',
            '',
            "Si vous n'avez pas envoyé ce message, ignorez simplement cet e-mail.",
            '',
            "L'équipe DataTixx",
            'https://datatixx.com/fr/',
        ];
    } else {
        $subject = 'We have received your message — DataTixx';
        $lines = [
            $name !== '' ? "Hello {$name}," : 'Hello,',
            '',
            'Thank you for writing to us. Your message has reached DataTixx.',
            'We will reply to this email address soon.',
            '',
            'If you did not send this message, you can simply ignore this email.',
            '',
            'The DataTixx team',
            'https://datatixx.com/en/',
        ];
    }

    $headers = implode("\r\n", [
        'From: ' . $config['mail_from'],
        'Reply-To: ' . ($config['reply_to'] ?? $config['mail_to']),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'Auto-Submitted: auto-replied',
        'X-Mailer: datatixx-website',
    ]);
    $ok = mail($to, mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n"),implode("\n", $lines), $headers, '-f' . $config['mail_envelope_from']);
    if (!$ok) error_log('[forms] confirmation mail() failed');
}

/** Лічильник: не більше $limit спроб для ключа (IP або e-mail) за годину ('YmdH') чи добу ('Ymd'). */
function dtx_rate_ok(string $key, int $limit, string $period = 'YmdH'): bool
{
    $dir = sys_get_temp_dir() . '/dtx-forms';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    dtx_rate_cleanup($dir);
    $file = $dir . '/' . hash('sha256', $key . date($period)); // IP і e-mail не зберігаємо у відкритому вигляді
    $count = is_file($file) ? (int)file_get_contents($file) : 0;
    if ($count >= $limit) return false;
    file_put_contents($file, (string)($count + 1), LOCK_EX);
    return true;
}

/**
 * Видаляє лічильники, старші за добу (так обіцяє Privacy Policy: «counters are deleted within 24 hours»).
 * Перевіряємо не частіше разу на годину — щоб не сканувати папку на кожен запит.
 */
function dtx_rate_cleanup(string $dir): void
{
    $stamp = $dir . '/.cleanup';
    if (is_file($stamp) && filemtime($stamp) > time() - 3600) return;
    @touch($stamp);
    foreach (glob($dir . '/*') ?: [] as $f) {
        if (is_file($f) && filemtime($f) < time() - 86400) @unlink($f);
    }
}
