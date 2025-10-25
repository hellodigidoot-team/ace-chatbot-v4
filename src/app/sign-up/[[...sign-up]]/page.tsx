// src/app/sign-up/[[...sign-up]]/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from './signup.module.css';

/**
 * Since Clerk authentication has been removed,
 * this page simply informs users that registration is disabled
 * and provides a link to continue to /chat.
 */
export default async function SignUpPage() {
  // Optional: Automatically redirect users to /chat
  // instead of showing this page. Uncomment if desired:
  // redirect('/chat');

  return (
    <main className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.brand}>Ace</h1>

        <div className={styles.panel}>
          <div className={styles.clerkWrap}>
            <h2 className={styles.clerkHeaderTitle}>Sign-Up Disabled</h2>
            <p className={styles.clerkSubtitle}>
              Account registration is no longer required to use Ace.
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
