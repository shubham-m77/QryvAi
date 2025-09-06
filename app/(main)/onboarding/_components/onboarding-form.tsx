'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { onboardingSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { updateUser } from "@/actions/user"
import { useFetch } from "@/hooks/fetch-user";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
type Industry = {
    id: string;
    name: string;
    subIndustries?: string[];
};

const OnboardingForm = ({ industries }: { industries: Industry[] }) => {
    const [selectedIndustry, setSelectedIndustry] = useState<Industry | undefined>();
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(onboardingSchema),
    })
    const watchIndustry = watch('industry');

    const { loading: updateLoading, fn: updateUserFn, data: updateData } = useFetch(updateUser);

    const OnSubmit = async (values: any) => {
        try {
            const formattedValue = `${values.industry} - ${values.subIndustry.toLowerCase().replace(/ /g, '-')}`;
            await updateUserFn({
                ...values,
                industry: formattedValue
            })
        } catch (error: any) {
            toast.error(error.message, { style: { background: 'red' } });
        }
    }
    useEffect(() => {
        if (updateData?.success && !updateLoading) {
            toast.success('Profile updated successfully!', { style: { background: 'green' } });
            router.push('/dashboard');
            router.refresh();
        }
    }, [updateData, updateLoading])
    return (
        <div className="flex items-center justify-center bg-background">
            <Card className="w-full max-w-lg mt-10 mx-2">
                <CardHeader>
                    <CardTitle className="gradient-title text-4xl ">Complet Your Profile</CardTitle>
                    <CardDescription>Select your industry to get personalized career insights and recomemendations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSubmit(OnSubmit)}>
                        {/* Industry Field */}
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Select onValueChange={(value) => {
                                setValue('industry', value);
                                setSelectedIndustry(industries.find(item => item.id === value));
                                setValue('subIndustry', '');
                            }}>
                                <SelectTrigger id="industry" className="w-[180px]">
                                    <SelectValue placeholder={'Select and industry'}></SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        industries?.map((item: any) => (
                                            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            {errors.industry && <p className="text-sm text-red-600">{errors.industry.message}</p>}
                        </div>
                        {/* SubIndustry Field*/}
                        {watchIndustry && <div className="space-y-2">
                            <Label htmlFor="subIndustry">Specialization </Label>
                            <Select onValueChange={(value) => {
                                setValue('subIndustry', value);
                            }}>
                                <SelectTrigger id="subIndustry" className="w-[180px]">
                                    <SelectValue placeholder={'Select a sub-industry'}></SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        selectedIndustry?.subIndustries?.map((item: any, index: number) => (
                                            <SelectItem key={index} value={item}>{item}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            {errors.subIndustry && <p className="text-sm text-red-600">{errors.subIndustry.message}</p>}
                        </div>}

                        {/* Experience Field */}
                        <div className="space-y-2">
                            <Label htmlFor="experience">Years of Experience</Label>
                            <Input id="experience" type="number" placeholder="0" min="0" max={'50'} {...register('experience')} />
                            {errors.experience && <p className="text-sm text-red-600">{errors.experience.message}</p>}
                        </div>

                        {/* Skills Field */}
                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills</Label>
                            <Input id="skills" type="text" placeholder="eg. Python, React, Software Management" {...register('skills')} />
                            <p className="text-xs text-muted-foreground">Separate multiple skills with commas(,)</p>
                            {errors.skills && <p className="text-sm text-red-600">{errors.skills.message}</p>}
                        </div>
                        {/* Bio Field */}
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" className="h-32" placeholder="Tell us about yourself" {...register('bio')} />
                            {errors.bio && <p className="text-sm text-red-600">{errors.bio.message}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={updateLoading}>{updateLoading ? <><Loader2 className="animate-spin mr-2 size-4" />Updating...</> : 'Complete Profile'}</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default OnboardingForm