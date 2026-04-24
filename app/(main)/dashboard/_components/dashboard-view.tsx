'use client';
import { Brain, LineChart, TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, TooltipProps, ResponsiveContainer } from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type SalaryRangeObject = {
    role?: string;
    min?: number;
    max?: number;
    median?: number;
    location?: string;
};

type SalaryRange = SalaryRangeObject | string | number | boolean | null | Record<string, unknown> | Array<unknown>;

type InsightDetails = {
    marketOutlook: string;
    growthRate: number | null;
    demandLevel: string;
    topSkills: string[];
    salaryRange: SalaryRange[];
    keyTrends: string[];
    lastUpdated: string | Date;
    nextUpdate: string | Date;
}

type ChartPayload = {
    name?: string;
    value?: number;
    payload?: { date?: string };
}

const DashboardView = ({ insights }: { insights: InsightDetails }) => {
    const salaryData = insights.salaryRange.map((range) => {
        const role = typeof range === 'object' && range !== null && 'role' in range ? String((range as any).role) : 'Unknown';
        const min = typeof range === 'object' && range !== null && 'min' in range ? Number((range as any).min) : 0;
        const max = typeof range === 'object' && range !== null && 'max' in range ? Number((range as any).max) : 0;
        const median = typeof range === 'object' && range !== null && 'median' in range ? Number((range as any).median) : 0;
        return {
            name: role,
            min: min / 1000,
            max: max / 1000,
            median: median / 1000
        }
    })
    const demandLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'high':
                return 'bg-green-500'
            case 'medium':
                return 'bg-yellow-500'
            case 'low':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }
    const marketOutlook = (outlook: string) => {
        switch (outlook.toLowerCase()) {
            case 'positive':
                return { icon: TrendingUp, color: 'text-green-500' }
            case 'neutral':
                return { icon: LineChart, color: 'text-yellow-500' }
            case 'negative':
                return { icon: TrendingDown, color: 'text-red-500' }
            default:
                return { icon: LineChart, color: 'text-gray-500' }
        }
    }
    const outlookMeta = marketOutlook(insights.marketOutlook);
    const OutlookIcon = outlookMeta.icon;
    const outlookColor = outlookMeta.color;

    const lastUpdatedDate = format(new Date(insights.lastUpdated), "dd/MM/yyyy")
    const nextUpdatedDistance = formatDistanceToNow(new Date(insights.nextUpdate), { addSuffix: true })
    return (
        <div className='space-y-6'>
            <div className='flex justify-between items-center'>
                <Badge className='text-sm' variant={'outline'}>Last Updated: {lastUpdatedDate}</Badge>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {/* MarketOulook Card */}
                <Card>
                    <CardHeader className='flex flex-row justify-between items-center pb-2'>
                        <CardTitle className='text-sm font-bold'>Market Outlook</CardTitle>
                        <OutlookIcon className={`w-4 h-4 ${outlookColor}`} />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{insights.marketOutlook}</div>
                        <p className='text-xs text-muted-foreground'>Next update {nextUpdatedDistance}</p>
                    </CardContent>
                </Card>

                {/* Industry Growth Card */}
                <Card>
                    <CardHeader className='flex flex-row justify-between items-center pb-2'>
                        <CardTitle className='text-sm font-bold'>Industry Growth</CardTitle>
                        <TrendingUp className={`w-4 h-4 text-muted-foreground`} />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{insights.growthRate !== null ? `${insights.growthRate.toFixed(1)}%` : 'N/A'}</div>
                        <Progress value={insights.growthRate ?? 0} className='mt-2' />
                    </CardContent>
                </Card>

                {/* Demand level Card */}
                <Card>
                    <CardHeader className='flex flex-row justify-between items-center pb-2'>
                        <CardTitle className='text-sm font-bold'>Demand Level</CardTitle>
                        <OutlookIcon className={`w-4 h-4 ${outlookColor}`} />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{insights.demandLevel}</div>
                        <div className={`h-2 w-full rounded-full mt-2 ${demandLevelColor(insights.demandLevel)}`} />
                    </CardContent>
                </Card>

                {/* Skills Card */}
                <Card>
                    <CardHeader className='flex flex-row justify-between items-center pb-2'>
                        <CardTitle className='text-sm font-bold'>Top Skills</CardTitle>
                        <Brain className={`w-4 h-4 text-muted-foreground`} />
                    </CardHeader>
                    <CardContent>
                        <div className='flex flex-wrap gap-1.5'>{insights.topSkills.map((skill: any) => (
                            <Badge key={skill} variant={'secondary'} className='mr-2'>{skill}</Badge>
                        ))}</div>
                        <p className='text-xs text-muted-foreground'>Next update {nextUpdatedDistance}</p>
                    </CardContent>
                </Card>
            </div>
            {/* Range of Salary */}
            <div className='w-full'>
                <Card>
                    <CardHeader className=''>
                        <CardTitle className=''>Salary Ranges by Role</CardTitle>
                        <CardDescription>
                            Displaying minimum, median and maximum salaries (in thousands)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={salaryData}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className='bg-background border rounded-lg p-2 shadow'>
                                                    <p className="font-medium">{label}</p>
                                                    {
                                                        payload.map((item) => (
                                                            <p key={item.name} className='text-sm'>{item.name}: ${item.value}K</p>
                                                        ))
                                                    }
                                                </div>
                                            )
                                        }
                                        return null
                                    }} />
                                    <Bar dataKey="min" fill="#94a9b8" name="Min Salary (K)" />
                                    <Bar dataKey="median" fill="#64748b" name="Median Salary (K)" />
                                    <Bar dataKey="max" fill="#475569" name="Max Salary (K)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Card>
                    <CardHeader className='flex flex-col items-center pb-2'>
                        <CardTitle className='text-sm font-bold'>Key Industry Trends</CardTitle>
                        <CardDescription className='text-xs text-gray-400'>Current trends shaping the industry</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul>
                            { }
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-col items-center pb-2'>
                        <CardTitle className='text-sm font-bold'>Key Industry Trends</CardTitle>
                        <CardDescription className='text-xs text-gray-400'>Current trends shaping the industry</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className='space-y-4'>
                            {insights.keyTrends.map((trend: any, index: number) => (
                                <li key={index} className='text-sm font-semibold flex items-start gap-1'><div className='bg-primary size-2 mt-2 rounded-full'></div>{trend}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default DashboardView