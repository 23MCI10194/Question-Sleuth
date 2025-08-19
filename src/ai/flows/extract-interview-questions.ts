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
    .describe(
      'A list of at least 10 questions extracted from the video transcript if available.'
    ),
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
  prompt: `You are an AI system that extracts interview questions from a video.
Your task is to analyze the provided video of a job interview. First, transcribe the audio from the video to get a full transcript. Then, from that transcript, identify and extract the questions asked by the interviewer.

Follow these rules carefully:
1.  Start by transcribing the entire video to text.
2.  Read through the transcript and identify every question the interviewer asks.
3.  Extract these questions accurately.
4.  Aim to find at least 10 distinct questions if they are present in the interview.
5.  Do not include any answers, comments, or dialogue from the candidate.
6.  Do not make up new questions.
7.  Format the output as a clean list of strings, with each string being a single question.

Here is the video for you to process:
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
