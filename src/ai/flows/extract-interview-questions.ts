// src/ai/flows/extract-interview-questions.ts
'use server';

/**
 * @fileOverview Extracts interview questions from a given transcript.
 *
 * - extractInterviewQuestions - A function to extract interview questions from a transcript.
 * - ExtractInterviewQuestionsInput - The input type for the extractInterviewQuestions function.
 * - ExtractInterviewQuestionsOutput - The return type for the extractInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInterviewQuestionsInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the job interview video.'),
});
export type ExtractInterviewQuestionsInput = z.infer<
  typeof ExtractInterviewQuestionsInputSchema
>;

const ExtractInterviewQuestionsOutputSchema = z.object({
  questions: z
    .string()
    .describe('A numbered list of questions extracted from the transcript.'),
});
export type ExtractInterviewQuestionsOutput = z.infer<
  typeof ExtractInterviewQuestionsOutputSchema
>;

export async function extractInterviewQuestions(
  input: ExtractInterviewQuestionsInput
): Promise<ExtractInterviewQuestionsOutput> {
  return extractInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractInterviewQuestionsPrompt',
  input: {schema: ExtractInterviewQuestionsInputSchema},
  output: {schema: ExtractInterviewQuestionsOutputSchema},
  prompt: `You are an AI system that extracts interview questions from transcripts.

I will provide you with a transcript from a job interview video.
Your tasks are:
1. Identify which lines are questions asked by the interviewer.
2. Extract ONLY those questions.
3. Do not include the candidate\'s answers or any explanations.
4. Do not generate new questions — only use what exists in the transcript.
5. Present the questions in a clean numbered list.
6. If the same question is repeated or rephrased, keep only the clearest version.

Here is the transcript:
<<<TRANSCRIPT>>>
{{{transcript}}}`,
});

const extractInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'extractInterviewQuestionsFlow',
    inputSchema: ExtractInterviewQuestionsInputSchema,
    outputSchema: ExtractInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
