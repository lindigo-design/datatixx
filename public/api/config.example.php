<?php
/**
 * ЗРАЗОК налаштувань форми.
 * На сервері IONOS: скопіюй як config.php і впиши справжні адреси.
 * config.php НЕ потрапляє в Git (див. .gitignore).
 */
return [
    // Куди приходять листи з форми (робоча скринька IONOS)
    'mail_to' => 'contact@datatixx.com',

    // Від кого лист. Має бути адреса НАШОГО домену, інакше лист потрапить у спам
    'mail_from' => 'DataTixx website <noreply@datatixx.com>',
    'mail_envelope_from' => 'noreply@datatixx.com',

    // Звідки дозволено відправляти форму
    'allowed_origins' => [
        'https://www.datatixx.com',
        'https://datatixx.com',
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
