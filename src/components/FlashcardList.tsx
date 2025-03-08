'use client';
import React from 'react';
import Flashcard from './Flashcard';
import { Flashcard as FlashcardType } from '../types';
import './FlashcardList.css';

interface FlashcardListProps {
  flashcards: FlashcardType[];
  onDelete: (id: string) => void;
}

const FlashcardList: React.FC<FlashcardListProps> = ({
  flashcards,
  onDelete,
}) => {
  return (
    <div className='flashcard-list'>
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
