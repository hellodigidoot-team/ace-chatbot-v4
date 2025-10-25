// src/app/sign-in/[[...sign-in]]/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from './signin.module.css';

/**
 * Since Clerk authentication has been removed, this page now
 * simply informs users that sign-in is disabled and links to /chat.
 */
export default async function SignInPage() {
  // Optional: If you still want to redirect automatically to /chat
  // instead of showing this page, uncomment the next line:
  // redirect('/chat');

  return (
    <main className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.brand}>Ace</h1>

        <div className={styles.panel}>
          <div className={styles.clerkWrap}>
            <h2 className={styles.clerkHeaderTitle}>Sign-In Disabled</h2>
            <p className={styles.clerkSubtitle}>
              Account login is no longer required to use Ace.
            </p>
            <Link href="/chat" className={styles.clerkPrimaryBtn}>
              Go to Chat
            </Link>
          </div>

          <p className={styles.powered}>Powered by The Air Assist</p>
        </div>
      </div>
    </main>
  );
}
