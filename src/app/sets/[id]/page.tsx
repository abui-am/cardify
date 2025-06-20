'use client';

import FlashcardForm from '@/components/Form/FlashcardForm';
import FlashcardList from '@/components/List/FlashcardList';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useSupabase } from '@/context/Supabase';
import type { Flashcard, Set } from '@/types';
import { SignedIn } from '@clerk/nextjs';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function SetDetailPage() {
  const [set, setSet] = useState<Set | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { supabase } = useSupabase();
  const params = useParams();
  const router = useRouter();
  const setId = Number(params.id);

  // Load set and its flashcards
  const loadSetData = async () => {
    if (!setId || !supabase) return;
    setIsLoading(true);

    try {
      // Use executeQuery to handle token expiration automatically
      const setResponse = await supabase
        .from('sets')
        .select()
        .eq('id', setId)
        .single();

      if (setResponse.error) {
        console.error(setResponse.error);
        if (setResponse.error.code === 'PGRST116') {
          // Set not found
          router.push('/sets');
          return;
        }
        return;
      }

      if (setResponse.data) {
        setSet(setResponse.data);
      }

      // Get flashcards for this set with token refresh handling
      const cardsResponse = await supabase
        .from('cards')
        .select()
        .eq('set_id', setId)
        .order('created_at', { ascending: false });

      if (cardsResponse.error) {
        console.error(cardsResponse.error);
        return;
      }

      if (cardsResponse.data) {
        setFlashcards(cardsResponse.data);
      }
    } catch (error) {
      console.error('Error loading set data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (supabase) {
      loadSetData();
    }
  }, [setId, supabase]);

  const addFlashcard = (newFlashcard: Flashcard) => {
    setFlashcards((prevFlashcards) => [newFlashcard, ...prevFlashcards]);
  };

  const addMultipleFlashcards = (newFlashcards: Flashcard[]) => {
    setFlashcards((prevFlashcards) => [...newFlashcards, ...prevFlashcards]);
  };

  const deleteFlashcard = async (id: number) => {
    if (!supabase) return;
    try {
      // Use executeQuery to handle token expiration automatically
      const result = await supabase.from('cards').delete().eq('id', id);

      if (result.error) {
        console.error(result.error);
        toast.error('Failed to delete flashcard');
        return;
      }

      setFlashcards((prevFlashcards) =>
        prevFlashcards.filter((flashcard) => flashcard.id !== id)
      );
      toast.success('Flashcard deleted successfully');
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast.error('Error deleting flashcard. Please try again.');
    }
  };

  // Delete the entire set and its flashcards
  const openDeleteDialog = () => {
    if (set) {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteSet = async () => {
    if (!set || !supabase) return;

    setIsDeleting(true);

    try {
      // First delete all flashcards in the set with token refresh handling
      const deleteCardsResult = await supabase
        .from('cards')
        .delete()
        .eq('set_id', setId);

      if (deleteCardsResult.error) {
        throw new Error(
          `Failed to delete flashcards: ${deleteCardsResult.error.message}`
        );
      }

      // Then delete the set itself with token refresh handling
      const deleteSetResult = await supabase
        .from('sets')
        .delete()
        .eq('id', setId);

      if (deleteSetResult.error) {
        throw new Error(
          `Failed to delete set: ${deleteSetResult.error.message}`
        );
      }

      toast.success(`Set "${set.name}" deleted successfully`);

      // Redirect to the sets page
      router.push('/sets');
    } catch (error) {
      console.error('Error deleting set:', error);
      toast.error('Failed to delete the set. Please try again.');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

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
              {flashcards.length > 0 && (
                <Link
                  href={`/sets/${setId}/test`}
                  className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2'
                >
                  <svg
                    className='w-4 h-4'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                    xmlns='http://www.w3.org/2000/svg'
                    aria-hidden='true'
                  >
                    <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  Test Knowledge
                </Link>
              )}
              <button
                onClick={openDeleteDialog}
                disabled={isDeleting}
                className='text-red-500 hover:text-red-700 text-sm font-medium flex items-center'
                title='Delete this set'
                type='button'
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
                      aria-label='Delete set'
                      aria-hidden='true'
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
