import { type NextRequest, NextResponse } from "next/server";
import { parsePdfToMarkdown } from "@/services/pdf-parser";
import { generateQuestion } from "@/services/question";

export async function POST(request: NextRequest) {
	try {
		// Get the form data
		const formData = await request.formData();
		const pdfFile = formData.get("pdfFile") as File;
		const setId = formData.get("setId") as string;

		// Validate inputs
		if (!pdfFile) {
			return NextResponse.json(
				{ error: "PDF file is required" },
				{ status: 400 },
			);
		}

		if (!setId) {
			return NextResponse.json(
				{ error: "Set ID is required" },
				{ status: 400 },
			);
		}

		// Validate PDF file type
		if (
			pdfFile.type !== "application/pdf" &&
			!pdfFile.name.toLowerCase().endsWith(".pdf")
		) {
			return NextResponse.json(
				{ error: "Invalid file type. Only PDF files are supported." },
				{ status: 400 },
			);
		}

		// Convert file to buffer
		const arrayBuffer = await pdfFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Parse PDF to markdown using LangChain
		const parseResult = await parsePdfToMarkdown(buffer, pdfFile.name);

		if (!parseResult.success || !parseResult.markdown) {
			return NextResponse.json(
				{ error: parseResult.error || "Failed to parse PDF" },
				{ status: 500 },
			);
		}

		// Generate flashcards from the markdown content
		const questionsResult = await generateQuestion(parseResult.markdown);

		if (
			!questionsResult.data.questions ||
			questionsResult.data.questions.length === 0
		) {
			return NextResponse.json(
				{ error: "No flashcards could be generated from the PDF content" },
				{ status: 422 },
			);
		}

		return NextResponse.json({
			success: true,
			fileName: pdfFile.name,
			markdown: parseResult.markdown,
			chunks: parseResult.chunks,
			questions: questionsResult.data.questions,
		});
	} catch (error) {
		console.error("Error processing PDF:", error);
		return NextResponse.json(
			{ error: "Internal server error while processing PDF" },
			{ status: 500 },
		);
	}
}
