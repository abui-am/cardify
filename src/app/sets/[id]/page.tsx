'use client';

import FlashcardForm from '@/components/FlashcardForm';
import FlashcardList from '@/components/FlashcardList';
import { SupabaseContext } from '@/context/Supabase';
import type { Flashcard, Set } from '@/types';
import { SignedIn } from '@clerk/nextjs';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useContext } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function SetDetailPage() {
  const [set, setSet] = useState<Set | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  const addMultipleFlashcards = (newFlashcards: Flashcard[]) => {
    setFlashcards((prevFlashcards) => [...newFlashcards, ...prevFlashcards]);
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

  // Delete the entire set and its flashcards
  const openDeleteDialog = () => {
    if (set) {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteSet = async () => {
    if (!set) return;

    setIsDeleting(true);

    try {
      // First delete all flashcards in the set
      const deleteCardsResult = await supabase
        ?.from('cards')
        .delete()
        .eq('set_id', setId);

      if (deleteCardsResult?.error) {
        throw new Error(
          `Failed to delete flashcards: ${deleteCardsResult.error.message}`
        );
      }

      // Then delete the set itself
      const deleteSetResult = await supabase
        ?.from('sets')
        .delete()
        .eq('id', setId);

      if (deleteSetResult?.error) {
        throw new Error(
          `Failed to delete set: ${deleteSetResult.error.message}`
        );
      }

      // Redirect to the sets page
      router.push('/sets');
    } catch (error) {
      console.error('Error deleting set:', error);
      alert('Failed to delete the set. Please try again.');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
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
            <div className='flex items-center gap-4'>
              <div className='text-sm text-gray-500'>
                Created: {new Date(set.created_at).toLocaleDateString()}
              </div>
              <button
                onClick={openDeleteDialog}
                disabled={isDeleting}
                className='text-red-500 hover:text-red-700 text-sm font-medium flex items-center'
                title='Delete this set'
              >
                {isDeleting ? (
                  'Deleting...'
                ) : (
                  <>
                    <svg
                      className='w-4 h-4 mr-1'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        fillRule='evenodd'
                        d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Delete Set
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        <main>
          <FlashcardForm
            setId={setId}
            onFlashcardCreated={addFlashcard}
            onMultipleFlashcardsCreated={addMultipleFlashcards}
          />

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
                <p>
                  No flashcards in this set yet. Add your first one above or
                  generate with AI!
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Delete confirmation dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteSet}
          title='Delete Flashcard Set'
          description={`Are you sure you want to delete "${set?.name}" and all its flashcards (${flashcards.length} cards)? This action cannot be undone.`}
          confirmText='Delete Set'
          isLoading={isDeleting}
          isDanger={true}
        />
      </div>
    </SignedIn>
  );
}
