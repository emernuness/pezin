"use client";

import Image from "next/image";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {/* Background Image */}
      <Image
        src="/img/bg-hero.png"
        alt=""
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Overlay Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-8 flex justify-center">
          <Image
            src="/img/logo-white.svg"
            alt="Pack do Pezin"
            width={180}
            height={40}
            className="h-16 w-auto"
          />
        </Link>

        {children}
      </div>
    </div>
  );
}
