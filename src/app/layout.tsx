// src/app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import Script from 'next/script';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Bootstrap JS bundle */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossOrigin="anonymous"
        />

        {/* Optional header (you can customize or remove) */}
        <header className="d-flex justify-content-end align-items-center p-3 gap-3">
          <span className="text-muted">Ace by The Air Assist</span>
        </header>

        {/* Main content */}
        {children}
      </body>
    </html>
  );
}
