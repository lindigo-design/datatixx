<?php
/**
 * ТИМЧАСОВА діагностика відправки листів. ВИДАЛИТИ, щойно форми запрацюють.
 *
 * Відкрити: https://datatixx.com/api/status.php
 * Показує по кроках: чи дійшов пароль із секрету GitHub, чи є з'єднання з поштовим
 * сервером, STARTTLS, які способи входу він приймає і чи проходить вхід.
 * Листів НЕ надсилає, пароля НЕ показує.
 * Не більше 10 перевірок на годину з однієї IP-адреси — щоб через цю сторінку не можна
 * було підбирати пароль і щоб Exchange не заблокував скриньку за невдалі входи.
 */
declare(strict_types=1);
require __DIR__ . '/_lib.php';

if (!dtx_rate_ok('status:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 10)) {
    http_response_code(429);
    echo json_encode(['status' => 'too_many_requests'], JSON_PRETTY_PRINT);
    exit;
}

$config = dtx_config();
$smtp = $config['smtp'] ?? [];
$host = (string)($smtp['host'] ?? '');
$port = (int)($smtp['port'] ?? 465);

$r = [
    'php' => PHP_VERSION,
    'openssl' => extension_loaded('openssl') ? 'ok' : 'missing',
    'mbstring' => extension_loaded('mbstring') ? 'ok' : 'missing',
    'mail_function' => function_exists('mail') ? 'available' : 'disabled',
    'config_php' => is_file(__DIR__ . '/config.php') ? 'present (overrides _settings.php)' : 'absent',
    'temp_dir_writable' => is_writable(sys_get_temp_dir()) ? 'yes' : 'no',
    'smtp_server' => "{$host}:{$port}",
    'smtp_user' => (string)($smtp['user'] ?? ''),
];

// 1. Пароль: файл, який Deploy Now має створити з _smtp_password.template
$pwFile = __DIR__ . '/_smtp_password';
if (!is_file($pwFile)) {
    $r['password_file'] = 'missing';
} else {
    $v = trim((string)file_get_contents($pwFile));
    $r['password_file'] = $v === '' ? 'empty' : (str_starts_with($v, '$DTX_') ? 'not_rendered' : 'ok');
}
$r['template_file'] = is_file(__DIR__ . '/_smtp_password.template') ? 'present' : 'absent';
$password = (string)($smtp['password'] ?? '');

// 2. З'єднання з поштовим сервером (лист не надсилаємо)
foreach (['connect', 'starttls', 'auth_methods', 'login'] as $k) $r[$k] = 'skipped';

if ($host !== '') {
    $ctx = stream_context_create(['ssl' => [
        'peer_name' => $host,
        'verify_peer' => (bool)($smtp['verify'] ?? true),
        'verify_peer_name' => (bool)($smtp['verify'] ?? true),
    ]]);
    $remote = ($port === 465 ? 'ssl://' : 'tcp://') . $host . ':' . $port;
    $fp = @stream_socket_client($remote, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);

    if (!$fp) {
        $r['connect'] = "fail: {$errstr} ({$errno})";
    } else {
        stream_set_timeout($fp, 15);
        $read = static function () use ($fp): string {
            $data = '';
            while (($line = fgets($fp, 1024)) !== false) {
                $data .= $line;
                if (strlen($line) < 4 || $line[3] === ' ') break;
            }
            return $data;
        };
        $send = static function (string $line) use ($fp, $read): string {
            fwrite($fp, $line . "\r\n");
            return $read();
        };
        $code = static fn(string $reply): int => (int)substr($reply, 0, 3);
        $short = static fn(string $reply): string => mb_substr(trim(preg_replace('/\s+/', ' ', $reply) ?? ''), 0, 160);

        $banner = $read();
        $r['connect'] = $code($banner) === 220 ? 'ok' : 'fail: ' . $short($banner);
        $me = gethostname() ?: 'datatixx.com';
        $ehlo = $code($banner) === 220 ? $send("EHLO {$me}") : '';
        $ready = $code($ehlo) === 250;

        if ($ready && $port !== 465) {
            $reply = $send('STARTTLS');
            if ($code($reply) !== 220) {
                $r['starttls'] = 'fail: ' . $short($reply);
                $ready = false;
            } elseif (!@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                $r['starttls'] = 'fail: TLS handshake (' . (error_get_last()['message'] ?? 'unknown') . ')';
                $ready = false;
            } else {
                $r['starttls'] = 'ok';
                $ehlo = $send("EHLO {$me}");
                $ready = $code($ehlo) === 250;
            }
        } elseif ($port === 465) {
            $r['starttls'] = 'n/a (port 465 uses SSL from the start)';
        }

        if ($ready) {
            $r['auth_methods'] = preg_match('/^250[ -]AUTH[ =](.+)$/mi', $ehlo, $m) ? trim($m[1]) : 'none offered';

            if ($r['password_file'] !== 'ok' && $password === '') {
                $r['login'] = 'skipped: no password';
            } else {
                $reply = $send('AUTH LOGIN');
                if ($code($reply) !== 334) {
                    $r['login'] = 'fail: ' . $short($reply);
                } else {
                    $reply = $send(base64_encode((string)($smtp['user'] ?? '')));
                    if ($code($reply) !== 334) {
                        $r['login'] = 'fail (user): ' . $short($reply);
                    } else {
                        $reply = $send(base64_encode($password));
                        $r['login'] = $code($reply) === 235 ? 'ok' : 'fail: ' . $short($reply);
                    }
                }
            }
        }
        @fwrite($fp, "QUIT\r\n");
        fclose($fp);
    }
}

echo json_encode($r, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
