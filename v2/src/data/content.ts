import type { PageKey, UIKey } from '../i18n';

export const NAV_ITEMS: ReadonlyArray<{ page: PageKey; labelKey: UIKey }> = [
  { page: 'services', labelKey: 'nav_services' },
  { page: 'gallery', labelKey: 'nav_gallery' },
  { page: 'menu', labelKey: 'nav_menu' },
  { page: 'about', labelKey: 'nav_about' },
  { page: 'contact', labelKey: 'nav_contact' },
];

export const SERVICE_IDS = ['weddings', 'corporate', 'cocktail', 'bento', 'drinks', 'delivery', 'seated', 'buffet'] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const MARQUEE_KEYS = ['marquee_1', 'marquee_2', 'marquee_3', 'marquee_4', 'marquee_5', 'marquee_6', 'marquee_7', 'marquee_8'] as const;

export const GALLERY_CATEGORIES = ['weddings', 'cakes', 'cocktail', 'buffet'] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface MenuItem {
  name: string;
  description?: string;
  price?: string;
}

export interface MenuCategory {
  id: 'cakes' | 'weddings' | 'cocktail' | 'buffet' | 'drinks';
  photo?: string;
  items?: MenuItem[];
}

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'cakes', photo: 't-19.jpeg' },
  { id: 'weddings', photo: 'boda-1.jpeg' },
  { id: 'cocktail', photo: 'co-1.jpeg' },
  { id: 'buffet', photo: 'c-1.jpeg' },
  { id: 'drinks' },
];

export const HOW_STEPS = [1, 2, 3, 4] as const;
export const FAQ_ITEMS = [1, 2, 3, 4, 5, 6] as const;

export const MICHIS = [
  { id: 'pivi', name: 'Pivi', accent: '#F15591' },
  { id: 'mandarino', name: 'Mandarino', accent: '#EE7C3E' },
  { id: 'zombie', name: 'Zombie', accent: '#F78C78' },
] as const;
export type MichiId = (typeof MICHIS)[number]['id'];
