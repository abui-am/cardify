"use client";

import type { TestMode, TestSettings as TestSettingsType } from "@/types";
import { useState } from "react";

interface TestSettingsProps {
	onStartTest: (settings: TestSettingsType) => void;
	onCancel: () => void;
	cardCount: number;
}

export default function TestSettings({
	onStartTest,
	onCancel,
	cardCount,
}: TestSettingsProps) {
	const [settings, setSettings] = useState<TestSettingsType>({
		mode: "flashcard",
		shuffleQuestions: true,
		showCorrectAnswer: true,
		allowRetry: true,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onStartTest(settings);
	};

	const testModes: { value: TestMode; label: string; description: string }[] = [
		{
			value: "flashcard",
			label: "Flashcard Mode",
			description:
				"Classic flashcard experience - see the question, reveal the answer",
		},
		{
			value: "multiple-choice",
			label: "Multiple Choice",
			description: "Choose the correct answer from multiple options",
		},
		{
			value: "type-answer",
			label: "Type Answer",
			description: "Type the correct answer (exact match required)",
		},
	];

	return (
		<div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
			<h2 className="text-2xl font-bold mb-6 text-center">Test Settings</h2>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Test Mode Selection */}
				<fieldset>
					<legend className="block text-sm font-medium text-gray-700 mb-3">
						Test Mode
					</legend>
					<div className="space-y-3">
						{testModes.map((mode) => (
							<div key={mode.value} className="flex items-start">
								<input
									type="radio"
									id={mode.value}
									name="testMode"
									value={mode.value}
									checked={settings.mode === mode.value}
									onChange={(e) =>
										setSettings({
											...settings,
											mode: e.target.value as TestMode,
										})
									}
									className="mt-1 mr-3"
								/>
								<div>
									<label
										htmlFor={mode.value}
										className="font-medium text-gray-900 cursor-pointer"
									>
										{mode.label}
									</label>
									<p className="text-sm text-gray-600">{mode.description}</p>
								</div>
							</div>
						))}
					</div>
				</fieldset>

				{/* Additional Settings */}
				<div className="space-y-4">
					<div className="flex items-center">
						<input
							type="checkbox"
							id="shuffleQuestions"
							checked={settings.shuffleQuestions}
							onChange={(e) =>
								setSettings({ ...settings, shuffleQuestions: e.target.checked })
							}
							className="mr-3"
						/>
						<label
							htmlFor="shuffleQuestions"
							className="text-sm font-medium text-gray-700"
						>
							Shuffle Questions
						</label>
					</div>

					<div className="flex items-center">
						<input
							type="checkbox"
							id="showCorrectAnswer"
							checked={settings.showCorrectAnswer}
							onChange={(e) =>
								setSettings({
									...settings,
									showCorrectAnswer: e.target.checked,
								})
							}
							className="mr-3"
						/>
						<label
							htmlFor="showCorrectAnswer"
							className="text-sm font-medium text-gray-700"
						>
							Show Correct Answer After Each Question
						</label>
					</div>

					<div className="flex items-center">
						<input
							type="checkbox"
							id="allowRetry"
							checked={settings.allowRetry}
							onChange={(e) =>
								setSettings({ ...settings, allowRetry: e.target.checked })
							}
							className="mr-3"
						/>
						<label
							htmlFor="allowRetry"
							className="text-sm font-medium text-gray-700"
						>
							Allow Multiple Attempts
						</label>
					</div>

					{/* Time Limit */}
					<div className="flex items-center space-x-3">
						<input
							type="checkbox"
							id="hasTimeLimit"
							checked={!!settings.timeLimit}
							onChange={(e) =>
								setSettings({
									...settings,
									timeLimit: e.target.checked ? 10 : undefined,
								})
							}
							className="mr-3"
						/>
						<label
							htmlFor="hasTimeLimit"
							className="text-sm font-medium text-gray-700"
						>
							Time Limit:
						</label>
						{settings.timeLimit !== undefined && (
							<input
								type="number"
								min="1"
								max="60"
								value={settings.timeLimit}
								onChange={(e) =>
									setSettings({
										...settings,
										timeLimit: Number(e.target.value),
									})
								}
								className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
							/>
						)}
						{settings.timeLimit !== undefined && (
							<span className="text-sm text-gray-600">minutes</span>
						)}
					</div>
				</div>

				{/* Test Info */}
				<div className="bg-gray-50 p-4 rounded-md">
					<p className="text-sm text-gray-600">
						<strong>Cards to test:</strong> {cardCount}
					</p>
					{settings.timeLimit && (
						<p className="text-sm text-gray-600">
							<strong>Time limit:</strong> {settings.timeLimit} minutes
						</p>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex space-x-4">
					<button
						type="button"
						onClick={onCancel}
						className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
					>
						Start Test
					</button>
				</div>
			</form>
		</div>
	);
}
