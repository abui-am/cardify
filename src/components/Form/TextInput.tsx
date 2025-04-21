'use client';

import { Button } from '@/components/ui/button';
import type React from 'react';
import { useContext, useState } from 'react';
import { generateQuestion } from '../../services/question';
import type { Flashcard } from '../../types';
import { SupabaseContext } from '@/context/Supabase';
import { toast } from 'sonner';

interface TextInputProps {
  onFlashcardsGenerated: (flashcards: Flashcard[]) => void;
}

const TextInput: React.FC<TextInputProps> = ({ onFlashcardsGenerated }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useContext(SupabaseContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !supabase) return;

    setIsLoading(true);
    try {
      const result = await generateQuestion(text);
      if (result.data.questions.length > 0) {
        const newSuggestions = result.data.questions.map((qa) => ({
          question: qa.question,
          answer: qa.answer,
        }));

        const res = await supabase
          .from('cards')
          .insert(
            newSuggestions.map((suggestion) => ({
              title: suggestion.question,
              description: suggestion.answer,
            }))
          )
          .select();

        if (res.error) {
          throw new Error(res.error.message);
        }

        onFlashcardsGenerated(res.data || []);
        setText('');
        toast.success(`${res.data.length} flashcards generated successfully`);
      } else {
        toast.error(
          'No questions could be generated from the text. Please try with different content.'
        );
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error('Failed to generate flashcards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-gray-100 rounded-lg p-6 mb-8'>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Paste your text here to generate flashcards...'
          rows={6}
          disabled={isLoading}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans resize-y mb-4'
        />
        <Button
          type='submit'
          disabled={isLoading || !text.trim() || !supabase}
          variant={isLoading || !text.trim() ? 'outline' : 'default'}
          className={
            isLoading || !text.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          }
        >
          {isLoading ? 'Generating...' : 'Generate Flashcards'}
        </Button>
      </form>
    </div>
  );
};

export default TextInput;
