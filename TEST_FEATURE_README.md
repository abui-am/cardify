# Test Knowledge Feature

A comprehensive testing system for flashcard sets that allows users to test their knowledge in multiple modes.

## Features

### Test Modes

1. **Flashcard Mode** - Classic flashcard experience where users see the question and can reveal the answer
2. **Multiple Choice** - Choose the correct answer from 4 options
3. **Type Answer** - Type the exact answer (case insensitive matching)

### Test Settings

- **Shuffle Questions** - Randomize question order
- **Show Correct Answer** - Display correct answer after each question
- **Allow Multiple Attempts** - Let users retry questions
- **Time Limit** - Optional time limit (1-60 minutes)

### Progress Tracking

- Real-time progress bar
- Current score display
- Time elapsed tracking
- Question counter

### Results & Review

- Detailed score breakdown (correct/total/percentage)
- Review of incorrect questions
- Performance messages based on score
- Test statistics (time spent, average per question)

### Retry Functionality

- Retry only incorrect questions
- Take a completely new test
- Return to flashcard set

## File Structure

```
src/
├── types/index.ts                 # Test-related type definitions
├── services/testService.ts       # Test logic and utilities
├── components/Test/
│   ├── TestSettings.tsx          # Test configuration component
│   ├── TestInterface.tsx         # Main test interface
│   └── TestResults.tsx           # Results display component
└── app/sets/[id]/test/page.tsx   # Test page route
```

## Usage

1. Navigate to any flashcard set that has cards
2. Click the "Test Knowledge" button in the set header
3. Configure test settings (mode, shuffle, time limit, etc.)
4. Take the test using your chosen mode
5. Review results and incorrect questions
6. Choose to retry incorrect questions or take a new test

## Technical Features

- **Type Safety** - Full TypeScript support with comprehensive interfaces
- **State Management** - Clean state management with React hooks
- **Error Handling** - Robust error handling and user feedback
- **Responsive Design** - Works on desktop and mobile devices
- **Performance** - Efficient rendering and state updates
- **Accessibility** - Proper semantic HTML and ARIA labels

## Test Service Functions

- `createTestSession()` - Initialize a new test session
- `submitAnswer()` - Process user answers and scoring
- `moveToNextQuestion()` / `moveToPreviousQuestion()` - Navigation
- `completeTest()` - Generate final test results
- `getProgressPercentage()` - Calculate progress
- `formatTime()` - Time formatting utilities
- `generateMultipleChoiceOptions()` - Create MC options

The test feature is fully integrated with the existing Supabase backend and Clerk authentication system.
