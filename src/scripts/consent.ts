/**
 * Згода на cookies — одне місце, де зберігається вибір відвідувача.
 *
 * Зберігаємо в localStorage браузера (не на сервері) на 6 місяців, як написано в банері.
 * Після 6 місяців або зміни версії банер з'являється знову.
 *
 * Як підключити аналітику пізніше (наприклад, Plausible чи Matomo):
 *   import { onConsent } from '@/scripts/consent';
 *   onConsent('analytics', () => { ...завантажити скрипт аналітики... });
 * Скрипт запуститься лише тоді, коли людина дозволила «Analytics».
 */

export type Category = 'necessary' | 'analytics' | 'preferences' | 'marketing';
export type Choices = Record<Category, boolean>;

const KEY = 'dtx-consent';
/** Змінити, якщо зміниться перелік cookies — тоді всі побачать банер знову */
const VERSION = 1;
const MAX_AGE = 182 * 24 * 60 * 60 * 1000; // 6 місяців

interface Stored {
  v: number;
  at: number;
  choices: Choices;
}

export const NONE: Choices = {
  necessary: true,
  analytics: false,
  preferences: false,
  marketing: false,
};
export const ALL: Choices = {
  necessary: true,
  analytics: true,
  preferences: true,
  marketing: true,
};

/** Збережений вибір або null, якщо вибору ще немає (чи він застарів). */
export function getConsent(): Choices | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Stored;
    if (data.v !== VERSION || Date.now() - data.at > MAX_AGE) return null;
    return { ...NONE, ...data.choices, necessary: true };
  } catch {
    return null; // приватний режим або заблоковане сховище — просто питаємо ще раз
  }
}

export function saveConsent(choices: Choices): void {
  const value: Choices = { ...choices, necessary: true };
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ v: VERSION, at: Date.now(), choices: value })
    );
  } catch {
    /* сховище недоступне — вибір діє до закриття сторінки */
  }
  document.dispatchEvent(new CustomEvent('dtx:consent', { detail: value }));
}

/** Виконати fn, щойно (або коли) дозволено категорію. */
export function onConsent(category: Category, fn: () => void): void {
  let done = false;
  const run = (c: Choices | null) => {
    if (!done && c?.[category]) {
      done = true;
      fn();
    }
  };
  run(getConsent());
  document.addEventListener('dtx:consent', e =>
    run((e as CustomEvent<Choices>).detail)
  );
}
