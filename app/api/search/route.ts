// app/api/search/route.ts
import { NextResponse } from 'next/server';

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_API_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() || '';

  const query = `
  query SearchProducts($query: String!) {
    products(first: 5, query: $query) {
      edges {
        node {
          id
          title
          handle
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

  try {
    const res = await fetch(
      `https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_API_TOKEN,
        },
        body: JSON.stringify({
          query,
          variables: { query: `title:*${q}*` },
        }),
      }
    );

    const data = await res.json();

    const products = data?.data?.products?.edges?.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      image: edge.node.images.edges[0]?.node.url ?? null,
    }));

    return NextResponse.json(products || []);
  } catch (error) {
    console.error('[Shopify search error]', error);

    return NextResponse.json(
      { error: 'Shopify search failed. Please try again later.' },
      { status: 500 }
    );
  }
}
