'use client';

import React, { useState, useEffect } from 'react';
import TextInput from '../../components/TextInput';
import FlashcardList from '../../components/FlashcardList';
import './App.css';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

function IndexPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Load flashcards from localStorage on initial render
  useEffect(() => {
    const storedFlashcards = localStorage.getItem('flashcards');
    if (storedFlashcards) {
      setFlashcards(JSON.parse(storedFlashcards));
    }
  }, []);

  // Save flashcards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  const addFlashcards = (newFlashcards: Flashcard[]) => {
    setFlashcards((prevFlashcards) => [...prevFlashcards, ...newFlashcards]);
  };

  const deleteFlashcard = (id: string) => {
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
