'use client';

import type React from 'react';
import { useState } from 'react';
import type { Flashcard as FlashcardType } from '../types';
import ConfirmDialog from './ui/ConfirmDialog';

interface FlashcardProps {
  flashcard: FlashcardType;
  onDelete: (id: number) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ flashcard, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete(flashcard.id);
    setIsDeleteDialogOpen(false);
  };

  // Common delete button component
  const DeleteButton = () => (
    <button
      className='text-gray-400 hover:text-red-500 transition-colors'
      onClick={handleDelete}
      title='Delete flashcard'
    >
      <svg
        className='w-5 h-5'
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
    </button>
  );

  return (
    <>
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
              <DeleteButton />
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
              <DeleteButton />
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

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title='Delete Flashcard'
        description='Are you sure you want to delete this flashcard? This action cannot be undone.'
        confirmText='Delete'
        isDanger={true}
      />
    </>
  );
};

export default Flashcard;
