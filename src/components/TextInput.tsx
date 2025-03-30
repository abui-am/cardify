'use client';

import React, { useContext, useState } from 'react';
import { generateQuestion } from '../services/question';
import { Flashcard } from '../types';
import './TextInput.css';
import useCreateClerkSupabaseClient from '@/hooks/useCreateClerkSupabaseClient';
import { SupabaseContext } from '@/context/Supabase';

interface TextInputProps {
  onFlashcardsGenerated: (flashcards: Flashcard[]) => void;
}

const TextInput: React.FC<TextInputProps> = ({ onFlashcardsGenerated }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useContext(SupabaseContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const result = await generateQuestion(text);
      if (result.data.questions.length > 0) {
        const newSuggestions = result.data.questions.map((qa) => ({
          question: qa.question,
          answer: qa.answer,
        }));

        const res = await supabase
          ?.from('cards')
          .insert(
            newSuggestions.map((suggestion) => ({
              title: suggestion.question,
              description: suggestion.answer,
            }))
          )
          .select();

        if (res?.error) {
          throw new Error(res.error.message);
        }

        onFlashcardsGenerated(res?.data ?? []);
        setText('');
      } else {
        alert(
          'No questions could be generated from the text. Please try with different content.'
        );
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Failed to generate flashcards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='text-input-container'>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Paste your text here to generate flashcards...'
          rows={6}
          disabled={isLoading}
        />
        <button
          type='submit'
          disabled={isLoading || !text.trim()}
          className='generate-button'
        >
          {isLoading ? 'Generating...' : 'Generate Flashcards'}
        </button>
      </form>
    </div>
  );
};

export default TextInput;
