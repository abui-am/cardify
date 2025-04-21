"use server";

import OpenAI from "openai";

const openAi = new OpenAI();

export const generateQuestion = async (text: string) => {
	try {
		const response = await openAi.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content: `
            Provide valid question and answer JSON Output based on the text provided.
            `,
				},
				{
					role: "user",
					content: text,
				},
				{
					role: "user",
					content: "Generate questions and answers from the text",
				},
			],
			temperature: 1,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,

			response_format: {
				type: "json_schema",
				json_schema: {
					name: "json_response",
					strict: true,
					schema: {
						type: "object",
						properties: {
							questions: {
								type: "array",
								items: {
									type: "object",
									properties: {
										question: {
											type: "string",
											description: "this is the question",
										},
										answer: {
											type: "string",
											description: "this is the answer",
										},
									},
									required: ["question", "answer"],
									additionalProperties: false,
								},
							},
						},
						required: ["questions"],
						additionalProperties: false,
					},
				},
			},
		});

		const content = JSON.parse(
			response?.choices?.[0]?.message.content ?? "{}",
		) as {
			questions: { question: string; answer: string }[];
		};
		return {
			data: content,
		};
	} catch (error) {
		console.error(error);
		return {
			data: {
				questions: [],
			},
		};
	}
};
