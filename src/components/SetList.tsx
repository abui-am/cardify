'use client';
import Link from 'next/link';
import type React from 'react';
import type { Set } from '../types';

interface SetWithCardCount extends Set {
  card_count?: number;
}

interface SetListProps {
  sets: SetWithCardCount[];
  onDeleteSet?: (setId: number, setName: string) => void;
}

const SetList: React.FC<SetListProps> = ({ sets, onDeleteSet }) => {
  if (sets.length === 0) {
    return (
      <div className='bg-gray-100 rounded-lg p-8 text-center'>
        <p className='text-gray-600'>
          No flashcard sets yet. Create your first one!
        </p>
      </div>
    );
  }

  const handleDelete = (e: React.MouseEvent, set: SetWithCardCount) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDeleteSet) {
      onDeleteSet(set.id, set.name || '');
    }
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
      {sets.map((set) => (
        <div
          key={set.id}
          className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden relative'
        >
          {onDeleteSet && (
            <button
              onClick={(e) => handleDelete(e, set)}
              className='absolute top-2 right-2 text-gray-400 hover:text-red-500 z-10'
              title='Delete set'
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
          )}
          <Link href={`/sets/${set.id}`} className='block p-5 h-full'>
            <h3 className='text-xl font-medium text-gray-800 mb-2'>
              {set.name}
            </h3>
            <div className='flex justify-between items-center text-sm text-gray-500'>
              <span>
                Created: {new Date(set.created_at).toLocaleDateString()}
              </span>
              <span className='bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-xs font-medium'>
                {set.card_count || 0} cards
              </span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default SetList;
