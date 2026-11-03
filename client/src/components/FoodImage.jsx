import { useState } from 'react';
import { getProductImage, getFallbackChain } from '../utils/foodImages';

export default function FoodImage({ product, alt, className = '' }) {
  const chain = getFallbackChain(product);
  const [index, setIndex] = useState(0);
  const src = chain[index] || chain[0];
  const label = alt || product?.name || 'Food item';

  const handleError = () => {
    setIndex(i => (i < chain.length - 1 ? i + 1 : i));
  };

  return (
    <img
      key={src}
      src={src}
      alt={label}
      className={className}
      loading="lazy"
      decoding="async"
      onError={handleError}
    />
  );
}
