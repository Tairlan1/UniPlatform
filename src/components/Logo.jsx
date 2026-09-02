import React from "react";

function Logo({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="damqorHex" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0891B2" />
          <stop offset="1" stopColor="#0E7490" />
        </linearGradient>
      </defs>
      <path
        d="M24 2 44 13.5 44 34.5 24 46 4 34.5 4 13.5Z"
        fill="url(#damqorHex)"
      />
      <path
        d="M17 14h7.2c6.6 0 10.6 3.9 10.6 10s-4 10-10.6 10H17Zm5.1 4.4v11.2h2c3.7 0 5.6-2.1 5.6-5.6s-1.9-5.6-5.6-5.6Z"
        fill="white"
      />
      <path d="M31 12.5 34.5 9l1.8 1.8-3.5 3.5Z" fill="#FBBF24" />
    </svg>
  );
}

export default Logo;
