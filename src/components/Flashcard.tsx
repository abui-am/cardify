'use client';

import React, { useState } from 'react';
import { Flashcard as FlashcardType } from '../types';

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
      className='relative h-64 w-full perspective-1000 cursor-pointer group'
      onClick={handleFlip}
    >
      <div
        className={`absolute w-full h-full preserve-3d transition-transform duration-500 ease-in-out ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of card */}
        <div className='absolute inset-0 w-full h-full bg-white rounded-lg shadow-md p-5 flex flex-col justify-between backface-hidden'>
          <div className='flex-1 overflow-y-auto'>
            <p className='text-lg font-medium text-gray-800'>
              {flashcard.title}
            </p>
          </div>
          <div className='absolute top-2 right-2'>
            <button
              className='text-2xl text-gray-500 hover:text-red-500 transition-colors'
              onClick={handleDelete}
              title='Delete flashcard'
            >
              ×
            </button>
          </div>
          <div className='mt-4 text-center text-sm text-gray-500'>
            Click to flip
          </div>
        </div>

        {/* Back of card */}
        <div className='absolute inset-0 w-full h-full bg-blue-50 rounded-lg shadow-md p-5 flex flex-col justify-between backface-hidden rotate-y-180'>
          <div className='flex-1 overflow-y-auto'>
            <p className='text-gray-700'>{flashcard.description}</p>
          </div>
          <div className='absolute top-2 right-2'>
            <button
              className='text-2xl text-gray-500 hover:text-red-500 transition-colors'
              onClick={handleDelete}
              title='Delete flashcard'
            >
              ×
            </button>
          </div>
          <div className='mt-4 text-center text-sm text-gray-500'>
            Click to flip
          </div>
        </div>
      </div>

      {/* Add flip indicator */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Flashcard;
