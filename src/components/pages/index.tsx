'use client';

import React, { useState, useEffect, useContext } from 'react';
import TextInput from '../../components/TextInput';
import FlashcardList from '../../components/FlashcardList';
import './App.css';
import { Flashcard } from '@/types';
import { SupabaseContext } from '@/context/Supabase';

function IndexPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Load flashcards from localStorage on initial render
  const { supabase } = useContext(SupabaseContext);
  const getFlashcards = async () => {
    try {
      const result = await supabase?.from('cards').select();
      console.log(result);
      if (result?.error) {
        console.error(result.error);
      }
      if (result?.data) {
        setFlashcards(result.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getFlashcards();
  }, []);

  // Save flashcards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  const addFlashcards = (newFlashcards: Flashcard[]) => {
    setFlashcards((prevFlashcards) => [...prevFlashcards, ...newFlashcards]);
  };

  const deleteFlashcard = (id: number) => {
    setFlashcards((prevFlashcards) =>
      prevFlashcards.filter((flashcard) => flashcard.id !== id)
    );
  };

  const clearAllFlashcards = () => {
    if (window.confirm('Are you sure you want to delete all flashcards?')) {
      setFlashcards([]);
    }
  };

  return (
    <div className='app'>
      <header>
        <h1>Text to Flashcards</h1>
      </header>
      <main>
        <TextInput onFlashcardsGenerated={addFlashcards} />
        {flashcards.length > 0 && (
          <>
            <div className='flashcards-header'>
              <h2>Your Flashcards ({flashcards.length})</h2>
              <button className='clear-button' onClick={clearAllFlashcards}>
                Clear All
              </button>
            </div>
            <FlashcardList flashcards={flashcards} onDelete={deleteFlashcard} />
          </>
        )}
      </main>
    </div>
  );
}

export default IndexPage;
