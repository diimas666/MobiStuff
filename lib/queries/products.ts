export const GET_ALL_PRODUCTS_QUERY = `
{
  products(first: 250) {
    edges {
      node {
        id
        title
        handle
        productType  # ← Это поле «Тип продукта» (например, Кабелі, Повербанки)
        tags         # ← Все теги
        description
        featuredImage {
          url
          altText
        }
        variants(first: 1) {
          edges {
            node {
              price {
                amount
              }
            }
          }
        }
      }
    }
  }
}
`;
