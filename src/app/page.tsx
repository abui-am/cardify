import { redirect } from 'next/navigation';
import { SignedIn } from '@clerk/nextjs';

export default function Home() {
  return <SignedIn>{redirect('/sets')}</SignedIn>;
}
