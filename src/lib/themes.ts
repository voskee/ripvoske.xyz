// Classic Windows 95 color theme for the window chrome.

export type Theme = {
  id: string;
  name: string;
  titleBg: string;
  titleText: string;
  accent: string;
  face: string;
};

export const DEFAULT_THEME: Theme = {
  id: 'classic',
  name: 'Azul clásico',
  titleBg: '#000080',
  titleText: '#ffffff',
  accent: '#000080',
  face: '#c0c0c0',
};
