import type React from 'react';

/**
 * Standard visual fallback image for products and catalog cards when remote image URL fails to load.
 */

export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=600&q=80';

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = FALLBACK_PRODUCT_IMAGE
) => {
  const target = e.currentTarget;
  if (target && target.src !== fallbackSrc) {
    target.onerror = null; // Prevent infinite fallback loops
    target.src = fallbackSrc;
  }
};
