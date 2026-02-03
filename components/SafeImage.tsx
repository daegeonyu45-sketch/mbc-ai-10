
import React, { useState, useEffect } from 'react';
import { CategoryType } from '../types';

interface SafeImageProps {
  src?: string;
  category?: CategoryType | string;
  className?: string;
  alt?: string;
}

const FALLBACK_IMAGES: Record<string, string> = {
  politics: "https://images.unsplash.com/photo-1529101091760-6149d4c46b7a?w=1200&q=80",
  economy: "https://images.unsplash.com/photo-1611974765270-ca1258634369?w=1200&q=80",
  society: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
  tech: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80",
  culture: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80",
  default: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80"
};

export const SafeImage: React.FC<SafeImageProps> = ({ src, category, className, alt = "News visual" }) => {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const getFallback = () => {
    const key = category?.toLowerCase() || 'default';
    return FALLBACK_IMAGES[key] || FALLBACK_IMAGES.default;
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(getFallback());
    } else if (currentSrc !== FALLBACK_IMAGES.default) {
      // 카테고리 이미지마저 실패했을 때 최후의 보루
      setCurrentSrc(FALLBACK_IMAGES.default);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-slate-200 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 animate-pulse bg-slate-300 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={currentSrc || getFallback()}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
      />
    </div>
  );
};
