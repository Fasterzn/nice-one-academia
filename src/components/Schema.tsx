import { useEffect } from 'react';
import { site } from '../data/site';
import { social } from '../data/social';
import { units } from '../data/units';

const ORG_ID = `${site.url}#organization`;

/**
 * JSON-LD gerado a partir de units.ts.
 * Unidades sem endereço confirmado ficam de fora do schema.
 */
function buildSchema() {
  const organization = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: site.name,
    url: site.url,
    logo: `${site.url}images/logo-placeholder.svg`,
    foundingDate: String(site.foundedYear),
    telephone: '+551635242224',
    sameAs: [social.instagram.url, social.facebook.url, social.youtube.url],
  };

  const clubs = units
    .filter((unit) => unit.street !== null)
    .map((unit) => ({
      '@type': 'HealthClub',
      name: `${site.name} — ${unit.name}`,
      url: site.url,
      telephone: `+${unit.whatsapp}`,
      parentOrganization: { '@id': ORG_ID },
      address: {
        '@type': 'PostalAddress',
        streetAddress: unit.neighborhood ? `${unit.street} — ${unit.neighborhood}` : unit.street,
        addressLocality: site.city,
        addressRegion: site.state,
        addressCountry: 'BR',
        ...(unit.cep ? { postalCode: unit.cep } : {}),
      },
    }));

  return { '@context': 'https://schema.org', '@graph': [organization, ...clubs] };
}

export function Schema() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(buildSchema());
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return null;
}
