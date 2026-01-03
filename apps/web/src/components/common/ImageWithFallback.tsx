"use client";

import Image, { type ImageProps } from "next/image";
import { useState, useEffect } from "react";
import { PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE_SVG } from "@/utils/constants";

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

interface SimpleImageWithFallbackProps {
  src: string | undefined | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

/**
 * Simple img tag with automatic fallback on load error.
 * Use this when you don't need next/image optimization.
 */
export function SimpleImageWithFallback({
  src,
  alt,
  className = "",
  fallbackSrc = PLACEHOLDER_IMAGE_SVG,
}: SimpleImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
      className={className}
    />
  );
}
