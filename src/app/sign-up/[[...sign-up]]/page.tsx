// src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import styles from './signup.module.css';

export default async function Page() {
  // If the user is already authenticated, send them to /chat
  const { userId } = await auth();
  if (userId) redirect('/chat');

  return (
    <main className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.brand}>Ace</h1>

        <div className={styles.panel}>
          <div className={styles.clerkWrap}>
            <SignUp
              routing="hash"
              signInUrl="/sign-in"
              afterSignUpUrl="/chat"
              afterSignInUrl="/chat"
              appearance={{
                variables: {
                  colorPrimary: '#3DB6A4',
                  colorText: '#000000ff',
                  colorBackground: 'transparent',
                  borderRadius: '14px',
                  fontFamily:
                    "'Fredoka', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif",
                },
                elements: {
                  // Header (ghost image + title)
                  header: styles.clerkHeaderGhost,
                  headerTitle: styles.clerkHeaderTitle,
                  headerSubtitle: styles.hidden,

                  // Container + card
                  rootBox: styles.clerkRoot,
                  card: styles.clerkCard,

                  // Form controls
                  form: styles.clerkForm,
                  formFieldLabel: styles.clerkLabel,
                  formFieldInput: styles.clerkInput,

                  // Primary action button
                  formButtonPrimary: styles.clerkPrimaryBtn,

                  // Footer / links / divider
                  footer: styles.clerkFooter,
                  footerAction: styles.clerkFooterAction,
                  footerActionText: styles.clerkFooterActionText,
                  dividerText: styles.clerkDividerText,

                  // Social buttons
                  socialButtonsBlockButton: styles.clerkSocialBtn,
                  socialButtonsIconButton: styles.clerkSocialBtn, // cover both variants
                },
                layout: { socialButtonsVariant: 'iconButton' },
              }}
            />
          </div>

          <p className={styles.powered}>Powered by The Air Assist</p>
        </div>
      </div>
    </main>
  );
}
