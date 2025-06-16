'use client';

import {
  formatTime,
  generateMultipleChoiceOptions,
  getProgressPercentage,
  moveToNextQuestion,
  moveToPreviousQuestion,
  submitAnswer,
} from '@/services/testService';
import type { TestQuestion, TestSession } from '@/types';
import { useEffect, useState } from 'react';

interface TestInterfaceProps {
  session: TestSession;
  onSessionUpdate: (session: TestSession) => void;
  onComplete: () => void;
  allAnswers: string[]; // All possible answers for multiple choice generation
}

export default function TestInterface({
  session,
  onSessionUpdate,
  onComplete,
  allAnswers,
}: TestInterfaceProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>(
    []
  );
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(
    null
  );
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const progress = getProgressPercentage(session);
  const timeElapsed = Math.floor(
    (Date.now() - session.startTime.getTime()) / 1000
  );

  // Generate multiple choice options when mode is multiple-choice and question changes
  useEffect(() => {
    if (
      session.mode === 'multiple-choice' &&
      currentQuestion &&
      currentQuestion.id !== currentQuestionId
    ) {
      const options = generateMultipleChoiceOptions(
        currentQuestion.correctAnswer,
        allAnswers,
        4
      );
      setMultipleChoiceOptions(options);
      setCurrentQuestionId(currentQuestion.id);
    }
  }, [session.mode, currentQuestion, allAnswers, currentQuestionId]);

  // Reset state when question changes
  useEffect(() => {
    // Check if the current question has already been answered
    if (currentQuestion && currentQuestion.userAnswer !== undefined) {
      // Restore previous answer and show the result
      setUserAnswer(currentQuestion.userAnswer);
      setShowAnswer(true);
    } else {
      // Reset state for new/unanswered questions
      setUserAnswer('');
      setShowAnswer(false);
    }
    setQuestionStartTime(Date.now());
  }, [currentQuestion]);

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setIsCheckingAnswer(true);
    try {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const updatedSession = await submitAnswer(
        session,
        userAnswer.trim(),
        timeSpent
      );
      onSessionUpdate(updatedSession);
      setShowAnswer(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsCheckingAnswer(false);
    }
  };

  const handleNext = () => {
    const updatedSession = moveToNextQuestion(session);
    onSessionUpdate(updatedSession);

    if (updatedSession.isCompleted) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    const updatedSession = moveToPreviousQuestion(session);
    onSessionUpdate(updatedSession);
  };

  const renderFlashcardMode = () => (
    <div className='text-center'>
      <div className='bg-white rounded-lg shadow-lg p-8 mb-6 min-h-[200px] flex items-center justify-center'>
        <div>
          <h3 className='text-xl font-semibold mb-4'>
            {currentQuestion.question}
          </h3>
          {showAnswer && (
            <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
              <p className='text-lg'>{currentQuestion.correctAnswer}</p>
              {currentQuestion.isCorrect !== undefined && (
                <div
                  className={`mt-2 text-sm font-medium ${
                    currentQuestion.isCorrect
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {currentQuestion.isCorrect
                    ? '✓ Correct!'
                    : '✗ Review this card'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!showAnswer ? (
        <button
          type='button'
          onClick={() => setShowAnswer(true)}
          className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          Show Answer
        </button>
      ) : (
        <div className='flex justify-center space-x-4'>
          <button
            type='button'
            onClick={() => {
              setUserAnswer(currentQuestion.correctAnswer);
              handleSubmitAnswer();
            }}
            className='px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
          >
            I Got It Right
          </button>
          <button
            type='button'
            onClick={() => {
              setUserAnswer('wrong');
              handleSubmitAnswer();
            }}
            className='px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
          >
            I Need to Review
          </button>
        </div>
      )}
    </div>
  );

  const renderMultipleChoiceMode = () => (
    <div className='text-center'>
      <div className='bg-white rounded-lg shadow-lg p-8 mb-6'>
        <h3 className='text-xl font-semibold mb-6'>
          {currentQuestion.question}
        </h3>

        <div className='space-y-3'>
          {multipleChoiceOptions.map((option, index) => (
            <button
              type='button'
              key={`option-${option}`}
              onClick={() => setUserAnswer(option)}
              disabled={showAnswer}
              className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                userAnswer === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${
                showAnswer
                  ? option === currentQuestion.correctAnswer
                    ? 'bg-green-100 border-green-500'
                    : option === userAnswer &&
                      option !== currentQuestion.correctAnswer
                    ? 'bg-red-100 border-red-500'
                    : 'bg-gray-100'
                  : ''
              }`}
            >
              <span className='font-medium mr-3'>
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        {showAnswer && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              currentQuestion.isCorrect
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {currentQuestion.isCorrect
              ? '✓ Correct!'
              : `✗ The correct answer is: ${currentQuestion.correctAnswer}`}
          </div>
        )}
      </div>

      {!showAnswer ? (
        <button
          type='button'
          onClick={handleSubmitAnswer}
          disabled={!userAnswer.trim() || isCheckingAnswer}
          className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isCheckingAnswer ? 'Checking...' : 'Submit Answer'}
        </button>
      ) : null}
    </div>
  );

  const renderTypeAnswerMode = () => (
    <div className='text-center'>
      <div className='bg-white rounded-lg shadow-lg p-8 mb-6'>
        <h3 className='text-xl font-semibold mb-6'>
          {currentQuestion.question}
        </h3>

        <div className='mb-6'>
          <input
            type='text'
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={showAnswer}
            placeholder='Type your answer here...'
            className='w-full p-4 border-2 border-gray-300 rounded-lg text-center text-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100'
            onKeyPress={(e) =>
              e.key === 'Enter' && !showAnswer && handleSubmitAnswer()
            }
          />
        </div>

        {showAnswer && (
          <div
            className={`p-4 rounded-lg ${
              currentQuestion.isCorrect
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {currentQuestion.isCorrect
              ? '✓ Correct!'
              : `✗ The correct answer is: ${currentQuestion.correctAnswer}`}
          </div>
        )}
      </div>

      {!showAnswer ? (
        <button
          type='button'
          onClick={handleSubmitAnswer}
          disabled={!userAnswer.trim() || isCheckingAnswer}
          className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isCheckingAnswer && session.mode === 'type-answer'
            ? 'AI Checking...'
            : 'Submit Answer'}
        </button>
      ) : null}
    </div>
  );

  const renderTestMode = () => {
    switch (session.mode) {
      case 'flashcard':
        return renderFlashcardMode();
      case 'multiple-choice':
        return renderMultipleChoiceMode();
      case 'type-answer':
        return renderTypeAnswerMode();
      default:
        return renderFlashcardMode();
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      {/* Header with progress and stats */}
      <div className='mb-8'>
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-2xl font-bold'>{session.setName} - Test</h1>
          <div className='text-sm text-gray-600'>{formatTime(timeElapsed)}</div>
        </div>

        {/* Progress bar */}
        <div className='w-full bg-gray-200 rounded-full h-3 mb-4'>
          <div
            className='bg-blue-600 h-3 rounded-full transition-all duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className='flex justify-between text-sm text-gray-600'>
          <span>
            Question {session.currentQuestionIndex + 1} of{' '}
            {session.totalQuestions}
          </span>
          <span>
            Score: {session.score}/{session.totalQuestions}
          </span>
        </div>
      </div>

      {/* Test interface */}
      {renderTestMode()}

      {/* Navigation buttons */}
      {showAnswer && (
        <div className='flex justify-between mt-8'>
          <button
            type='button'
            onClick={handlePrevious}
            disabled={session.currentQuestionIndex === 0}
            className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Previous
          </button>

          <button
            type='button'
            onClick={handleNext}
            className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            {session.currentQuestionIndex === session.totalQuestions - 1
              ? 'Finish Test'
              : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
}
