"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDollarCurrency } from "@/lib/utils"
import { ChangePasswordRequest, userApi, UserResponse } from "@/services/api/userApi"


export default function ProfilePage() {
    const [profile, setProfile] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [showSalary, setShowSalary] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editedProfile, setEditedProfile] = useState<Partial<UserResponse>>({})
    const [oldPassword, setoldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [changingPassword, setChangingPassword] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await userApi.getCurrentUser();
                if (response.isSuccess) {
                    setProfile(response.data);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        if (selectedFile) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        } else {
            setPreviewUrl(null)
        }
    }, [selectedFile])

    const fetchUserProfile = async () => {
        try {
            setLoading(true)
            // In a real application, this would be an actual API call
            // const response = await axios.get('/api/users/me')
            // const data = response.data

            // For demo purposes, we'll use mock data
            const mockData: UserResponse = {
                id: "550e8400-e29b-41d4-a716-446655440000",
                email: "john.doe@example.com",
                userName: "johndoe",
                fullName: "John Doe",
                roleName: "Manager",
                phoneNumber: "+1 (555) 123-4567",
                department: "Engineering",
                rank: "Senior",
                title: "Senior Software Engineer",
                salary: 120000,
                imageUrl: "", // Empty to test avatar generation
                dob: "1990-01-01",
                address: "123 Main St, Anytown, USA",
                isActive: true,
                isDeleted: false,
            }

            setProfile(mockData)
            setEditedProfile(mockData)
        } catch (error) {
            console.error("Error fetching user profile:", error)
            toast({
                title: "Error",
                description: "Failed to load user profile",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleEditProfile = async () => {
        if (!isEditing) {
            setIsEditing(true)
            return
        }

        try {
            setLoading(true)
            // In a real application, this would be an actual API call
            // await axios.put('/api/users/me', editedProfile)

            // For demo purposes, we'll just update the local state
            setProfile((prev) => (prev ? { ...prev, ...editedProfile } : null))
            setIsEditing(false)

            toast({
                title: "Success",
                description: "Profile updated successfully",
            })
        } catch (error) {
            console.error("Error updating profile:", error)
            toast({
                title: "Error",
                description: "Failed to update profile",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }



    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast({
                title: "Error",
                description: "All password fields are required",
                variant: "destructive",
            })
            return
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match",
                variant: "destructive",
            })
            return
        }

        try {
            const changeNewPassword: ChangePasswordRequest = {
                oldPassword: oldPassword,
                newPassword: newPassword,
                confirmPassword: confirmPassword,
            }
            setChangingPassword(true)
            var response = await userApi.changePassword(changeNewPassword)
            if (response.isSuccess) {
                toast({
                    title: "Success",
                    description: "Password changed successfully",
                })
            }

            setoldPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error) {
            console.error("Error changing password:", error)
            toast({
                title: "Error",
                description: "Failed to change password",
                variant: "destructive",
            })
        } finally {
            setChangingPassword(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleUploadImage = async () => {
        if (!selectedFile) return

        try {
            setUploadingImage(true)
            // In a real application, this would be an actual API call to upload the image
            // const formData = new FormData()
            // formData.append('avatar', selectedFile)
            // const response = await axios.post('/api/users/avatar', formData)
            // const avatarUrl = response.data.avatarUrl

            // For demo purposes, we'll just use the preview URL
            const avatarUrl = previewUrl

            setProfile((prev) => (prev ? { ...prev, imageUrl: avatarUrl || prev.imageUrl } : null))
            setSelectedFile(null)
            setPreviewUrl(null)

            toast({
                title: "Success",
                description: "Profile picture updated successfully",
            })
        } catch (error) {
            console.error("Error uploading image:", error)
            toast({
                title: "Error",
                description: "Failed to upload profile picture",
                variant: "destructive",
            })
        } finally {
            setUploadingImage(false)
        }
    }

    // Generate initials for avatar fallback
    const getInitials = (name?: string) => {
        if (!name) return "U"
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }

    // Generate a consistent color based on the user's name
    const getAvatarColor = (name?: string) => {
        if (!name) return "hsl(215, 100%, 50%)"
        let hash = 0
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash)
        }
        const h = hash % 360
        return `hsl(${h}, 70%, 50%)`
    }

    if (loading && !profile) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading profile...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground font-light">View and manage your personal information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Summary Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>View and manage your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="relative mb-6 group">
                            <Avatar className="h-32 w-32 border-4 border-background">
                                <AvatarImage src={profile?.imageUrl || ""} />
                                <AvatarFallback className="text-2xl" style={{ backgroundColor: getAvatarColor(profile?.fullName) }}>
                                    {getInitials(profile?.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow-md"
                            >
                                <Upload className="h-4 w-4" />
                                <span className="sr-only">Upload avatar</span>
                            </label>
                            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>

                        {selectedFile && (
                            <div className="mb-4 w-full">
                                <p className="text-sm text-center mb-2">Preview:</p>
                                <div className="flex justify-center mb-2">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={previewUrl || ""} />
                                        <AvatarFallback>...</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex justify-center gap-2">
                                    <Button size="sm" onClick={handleUploadImage} disabled={uploadingImage}>
                                        {uploadingImage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedFile(null)
                                            setPreviewUrl(null)
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        <h2 className="text-xl font-bold mt-2">{profile?.fullName}</h2>
                        <p className="text-muted-foreground">{profile?.title}</p>

                        <Separator className="my-4" />

                        <div className="w-full space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Department:</span>
                                <span className="font-medium">{profile?.department}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Rank:</span>
                                <span className="font-medium">{profile?.rank}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Role:</span>
                                <span className="font-medium">{profile?.roleName}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs for Profile Details and Settings */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="details">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details">Profile Details</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                        </TabsList>

                        {/* Profile Details Tab */}
                        <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Details</CardTitle>
                                    <CardDescription>View and update your personal information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name</Label>
                                            <Input
                                                id="fullName"
                                                value={isEditing ? editedProfile.fullName || "" : profile?.fullName || ""}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                                                disabled={!isEditing || loading}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="userName">Username</Label>
                                            <Input
                                                id="userName"
                                                value={isEditing ? editedProfile.userName || "" : profile?.userName || ""}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, userName: e.target.value })}
                                                disabled={!isEditing || loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" value={profile?.email || ""} disabled={true} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phoneNumber">Phone Number</Label>
                                            <Input
                                                id="phoneNumber"
                                                value={isEditing ? editedProfile.phoneNumber || "" : profile?.phoneNumber || ""}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, phoneNumber: e.target.value })}
                                                disabled={!isEditing || loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Job Title</Label>
                                            <Input
                                                id="title"
                                                value={isEditing ? editedProfile.title || "" : profile?.title || ""}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, title: e.target.value })}
                                                disabled={!isEditing || loading}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="salary">Salary</Label>
                                            <div className="relative">
                                                <Input
                                                    id="salary"
                                                    type={showSalary ? "text" : "password"}
                                                    value={showSalary ? formatDollarCurrency(profile?.salary || 0) : "••••••••••"}
                                                    disabled={true}
                                                    className="pr-10"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3"
                                                    onClick={() => setShowSalary(!showSalary)}
                                                >
                                                    {showSalary ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Input id="department" value={profile?.department || ""} disabled={true} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="rank">Rank</Label>
                                            <Input id="rank" value={profile?.rank || ""} disabled={true} />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end">
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditing(false)
                                                    setEditedProfile(profile || {})
                                                }}
                                                disabled={loading}
                                            >
                                                Cancel
                                            </Button>
                                            <Button onClick={handleEditProfile} disabled={loading}>
                                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Changes
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button onClick={handleEditProfile} disabled={loading}>
                                            Edit Profile
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security</CardTitle>
                                    <CardDescription>Manage your password and security settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="oldPassword">Current Password</Label>
                                        <Input
                                            id="oldPassword"
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setoldPassword(e.target.value)}
                                            disabled={changingPassword}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                disabled={changingPassword}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={changingPassword}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end">
                                    <Button
                                        onClick={handleChangePassword}
                                        disabled={changingPassword || !oldPassword || !newPassword || !confirmPassword}
                                    >
                                        {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Change Password
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

