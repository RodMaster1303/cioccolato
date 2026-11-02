export const SITE = {
  name: 'Cioccolato',
  url: 'https://cioccolato.netlify.app',
  phoneDisplay: '(+591) 68023352',
  phoneHref: 'tel:+59168023352',
  whatsappNumber: '59168023352',
  street: 'Calle Colón, frente al banco BNB',
  venue: 'Feria Nuestra Bolivia',
  city: 'La Paz',
  country: 'BO',
  mapsUrl: 'https://maps.app.goo.gl/AH8asX2RzXpFEsmx6',
  hoursOpen: '10:00',
  hoursClose: '19:00',
  openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  facebook: 'https://www.facebook.com/profile.php?id=100086622783681',
  tiktok: 'https://www.tiktok.com/@cioccolato.lp',
  instagram: '',
  developer: {
    name: 'Josue Chura',
    urlEs: 'https://josue-chura.netlify.app/es/',
    urlEn: 'https://josue-chura.netlify.app/',
  },
} as const;

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
