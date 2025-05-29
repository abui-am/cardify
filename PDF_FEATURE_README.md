# PDF to Flashcard Feature

This document describes the implementation of the PDF to Markdown parsing and AI flashcard generation feature using LangChain.

## Overview

The feature allows users to upload PDF files and automatically generate flashcards from the content using AI. The process involves:

1. **PDF Upload**: User uploads a PDF file directly through a file input
2. **PDF Parsing**: The PDF is parsed using LangChain's PDFLoader to extract text content
3. **Text Chunking**: Content is split into manageable chunks using RecursiveCharacterTextSplitter
4. **Markdown Conversion**: Extracted text is converted to Markdown format
5. **AI Generation**: The Markdown content is processed by OpenAI to generate question-answer pairs
6. **Flashcard Creation**: The generated Q&A pairs are saved as flashcards in the database

## Implementation Details

### Components

#### `FlashcardForm.tsx`

- Updated to handle PDF files directly using a file input
- Removed dependency on UploadThing service for PDF uploads
- Sends PDF files as FormData to the parsing API
- Handles the entire flow from PDF upload to flashcard creation
- Provides user feedback through toast notifications

#### `pdf-parser.ts` (Service)

- Uses LangChain's `PDFLoader` for robust PDF text extraction
- Implements `RecursiveCharacterTextSplitter` for intelligent text chunking
- Creates temporary files for PDF processing with automatic cleanup
- Converts extracted text to Markdown format with formatting rules:
  - Bullet points (•) → Markdown lists (-)
  - Numbered lists → Proper numbered format
  - All-caps text → Headers (#)
  - Text ending with colons → Subheaders (##)
- Returns both full markdown and individual chunks with metadata

#### `route.ts` (API Route)

- `/api/pdf-parse` endpoint handles PDF file uploads via FormData
- Validates file types and sizes before processing
- Coordinates between PDF parsing and AI question generation
- Returns generated questions ready for database insertion

### Technical Stack

- **PDF Processing**: LangChain Community PDFLoader
- **Text Splitting**: LangChain RecursiveCharacterTextSplitter
- **AI Generation**: OpenAI GPT-4o-mini
- **File Handling**: Native HTML file input with FormData
- **Database**: Supabase

### Dependencies

```json
{
  "@langchain/community": "latest",
  "@langchain/textsplitters": "latest",
  "openai": "^4.86.2"
}
```

## Usage Flow

1. **Upload PDF**: Click "Upload PDF" button in the FlashcardForm
2. **Select File**: Choose a PDF file using the file picker (max 16MB)
3. **File Validation**: System validates the file type and size
4. **Generate**: Click "Generate from PDF" button
5. **Processing**: The system:
   - Creates a temporary file from the uploaded PDF
   - Extracts text using LangChain PDFLoader
   - Splits text into chunks for better processing
   - Converts to Markdown format
   - Generates flashcards using AI
   - Saves to database
   - Cleans up temporary files
6. **Result**: New flashcards appear in the set

## Key Features

### Text Chunking

- Intelligent text splitting with 1500 character chunks
- 200 character overlap for context preservation
- Smart separators: paragraphs, sentences, punctuation
- Preserves context across chunk boundaries

### File Handling

- Direct file upload without external services
- Automatic file type validation
- Temporary file creation and cleanup
- Support for various PDF types and structures

### Error Handling

- Comprehensive error handling for:
  - Invalid PDF files
  - File size limits
  - Parsing failures
  - AI generation errors
  - Database insertion errors
  - Temporary file cleanup

## File Structure

```
src/
├── components/Form/FlashcardForm.tsx    # Main component with direct PDF upload
├── services/
│   ├── pdf-parser.ts                    # LangChain PDF to Markdown conversion
│   └── question.ts                      # AI question generation
└── app/api/
    └── pdf-parse/route.ts              # FormData API endpoint
```

## Configuration

### PDF Processing Settings

- Maximum file size: 16MB (configurable in component)
- Allowed file types: PDF only
- Chunk size: 1500 characters
- Chunk overlap: 200 characters
- Temporary file cleanup: Automatic

### AI Generation

- Model: GPT-4o-mini
- Response format: Structured JSON with question-answer pairs
- Temperature: 1.0 for creative question generation

### Text Splitting Configuration

```typescript
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1500,
  chunkOverlap: 200,
  separators: ['\n\n', '\n', '. ', '! ', '? '],
  keepSeparator: true,
});
```

## Advantages of LangChain Implementation

1. **Better Text Extraction**: LangChain's PDFLoader handles complex PDF structures more reliably
2. **Intelligent Chunking**: RecursiveCharacterTextSplitter preserves context and meaning
3. **Server-Side Processing**: All PDF processing happens on the server for security
4. **Robust Error Handling**: Built-in error handling and automatic resource cleanup
5. **Scalability**: Better suited for production environments
6. **Flexibility**: Easy to extend with additional document loaders

## Future Enhancements

Potential improvements for the feature:

1. **Multi-Document Support**: Process multiple PDFs simultaneously
2. **OCR Integration**: Handle scanned PDFs with image-based text
3. **Progress Indicators**: Real-time progress updates for large files
4. **Preview Mode**: Allow users to review extracted content before generating flashcards
5. **Custom Chunking**: User-configurable chunk sizes and overlap
6. **Document Metadata**: Preserve and display document structure information
7. **Caching**: Cache extracted text for faster re-processing
