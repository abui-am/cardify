"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { SupabaseContext } from "@/context/Supabase";
import { generateQuestion } from "@/services/question";
import type { Flashcard } from "@/types";
import type React from "react";
import { useContext, useState } from "react";

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
		flashcards.forEach((card) => onFlashcardCreated(card));
	},
}) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
	const [aiText, setAiText] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const { supabase } = useContext(SupabaseContext);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		setIsLoading(true);
		try {
			const result = await supabase
				?.from("cards")
				.insert({
					title,
					description,
					set_id: setId,
				})
				.select();

			if (result?.error) {
				throw new Error(result.error.message);
			}

			if (result?.data && result.data.length > 0) {
				onFlashcardCreated(result.data[0]);
				setTitle("");
				setDescription("");
			}
		} catch (error) {
			console.error("Error creating flashcard:", error);
			alert("Failed to create flashcard. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGenerateWithAI = async () => {
		if (!aiText.trim()) return;

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
					?.from("cards")
					.insert(cardsToInsert)
					.select();

				if (response?.error) {
					throw new Error(response.error.message);
				}

				if (response?.data && response.data.length > 0) {
					onMultipleFlashcardsCreated(response.data);
					setAiText("");
					setIsAiDialogOpen(false);
				}
			} else {
				alert(
					"No questions could be generated from the text. Please try with different content.",
				);
			}
		} catch (error) {
			console.error("Error generating flashcards:", error);
			alert("Failed to generate flashcards. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="bg-gray-100 rounded-lg p-6 mb-8">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
				<h3 className="text-xl font-semibold">Add New Flashcard</h3>
				<button
					type="button"
					onClick={() => setIsAiDialogOpen(true)}
					className="mt-2 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors flex items-center"
				>
					<span className="mr-2">✨</span>
					Generate with AI
				</button>
			</div>

			<form onSubmit={handleSubmit}>
				<div className="mb-4">
					<label
						htmlFor="title"
						className="block mb-1 font-medium text-gray-700"
					>
						Front (Question/Term)
					</label>
					<input
						id="title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Enter the front of the flashcard"
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>
				<div className="mb-4">
					<label
						htmlFor="description"
						className="block mb-1 font-medium text-gray-700"
					>
						Back (Answer/Definition)
					</label>
					<textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Enter the back of the flashcard"
						rows={3}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans resize-y"
						required
					/>
				</div>
				<button
					type="submit"
					disabled={isLoading || !title.trim() || !description.trim()}
					className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
						isLoading || !title.trim() || !description.trim()
							? "bg-gray-400 cursor-not-allowed"
							: "bg-blue-500 hover:bg-blue-600"
					}`}
				>
					{isLoading ? "Adding..." : "Add Flashcard"}
				</button>
			</form>

			{/* AI Generation Dialog */}
			<Dialog
				open={isAiDialogOpen}
				onOpenChange={(open) => !open && setIsAiDialogOpen(false)}
			>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>Generate Flashcards with AI</DialogTitle>
						<DialogDescription>
							Paste your text material below and our AI will generate flashcards
							for you.
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<textarea
							value={aiText}
							onChange={(e) => setAiText(e.target.value)}
							placeholder="Paste your study material, notes, or any text here..."
							className="w-full border border-gray-300 rounded-md p-3 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<DialogFooter className="flex justify-end gap-3">
						<button
							onClick={() => setIsAiDialogOpen(false)}
							className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
							disabled={isGenerating}
						>
							Cancel
						</button>
						<button
							onClick={handleGenerateWithAI}
							disabled={isGenerating || !aiText.trim()}
							className={`px-4 py-2 rounded-md text-white font-medium ${
								isGenerating || !aiText.trim()
									? "bg-gray-400 cursor-not-allowed"
									: "bg-purple-600 hover:bg-purple-700"
							}`}
						>
							{isGenerating ? "Generating..." : "Generate Flashcards"}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default FlashcardForm;
