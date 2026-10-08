import { createHash } from 'node:crypto';

/**
 * Маленький скрипт лоадера. Має виконатися ДО першого малювання сторінки,
 * тому вбудовується прямо в <head>. Його хеш додаємо в Content-Security-Policy,
 * інакше браузер його заблокує.
 */
export const introScript =
  "try{if(!sessionStorage.getItem('dtx-intro')){document.documentElement.dataset.intro='';sessionStorage.setItem('dtx-intro','1')}}catch(e){}";

export const introScriptHash =
  `sha256-${createHash('sha256').update(introScript).digest('base64')}` as const;
