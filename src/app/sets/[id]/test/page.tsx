"use client";

import { useSupabase } from "@/context/Supabase";
import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import TestInterface from "@/components/Test/TestInterface";
import TestResults from "@/components/Test/TestResults";
import TestSettings from "@/components/Test/TestSettings";
import { completeTest, createTestSession } from "@/services/testService";
import type {
	Flashcard,
	Set as FlashcardSet,
	TestResult,
	TestSession,
	TestSettings as TestSettingsType,
} from "@/types";

type TestPhase = "loading" | "settings" | "testing" | "results";

export default function TestPage() {
	const [phase, setPhase] = useState<TestPhase>("loading");
	const [set, setSet] = useState<FlashcardSet | null>(null);
	const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
	const [testSession, setTestSession] = useState<TestSession | null>(null);
	const [testResult, setTestResult] = useState<TestResult | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const { supabase } = useSupabase();
	const params = useParams();
	const router = useRouter();
	const setId = Number(params.id);

	// Load set and flashcards
	useEffect(() => {
		const loadSetData = async () => {
			if (!setId || !supabase) return;

			try {
				setIsLoading(true);

				// Load set details
				const setResponse = await supabase
					.from("sets")
					.select()
					.eq("id", setId)
					.single();

				if (setResponse.error) {
					console.error("Error loading set:", setResponse.error);
					if (setResponse.error.code === "PGRST116") {
						toast.error("Set not found");
						router.push("/sets");
						return;
					}
				}

				if (setResponse.data) {
					setSet(setResponse.data);
				}

				// Load flashcards
				const cardsResponse = await supabase
					.from("cards")
					.select()
					.eq("set_id", setId)
					.order("created_at", { ascending: false });

				if (cardsResponse.error) {
					console.error("Error loading cards:", cardsResponse.error);
					toast.error("Error loading flashcards");
					return;
				}

				if (cardsResponse.data) {
					setFlashcards(cardsResponse.data);
					if (cardsResponse.data.length === 0) {
						toast.error("No flashcards found in this set");
						router.push(`/sets/${setId}`);
						return;
					}
				}

				setPhase("settings");
			} catch (error) {
				console.error("Error loading test data:", error);
				toast.error("Error loading test data");
			} finally {
				setIsLoading(false);
			}
		};

		if (supabase) {
			loadSetData();
		}
	}, [setId, supabase, router]);

	const handleStartTest = (settings: TestSettingsType) => {
		if (!set || flashcards.length === 0) {
			toast.error("Cannot start test: Missing data");
			return;
		}

		try {
			const session = createTestSession(
				setId,
				set.name || "Untitled Set",
				flashcards,
				settings,
			);
			setTestSession(session);
			setPhase("testing");
		} catch (error) {
			console.error("Error creating test session:", error);
			toast.error("Error starting test");
		}
	};

	const handleSessionUpdate = (session: TestSession) => {
		setTestSession(session);
	};

	const handleTestComplete = () => {
		if (!testSession) {
			toast.error("No test session found");
			return;
		}

		const result = completeTest(testSession);
		setTestResult(result);
		setPhase("results");
	};

	const handleRetry = () => {
		if (!testResult || !set) return;

		// Create a new test session with only the incorrect questions
		const incorrectCards = flashcards.filter((card) =>
			testResult.incorrectQuestions.some((q) => q.id === card.id),
		);

		if (incorrectCards.length === 0) {
			toast.error("No incorrect questions to retry");
			return;
		}

		try {
			const settings: TestSettingsType = {
				mode: testResult.mode,
				shuffleQuestions: true,
				showCorrectAnswer: true,
				allowRetry: true,
			};

			const session = createTestSession(
				setId,
				`${set.name || "Untitled Set"} - Retry`,
				incorrectCards,
				settings,
			);
			setTestSession(session);
			setTestResult(null);
			setPhase("testing");
		} catch (error) {
			console.error("Error creating retry session:", error);
			toast.error("Error starting retry");
		}
	};

	const handleBackToSet = () => {
		router.push(`/sets/${setId}`);
	};

	const handleNewTest = () => {
		setTestSession(null);
		setTestResult(null);
		setPhase("settings");
	};

	const handleCancelTest = () => {
		router.push(`/sets/${setId}`);
	};

	// Get all answers for multiple choice generation
	const allAnswers = flashcards
		.map((card) => card.description || "")
		.filter(Boolean);

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
					<p className="text-gray-600">Loading test data...</p>
				</div>
			</div>
		);
	}

	if (!set) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Set Not Found</h1>
					<p className="text-gray-600 mb-4">
						The requested set could not be found.
					</p>
					<Link href="/sets" className="text-blue-600 hover:underline">
						Back to Sets
					</Link>
				</div>
			</div>
		);
	}

	return (
		<SignedIn>
			<div className="min-h-screen bg-gray-50">
				{/* Header */}
				<div className="bg-white shadow-sm">
					<div className="container mx-auto px-4 py-4">
						<nav className="flex items-center justify-between">
							<Link
								href={`/sets/${setId}`}
								className="text-blue-600 hover:underline"
							>
								← Back to {set.name || "Untitled Set"}
							</Link>
							<div className="text-sm text-gray-600">Test Mode</div>
						</nav>
					</div>
				</div>

				{/* Main Content */}
				<div className="container mx-auto px-4 py-8">
					{phase === "settings" && (
						<TestSettings
							onStartTest={handleStartTest}
							onCancel={handleCancelTest}
							cardCount={flashcards.length}
						/>
					)}

					{phase === "testing" && testSession && (
						<TestInterface
							session={testSession}
							onSessionUpdate={handleSessionUpdate}
							onComplete={handleTestComplete}
							allAnswers={allAnswers}
						/>
					)}

					{phase === "results" && testResult && (
						<TestResults
							result={testResult}
							onRetry={handleRetry}
							onBackToSet={handleBackToSet}
							onNewTest={handleNewTest}
						/>
					)}
				</div>
			</div>
		</SignedIn>
	);
}
