const BASE_URL = 'https://elyonschools.edu.ng'

export function SchoolJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'School',
        '@id': `${BASE_URL}/#school`,
        name: 'Elyon Schools',
        alternateName: 'Elyon Schools Nigeria',
        description:
          'Elyon Schools provides quality education from nursery through secondary levels, nurturing academic excellence and character development since 1994.',
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/logo.png`,
        },
        image: `${BASE_URL}/logo.png`,
        foundingDate: '1994',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'NG',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'admissions',
          url: `${BASE_URL}/contact`,
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Academic Programmes',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Course',
                name: 'Nursery School',
                description: 'Early childhood education for ages 18 months to 5 years',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Course',
                name: 'Primary School',
                description: 'Primary education for Primary 1 through Primary 6',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Course',
                name: 'Secondary School',
                description: 'Junior and Senior Secondary School (JSS 1–SSS 3)',
              },
            },
          ],
        },
        sameAs: [BASE_URL],
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: 'Elyon Schools',
        description: 'Official website of Elyon Schools',
        publisher: {
          '@id': `${BASE_URL}/#school`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/news?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BreadcrumbItem {
  name: string
  url: string
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function NewsArticleJsonLd({
  title,
  description,
  slug,
  publishedAt,
  imageUrl,
}: {
  title: string
  description: string
  slug: string
  publishedAt: string
  imageUrl?: string
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    url: `${BASE_URL}/news/${slug}`,
    datePublished: publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'Elyon Schools',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    ...(imageUrl ? { image: imageUrl } : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
