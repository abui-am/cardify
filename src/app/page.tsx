import IndexPage from '@/components/pages';
import { SignedIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function Home() {
  return (
    <SignedIn>
      <IndexPage />
    </SignedIn>
  );
}
