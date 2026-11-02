import { SITE } from '../data/site';
import { homePath, useTranslations, type Lang } from '../i18n';

export function bakerySchema(lang: Lang, site: URL) {
  const t = useTranslations(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: 'Cioccolato',
    url: new URL(homePath(lang), site).href,
    image: new URL('/og.jpg', site).href,
    description: t('meta_description_home'),
    telephone: '+59168023352',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${SITE.street} (${SITE.venue})`,
      addressLocality: SITE.city,
      addressCountry: SITE.country,
    },
    areaServed: [
      { '@type': 'City', name: 'La Paz' },
      { '@type': 'City', name: 'El Alto' },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...SITE.openDays],
        opens: SITE.hoursOpen,
        closes: SITE.hoursClose,
      },
    ],
    hasMap: SITE.mapsUrl,
    paymentAccepted: 'Cash, Bank transfer, QR code',
    sameAs: [SITE.facebook, SITE.tiktok],
  };
}

export function faqSchema(lang: Lang, ids: readonly number[]) {
  const t = useTranslations(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ids.map((id) => ({
      '@type': 'Question',
      name: t(`faq_${id}_q` as never),
      acceptedAnswer: { '@type': 'Answer', text: t(`faq_${id}_a` as never) },
    })),
  };
}
