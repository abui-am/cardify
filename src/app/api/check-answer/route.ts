import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
	try {
		const { userAnswer, correctAnswer } = await request.json();

		if (!userAnswer || !correctAnswer) {
			return NextResponse.json(
				{ error: "Missing userAnswer or correctAnswer" },
				{ status: 400 },
			);
		}

		const prompt = `Compare these two answers and determine if they are semantically equivalent or if the user answer is correct enough to be considered right:

Correct Answer: "${correctAnswer}"
User Answer: "${userAnswer}"

Consider the following:
- Minor spelling mistakes should be forgiven
- Different phrasing that means the same thing should be accepted
- Synonyms and equivalent terms should be accepted
- Partial answers that capture the main concept should be accepted
- Only reject if the meaning is clearly different or wrong

Respond with only "YES" if the user answer is correct enough, or "NO" if it's wrong.`;

		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			max_tokens: 10,
			temperature: 0,
		});

		const result = response.choices[0]?.message?.content?.trim().toUpperCase();
		const isCorrect = result === "YES";

		return NextResponse.json({ isCorrect });
	} catch (error) {
		console.error("AI answer checking failed:", error);

		return NextResponse.json(
			{ error: "AI service temporarily unavailable" },
			{ status: 500 },
		);
	}
}
