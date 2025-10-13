import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Trophy, XCircle } from 'lucide-react';
import React from 'react'

const QuizResult = ({ result, onStartNew, hideStartNew = false }: { result: any, onStartNew: any, hideStartNew?: boolean }) => {
    if (!result) return null;
    return (
        <div className='mx-auto'>
            <h1 className='text-3xl flex items-center gap-2 gradient-title'>
                <Trophy className='size-6 text-yellow-500' />
                Quiz Results
            </h1>
            <CardContent className="space-y-6">
                {/* Score Overview */}
                <div className="text-center space-y-2">
                    <h3>{result.quizScore.toFixed(1)}%</h3>
                    <Progress value={result.quizScore} className='w-full' />
                </div>
                {/* Improvement Tip */}
                {
                    result.improvementTip && (
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="font-medium">Improvement Tip: </p>
                            <p className="text-muted-foreground">{result.improvementTip}</p>
                        </div>
                    )
                }
                <div className='space-y-4'>
                    <h3 className='font-medium'>Question Review</h3>
                    {result.questions.map((q: any, index: number) => (
                        <div key={index} className="p-4 border border-muted space-y-2 rounded-lg">
                            <div className='flex items-start justify-center gap-2 '>
                                <p className="font-medium">{q.question}</p>
                                {q.isCorrect ? (
                                    <CheckCircle className='size-5 text-green-500 flex-shrink-0' />
                                ) : (
                                    <XCircle className='size-5 text-red-500 flex-shrink-0' />
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>Your Answer: {q.selectedAnswer}</p>
                                {!q.isCorrect && <p>Correct Answer: {q.correctAnswer}</p>}
                            </div>
                            <div className="text-m bg-muted p-2 rounded">
                                <p className="font-medium">Explanation:</p>
                                <p>{q.explanation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            {
                !hideStartNew && (
                    <CardFooter>
                        <Button onClick={onStartNew} className="w-full">
                            Start New Quiz
                        </Button>
                    </CardFooter>
                )
            }
        </div>
    )
}

export default QuizResult