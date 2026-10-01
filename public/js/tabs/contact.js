import { h, group, field, textInput, seg } from '../ui.js';

export default function contact(ed) {
  const bind = (label, key, { placeholder = '', hint, type = 'text', maxlength } = {}) =>
    field(label, textInput({ value: ed.contact[key], placeholder, type, maxlength, onInput: (v) => ed.commit((s) => { s.contact[key] = v; }, { coalesce: `ct.${key}` }) }), hint);

  return h('div', { class: 'tab' },
    group('Как с вами связаться',
      bind('Телефон', 'phone', { placeholder: '+7 900 000-00-00', type: 'tel', maxlength: 40 }),
      bind('Email', 'email', { placeholder: 'hello@example.com', type: 'email', maxlength: 120, hint: 'Если указан email, на сайте появится форма — она открывает почтовое приложение.' }),
      bind('Адрес', 'address', { placeholder: 'Улица, дом', maxlength: 160 }),
      bind('Часы работы', 'hours', { placeholder: 'Пн–Пт, 9:00–20:00', maxlength: 120 }),
    ),
    group('Мессенджеры и соцсети',
      bind('Telegram', 'telegram', { placeholder: 'username или t.me/username', maxlength: 100 }),
      bind('WhatsApp', 'whatsapp', { placeholder: '79001234567', maxlength: 30, hint: 'Номер с кодом страны, только цифры.' }),
      bind('Instagram', 'instagram', { placeholder: 'username', maxlength: 100 }),
      bind('VK', 'vk', { placeholder: 'id или короткое имя', maxlength: 100 }),
    ),
    group('Главная кнопка',
      h('div', { class: 'fld' },
        h('label', { class: 'fld-l' }, 'Куда ведёт кнопка в шапке и первом экране'),
        seg([['form', 'К контактам'], ['phone', 'Звонок'], ['telegram', 'Telegram'], ['whatsapp', 'WhatsApp']], ed.contact.primary, (v) => ed.commit((s) => { s.contact.primary = v; }), { cls: 'wrap' }),
        h('p', { class: 'fld-h' }, 'Если выбранный способ не заполнен выше, кнопка поведёт к блоку контактов.')),
    ),
  );
}
