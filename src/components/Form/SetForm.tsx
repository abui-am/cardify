'use client';
import { Button } from '@/components/ui/button';
import { SupabaseContext } from '@/context/Supabase';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useContext, useState } from 'react';

const SetForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useContext(SupabaseContext);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const result = await supabase
        ?.from('sets')
        .insert({ name: title })
        .select();

      if (result?.error) {
        throw new Error(result.error.message);
      }

      if (result?.data && result.data.length > 0) {
        const newSet = result.data[0];
        router.push(`/sets/${newSet.id}`);
      }
    } catch (error) {
      console.error('Error creating set:', error);
      alert('Failed to create set. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-gray-100 rounded-lg p-6 mb-8'>
      <h2 className='text-xl font-semibold mb-4'>Create New Flashcard Set</h2>
      <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <label
            htmlFor='title'
            className='block mb-1 font-medium text-gray-700'
          >
            Set Title
          </label>
          <input
            id='title'
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Enter a name for your flashcard set'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>
        <Button
          type='submit'
          disabled={isLoading || !title.trim()}
          variant={isLoading || !title.trim() ? 'outline' : 'default'}
          className={
            isLoading || !title.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }
        >
          {isLoading ? 'Creating...' : 'Create Set'}
        </Button>
      </form>
    </div>
  );
};

export default SetForm;
