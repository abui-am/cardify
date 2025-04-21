# Component Structure

This project organizes components by functionality to improve maintainability and reusability.

## Folders:

- **Card/**: Components related to card display and interaction

  - `Flashcard.tsx`: Individual flashcard component with flip animation

- **Form/**: Components for data input and form submission

  - `FlashcardForm.tsx`: Form for creating flashcards
  - `SetForm.tsx`: Form for creating sets
  - `TextInput.tsx`: Text input for AI-generated flashcards

- **List/**: Components for displaying collections of items

  - `FlashcardList.tsx`: Grid of flashcards
  - `SetList.tsx`: Grid of flashcard sets

- **ui/**: Reusable UI components from shadcn
  - `button.tsx`: Shadcn Button component
  - `dialog.tsx`: Shadcn Dialog component
  - `sonner.tsx`: Toast notifications
  - `ConfirmDialog.tsx`: Reusable confirmation dialog

## UI Components

All buttons in the application use the shadcn Button component, which provides consistent styling and variants.

## Adding New Components

When adding new components:

1. Place them in the appropriate folder based on functionality
2. Import the shadcn Button component when needed
3. Follow the existing component patterns for consistency
