const MMA_GRAPHQL = 'https://api.mma.ua/graphql';
const MMA_LOGIN = 'https://mma.ua/api/login';

const PRODUCTS_LIST_QUERY = `
  query ProductsData($filtering: ProductsFilterInput!, $ordering: [ProductOrderInput!], $page: Int!, $first: Int!) {
    siteFilteredProducts(filtering: $filtering, ordering: $ordering, page: $page, first: $first) {
      data {
        id
        key
        translation { name slug }
        availabilityStatus
        recommendedRetailPrice
        productVariantInfo {
          price {
            minValue
            maxValue
            minOldValue
            maxOldValue
            salePercent
          }
        }
        images(page: 1, first: 2) {
          data {
            image {
              originalUrl
              conversions { size url }
            }
          }
        }
      }
      paginatorInfo { currentPage lastPage total perPage }
    }
  }
`;

const PRODUCT_DETAIL_QUERY = `
  query SiteProduct($slug: String!) {
    siteProduct(slug: $slug) {
      id
      key
      translation { name slug description }
      availabilityStatus
      recommendedRetailPrice
      images {
        image {
          originalUrl
          conversions { size url }
        }
      }
      brand { translation { seoTitle } }
      category { breadcrumbs { name slug } }
    }
  }
`;

const CATEGORIES_QUERY = `
  query GetCategories {
    siteCategories(filtering: { root: true }) {
      id
      slug
      translation { name }
      children {
        id
        slug
        translation { name }
        children {
          id
          slug
          translation { name }
          children {
            id
            slug
            translation { name }
          }
        }
      }
    }
  }
`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export class MmaClient {
  constructor({ login, password, delayMs = 120 } = {}) {
    this.login = login;
    this.password = password;
    this.delayMs = delayMs;
    this.token = null;
  }

  async authenticate() {
    if (!this.login || !this.password) {
      console.warn('⚠️  MMA_LOGIN/MMA_PASSWORD не заданы — цены будут 0 без авторизации');
      return null;
    }

    const res = await fetch(MMA_LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: this.login, password: this.password }),
    });

    const json = await res.json();
    const payload = json?.data?.siteUserLogin || json?.siteUserLogin;

    if (!payload?.accessToken) {
      throw new Error(
        `MMA login failed: ${JSON.stringify(json?.graphQLErrors || json?.errors || json).slice(0, 300)}`
      );
    }

    this.token = payload.accessToken;
    console.log('✅ Авторизация MMA успешна');
    return this.token;
  }

  async graphql(query, variables = {}, operationName) {
    await sleep(this.delayMs);

    const res = await fetch(MMA_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      body: JSON.stringify({ query, variables, operationName }),
    });

    const json = await res.json();
    if (json.errors?.length) {
      throw new Error(json.errors.map((e) => e.message).join('; '));
    }
    return json.data;
  }

  async getRootCategories() {
    const data = await this.graphql(CATEGORIES_QUERY, {}, 'GetCategories');
    return data.siteCategories || [];
  }

  collectCategorySlugs(categories, acc = []) {
    for (const cat of categories) {
      if (cat.slug) acc.push(cat.slug);
      if (cat.children?.length) this.collectCategorySlugs(cat.children, acc);
    }
    return acc;
  }

  pickImageUrl(item) {
    const image = item?.image || item?.data?.[0]?.image || item;
    const conversions = image?.conversions || [];
    const preferred = [
      'medium_webp',
      'medium',
      'big_webp',
      'big',
      'small_webp',
      'small',
    ];

    for (const size of preferred) {
      const found = conversions.find((c) => c.size === size);
      if (found?.url) return found.url;
    }

    return image?.originalUrl || conversions[0]?.url || '';
  }

  pickAllImageUrls(items = []) {
    const list = Array.isArray(items) ? items : items?.data || [];
    const urls = [];

    for (const item of list) {
      const url = this.pickImageUrl(item);
      if (url && !urls.includes(url)) urls.push(url);
    }

    return urls;
  }

  async fetchCategoryProducts(categorySlug, page = 1, first = 48) {
    const data = await this.graphql(
      PRODUCTS_LIST_QUERY,
      {
        filtering: { page: 'CATEGORY', categorySlug },
        ordering: [],
        page,
        first,
      },
      'ProductsData'
    );
    return data.siteFilteredProducts;
  }

  async fetchAllCategoryProducts(categorySlug) {
    const all = [];
    let currentPage = 1;
    let lastPage = 1;

    do {
      const result = await this.fetchCategoryProducts(categorySlug, currentPage);
      all.push(...(result?.data || []));
      lastPage = result?.paginatorInfo?.lastPage || 1;
      currentPage += 1;
    } while (currentPage <= lastPage);

    return all;
  }

  async fetchProductDetails(slug) {
    const data = await this.graphql(
      PRODUCT_DETAIL_QUERY,
      { slug },
      'SiteProduct'
    );
    return data.siteProduct;
  }
}

export function mapAvailability(status) {
  return ['AVAILABLE', 'RUNNING_OUT', 'ARRIVAL', 'EXPECTED_ARRIVAL'].includes(
    status
  );
}
