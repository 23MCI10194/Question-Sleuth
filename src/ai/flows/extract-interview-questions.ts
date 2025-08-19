'use server';

/**
 * @fileOverview Extracts interview questions from a given video.
 *
 * - extractInterviewQuestions - A function to extract interview questions from a video.
 * - ExtractInterviewQuestionsInput - The input type for the extractInterviewQuestions function.
 * - ExtractInterviewQuestionsOutput - The return type for the extractInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInterviewQuestionsInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of a job interview, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractInterviewQuestionsInput = z.infer<
  typeof ExtractInterviewQuestionsInputSchema
>;

const ExtractInterviewQuestionsOutputSchema = z.object({
  questions: z
    .array(z.string())
    .describe('A list of questions extracted from the video transcript.'),
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
  prompt: `You are an AI system that extracts interview questions from video transcripts.

I will provide you with a video from a job interview.
Your tasks are:
1. Transcribe the video to identify what is said.
2. Identify which lines are questions asked by the interviewer.
3. Extract ONLY those questions.
4. Do not include the candidate's answers or any explanations.
5. Do not generate new questions — only use what exists in the interview.
6. Present the questions as a list of strings.
7. If the same question is repeated or rephrased, keep only the clearest version.

Here is the video:
{{media url=videoDataUri}}`,
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
