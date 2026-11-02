import es from './es.json';
import en from './en.json';

export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'es';

export const LOCALE_META: Record<Lang, { htmlLang: string; ogLocale: string }> = {
  es: { htmlLang: 'es', ogLocale: 'es_BO' },
  en: { htmlLang: 'en', ogLocale: 'en_US' },
};

const dictionaries: Record<Lang, Record<string, string>> = { es, en };

export type UIKey = keyof typeof es;

const referenceKeys = Object.keys(es);
for (const lang of LANGS) {
  const dict = dictionaries[lang];
  const missing = referenceKeys.filter((key) => !(key in dict));
  const unexpected = Object.keys(dict).filter((key) => !(key in es));
  const empty = Object.entries(dict)
    .filter(([, value]) => value.trim() === '')
    .map(([key]) => key);
  if (missing.length || unexpected.length || empty.length) {
    throw new Error(`i18n "${lang}": missing [${missing.join(', ')}] unexpected [${unexpected.join(', ')}] empty [${empty.join(', ')}]`);
  }
}

export function useTranslations(lang: Lang) {
  const dict = dictionaries[lang];
  return (key: UIKey, vars?: Record<string, string | number>): string => {
    let value = dict[key];
    if (vars) {
      for (const [name, replacement] of Object.entries(vars)) {
        value = value.replaceAll(`{${name}}`, String(replacement));
      }
    }
    return value;
  };
}

export const PAGES = ['home', 'services', 'gallery', 'menu', 'about', 'contact'] as const;
export type PageKey = (typeof PAGES)[number];

const SLUGS: Record<Lang, Record<PageKey, string>> = {
  es: { home: '', services: 'servicios', gallery: 'galeria', menu: 'carta', about: 'nosotros', contact: 'contacto' },
  en: { home: '', services: 'services', gallery: 'gallery', menu: 'menu', about: 'about', contact: 'contact' },
};

export function pathFor(lang: Lang, page: PageKey): string {
  const prefix = lang === DEFAULT_LANG ? '' : `/${lang}`;
  const slug = SLUGS[lang][page];
  return `${prefix}/${slug ? `${slug}/` : ''}`;
}

export function allRoutes() {
  return LANGS.flatMap((lang) =>
    PAGES.map((page) => ({
      params: { path: pathFor(lang, page).replace(/^\/|\/$/g, '') || undefined },
      props: { lang, page },
    })),
  );
}

export function homePath(lang: Lang): string {
  return pathFor(lang, 'home');
}
