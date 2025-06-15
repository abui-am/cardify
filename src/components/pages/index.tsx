"use client";

import Link from "next/link";
import React, { useState, useEffect, useContext } from "react";
import TextInput from "../Form/TextInput";
import FlashcardList from "../List/FlashcardList";
import "./App.css";
import { Button } from "@/components/ui/button";
import { SupabaseContext } from "@/context/Supabase";
import type { Flashcard } from "@/types";
import { toast } from "sonner";

function IndexPage() {
	const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { supabase } = useContext(SupabaseContext);

	// Load flashcards
	const getFlashcards = async () => {
		if (!supabase) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		try {
			const result = await supabase.from("cards").select().is("set_id", null);

			if (result.error) {
				console.error(result.error);
				toast.error("Failed to load flashcards");
			}

			if (result.data) {
				setFlashcards(result.data);
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to load flashcards");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getFlashcards();
	}, [supabase]);

	// Save flashcards to localStorage whenever they change
	useEffect(() => {
		localStorage.setItem("flashcards", JSON.stringify(flashcards));
	}, [flashcards]);

	const addFlashcards = (newFlashcards: Flashcard[]) => {
		setFlashcards((prevFlashcards) => [...prevFlashcards, ...newFlashcards]);
	};

	const deleteFlashcard = async (id: number) => {
		if (!supabase) return;

		try {
			const result = await supabase.from("cards").delete().eq("id", id);

			if (result.error) {
				throw new Error(result.error.message);
			}

			setFlashcards((prevFlashcards) =>
				prevFlashcards.filter((flashcard) => flashcard.id !== id),
			);
			toast.success("Flashcard deleted successfully");
		} catch (error) {
			console.error("Error deleting flashcard:", error);
			toast.error("Failed to delete flashcard");
		}
	};

	const clearAllFlashcards = async () => {
		if (!supabase) return;

		if (window.confirm("Are you sure you want to delete all flashcards?")) {
			try {
				const result = await supabase.from("cards").delete().is("set_id", null);

				if (result.error) {
					throw new Error(result.error.message);
				}

				setFlashcards([]);
				toast.success("All flashcards cleared successfully");
			} catch (error) {
				console.error("Error clearing flashcards:", error);
				toast.error("Failed to clear all flashcards");
			}
		}
	};

	return (
		<div className="app">
			<header>
				<h1>Text to Flashcards</h1>
				<nav>
					<Link href="/sets" className="sets-link">
						Manage Flashcard Sets
					</Link>
				</nav>
			</header>
			<main>
				<TextInput onFlashcardsGenerated={addFlashcards} />
				{isLoading ? (
					<div className="text-center py-10">Loading flashcards...</div>
				) : flashcards.length > 0 ? (
					<>
						<div className="flashcards-header">
							<h2>Your Flashcards ({flashcards.length})</h2>
							<Button variant="destructive" onClick={clearAllFlashcards}>
								Clear All
							</Button>
						</div>
						<FlashcardList flashcards={flashcards} onDelete={deleteFlashcard} />
					</>
				) : (
					<div className="bg-gray-100 rounded-lg p-8 text-center mt-8">
						<p className="text-gray-600">
							No flashcards yet. Create your first one by pasting text above!
						</p>
					</div>
				)}
			</main>
		</div>
	);
}

export default IndexPage;
