'use client'
import { Button } from "@/components/ui/button"
import { entrySchema } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { PlusCircle, Loader2, Sparkles, PlusIcon, X } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFetch } from "@/hooks/fetch-user"
import { improveWithAi } from "@/actions/resume"
import { toast } from "sonner"
import { format, parse } from "date-fns"

const EntryForm = ({ type, entries, onChange }: { type: string, entries: any[], onChange: (entries: any[]) => void }) => {
    const [isAdding, setIsAdding] = useState(false);
    const {
        register,
        handleSubmit: handleValidation,
        formState: { errors },
        watch,
        reset,
        setValue
    } = useForm({
        resolver: zodResolver(entrySchema),
        defaultValues: {
            title: "",
            organization: "",
            startDate: "",
            endDate: "",
            description: "",
            current: false
        }
    })
    const current = watch('current')
    const {
        loading: isImproving,
        fn: improveWithAiFn,
        data: improvedContent,
        error: improveError
    } = useFetch(improveWithAi)

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return "";
        const date = parse(dateStr, 'yyyy-MM', new Date());
        return format(date, 'MMMM yyyy');
    }
    const handleAdd = handleValidation((data) => {
        const formattedEntry = {
            ...data,
            startDate: formatDate(data.startDate),
            endDate: data.current ? "" : formatDate(data.endDate)
        }
        onChange([...entries, formattedEntry]);
        reset();
        setIsAdding(false);
    })

    const handleDelete = (index: number) => {
        onChange(entries.filter((_, i) => i !== index));
    }

    const handleImproveDescription = async () => {
        const desc = watch('description')
        if (!desc) {
            toast.error("Please enter a description first!")
            return;
        }
        await improveWithAiFn({
            current: desc,
            type: type.toLowerCase()
        })
    }

    useEffect(() => {
        if (improvedContent && !isImproving) {
            setValue("description", improvedContent);
            toast.success("Description Improved!");
        }
        if (improveError) {

            toast.error("Failed to improve message~", improveError.message);
        }
    }, [improveError, improvedContent, isImproving])
    return (
        <div className="space-y-4">
            <div className="space-y-4">
                {
                    entries?.map((entry, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row pb-2 items-center justify-between">
                                <CardTitle>{entry.title} @ {entry.organization}</CardTitle>
                                <Button variant="outline" size={'icon'} onClick={() => handleDelete(index)}><X className="size-4 mr-1" />Delete</Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{entry.current ? `${entry.startDate} - Present` : `${entry.startDate} - ${entry.endDate}`}</p>
                                <p className="mt-2 text-sm whitespace-pre-wrap">{entry.description}</p>
                            </CardContent>
                        </Card>
                    ))
                }
            </div>
            {
                isAdding && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Add {type}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Input placeholder="Title/Position" {...register("title")} error={errors.title} />
                                    {
                                        errors.title && (
                                            <p className="text-red-500 text-sm">{errors.title.message}</p>
                                        )
                                    }
                                </div>
                                <div className="space-y-2">
                                    <Input placeholder="Organization/Company" {...register("organization")} error={errors.organization} />
                                    {
                                        errors.organization && (
                                            <p className="text-red-500 text-sm">{errors.organization.message}</p>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Input type="month" {...register("startDate")} error={errors.startDate} />
                                    {
                                        errors.startDate && (
                                            <p className="text-red-500 text-sm">{errors.startDate.message}</p>
                                        )
                                    }
                                </div>
                                <div className="space-y-2">
                                    <Input type="month" {...register("endDate")} error={errors.endDate} disabled={current} />
                                    {
                                        errors.endDate && (
                                            <p className="text-red-500 text-sm">{errors.endDate.message}</p>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input type="checkbox" id="current" {...register('current')} onChange={(e) => {
                                    setValue("current", e.target.checked);
                                    if (e.target.checked) setValue("endDate", "")
                                }} />
                                <Label htmlFor="current">Current {type}</Label>
                            </div>
                            <div className="space-y-2">
                                <Textarea
                                    placeholder={`Description of your ${type.toLowerCase()}`}
                                    className="h-32"
                                    {...register("description")}
                                    error={errors.description?.message}
                                />
                                {
                                    errors.description && (
                                        <p className="text-red-500 text-sm">{errors.description.message}</p>
                                    )
                                }
                            </div>
                            <Button
                                type="button"
                                variant={"ghost"}
                                size="sm"
                                onClick={handleImproveDescription}
                                disabled={isImproving || !watch("description")}
                            >
                                {
                                    isImproving ? (
                                        <>
                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                            Improving...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="size-4 mr-2" />
                                            Improve with AI
                                        </>
                                    )
                                }
                            </Button>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-3">
                            <Button variant={'outline'} onClick={() => { reset(); setIsAdding(false) }}>Cancel</Button>
                            <Button onClick={handleAdd}><PlusIcon className="size-4 mr-2" />Add</Button>
                        </CardFooter>
                    </Card>
                )
            }
            {
                !isAdding && (
                    <Button className="w-full" variant={'outline'} onClick={() => setIsAdding(true)}>
                        <PlusCircle className="size-4 mr-2" />
                        Add {type}
                    </Button>
                )
            }
        </div>
    )
}

export default EntryForm