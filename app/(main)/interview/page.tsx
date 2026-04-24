import { getAssessment } from '@/actions/interview';
import React from 'react';
import StatsCard from './_components/stats-card';
import PerformanceChart from './_components/performance-chart';
import QuizList from './_components/quiz-list';
const InterviewPage = async () => {
	const assessments = await getAssessment();
	return <div className="">
		<h1 className="text-3xl font-bold mb-5 gradient-title">Interview Preparation</h1>
		<div className='space-y-6'>
			<StatsCard assessments={assessments} />
			<PerformanceChart assessments={assessments} />
			<QuizList assessments={assessments} />

		</div>
	</div>
}
export default InterviewPage