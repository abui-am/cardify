"use client";

import Link from "next/link";
import React, { useState, useEffect, useContext } from "react";
import FlashcardList from "../../components/FlashcardList";
import TextInput from "../../components/TextInput";
import "./App.css";
import { SupabaseContext } from "@/context/Supabase";
import type { Flashcard } from "@/types";

function IndexPage() {
	const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

	// Load flashcards from localStorage on initial render
	const { supabase } = useContext(SupabaseContext);
	const getFlashcards = async () => {
		try {
			const result = await supabase?.from("cards").select().is("set_id", null);
			console.log(result);
			if (result?.error) {
				console.error(result.error);
			}
			if (result?.data) {
				setFlashcards(result.data);
			}
		} catch (error) {
			console.error(error);
		}
	};
	useEffect(() => {
		getFlashcards();
	}, []);

	// Save flashcards to localStorage whenever they change
	useEffect(() => {
		localStorage.setItem("flashcards", JSON.stringify(flashcards));
	}, [flashcards]);

	const addFlashcards = (newFlashcards: Flashcard[]) => {
		setFlashcards((prevFlashcards) => [...prevFlashcards, ...newFlashcards]);
	};

	const deleteFlashcard = (id: number) => {
		setFlashcards((prevFlashcards) =>
			prevFlashcards.filter((flashcard) => flashcard.id !== id),
		);
	};

	const clearAllFlashcards = () => {
		if (window.confirm("Are you sure you want to delete all flashcards?")) {
			setFlashcards([]);
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
				{flashcards.length > 0 && (
					<>
						<div className="flashcards-header">
							<h2>Your Flashcards ({flashcards.length})</h2>
							<button className="clear-button" onClick={clearAllFlashcards}>
								Clear All
							</button>
						</div>
						<FlashcardList flashcards={flashcards} onDelete={deleteFlashcard} />
					</>
				)}
			</main>
		</div>
	);
}

export default IndexPage;
