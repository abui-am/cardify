'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SupabaseContext } from '@/context/Supabase';
import { generateQuestion } from '@/services/question';
import type { Flashcard } from '@/types';
import type React from 'react';
import { useContext, useState } from 'react';
import { toast } from 'sonner';

interface FlashcardFormProps {
  setId: number;
  onFlashcardCreated: (flashcard: Flashcard) => void;
  onMultipleFlashcardsCreated?: (flashcards: Flashcard[]) => void;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({
  setId,
  onFlashcardCreated,
  onMultipleFlashcardsCreated = (flashcards) => {
    // If no specific handler provided, add them one by one
    for (const card of flashcards) {
      onFlashcardCreated(card);
    }
  },
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [aiText, setAiText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { supabase } = useContext(SupabaseContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !supabase) return;

    setIsLoading(true);
    try {
      const result = await supabase
        .from('cards')
        .insert({
          title,
          description,
          set_id: setId,
        })
        .select();

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.data && result.data.length > 0) {
        onFlashcardCreated(result.data[0]);
        setTitle('');
        setDescription('');
        toast.success('Flashcard created successfully');
      }
    } catch (error) {
      console.error('Error creating flashcard:', error);
      toast.error('Failed to create flashcard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiText.trim() || !supabase) return;

    setIsGenerating(true);
    try {
      const result = await generateQuestion(aiText);

      if (result.data.questions.length > 0) {
        // Create flashcard objects for insertion
        const cardsToInsert = result.data.questions.map((qa) => ({
          title: qa.question,
          description: qa.answer,
          set_id: setId,
        }));

        // Insert all cards in a batch
        const response = await supabase
          .from('cards')
          .insert(cardsToInsert)
          .select();

        if (response.error) {
          throw new Error(response.error.message);
        }

        if (response.data && response.data.length > 0) {
          onMultipleFlashcardsCreated(response.data);
          setAiText('');
          setIsAiDialogOpen(false);
          toast.success(
            `${response.data.length} flashcards generated successfully`
          );
        }
      } else {
        toast.error(
          'No questions could be generated from the text. Please try with different content.'
        );
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error('Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromPdf = async () => {
    if (!pdfFile || !supabase) return;

    setIsGenerating(true);
    try {
      // Create FormData with the PDF file and setId
      const formData = new FormData();
      formData.append('pdfFile', pdfFile);
      formData.append('setId', setId.toString());

      const response = await fetch('/api/pdf-parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process PDF');
      }

      const result = await response.json();

      if (result.questions && result.questions.length > 0) {
        // Create flashcard objects for insertion
        const cardsToInsert = result.questions.map(
          (qa: { question: string; answer: string }) => ({
            title: qa.question,
            description: qa.answer,
            set_id: setId,
          })
        );

        // Insert all cards in a batch
        const dbResponse = await supabase
          .from('cards')
          .insert(cardsToInsert)
          .select();

        if (dbResponse.error) {
          throw new Error(dbResponse.error.message);
        }

        if (dbResponse.data && dbResponse.data.length > 0) {
          onMultipleFlashcardsCreated(dbResponse.data);
          setPdfFile(null);
          setIsPdfDialogOpen(false);
          toast.success(
            `${dbResponse.data.length} flashcards generated from PDF successfully`
          );
        }
      } else {
        toast.error(
          'No flashcards could be generated from the PDF. Please try with a different PDF file.'
        );
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to process PDF';
      toast.error(`PDF processing failed: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className='bg-gray-100 rounded-lg p-6 mb-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-4'>
        <h3 className='text-xl font-semibold'>Add New Flashcard</h3>
        <div className='flex flex-col sm:flex-row gap-2 mt-2 md:mt-0'>
          <Button
            variant='secondary'
            onClick={() => setIsAiDialogOpen(true)}
            className='bg-purple-600 hover:bg-purple-700 text-white'
          >
            <span className='mr-2'>✨</span>
            Generate with AI
          </Button>
          <Button
            variant='secondary'
            onClick={() => setIsPdfDialogOpen(true)}
            className='bg-blue-600 hover:bg-blue-700 text-white'
          >
            <span className='mr-2'>📄</span>
            Upload PDF
          </Button>
        </div>
      </div>

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
        <Button
          type='submit'
          disabled={
            isLoading || !title.trim() || !description.trim() || !supabase
          }
          variant={
            isLoading || !title.trim() || !description.trim()
              ? 'outline'
              : 'default'
          }
          className={
            isLoading || !title.trim() || !description.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : ''
          }
        >
          {isLoading ? 'Adding...' : 'Add Flashcard'}
        </Button>
      </form>

      {/* AI Generation Dialog */}
      <Dialog
        open={isAiDialogOpen}
        onOpenChange={(open) => !open && setIsAiDialogOpen(false)}
      >
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Generate Flashcards with AI</DialogTitle>
            <DialogDescription>
              Paste your text material below and our AI will generate flashcards
              for you.
            </DialogDescription>
          </DialogHeader>

          <div className='py-4'>
            <textarea
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder='Paste your study material, notes, or any text here...'
              className='w-full border border-gray-300 rounded-md p-3 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <DialogFooter className='flex justify-end gap-3'>
            <Button
              variant='outline'
              onClick={() => setIsAiDialogOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateWithAI}
              disabled={isGenerating || !aiText.trim() || !supabase}
              variant='default'
              className={
                isGenerating || !aiText.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }
            >
              {isGenerating ? 'Generating...' : 'Generate Flashcards'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Upload Dialog */}
      <Dialog
        open={isPdfDialogOpen}
        onOpenChange={(open) => !open && setIsPdfDialogOpen(false)}
      >
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Upload PDF for Flashcard Generation</DialogTitle>
            <DialogDescription>
              Upload a PDF file and our AI will extract text and generate
              flashcards for you.
            </DialogDescription>
          </DialogHeader>

          <div className='py-4'>
            {!pdfFile ? (
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
                <div className='mb-4'>
                  <span className='text-4xl'>📄</span>
                </div>
                <p className='text-gray-600 mb-4'>
                  Click below to upload your PDF file
                </p>
                <input
                  type='file'
                  accept='.pdf,application/pdf'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (
                        file.type === 'application/pdf' ||
                        file.name.toLowerCase().endsWith('.pdf')
                      ) {
                        setPdfFile(file);
                        toast.success('PDF uploaded successfully!');
                      } else {
                        toast.error('Please select a valid PDF file');
                      }
                    }
                  }}
                  className='hidden'
                  id='pdf-upload'
                />
                <label
                  htmlFor='pdf-upload'
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer inline-block'
                >
                  Choose PDF File
                </label>
                <p className='text-sm text-gray-600 mt-2'>
                  Maximum file size: 16MB
                </p>
              </div>
            ) : (
              <div className='border border-green-300 bg-green-50 rounded-lg p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <span className='text-green-600 mr-2'>✅</span>
                    <span className='text-green-800 font-medium'>
                      {pdfFile.name}
                    </span>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPdfFile(null)}
                    className='text-red-600 hover:text-red-700'
                  >
                    Remove
                  </Button>
                </div>
                <p className='text-sm text-green-700 mt-2'>
                  Ready to generate flashcards from your PDF content.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className='flex justify-end gap-3'>
            <Button
              variant='outline'
              onClick={() => setIsPdfDialogOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateFromPdf}
              disabled={isGenerating || !pdfFile || !supabase}
              variant='default'
              className={
                isGenerating || !pdfFile
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {isGenerating ? 'Processing...' : 'Generate from PDF'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlashcardForm;
