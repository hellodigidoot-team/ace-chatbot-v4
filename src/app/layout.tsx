import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { enUS } from '@clerk/localizations';
import type { LocalizationResource } from '@clerk/types';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import Script from 'next/script';

const locale: LocalizationResource = {
  ...enUS,
  signIn: {
    ...enUS.signIn,
    start: { ...enUS.signIn?.start, title: 'Clerk Authentication', subtitle: '' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={locale}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
    >
      <html lang="en">
        <body>
          <Script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
            strategy="afterInteractive"
            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
            crossOrigin="anonymous"
          />
          <header className="d-flex justify-content-end align-items-center p-3 gap-3">
            <SignedOut />
            <SignedIn><UserButton /></SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
