// One drawn icon family: 24px grid, 1.75 stroke, round joins.
const wrap = (body, extra = "") =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"${extra}>${body}</svg>`;

export const icons = {
  sun: wrap('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.55 1.55M17.15 17.15l1.55 1.55M5.3 18.7l1.55-1.55M17.15 6.85l1.55-1.55"/>'),
  part: wrap('<path d="M12 7.8a4.2 4.2 0 1 0 0 8.4Z" fill="currentColor"/><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M5.3 5.3l1.55 1.55M5.3 18.7l1.55-1.55"/><path d="M16 4.5l4 4M16 9.5l4 4M16 14.5l4 4" opacity=".55"/>'),
  shade: wrap('<path d="M3 7h18M3 11.5h18M3 16h18"/><path d="M6 20.5h12" opacity=".55"/><circle cx="12" cy="3.6" r="1.4" fill="currentColor" stroke="none"/>'),
  phone: wrap('<path d="M6.6 3.5h2.6l1.4 4-1.9 1.3a11 11 0 0 0 6.5 6.5l1.3-1.9 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/>'),
  sms: wrap('<path d="M4 5.5h16v10.5H9.5L5 19.5V16H4Z"/><path d="M8 10.7h.01M12 10.7h.01M16 10.7h.01" stroke-width="2.4"/>'),
  whatsapp: wrap('<path d="M4.2 19.8l1.1-3.9A8.3 8.3 0 1 1 8.4 19Z"/><path d="M9.3 8.4c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .5.4l.7 1.6c.1.3 0 .5-.1.6l-.5.6c-.1.1-.2.3 0 .6a6 6 0 0 0 2.8 2.4c.3.1.5.1.6 0l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.3.6-.2.9-1 1.6-1.9 1.6-2.7.1-6-3-6.3-5.6 0-.7.3-1.4.7-2Z" stroke-width="1.3"/>'),
  search: wrap('<circle cx="10.8" cy="10.8" r="6.3"/><path d="M15.5 15.5l5 5"/>'),
  prev: wrap('<path d="M14.5 5.5L8 12l6.5 6.5"/>'),
  next: wrap('<path d="M9.5 5.5L16 12l-6.5 6.5"/>'),
  close: wrap('<path d="M6 6l12 12M18 6L6 18"/>'),
  plus: wrap('<path d="M12 5.5v13M5.5 12h13"/>'),
  minus: wrap('<path d="M5.5 12h13"/>'),
  check: wrap('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  turn: wrap('<path d="M4.5 12a7.5 7.5 0 0 1 13-5.1M19.5 12a7.5 7.5 0 0 1-13 5.1"/><path d="M17.8 3.5v3.6h-3.6M6.2 20.5v-3.6h3.6"/>'),
  tag: wrap('<path d="M7.5 2.8h9a1.8 1.8 0 0 1 1.8 1.8v10.6L12 21.2l-6.3-6V4.6a1.8 1.8 0 0 1 1.8-1.8Z"/><circle cx="12" cy="6.4" r="1.2"/>'),
  copy: wrap('<rect x="8" y="8" width="11.5" height="11.5" rx="1.6"/><path d="M5.5 15.5h-.3A1.7 1.7 0 0 1 3.5 13.8V5.2a1.7 1.7 0 0 1 1.7-1.7h8.6a1.7 1.7 0 0 1 1.7 1.7v.3"/>'),
  menu: wrap('<path d="M4.5 7.5h15M4.5 12h15M4.5 16.5h15"/>'),
  send: wrap('<path d="M4.5 12h13M12.5 6l6 6-6 6"/>'),
  chat: wrap('<path d="M4.5 5.5h15v10h-8l-4.5 3.5V15.5H4.5Z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" stroke-width="2.4"/>'),
  trash: wrap('<path d="M4.5 7h15M10 7V4.5h4V7M6.5 7l.9 12.5h9.2L17.5 7"/>'),
};

export const lightLabel = { sun: "Full sun", part: "Part shade", shade: "Shade" };
