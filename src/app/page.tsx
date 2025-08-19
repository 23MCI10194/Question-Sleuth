'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Copy,
  Trash2,
  Video,
  Bot,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { getQuestionsAction } from './actions';

export default function Home() {
  const { toast } = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!videoFile) {
      setError('Please select a video file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuestions([]);

    try {
      const videoDataUri = await toBase64(videoFile);
      const result = await getQuestionsAction({ videoDataUri });
      if (result.error) {
        setError(result.error);
      } else {
        setQuestions(result.questions ?? []);
      }
    } catch (e) {
      setError('An unexpected error occurred while processing the video.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!questions.length) return;
    const questionsToCopy = questions.join('\n');
    navigator.clipboard.writeText(questionsToCopy);
    toast({
      title: 'Copied to clipboard!',
      description: 'The extracted questions are ready to be pasted.',
    });
  };

  const handleClear = () => {
    setVideoFile(null);
    setQuestions([]);
    setError(null);
    // Reset file input
    const fileInput = document.getElementById('video-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary font-headline">
            Question Sleuth
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Upload your interview video below and let our AI pinpoint the
            questions for you. Perfect for interview prep and analysis.
          </p>
        </header>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Video className="text-primary" />
              <span>Interview Video</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="video-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-border border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    {videoFile ? (
                      <p className="font-semibold text-primary">{videoFile.name}</p>
                    ) : (
                      <>
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">MP4, MOV, or other video formats</p>
                      </>
                    )}
                  </div>
                  <input
                    id="video-upload"
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <div className="flex justify-between items-center mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClear}
                  disabled={!videoFile && questions.length === 0 && !error}
                  className="text-muted-foreground"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !videoFile}
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

        {questions.length > 0 && !isLoading && (
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
                disabled={questions.length === 0}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy questions</span>
              </Button>
            </CardHeader>
            <CardContent>
              {questions.length > 0 ? (
                <ol className="list-decimal pl-5 space-y-3 text-base">
                  {questions.map((q, i) => (
                    <li key={i} className="ml-2 pl-2">
                      {q}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No questions were found in the provided video.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
