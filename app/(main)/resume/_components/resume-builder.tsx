'use client'
import { saveResume } from "@/actions/resume"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useFetch } from "@/hooks/fetch-user"
import { resumeSchema } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save, Download, Edit, Monitor, AlertTriangle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import EntryForm from "./entry-form"
import { entriesToMarkdown } from "@/lib/resumeHelper"
import MDEditor, { PreviewType } from "@uiw/react-md-editor"
import { toast } from "sonner"

const ResumeBuilder = ({ initialContent = '', userName = 'Resume' }: { initialContent?: string, userName?: string }) => {
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
    const [resumeMode, setResumeMode] = useState<PreviewType>('preview');
    const [previewContent, setPreviewContent] = useState<string>(initialContent ?? '');
    const handleTabChange = (value: string) => setActiveTab(value as 'edit' | 'preview');
    const handlePreviewChange = (value?: string) => setPreviewContent(value ?? '');
    const [isGenerating, setIsGenerating] = useState(false);
    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(resumeSchema),
        defaultValues: {
            contactInfo: {},
            summary: "",
            skills: "",
            experience: [],
            education: [],
            projects: []

        }
    })
    const {
        loading: isSaving,
        fn: saveResumeFn,
        data: saveResult,
        error: saveError
    } = useFetch(saveResume);
    const formValues = watch();
    useEffect(() => {
        if (initialContent) setActiveTab("preview")
    }, [initialContent])

    useEffect(() => {
        if (activeTab === "edit") {
            const newContent = getCombinedContent();
            setPreviewContent(newContent ? newContent : initialContent ?? '');
        }
    }, [activeTab, formValues, initialContent])

    useEffect(() => {
        if (saveResult && !isSaving) {
            toast.success("Resume saved successfully");
        }
        if (saveError) toast.error("Error saving resume. Please try again.");
    }, [isSaving, saveResult, saveError])
    const onSubmit = async () => {
        try {
            await saveResumeFn({ content: previewContent });
        } catch (error) {
            console.error("Save Resume Error:", error);
        }
    }

    // Markdown Resume Edit/preview
    const getContactMarkdown = () => {
        const { contactInfo } = formValues;
        const parts = [];
        if (contactInfo.email) parts.push(`✉️ [${contactInfo.email}](mailto:${contactInfo.email})`);
        if (contactInfo.mobile) parts.push(`📞 ${contactInfo.mobile}`);
        if (contactInfo.linkedIn) parts.push(`💼 [LinkedIn](${contactInfo.linkedIn})`);
        if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);
        return parts.length > 0 ? `## <div align="center">${userName}</div>\n\n<div align="center">\n\n${parts.join(' | ')}\n\n</div>` : '';
    }

    const getCombinedContent = () => {
        const { summary, skills, experience, education, projects } = formValues;
        return [
            getContactMarkdown(),
            summary && `## Summary\n\n${summary}`,
            skills && `## Skills\n\n${skills}`,
            entriesToMarkdown('Work Experience', experience),
            entriesToMarkdown('Education', education),
            entriesToMarkdown('Projects', projects)
        ].filter(Boolean).join('\n\n');
    }

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            if (typeof window === 'undefined') {
                throw new Error("PDF generation is only available in the browser.");
            }

            const elem = document.querySelector<HTMLElement>("#resume-pdf");
            if (!elem) {
                throw new Error("Resume preview container not found for PDF generation.");
            }

            const html2pdf = (await import('html2pdf.js')).default;
            const opt = {
                margin: [15, 15],
                filename: `${(userName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }
            await html2pdf().set(opt).from(elem).save();
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Unable to generate PDF. Please try again in the browser.");
        }
        finally {
            setIsGenerating(false);
        }
    }
    return (
        <div className="space-y-4">
            <div className="gap-4 flex flex-col md:flex-row justify-between items-center ">
                <h1 className="font-bold gradient-title text-5xl">Resume Builder</h1>
                <div className="flex flex-col md:flex-row justify-between space-x-4 items-center ">
                    <Button variant={'destructive'} disabled={isSaving} onClick={onSubmit}>{
                        isSaving ? (<><Loader2 className="size-4 animate-spin mr-2" /> Saving...</>) : (
                            <><Save className="size-4 mr-1" /> Save</>)}</Button>
                    <Button disabled={isGenerating} onClick={generatePDF}>{isGenerating ? (<><Loader2 className="size-4 animate-spin" /> Generating PDF...</>) : (<><Download className="size-4" /> Download PDF</>)}</Button>
                </div>
            </div>
            <Tabs value={activeTab} onValueChange={handleTabChange} >
                <TabsList>
                    <TabsTrigger value="edit">Form</TabsTrigger>
                    <TabsTrigger value="preview">Markdown</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                    <form className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bordr rounded-lg bg-muted/50">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input {...register("contactInfo.email")} type="email" placeholder="your@gmail.com" error={errors.contactInfo?.email} />
                                    {errors.contactInfo?.email && (
                                        <p className="text-sm text-red-500">{errors.contactInfo.email.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mobile No.</label>
                                    <Input {...register("contactInfo.mobile")} type="tel" placeholder="+91 0000000000" error={errors.contactInfo?.mobile} />
                                    {errors.contactInfo?.mobile && (
                                        <p className="text-sm text-red-500">{errors.contactInfo.mobile.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">LinkedIn URL</label>
                                    <Input {...register("contactInfo.linkedIn")} type="url" placeholder="https://www.linkedin.com/in/your-profile" error={errors.contactInfo?.linkedIn} />
                                    {errors.contactInfo?.linkedIn && (
                                        <p className="text-sm text-red-500">{errors.contactInfo.linkedIn.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Twitter/X Profile</label>
                                    <Input {...register("contactInfo.twitter")} type="url" placeholder="https://www.x.com/your-profile" error={errors.contactInfo?.twitter} />
                                    {errors.contactInfo?.twitter && (
                                        <p className="text-sm text-red-500">{errors.contactInfo.twitter.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Professional Summary</h3>
                            <Controller
                                control={control}
                                name="summary"
                                render={({ field }) => (
                                    <Textarea {...field} placeholder="Write your professional summary here..." error={errors.summary} />
                                )}
                            />
                            {errors.summary && (
                                <p className="text-red-500 text-sm">{errors.summary.message}</p>
                            )}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Skills</h3>
                            <Controller
                                control={control}
                                name="skills"
                                render={({ field }) => (
                                    <Textarea {...field} className="h-16" placeholder="List your skills here... " error={errors.skills} />
                                )}
                            />
                            {errors.skills && (
                                <p className="text-red-500 text-sm">{errors.skills.message}</p>
                            )}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Work Experience</h3>
                            <Controller
                                control={control}
                                name="experience"
                                render={({ field }) => (
                                    <EntryForm type="Experience" entries={field.value} onChange={field.onChange} />
                                )}
                            />
                            {errors.experience && (
                                <p className="text-red-500 text-sm">{errors.experience.message}</p>
                            )}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Education</h3>
                            <Controller
                                control={control}
                                name="education"
                                render={({ field }) => (
                                    <EntryForm type="Education" entries={field.value} onChange={field.onChange} />
                                )}
                            />
                            {errors.education && (
                                <p className="text-red-500 text-sm">{errors.education.message}</p>
                            )}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Projects</h3>
                            <Controller
                                control={control}
                                name="projects"
                                render={({ field }) => (
                                    <EntryForm type="Projects" entries={field.value} onChange={field.onChange} />
                                )}
                            />
                            {errors.projects && (
                                <p className="text-red-500 text-sm">{errors.projects.message}</p>
                            )}

                        </div>
                    </form>
                </TabsContent>
                <TabsContent value="preview">
                    <Button className="mb-2 flex items-center" onClick={() => setResumeMode(resumeMode == "preview" ? "edit" : "preview")} variant={'link'}>
                        {resumeMode == "preview" ? <> <Edit className='size-4 mr-1' /> Edit Resume</> : <> <Monitor className='size-4 mr-1' /> Show Preview</>}
                    </Button>
                    {
                        resumeMode === "edit" && (
                            <div className="flex items-center p-3 gap-2 border-2 border-yellow-600 text-yellow-600 rounded-md mb-2">
                                <AlertTriangle className="size-5 mr-1" />
                                <span className="text-sm">You'll lose the edited markdown if you update the form data.</span>
                            </div>
                        )
                    }
                    <div className="border rounded-lg">
                        <MDEditor value={previewContent} onChange={handlePreviewChange} height={800} preview={resumeMode} />
                    </div>
                    <div className="hidden" >
                        <div id='resume-pdf'>
                            <MDEditor.Markdown source={previewContent} style={{
                                backgroundColor: 'white',
                                color: "black"
                            }} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ResumeBuilder