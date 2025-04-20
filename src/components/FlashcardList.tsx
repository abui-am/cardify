'use client';
import React from 'react';
import Flashcard from './Flashcard';
import { Flashcard as FlashcardType } from '../types';

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
      <div className='bg-gray-100 rounded-lg p-8 text-center'>
        <p className='text-gray-600'>
          No flashcards yet. Create your first one!
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
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
