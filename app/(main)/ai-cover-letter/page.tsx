import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Eye, Trash } from "lucide-react"
import { getCoverLetters } from '@/actions/cover-letter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parse } from 'date-fns';
import CoverLetterList from './_components/cover-letters-list';
const AICoverLetterPage = async () => {
	const coverLetters = await getCoverLetters();
	const formatDate = (dateStr: string | undefined) => {
		if (!dateStr) return "";
		const date = parse(dateStr, 'yyyy-MM', new Date());
		return format(date, 'MMMM yyyy');
	}
	return <div className="mt-16 ">
		<div className="flex items-center justify-between ">
			<h1 className="text-3xl font-bold mb-5 gradient-title">My Cover Letters</h1>
			<Button><Plus className="size-2 mr-2" /> Create New</Button>
		</div>
		<CoverLetterList coverLetters={coverLetters} />
	</div>
}
export default AICoverLetterPage