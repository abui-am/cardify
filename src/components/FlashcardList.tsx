'use client';
import React from 'react';
import Flashcard from './Flashcard';
import { Flashcard as FlashcardType } from '../types';
import './FlashcardList.css';

interface FlashcardListProps {
  flashcards: FlashcardType[];
  onDelete: (id: number) => void;
}

const FlashcardList: React.FC<FlashcardListProps> = ({
  flashcards,
  onDelete,
}) => {
  if (flashcards.length === 0) {
    return (
      <div className='empty-state'>
        <p>No flashcards yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className='flashcard-grid'>
      {flashcards.map((flashcard) => (
        <Flashcard
          key={flashcard.id}
          flashcard={flashcard}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default FlashcardList;
