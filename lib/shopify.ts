const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// const endpoint = `https://${domain}/api/2023-07/graphql.json`;
// const endpoint = `https://${domain}/api/2024-01/graphql.json`;
const endpoint = `https://${domain}/api/unstable/graphql.json`;



export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken || '',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  console.log('Shopify response:', JSON.stringify(json, null, 2));

  if (json.errors) {
    console.error(JSON.stringify(json.errors));
    throw new Error('Shopify API Error');
  }

  return json.data;
}
