"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, Save, X, User } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { getUser, updateUser } from "@/actions/user";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  experience: z.number().min(0).optional(),
  skills: z.string().optional(),
  industry: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/sign-in');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
        reset({
          name: userData.name || "",
          bio: userData.bio || "",
          experience: userData.experience || 0,
          skills: userData.skills || "",
          industry: userData.industry || "",
        });
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchUser();
    }
  }, [status, reset]);

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      const updatedUser = await updateUser(data);
      setUser(updatedUser);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className='flex flex-col items-center justify-center p-6 bg-slate-900/20 backdrop-blur-md min-h-screen w-[90%] mt-16'>
        <Loader2 className="animate-spin size-8" />
        <p className='text-white mt-2'>Loading profile...</p>
      </div>
    );
  }

  if (!session || !user) {
    return null;
  }

  return (
    <div className='flex flex-col items-center  p-6 bg-slate-900/20 backdrop-blur-md min-h-screen w-full mt-24'>
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">User Profile</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (editing) {
                reset();
                setEditing(false);
              } else {
                setEditing(true);
              }
            }}
          >
            {editing ? <X className="size-4" /> : <Edit className="size-4" />}
            {editing ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="size-16 rounded-full bg-muted flex items-center  justify-center">
              {user.image ? (
                <Image src={user.image} alt={user.name || "User"} width={64} height={64} className="size-16 rounded-full" />
              ) : (
                <User className="size-8" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-center sm:text-left">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" {...register("bio")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (years)</Label>
                <Input
                  id="experience"
                  type="number"
                  {...register("experience", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input id="skills" {...register("skills")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" disabled {...register("industry")} />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2" />}
                Save Changes
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Bio</Label>
                <p className="text-sm text-muted-foreground">{user.bio || "No bio provided"}</p>
              </div>
              <div>
                <Label>Experience</Label>
                <p className="text-sm text-muted-foreground">{user.experience ? `${user.experience} years` : "Not specified"}</p>
              </div>
              <div>
                <Label>Skills</Label>
                <p className="text-sm text-muted-foreground">{user.skills || "No skills listed"}</p>
              </div>
              <div>
                <Label>Industry</Label>
                <p className="text-sm text-muted-foreground">{user.industry || "Not specified"}</p>
              </div>
              <div>
                <Label>Member Since</Label>
                <p className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
