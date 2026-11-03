/** Reliable food image URLs (Foodish API + stable Unsplash) */
const img = (url) => url;

module.exports = [
  // Pizza
  { name: 'Margherita Pizza', description: 'Classic tomato, mozzarella and fresh basil', price: 12.99, category: 'Pizza', image: img('https://foodish-api.com/images/pizza/pizza1.jpg'), rating: 4.8, stock: 40 },
  { name: 'Pepperoni Feast', description: 'Double pepperoni with mozzarella and oregano', price: 14.99, category: 'Pizza', image: img('https://foodish-api.com/images/pizza/pizza2.jpg'), rating: 4.7, stock: 35 },
  { name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce, grilled chicken, red onion', price: 15.49, category: 'Pizza', image: img('https://foodish-api.com/images/pizza/pizza3.jpg'), rating: 4.6, stock: 30 },
  { name: 'Four Cheese Pizza', description: 'Mozzarella, gorgonzola, parmesan and ricotta', price: 15.99, category: 'Pizza', image: img('https://foodish-api.com/images/pizza/pizza4.jpg'), rating: 4.7, stock: 28 },
  { name: 'Veggie Supreme', description: 'Roasted peppers, olives, mushrooms and red onion', price: 13.49, category: 'Pizza', image: img('https://foodish-api.com/images/pizza/pizza5.jpg'), rating: 4.5, stock: 32 },
  { name: 'Spicy Diavola', description: 'Spicy salami, chilli flakes and hot honey drizzle', price: 14.49, category: 'Pizza', image: img('https://foodish-api.com/images/pizza/pizza6.jpg'), rating: 4.6, stock: 26 },
  { name: 'Hawaiian Pizza', description: 'Ham, pineapple and mozzarella — sweet & savoury', price: 13.99, category: 'Pizza', image: img('https://foodish-api.com/images/pizza/pizza7.jpg'), rating: 4.3, stock: 24 },

  // Burgers
  { name: 'Classic Cheeseburger', description: 'Angus beef, cheddar, pickles, special sauce', price: 11.99, category: 'Burgers', image: img('https://foodish-api.com/images/burger/burger1.jpg'), rating: 4.9, stock: 45 },
  { name: 'Double Smash Burger', description: 'Two patties, american cheese, caramelized onions', price: 13.99, category: 'Burgers', image: img('https://foodish-api.com/images/burger/burger2.jpg'), rating: 4.8, stock: 38 },
  { name: 'Crispy Chicken Burger', description: 'Buttermilk fried chicken, coleslaw, mayo', price: 12.49, category: 'Burgers', image: img('https://foodish-api.com/images/burger/burger3.jpg'), rating: 4.5, stock: 32 },
  { name: 'Bacon BBQ Burger', description: 'Crispy bacon, BBQ glaze, onion rings', price: 14.49, category: 'Burgers', image: img('https://foodish-api.com/images/burger/burger4.jpg'), rating: 4.7, stock: 30 },
  { name: 'Mushroom Swiss Burger', description: 'Sautéed mushrooms, swiss cheese, garlic aioli', price: 13.49, category: 'Burgers', image: img('https://foodish-api.com/images/burger/burger5.jpg'), rating: 4.6, stock: 28 },
  { name: 'Veggie Patty Burger', description: 'Plant-based patty, avocado, tomato, vegan mayo', price: 11.49, category: 'Burgers', image: img('https://foodish-api.com/images/burger/burger6.jpg'), rating: 4.4, stock: 35 },
  { name: 'Fish Fillet Burger', description: 'Beer-battered cod, tartare sauce, lettuce', price: 12.99, category: 'Burgers', image: img('https://foodish-api.com/images/burger/burger7.jpg'), rating: 4.5, stock: 22 },

  // Drinks (verified Unsplash URLs — broken IDs replaced)
  { name: 'Fresh Lemonade', description: 'House-made with mint and sparkling water', price: 3.99, category: 'Drinks', image: img('https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&h=450&q=80'), rating: 4.4, stock: 80 },
  { name: 'Iced Caramel Latte', description: 'Cold brew espresso with caramel and oat milk', price: 4.99, category: 'Drinks', image: img('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&h=450&q=80'), rating: 4.6, stock: 60 },
  { name: 'Berry Smoothie', description: 'Mixed berries, banana, yogurt blend', price: 5.49, category: 'Drinks', image: img('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&h=450&q=80'), rating: 4.5, stock: 55 },
  { name: 'Mango Milkshake', description: 'Thick blend of ripe mango and vanilla ice cream', price: 5.99, category: 'Drinks', image: img('https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&h=450&q=80'), rating: 4.6, stock: 48 },
  { name: 'Cola Zero', description: 'Chilled 330ml — zero sugar', price: 2.49, category: 'Drinks', image: img('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&h=450&q=80'), rating: 4.2, stock: 100 },
  { name: 'Peach Iced Tea', description: 'Brewed black tea with natural peach flavour', price: 3.49, category: 'Drinks', image: img('https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&h=450&q=80'), rating: 4.3, stock: 70 },
  { name: 'Espresso Shot', description: 'Double ristretto — bold and smooth', price: 2.99, category: 'Drinks', image: img('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&h=450&q=80'), rating: 4.7, stock: 90 },

  // Desserts
  { name: 'Chocolate Lava Cake', description: 'Warm molten center with vanilla gelato', price: 7.99, category: 'Desserts', image: img('https://foodish-api.com/images/dessert/dessert1.jpg'), rating: 4.9, stock: 25 },
  { name: 'New York Cheesecake', description: 'Creamy classic with berry compote', price: 6.99, category: 'Desserts', image: img('https://foodish-api.com/images/dessert/dessert2.jpg'), rating: 4.7, stock: 28 },
  { name: 'Tiramisu Cup', description: 'Espresso-soaked ladyfingers, mascarpone', price: 6.49, category: 'Desserts', image: img('https://foodish-api.com/images/dessert/dessert3.jpg'), rating: 4.8, stock: 22 },
  { name: 'Brownie Sundae', description: 'Warm brownie, chocolate sauce, whipped cream', price: 7.49, category: 'Desserts', image: img('https://foodish-api.com/images/dessert/dessert4.jpg'), rating: 4.8, stock: 20 },
  { name: 'Apple Pie Slice', description: 'Buttery crust, cinnamon apples, custard', price: 5.99, category: 'Desserts', image: img('https://foodish-api.com/images/dessert/dessert5.jpg'), rating: 4.5, stock: 24 },
  { name: 'Cookie Dough Ice Cream', description: 'Vanilla base with chocolate chip cookie dough', price: 5.49, category: 'Desserts', image: img('https://foodish-api.com/images/dessert/dessert6.jpg'), rating: 4.6, stock: 30 },
  { name: 'Churros & Dip', description: 'Cinnamon sugar churros with chocolate sauce', price: 5.99, category: 'Desserts', image: img('https://foodish-api.com/images/dessert/dessert7.jpg'), rating: 4.7, stock: 26 },
];
