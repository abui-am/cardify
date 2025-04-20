'use client';

import React, { useState, useContext } from 'react';
import { SupabaseContext } from '@/context/Supabase';
import { Flashcard } from '@/types';

interface FlashcardFormProps {
  setId: number;
  onFlashcardCreated: (flashcard: Flashcard) => void;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({
  setId,
  onFlashcardCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useContext(SupabaseContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const result = await supabase
        ?.from('cards')
        .insert({
          title,
          description,
          set_id: setId,
        })
        .select();

      if (result?.error) {
        throw new Error(result.error.message);
      }

      if (result?.data && result.data.length > 0) {
        onFlashcardCreated(result.data[0]);
        setTitle('');
        setDescription('');
      }
    } catch (error) {
      console.error('Error creating flashcard:', error);
      alert('Failed to create flashcard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-gray-100 rounded-lg p-6 mb-8'>
      <h3 className='text-xl font-semibold mb-4'>Add New Flashcard</h3>
      <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <label
            htmlFor='title'
            className='block mb-1 font-medium text-gray-700'
          >
            Front (Question/Term)
          </label>
          <input
            id='title'
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Enter the front of the flashcard'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>
        <div className='mb-4'>
          <label
            htmlFor='description'
            className='block mb-1 font-medium text-gray-700'
          >
            Back (Answer/Definition)
          </label>
          <textarea
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Enter the back of the flashcard'
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans resize-y'
            required
          />
        </div>
        <button
          type='submit'
          disabled={isLoading || !title.trim() || !description.trim()}
          className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
            isLoading || !title.trim() || !description.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Adding...' : 'Add Flashcard'}
        </button>
      </form>
    </div>
  );
};

export default FlashcardForm;
