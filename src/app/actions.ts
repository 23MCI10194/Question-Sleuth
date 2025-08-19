'use server';

import {
  extractInterviewQuestions,
  type ExtractInterviewQuestionsOutput,
} from '@/ai/flows/extract-interview-questions';

interface ActionResult {
  questions?: string;
  error?: string;
}

export async function getQuestionsAction(input: {
  transcript: string;
}): Promise<ActionResult> {
  if (!input.transcript || input.transcript.trim().length === 0) {
    return { error: 'Transcript cannot be empty.' };
  }

  try {
    const result: ExtractInterviewQuestionsOutput =
      await extractInterviewQuestions({ transcript: input.transcript });
    return { questions: result.questions };
  } catch (e: unknown) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { error: `Failed to extract questions: ${errorMessage}` };
  }
}
