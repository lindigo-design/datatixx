<?php
/**
 * Налаштування форм сайту DataTixx. Тут НЕМАЄ паролів — файл лежить у Git.
 *
 * Пароль від поштової скриньки зберігається в GitHub:
 *   Settings → Secrets and variables → Actions → секрет DTX_SMTP_PASSWORD.
 * Під час публікації IONOS Deploy Now сам створює з шаблону
 * .deploy-now/datatixx/api/_smtp_password.template файл api/_smtp_password з паролем
 * (див. dtx_smtp_password() у _lib.php). Шаблони Deploy Now обробляє ЛИШЕ з папки
 * .deploy-now/<проєкт>/ — у public/ вони копіюються як звичайні файли, без підстановки.
 *
 * Локально (або на іншому хостингу) можна покласти поруч config.php
 * з тими самими ключами — він перекриє ці значення. config.php у Git не потрапляє.
 *
 * Файли, що починаються з «_», .htaccess не віддає браузеру.
 */
return [
    // Куди приходять листи з форми
    'mail_to' => 'contact@datatixx.com',

    // Від кого лист. Для SMTP — та сама скринька, під якою входимо (так вимагає IONOS)
    'mail_from' => 'DataTixx website <contact@datatixx.com>',
    'mail_envelope_from' => 'contact@datatixx.com',

    // Поштовий сервер. contact@datatixx.com — скринька IONOS Microsoft Exchange,
    // її SMTP: smtp.exchange.ionos.eu, порт 587, STARTTLS, логін — повна адреса.
    // (Для звичайної пошти IONOS було б smtp.ionos.fr, порт 465.)
    // Якщо пароля немає (секрет не додано) — сайт пробує звичайну PHP mail().
    'smtp' => [
        'host' => 'smtp.exchange.ionos.eu',
        'port' => 587,          // 587 = STARTTLS; 465 = SSL
        'user' => 'contact@datatixx.com',
    ],

    // Звідки дозволено відправляти форму
    'allowed_origins' => [
        'https://datatixx.com',
        'https://www.datatixx.com',
    ],

    // Надсилати відвідувачу короткий лист «Ми отримали ваше повідомлення» (true / false)
    'send_confirmation' => true,

    // Куди піде відповідь, якщо відвідувач натисне «Відповісти» на лист-підтвердження
    'reply_to' => 'contact@datatixx.com',

    // Скільки листів-підтверджень сайт може надіслати за добу ВСЬОГО (захист від розсилки на чужі адреси)
    'confirmations_per_day' => 50,

    // Скільки листів з однієї IP-адреси за годину
    'rate_limit_per_hour' => 5,
];
