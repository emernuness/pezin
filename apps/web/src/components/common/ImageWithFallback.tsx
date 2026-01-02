"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

/**
 * Image component with automatic fallback on load error.
 * Defaults to placeholder image if no fallback is provided.
 */
export function ImageWithFallback({
  src,
  fallbackSrc = PLACEHOLDER_IMAGE,
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      {...props}
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
