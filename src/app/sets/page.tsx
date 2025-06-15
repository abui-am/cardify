"use client";

import SetForm from "@/components/Form/SetForm";
import SetList from "@/components/List/SetList";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useSupabase } from "@/context/Supabase";
import { UploadButton } from "@/utils/uploadthing";

import type { Set } from "@/types";
import { SignedIn } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

interface SetWithCardCount extends Set {
	card_count?: number;
}

export default function SetsPage() {
	const [sets, setSets] = useState<SetWithCardCount[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteSet, setDeleteSet] = useState<SetWithCardCount | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const { supabase, isLoaded } = useSupabase();

	// Load sets from Supabase on initial render
	const getSets = async () => {
		setIsLoading(true);
		if (!supabase || !isLoaded) return;
		try {
			// Get all sets
			const setsResult = await supabase
				.from("sets")
				.select()
				.order("created_at", { ascending: false });

			if (setsResult.error) {
				console.error(setsResult.error);
				return;
			}

			if (!setsResult.data) {
				setSets([]);
				return;
			}

			// Get card counts for each set
			const setsWithCounts = await Promise.all(
				setsResult.data.map(async (set) => {
					const countResult = await supabase
						.from("cards")
						.select("*", { count: "exact", head: true })
						.eq("set_id", set.id);

					return {
						...set,
						card_count: countResult.count || 0,
					};
				}),
			);

			setSets(setsWithCounts);
		} catch (error) {
			console.error(error);
			toast.error("Failed to load sets. Please refresh the page.");
		} finally {
			setIsLoading(false);
		}
	};

	// Delete a set and its flashcards - modified to use dialog
	const handleDeleteSetRequest = (setId: number, setName: string) => {
		const setToDelete = sets.find((set) => set.id === setId);
		if (setToDelete) {
			setDeleteSet(setToDelete);
			setIsDeleteDialogOpen(true);
		}
	};

	const handleDeleteSet = async () => {
		if (!deleteSet || !supabase) return;

		setIsDeleting(true);

		try {
			// First delete all flashcards in the set
			const deleteCardsResult = await supabase
				.from("cards")
				.delete()
				.eq("set_id", deleteSet.id);

			if (deleteCardsResult.error) {
				throw new Error(
					`Failed to delete flashcards: ${deleteCardsResult.error.message}`,
				);
			}

			// Then delete the set itself
			const deleteSetResult = await supabase
				.from("sets")
				.delete()
				.eq("id", deleteSet.id);

			if (deleteSetResult.error) {
				throw new Error(
					`Failed to delete set: ${deleteSetResult.error.message}`,
				);
			}

			// Update the sets list
			setSets((prevSets) => prevSets.filter((set) => set.id !== deleteSet.id));
			toast.success(`Set "${deleteSet.name}" deleted successfully`);
		} catch (error) {
			console.error("Error deleting set:", error);
			toast.error("Failed to delete the set. Please try again.");
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
			setDeleteSet(null);
		}
	};

	useEffect(() => {
		getSets();
	}, [isLoaded, supabase]);

	return (
		<SignedIn>
			<div className="container">
				<header className="mb-8">
					<h1 className="text-3xl font-bold">My Flashcard Sets</h1>
					<p className="text-gray-600 mt-2">
						Create and manage your flashcard collections
					</p>
				</header>

				<main>
					<SetForm />

					{isLoading ? (
						<div className="text-center py-10">Loading sets...</div>
					) : (
						<div className="mt-8">
							<SetList sets={sets} onDeleteSet={handleDeleteSetRequest} />
						</div>
					)}
				</main>

				{/* Delete confirmation dialog */}
				<ConfirmDialog
					isOpen={isDeleteDialogOpen}
					onClose={() => setIsDeleteDialogOpen(false)}
					onConfirm={handleDeleteSet}
					title="Delete Flashcard Set"
					description={`Are you sure you want to delete "${
						deleteSet?.name
					}"? All ${
						deleteSet?.card_count || 0
					} flashcards in this set will also be deleted. This action cannot be undone.`}
					confirmText="Delete Set"
					isLoading={isDeleting}
					isDanger={true}
				/>
			</div>
		</SignedIn>
	);
}
