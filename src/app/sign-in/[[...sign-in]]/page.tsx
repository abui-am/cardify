'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams.get('redirect_url');

  // Handle redirection after successful sign-in
  const handleAfterSignIn = () => {
    // If we have a redirect URL from parameters, navigate there
    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      // Otherwise go to the default destination
      router.push('/');
    }
  };

  // Display debug info during development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sign-in redirect URL:', redirectUrl);
      console.log('Source:', searchParams.get('source'));
    }
  }, [redirectUrl, searchParams]);

  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-80px)]'>
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-indigo-600 hover:bg-indigo-700 text-sm normal-case',
            card: 'shadow-lg rounded-lg',
          },
        }}
        redirectUrl={redirectUrl || '/'}
        afterSignInUrl={redirectUrl || '/'}
      />
    </div>
  );
}
