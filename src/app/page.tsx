'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Copy,
  Trash2,
  Mic,
  Bot,
  AlertTriangle,
} from 'lucide-react';
import { getQuestionsAction } from './actions';

const exampleTranscript = `Interviewer: Can you tell me about yourself?
Candidate: Sure, I am a software engineer with 5 years of experience.
Interviewer: Why did you leave your previous company?
Candidate: Because I wanted more challenges.`;

export default function Home() {
  const { toast } = useToast();
  const [transcript, setTranscript] = useState(exampleTranscript);
  const [questions, setQuestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!transcript.trim()) {
      setError('Transcript cannot be empty.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuestions('');

    try {
      const result = await getQuestionsAction({ transcript });
      if (result.error) {
        setError(result.error);
      } else {
        setQuestions(result.questions ?? '');
      }
    } catch (e) {
      setError('An unexpected error occurred while communicating with the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!questions) return;
    const questionsToCopy = questions
      .split('\n')
      .filter((q) => q.trim().length > 0)
      .map((q) => q.replace(/^\d+\.\s*/, ''))
      .join('\n');
    navigator.clipboard.writeText(questionsToCopy);
    toast({
      title: 'Copied to clipboard!',
      description: 'The extracted questions are ready to be pasted.',
    });
  };

  const handleClear = () => {
    setTranscript('');
    setQuestions('');
    setError(null);
  };

  const formattedQuestions = questions
    .split('\n')
    .filter((q) => q.trim().length > 0);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary font-headline">
            Question Sleuth
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Paste your interview transcript below and let our AI pinpoint the
            questions for you. Perfect for interview prep and analysis.
          </p>
        </header>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Mic className="text-primary" />
              <span>Interview Transcript</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="Paste your transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={10}
                className="text-base"
              />
              <div className="flex justify-between items-center mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClear}
                  disabled={!transcript && !questions && !error}
                  className="text-muted-foreground"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !transcript.trim()}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                  size="lg"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Extract Questions
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex justify-center items-center gap-4 text-muted-foreground p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg font-medium">Analyzing...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Extraction Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {questions && !isLoading && (
          <Card className="shadow-lg animate-in fade-in-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bot className="text-primary" />
                <span>Extracted Questions</span>
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={formattedQuestions.length === 0}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy questions</span>
              </Button>
            </CardHeader>
            <CardContent>
              {formattedQuestions.length > 0 ? (
                <ol className="list-decimal pl-5 space-y-3 text-base">
                  {formattedQuestions.map((q, i) => (
                    <li key={i} className="ml-2 pl-2">
                      {q.replace(/^\d+\.\s*/, '')}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No questions were found in the provided transcript.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
