"use client";

import SetForm from "@/components/SetForm";
import SetList from "@/components/SetList";
import { SupabaseContext } from "@/context/Supabase";
import type { Set } from "@/types";
import { SignedIn } from "@clerk/nextjs";
import React, { useState, useEffect, useContext } from "react";

export default function SetsPage() {
	const [sets, setSets] = useState<Set[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { supabase } = useContext(SupabaseContext);

	// Load sets from Supabase on initial render
	const getSets = async () => {
		setIsLoading(true);
		try {
			const result = await supabase
				?.from("sets")
				.select()
				.order("created_at", { ascending: false });
			if (result?.error) {
				console.error(result.error);
			}
			if (result?.data) {
				setSets(result.data);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getSets();
	}, []);

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
							<SetList sets={sets} />
						</div>
					)}
				</main>
			</div>
		</SignedIn>
	);
}
