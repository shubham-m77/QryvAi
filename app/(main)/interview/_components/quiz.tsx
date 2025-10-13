"use client"
import { generateQuiz, saveQuizResults } from "@/actions/interview";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useFetch } from "@/hooks/fetch-user";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BarLoader, PropagateLoader } from "react-spinners";
import { toast } from "sonner";
import QuizResult from "./quiz-result";

export const Quiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [showExplaination, setShowExplaination] = useState<boolean>(false);
    const {
        loading: generatingQuiz,
        data: quizData,
        fn: generateQuizFn
    } = useFetch(generateQuiz);

    const {
        loading: savingResult,
        data: resultData,
        fn: saveQuizFn,
        setData: setResultData
    } = useFetch(saveQuizResults);

    useEffect(() => {
        if (quizData) {
            setAnswers(new Array(quizData.questions.length).fill(""));
        }
    }, [quizData]);

    const handleNext = () => {
        if (currentQuestion < quizData.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowExplaination(false);
        }
        else {
            finishQuiz();
        }
    }

    const calculateTestScore = () => {
        let correct = 0;
        answers.forEach((ans: any, index: number) => {
            if (ans == quizData[index].correctAnswer) {
                correct++;
            }
        })
        return (correct / quizData.length) * 100
    }
    const finishQuiz = async () => {
        let score = 0;
        score = calculateTestScore()
        try {
            await saveQuizFn(quizData, answers, score);
            toast.success("Test Completed")
        } catch (error: any) {
            toast.error(error.message || "Unable to save test results!");
        }
    }
    // Generate New Quiz/Test
    const startNewQuiz = () => {
        setCurrentQuestion(0);
        setAnswers([]);
        setShowExplaination(false);
        setResultData(null);
        generateQuizFn();
    }

    if (generatingQuiz) {
        return <div className="mt-5 w-full min-h-screen flex items-center justify-center">
            <PropagateLoader color="gray" />
        </div>
    }
    // Show results if quiz is completed
    if (resultData) {
        return (
            <div className='mx-2'>
                <QuizResult result={resultData} onStartNew={startNewQuiz} />
            </div>
        )
    }
    if (!quizData) {
        return (
            <Card className="gap-2 w-full flex flex-col mx-2">
                <CardHeader>
                    <CardTitle className="text-base">Ready to Test Your Knowledge</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">This quiz contains industry-specific questions to help you prepare for your interview.</p>
                    <Button onClick={generateQuizFn} className="w-full">Start Test</Button>
                </CardContent>
            </Card>
        )
    }
    const question = quizData[currentQuestion];
    return (
        <Card className=" mx-2">
            <CardHeader>
                <CardTitle className="text-sm">Question {currentQuestion + 1} of {quizData.length}</CardTitle>
            </CardHeader>
            <CardContent className="gap-y-4">
                <p className="text-base text-muted-foreground">{question?.question}</p>
                <div className="space-y-2">
                    {question?.options.map((option: any, index: number) => {
                        return (<Button
                            key={index}
                            variant={answers[currentQuestion] === option ? "default" : "outline"}
                            onClick={() => setAnswers((prev) => {
                                const newAnswers = [...prev];
                                newAnswers[currentQuestion] = option;
                                return newAnswers;
                            })}
                            className="w-full"
                        >
                            {option}
                        </Button>
                        )
                    })}
                </div>
                {showExplaination &&
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="font-medium ">Explaination:</p>
                        <p className="text-muted-foreground">{question.explaination}</p>
                    </div>}
            </CardContent>
            <CardFooter>
                {
                    !showExplaination && (
                        <Button onClick={() => setShowExplaination(true)} variant={'outline'} disabled={!answers[currentQuestion]}>
                            Show Explaination
                        </Button>
                    )
                }

                <Button onClick={handleNext} className="ml-auto" disabled={!answers[currentQuestion] || savingResult}>
                    {
                        savingResult && <Loader2 className="mt-4 animate-spin" width={'100%'} color="gray" />
                    }
                    {
                        currentQuestion < quizData.length - 1 ? "Next Question" : "Finish Test"
                    }</Button>
            </CardFooter>
        </Card>
    )
}
