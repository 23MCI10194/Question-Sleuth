'use server';

import {
  extractInterviewQuestions,
  type ExtractInterviewQuestionsOutput,
} from '@/ai/flows/extract-interview-questions';

interface ActionResult {
  questions?: string[];
  error?: string;
}

export async function getQuestionsAction(input: {
  videoDataUri: string;
}): Promise<ActionResult> {
  if (!input.videoDataUri) {
    return { error: 'Video data URI cannot be empty.' };
  }

  try {
    const result: ExtractInterviewQuestionsOutput =
      await extractInterviewQuestions({ videoDataUri: input.videoDataUri });
    return { questions: result.questions };
  } catch (e: unknown) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { error: `Failed to extract questions: ${errorMessage}` };
  }
}
