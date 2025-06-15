"use client";
import type React from "react";
import type { Flashcard as FlashcardType } from "../../types";
import Flashcard from "../Card/Flashcard";

interface FlashcardListProps {
	flashcards: FlashcardType[];
	onDelete: (id: number) => void;
}

const FlashcardList: React.FC<FlashcardListProps> = ({
	flashcards,
	onDelete,
}) => {
	if (flashcards.length === 0) {
		return (
			<div className="bg-gray-100 rounded-lg p-8 text-center">
				<p className="text-gray-600">
					No flashcards yet. Create your first one!
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{flashcards.map((flashcard) => (
				<Flashcard
					key={flashcard.id}
					flashcard={flashcard}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
};

export default FlashcardList;
