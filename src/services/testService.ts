import type {
	Flashcard,
	TestMode,
	TestQuestion,
	TestResult,
	TestSession,
	TestSettings,
} from "@/types";

function createQuestionsFromFlashcards(
	flashcards: Flashcard[],
): TestQuestion[] {
	return flashcards.map((card) => ({
		id: card.id,
		question: card.title,
		correctAnswer: card.description || "",
		attemptCount: 0,
	}));
}

function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

function generateSessionId(): string {
	return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function checkAnswer(
	userAnswer: string,
	correctAnswer: string,
	mode: TestMode,
): boolean {
	const normalizedUser = userAnswer.trim().toLowerCase();
	const normalizedCorrect = correctAnswer.trim().toLowerCase();

	switch (mode) {
		case "flashcard":
			// For flashcard mode, we can be more lenient
			return normalizedUser === normalizedCorrect;
		case "type-answer":
			// For type answer, require exact match (case insensitive)
			return normalizedUser === normalizedCorrect;
		case "multiple-choice":
			// For multiple choice, exact match
			return normalizedUser === normalizedCorrect;
		default:
			return normalizedUser === normalizedCorrect;
	}
}

export function createTestSession(
	setId: number,
	setName: string,
	flashcards: Flashcard[],
	settings: TestSettings,
): TestSession {
	if (flashcards.length === 0) {
		throw new Error("Cannot create test session: No flashcards available");
	}

	let questions = createQuestionsFromFlashcards(flashcards);

	if (settings.shuffleQuestions) {
		questions = shuffleArray(questions);
	}

	return {
		id: generateSessionId(),
		setId,
		setName,
		questions,
		currentQuestionIndex: 0,
		score: 0,
		totalQuestions: questions.length,
		startTime: new Date(),
		mode: settings.mode,
		isCompleted: false,
	};
}

export function submitAnswer(
	session: TestSession,
	answer: string,
	timeSpent: number,
): TestSession {
	const updatedSession = { ...session };
	const currentQuestion =
		updatedSession.questions[session.currentQuestionIndex];

	if (!currentQuestion) {
		throw new Error("No current question found");
	}

	// Update the current question with user's answer
	const updatedQuestion = {
		...currentQuestion,
		userAnswer: answer,
		isCorrect: checkAnswer(answer, currentQuestion.correctAnswer, session.mode),
		timeSpent,
		attemptCount: currentQuestion.attemptCount + 1,
	};

	updatedSession.questions[session.currentQuestionIndex] = updatedQuestion;

	// Update score if correct
	if (updatedQuestion.isCorrect) {
		updatedSession.score += 1;
	}

	return updatedSession;
}

export function moveToNextQuestion(session: TestSession): TestSession {
	const updatedSession = { ...session };

	if (session.currentQuestionIndex < session.totalQuestions - 1) {
		updatedSession.currentQuestionIndex += 1;
	} else {
		updatedSession.isCompleted = true;
		updatedSession.endTime = new Date();
	}

	return updatedSession;
}

export function moveToPreviousQuestion(session: TestSession): TestSession {
	const updatedSession = { ...session };

	if (session.currentQuestionIndex > 0) {
		updatedSession.currentQuestionIndex -= 1;
	}

	return updatedSession;
}

export function completeTest(session: TestSession): TestResult {
	const timeSpent = session.endTime
		? Math.floor(
				(session.endTime.getTime() - session.startTime.getTime()) / 1000,
			)
		: 0;

	const incorrectQuestions = session.questions.filter(
		(q) => q.isCorrect === false,
	);
	const percentage = Math.round((session.score / session.totalQuestions) * 100);

	return {
		sessionId: session.id,
		setId: session.setId,
		setName: session.setName,
		mode: session.mode,
		score: session.score,
		totalQuestions: session.totalQuestions,
		percentage,
		timeSpent,
		completedAt: session.endTime || new Date(),
		incorrectQuestions,
	};
}

export function getProgressPercentage(session: TestSession): number {
	return Math.round(
		((session.currentQuestionIndex + 1) / session.totalQuestions) * 100,
	);
}

export function formatTime(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function generateMultipleChoiceOptions(
	correctAnswer: string,
	allAnswers: string[],
	optionsCount = 4,
): string[] {
	const options = [correctAnswer];
	const normalizedCorrect = correctAnswer.trim().toLowerCase();

	const otherAnswers = allAnswers.filter(
		(answer) => answer.trim().toLowerCase() !== normalizedCorrect,
	);

	// Shuffle and take random wrong answers
	const shuffledOthers = shuffleArray(otherAnswers);
	const wrongOptions = shuffledOthers.slice(0, optionsCount - 1);

	options.push(...wrongOptions);

	// If we don't have enough options, add some generic ones
	while (options.length < optionsCount) {
		options.push(`Option ${options.length}`);
	}

	return shuffleArray(options);
}
