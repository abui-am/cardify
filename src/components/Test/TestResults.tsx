"use client";

import { formatTime } from "@/services/testService";
import type { TestResult } from "@/types";

interface TestResultsProps {
	result: TestResult;
	onRetry: () => void;
	onBackToSet: () => void;
	onNewTest: () => void;
}

export default function TestResults({
	result,
	onRetry,
	onBackToSet,
	onNewTest,
}: TestResultsProps) {
	const getPerformanceMessage = () => {
		if (result.percentage >= 90) {
			return { message: "Excellent work! 🎉", color: "text-green-600" };
		}
		if (result.percentage >= 80) {
			return { message: "Great job! 👏", color: "text-blue-600" };
		}
		if (result.percentage >= 70) {
			return { message: "Good effort! 👍", color: "text-yellow-600" };
		}
		return { message: "Keep practicing! 💪", color: "text-red-600" };
	};

	const performance = getPerformanceMessage();

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="bg-white rounded-lg shadow-lg p-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-4">Test Complete!</h1>
					<div className={`text-xl font-semibold ${performance.color}`}>
						{performance.message}
					</div>
				</div>

				{/* Score Summary */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					<div className="bg-blue-50 p-4 rounded-lg text-center">
						<div className="text-2xl font-bold text-blue-600">
							{result.score}
						</div>
						<div className="text-sm text-gray-600">Correct</div>
					</div>
					<div className="bg-gray-50 p-4 rounded-lg text-center">
						<div className="text-2xl font-bold text-gray-600">
							{result.totalQuestions}
						</div>
						<div className="text-sm text-gray-600">Total</div>
					</div>
					<div className="bg-green-50 p-4 rounded-lg text-center">
						<div className="text-2xl font-bold text-green-600">
							{result.percentage}%
						</div>
						<div className="text-sm text-gray-600">Score</div>
					</div>
					<div className="bg-purple-50 p-4 rounded-lg text-center">
						<div className="text-2xl font-bold text-purple-600">
							{formatTime(result.timeSpent)}
						</div>
						<div className="text-sm text-gray-600">Time</div>
					</div>
				</div>

				{/* Incorrect Questions Review */}
				{result.incorrectQuestions.length > 0 && (
					<div className="mb-8">
						<h2 className="text-xl font-semibold mb-4 text-red-600">
							Questions to Review ({result.incorrectQuestions.length})
						</h2>
						<div className="space-y-4">
							{result.incorrectQuestions.map((question, index) => (
								<div
									key={question.id}
									className="bg-red-50 border border-red-200 rounded-lg p-4"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h3 className="font-semibold text-gray-900 mb-2">
												{question.question}
											</h3>
											<div className="text-sm space-y-1">
												<div className="text-green-700">
													<span className="font-medium">Correct answer:</span>{" "}
													{question.correctAnswer}
												</div>
												{question.userAnswer &&
													question.userAnswer !== question.correctAnswer && (
														<div className="text-red-700">
															<span className="font-medium">Your answer:</span>{" "}
															{question.userAnswer}
														</div>
													)}
											</div>
										</div>
										<div className="text-right text-sm text-gray-500 ml-4">
											#{index + 1}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Perfect Score Message */}
				{result.incorrectQuestions.length === 0 && (
					<div className="mb-8 text-center">
						<div className="bg-green-50 border border-green-200 rounded-lg p-6">
							<div className="text-green-800">
								<div className="text-lg font-semibold mb-2">
									Perfect Score! 🏆
								</div>
								<div>
									You answered all questions correctly. Excellent mastery of
									this set!
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Test Details */}
				<div className="bg-gray-50 p-4 rounded-lg mb-8">
					<h3 className="font-semibold mb-2">Test Details</h3>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="font-medium">Set:</span> {result.setName}
						</div>
						<div>
							<span className="font-medium">Mode:</span>{" "}
							{result.mode.replace("-", " ")}
						</div>
						<div>
							<span className="font-medium">Completed:</span>{" "}
							{result.completedAt.toLocaleString()}
						</div>
						<div>
							<span className="font-medium">Average time per question:</span>{" "}
							{formatTime(Math.round(result.timeSpent / result.totalQuestions))}
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4">
					<button
						type="button"
						onClick={onBackToSet}
						className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
					>
						Back to Set
					</button>

					{result.incorrectQuestions.length > 0 && (
						<button
							type="button"
							onClick={onRetry}
							className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
						>
							Retry Incorrect Questions
						</button>
					)}

					<button
						type="button"
						onClick={onNewTest}
						className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Take New Test
					</button>
				</div>
			</div>
		</div>
	);
}
