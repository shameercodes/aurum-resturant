/** Verified image URLs — updated when CDN links break */

const DRINK_IMAGES = {
  lemonade:
    "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&h=450&q=80",
  latte:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&h=450&q=80",
  smoothie:
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&h=450&q=80",
  mango:
    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&h=450&q=80",
  cola: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&h=450&q=80",
  tea: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&h=450&q=80",
  espresso:
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&h=450&q=80",
};

const CATEGORY_FALLBACK = {
  Pizza:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&h=450&q=80",
  Burgers:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&h=450&q=80",
  Drinks: DRINK_IMAGES.lemonade,
  Desserts:
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&h=450&q=80",
};

const DEFAULT_FALLBACK = CATEGORY_FALLBACK.Pizza;

export const CATEGORY_THUMBS = {
  Pizza:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&h=450&q=80",
  Burgers:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&h=450&q=80",
  Drinks: DRINK_IMAGES.lemonade,
  Desserts:
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&h=450&q=80",
};

/** Map product names to verified drink images */
const DRINK_BY_NAME = {
  "Fresh Lemonade": DRINK_IMAGES.lemonade,
  "Iced Caramel Latte": DRINK_IMAGES.latte,
  "Berry Smoothie": DRINK_IMAGES.smoothie,
  "Mango Milkshake": DRINK_IMAGES.mango,
  "Cola Zero": DRINK_IMAGES.cola,
  "Peach Iced Tea": DRINK_IMAGES.tea,
  "Espresso Shot": DRINK_IMAGES.espresso,
};

export function getProductImage(product) {
  // Always prefer the saved product image (Cloudinary).
  if (product?.image?.trim()) {
    return product.image.trim();
  }

  // Use drink-specific fallback only when no product image exists.
  if (product?.name && DRINK_BY_NAME[product.name]) {
    return DRINK_BY_NAME[product.name];
  }

  return CATEGORY_FALLBACK[product?.category] || DEFAULT_FALLBACK;
}

export function getFallbackChain(product) {
  const chain = [];
  const primary = getProductImage(product);
  if (primary) chain.push(primary);
  if (product?.category && CATEGORY_FALLBACK[product.category]) {
    chain.push(CATEGORY_FALLBACK[product.category]);
  }
  if (product?.name && DRINK_BY_NAME[product.name]) {
    chain.push(DRINK_BY_NAME[product.name]);
  }
  chain.push(DEFAULT_FALLBACK);
  return [...new Set(chain)];
}

export function getFallbackImage(category) {
  return CATEGORY_FALLBACK[category] || DEFAULT_FALLBACK;
}
