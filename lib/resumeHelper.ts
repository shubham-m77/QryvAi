type ResumeEntry = {
    title: string;
    organization: string;
    startDate: string;
    endDate?: string;
    description: string;
    current?: boolean;
}

export const entriesToMarkdown = (type: string, entries: ResumeEntry[]) => {
    return (
        `## ${type}\n\n` +
        entries.map((entry) => {
            const dateRange = entry.current ? `${entry.startDate} - Present` : `${entry.startDate} - ${entry.endDate ?? ''}`;
            return `### ${entry.title} @ ${entry.organization}\n${dateRange}\n\n${entry.description}`
        }).join('\n\n')
    )
}