import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Trophy } from 'lucide-react'

const StatsCard = ({ assessments }: { assessments: any }) => {
    const getAverageScore = () => {
        if (!assessments) return;
        const total = assessments.reduce((sum: number, assessment: any) => sum + assessment.quizScore, 0);
        return (total / assessments.length).toFixed(1);
    }
    const getLatestAssessment = () => {
        if (!assessments?.length) return null;
        return assessments[0];
    }
    const getTotalQuestions = () => {
        if (!assessments.length) return 0;
        return assessments.reduce((sum: any, assessment: any) => sum + assessment.questions.length, 0)
    }
    return (<div className=''>
        <div className='grid gap-4 md:grid-cols-3'>
            <Card>
                <CardHeader className='flex flex-row justify-between items-center pb-2'>
                    <CardTitle className='text-sm font-bold'>Average Score</CardTitle>
                    <Trophy className={`w-4 h-4 text-muted-foreground`} />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>{getAverageScore()}%</div>
                    <div className={`text-gray-400 text-xs`} >Across all assessments</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className='flex flex-row justify-between items-center pb-2'>
                    <CardTitle className='text-sm font-bold'>Questions Practiced</CardTitle>
                    <Brain className={`w-4 h-4 text-muted-foreground`} />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>{getTotalQuestions()}</div>
                    <div className={`text-gray-400 text-xs`} >Total questions</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className='flex flex-row justify-between items-center pb-2'>
                    <CardTitle className='text-sm font-bold'>Latest Score</CardTitle>
                    <Trophy className={`w-4 h-4 text-muted-foreground`} />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>{getLatestAssessment()}</div>
                    <div className={`text-gray-400 text-xs`} >Most-recent quiz</div>
                </CardContent>
            </Card>
        </div>
    </div>
    )
}

export default StatsCard