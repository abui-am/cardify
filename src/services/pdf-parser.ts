"use server";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export interface PdfParseResult {
	success: boolean;
	markdown?: string;
	chunks?: PdfChunk[];
	error?: string;
}

export interface PdfChunk {
	text: string;
	metadata: {
		pageNumber: number;
		source: string;
	};
}

export const parsePdfToMarkdown = async (
	pdfBuffer: Buffer,
	fileName: string,
): Promise<PdfParseResult> => {
	let tempFilePath: string | null = null;

	try {
		// Create a temporary file path
		tempFilePath = path.join(
			os.tmpdir(),
			`pdf-${Date.now()}-${Math.round(Math.random() * 10000)}.pdf`,
		);

		// Write buffer to temporary file
		await fs.writeFile(tempFilePath, pdfBuffer);

		// Process the PDF from the temporary file
		const loader = new PDFLoader(tempFilePath, {
			splitPages: true,
		});

		const docs = await loader.load();

		// Split text into chunks for better processing
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1500,
			chunkOverlap: 200,
			separators: ["\n\n", "\n", ". ", "! ", "? "],
			keepSeparator: true,
		});

		const splitDocs = await textSplitter.splitDocuments(docs);

		// Format the chunks
		const chunks: PdfChunk[] = splitDocs.map((doc) => ({
			text: doc.pageContent,
			metadata: {
				pageNumber: doc.metadata.loc?.pageNumber || doc.metadata.page || 1,
				source: fileName,
			},
		}));

		// Combine all text content for markdown conversion
		const fullText = chunks.map((chunk) => chunk.text).join("\n\n");
		const markdown = convertToMarkdown(fullText);

		return {
			success: true,
			markdown,
			chunks,
		};
	} catch (error) {
		console.error("Error parsing PDF:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	} finally {
		// Clean up temporary file
		if (tempFilePath) {
			try {
				await fs.unlink(tempFilePath);
			} catch (e) {
				// Ignore cleanup errors
				console.warn("Failed to cleanup temporary file:", tempFilePath);
			}
		}
	}
};

function convertToMarkdown(text: string): string {
	return (
		text
			// Clean up extra whitespace
			.replace(/\s+/g, " ")
			// Convert bullet points
			.replace(/•/g, "- ")
			// Convert numbered lists (basic pattern)
			.replace(/(\d+)\.\s/g, "$1. ")
			// Convert potential headings (all caps with 3+ characters)
			.replace(/([A-Z\s]{3,})\n/g, "# $1\n")
			// Convert sentences that end with colon to potential subheadings
			.replace(/([^.!?]*:)\n/g, "## $1\n")
			// Add proper paragraph breaks
			.replace(/\n\s*\n/g, "\n\n")
			// Clean up multiple line breaks
			.replace(/\n{3,}/g, "\n\n")
			.trim()
	);
}
