'use client';

import React, { useState } from 'react';
import { Flashcard as FlashcardType } from '../types';
import './Flashcard.css';

interface FlashcardProps {
  flashcard: FlashcardType;
  onDelete: (id: number) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ flashcard, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(flashcard.id);
  };

  return (
    <div
      className={`flashcard ${isFlipped ? 'flipped' : ''}`}
      onClick={handleFlip}
    >
      <div className='flashcard-inner'>
        <div className='flashcard-front'>
          <p>{flashcard.title}</p>
          <div className='flashcard-actions'>
            <button
              className='delete-button'
              onClick={handleDelete}
              title='Delete flashcard'
            >
              ×
            </button>
          </div>
        </div>
        <div className='flashcard-back'>
          <p>{flashcard.description}</p>
          <div className='flashcard-actions'>
            <button
              className='delete-button'
              onClick={handleDelete}
              title='Delete flashcard'
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
