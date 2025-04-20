'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flashcard, Set } from '@/types';
import FlashcardList from '@/components/FlashcardList';
import FlashcardForm from '@/components/FlashcardForm';
import { SupabaseContext } from '@/context/Supabase';
import { SignedIn } from '@clerk/nextjs';

export default function SetDetailPage() {
  const [set, setSet] = useState<Set | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { supabase } = useContext(SupabaseContext);
  const params = useParams();
  const router = useRouter();
  const setId = Number(params.id);

  // Load set and its flashcards
  const loadSetData = async () => {
    if (!setId) return;
    setIsLoading(true);

    try {
      // Get set details
      const setResult = await supabase
        ?.from('sets')
        .select()
        .eq('id', setId)
        .single();

      if (setResult?.error) {
        console.error(setResult.error);
        if (setResult.error.code === 'PGRST116') {
          // Set not found
          router.push('/sets');
          return;
        }
        return;
      }

      if (setResult?.data) {
        setSet(setResult.data);
      }

      // Get flashcards for this set
      const cardsResult = await supabase
        ?.from('cards')
        .select()
        .eq('set_id', setId)
        .order('created_at', { ascending: false });

      if (cardsResult?.error) {
        console.error(cardsResult.error);
        return;
      }

      if (cardsResult?.data) {
        setFlashcards(cardsResult.data);
      }
    } catch (error) {
      console.error('Error loading set data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSetData();
  }, [setId]);

  const addFlashcard = (newFlashcard: Flashcard) => {
    setFlashcards((prevFlashcards) => [newFlashcard, ...prevFlashcards]);
  };

  const deleteFlashcard = async (id: number) => {
    try {
      const result = await supabase?.from('cards').delete().eq('id', id);

      if (result?.error) {
        console.error(result.error);
        return;
      }

      setFlashcards((prevFlashcards) =>
        prevFlashcards.filter((flashcard) => flashcard.id !== id)
      );
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='container'>
        <div className='text-center py-10'>Loading set data...</div>
      </div>
    );
  }

  if (!set) {
    return (
      <div className='container'>
        <div className='text-center py-10'>
          <p>Set not found</p>
          <Link href='/sets' className='text-blue-500 mt-4 inline-block'>
            Back to Sets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SignedIn>
      <div className='container'>
        <header className='mb-8'>
          <nav className='mb-4'>
            <Link href='/sets' className='text-blue-500 hover:underline'>
              ← Back to Sets
            </Link>
          </nav>
          <div className='flex items-center justify-between'>
            <h1 className='text-3xl font-bold'>{set.name}</h1>
            <div className='text-sm text-gray-500'>
              Created: {new Date(set.created_at).toLocaleDateString()}
            </div>
          </div>
        </header>

        <main>
          <FlashcardForm setId={setId} onFlashcardCreated={addFlashcard} />

          <div className='mt-10'>
            {flashcards.length > 0 ? (
              <>
                <div className='flashcards-header'>
                  <h2 className='text-xl font-semibold'>
                    Flashcards in this Set ({flashcards.length})
                  </h2>
                </div>
                <FlashcardList
                  flashcards={flashcards}
                  onDelete={deleteFlashcard}
                />
              </>
            ) : (
              <div className='empty-state'>
                <p>No flashcards in this set yet. Add your first one above!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SignedIn>
  );
}
