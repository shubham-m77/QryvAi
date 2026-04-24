import { getIndustryInsights } from '@/actions/dashboard';
import { getUserOnboardingStatus } from '@/actions/user';
import { redirect } from 'next/navigation';
import DashboardView from './_components/dashboard-view';
const IndustryInsights = async () => {
	const { isOnboarded } = await getUserOnboardingStatus();
	if (!isOnboarded) redirect('/onboarding');
	const insights = await getIndustryInsights();

	if (!insights) {
		return (
			<div className="container mx-auto py-12 text-center">
				<h1 className="text-3xl font-bold mb-4">Industry insights are not available yet</h1>
				<p className="text-muted-foreground">Please complete your onboarding or try again later.</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto">
			<DashboardView insights={insights} />
		</div>
	);
}
export default IndustryInsights