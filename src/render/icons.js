// Набор простых линейных иконок (24x24, stroke). ИИ выбирает иконку по имени —
// список имён попадает в JSON-схему, поэтому модель не может «придумать» несуществующую.
export const ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  shield: '<path d="M12 3 4 6v6c0 4.8 3.3 8.2 8 9 4.7-.8 8-4.2 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  heart: '<path d="M12 20s-8-4.6-9-10a4.8 4.8 0 0 1 9-2.5A4.8 4.8 0 0 1 21 10c-1 5.4-9 10-9 10z"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  truck: '<path d="M3 6h11v10H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3 17.7 6.3 21l6.3-6.3a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.5-.5-.5-2.5z"/>',
  leaf: '<path d="M5 19C5 10 10 4 20 4c0 10-6 15-15 15z"/><path d="M5 19 13 11"/>',
  coffee: '<path d="M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M16 10h2a2 2 0 0 1 0 5h-2"/><path d="M8 3v2M12 3v2"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6 6 0 0 1 3.5 6"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.6 7.6 20 18M8.6 16.4 20 6"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  sparkles: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 3v4M17 5h4"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="m8 15 3-4 3 2 5-6"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12"/><path d="M12 9c-1-3-4-4-4.500-2S9 9 12 9zM12 9c1-3 4-4 4.500-2S15 9 12 9z"/>',
  dumbbell: '<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>',
  code: '<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.500-2.200-.6-1.400.3-2.800 1.800-2.800H18a3 3 0 0 0 3-3C21 7 17 3 12 3z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="7.500" r="1"/><circle cx="16" cy="11" r="1"/>',
  cart: '<circle cx="9" cy="20" r="1.500"/><circle cx="18" cy="20" r="1.500"/><path d="M2 3h3l2.500 12h11L21 7H6"/>',
  utensils: '<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10"/><path d="M17 21V3c-2.500 1.500-3.500 5-3.500 8H17"/>',
  car: '<path d="M3 17v-5l2-5h14l2 5v5z"/><path d="M3 12h18"/><circle cx="7.500" cy="17" r="1.700"/><circle cx="16.500" cy="17" r="1.700"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8.500 14a4 4 0 0 0 7 0M9 9.500h.01M15 9.500h.01"/>',
  message: '<path d="M4 5h16v11H9l-5 4z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  flower: '<circle cx="12" cy="12" r="2.500"/><path d="M12 9.500C10 6 10.500 3 12 3s2 3 0 6.500zM12 14.500c2 3.500 1.500 6.500 0 6.500s-2-3 0-6.500zM9.500 12C6 10 3 10.500 3 12s3 2 6.500 0zM14.500 12c3.500 2 6.500 1.500 6.500 0s-3-2-6.500 0z"/>',
  paw: '<circle cx="7" cy="10" r="1.800"/><circle cx="11" cy="6.500" r="1.800"/><circle cx="16" cy="7" r="1.800"/><circle cx="19" cy="11.500" r="1.800"/><path d="M8 17c0-3 2.500-5 5-5s5 2 4 5c-.8 2.500-3 2.500-4.500 2S8 19.500 8 17z"/>',
};

export const ICON_NAMES = Object.keys(ICONS);

// Служебные иконки интерфейса — ИИ их не выбирает.
const UI_ICONS = {
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
};

export function icon(name, size = 24) {
  const body = UI_ICONS[name] ?? ICONS[name] ?? ICONS.sparkles;
  return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
