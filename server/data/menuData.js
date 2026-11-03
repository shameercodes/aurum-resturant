const menuData = [
  // ─── STARTERS ───
  {
    name: "Truffle Arancini",
    category: "starters",
    price: 14,
    description: "Crispy risotto spheres filled with wild mushroom, black truffle, and aged Parmesan — served with saffron aioli.",
    image: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&q=80",
    badges: ["Vegetarian"],
    spiceLevel: 0,
    isVegetarian: true,
    featured: false
  },
  {
    name: "Tuna Tartare",
    category: "starters",
    price: 18,
    description: "Sashimi-grade tuna, avocado, sesame oil, micro herbs and a yuzu ponzu dressing on crispy wonton.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
    badges: ["Chef's Pick"],
    spiceLevel: 1,
    isVegetarian: false,
    featured: true
  },
  {
    name: "Burrata & Heritage Tomato",
    category: "starters",
    price: 13,
    description: "Creamy burrata with slow-roasted heirloom tomatoes, aged balsamic, fresh basil oil and toasted pine nuts.",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&q=80",
    badges: ["Vegetarian", "Seasonal"],
    spiceLevel: 0,
    isVegetarian: true,
    featured: false
  },
  {
    name: "Seared Scallops",
    category: "starters",
    price: 22,
    description: "King scallops seared in brown butter, served with cauliflower purée, crispy capers and pancetta crumbs.",
    image: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=600&q=80",
    badges: ["Signature"],
    spiceLevel: 0,
    isVegetarian: false,
    featured: true
  },
  {
    name: "Foie Gras Torchon",
    category: "starters",
    price: 26,
    description: "Classic duck foie gras with Sauternes jelly, toasted brioche and Granny Smith apple compote.",
    image: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=600&q=80",
    badges: ["Award-Winning"],
    spiceLevel: 0,
    isVegetarian: false,
    featured: true
  },
  // ─── MAINS ───
  {
    name: "Wagyu Fillet A5",
    category: "mains",
    price: 68,
    description: "200g Japanese A5 Wagyu with bone marrow butter, pomme purée, roasted bone marrow and a rich red wine jus.",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80",
    badges: ["Signature", "Award-Winning"],
    spiceLevel: 0,
    isVegetarian: false,
    featured: true
  },
  {
    name: "Pan-Seared Sea Bass",
    category: "mains",
    price: 34,
    description: "Whole fillet with saffron velouté, fennel confit, baby capers, samphire and lemon butter sauce.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80",
    badges: ["Chef's Pick"],
    spiceLevel: 0,
    isVegetarian: false,
    featured: true
  },
  {
    name: "Duck Confit",
    category: "mains",
    price: 29,
    description: "48-hour slow-cooked duck leg, cherry gastrique, dauphinois potato, crispy kale and duck jus.",
    image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&q=80",
    badges: ["Award-Winning"],
    spiceLevel: 0,
    isVegetarian: false,
    featured: false
  },
  {
    name: "Wild Mushroom Risotto",
    category: "mains",
    price: 24,
    description: "Carnaroli rice with mixed wild mushrooms, truffle oil, aged Parmesan foam and micro herbs.",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80",
    badges: ["Vegetarian", "Chef's Pick"],
    spiceLevel: 0,
    isVegetarian: true,
    featured: false
  },
  {
    name: "Rack of Lamb",
    category: "mains",
    price: 42,
    description: "French-trimmed lamb rack with herb crust, ratatouille, garlic confit and a rosemary jus.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
    badges: ["Seasonal"],
    spiceLevel: 0,
    isVegetarian: false,
    featured: false
  },
  {
    name: "Lobster Thermidor",
    category: "mains",
    price: 58,
    description: "Half native lobster with classic Thermidor sauce, gruyère glaze, fries and dressed watercress salad.",
    image: "https://images.unsplash.com/photo-1571167530149-c1105da4c2c2?w=600&q=80",
    badges: ["Signature"],
    spiceLevel: 0,
    isVegetarian: false,
    featured: true
  },
  // ─── DESSERTS ───
  {
    name: "Valrhona Fondant",
    category: "desserts",
    price: 12,
    description: "Warm Valrhona 70% chocolate fondant with molten centre, vanilla bean ice cream and salted caramel.",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80",
    badges: ["Signature"],
    spiceLevel: 0,
    isVegetarian: true,
    featured: true
  },
  {
    name: "Vanilla Crème Brûlée",
    category: "desserts",
    price: 9,
    description: "Madagascan vanilla custard with a perfectly caramelised sugar crust, fresh raspberries and tuile.",
    image: "https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=600&q=80",
    badges: ["Classic"],
    spiceLevel: 0,
    isVegetarian: true,
    featured: false
  },
  {
    name: "Mango & Passion Fruit Pavlova",
    category: "desserts",
    price: 11,
    description: "Crisp meringue, Chantilly cream, fresh mango, passion fruit curd and toasted coconut.",
    image: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=600&q=80",
    badges: ["Gluten-Free"],
    spiceLevel: 0,
    isVegetarian: true,
    featured: false
  },
  {
    name: "Cheese Selection",
    category: "desserts",
    price: 18,
    description: "Five artisan cheeses, quince paste, honeycomb, walnuts and seeded crackers. Ask your server for today's selection.",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80",
    badges: ["Vegetarian"],
    spiceLevel: 0,
    isVegetarian: true,
    featured: false
  },
  // ─── COCKTAILS ───
  {
    name: "The Gold Rush",
    category: "cocktails",
    price: 16,
    description: "Woodford Reserve bourbon, wild honey syrup, fresh lemon juice and a touch of edible 24k gold dust.",
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80",
    badges: ["House Special"],
    spiceLevel: 0,
    isVegetarian: true,
    featured: true
  },
  {
    name: "Elderflower Fizz",
    category: "cocktails",
    price: 14,
    description: "Hendrick's gin, elderflower cordial, cucumber, fresh mint, lime and Fever-Tree premium tonic.",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80",
    badges: ["Bestseller"],
    spiceLevel: 0,
    isVegetarian: true,
    featured: false
  },
  {
    name: "Aurum Negroni",
    category: "cocktails",
    price: 15,
    description: "Monkey 47 gin, Campari, Cocchi Vermouth di Torino, stirred and served over a large ice sphere with orange.",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
    badges: ["Classic"],
    spiceLevel: 0,
    isVegetarian: true,
    featured: false
  },
  {
    name: "Smoked Old Fashioned",
    category: "cocktails",
    price: 17,
    description: "Buffalo Trace bourbon, demerara sugar, Angostura bitters, orange peel — served under cherry wood smoke.",
    image: "https://images.unsplash.com/photo-1470338745628-171cf53de3a8?w=600&q=80",
    badges: ["Chef's Pick"],
    spiceLevel: 0,
    isVegetarian: true,
    featured: true
  },
  {
    name: "Berry Bellini",
    category: "cocktails",
    price: 13,
    description: "Prosecco with house-made raspberry and blackberry purée, fresh mint and edible flowers.",
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&q=80",
    badges: ["Non-Alcoholic Option"],
    spiceLevel: 0,
    isVegetarian: true,
    featured: false
  }
];

module.exports = menuData;
