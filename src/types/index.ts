import type { Tables } from "../../database.types";

export interface Flashcard extends Tables<"cards"> {}

export interface Set extends Tables<"sets"> {}

// Test/Quiz related types
export interface TestSession {
	id: string;
	setId: number;
	setName: string;
	questions: TestQuestion[];
	currentQuestionIndex: number;
	score: number;
	totalQuestions: number;
	startTime: Date;
	endTime?: Date;
	mode: TestMode;
	isCompleted: boolean;
}

export interface TestQuestion {
	id: number;
	question: string; // Card title
	correctAnswer: string; // Card description
	userAnswer?: string;
	isCorrect?: boolean;
	timeSpent?: number; // in seconds
	attemptCount: number;
}

export type TestMode = "flashcard" | "multiple-choice" | "type-answer";

export interface TestResult {
	sessionId: string;
	setId: number;
	setName: string;
	mode: TestMode;
	score: number;
	totalQuestions: number;
	percentage: number;
	timeSpent: number; // in seconds
	completedAt: Date;
	incorrectQuestions: TestQuestion[];
}

export interface TestSettings {
	mode: TestMode;
	shuffleQuestions: boolean;
	timeLimit?: number; // in minutes
	showCorrectAnswer: boolean;
	allowRetry: boolean;
}
