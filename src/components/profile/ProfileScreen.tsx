import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserCircle, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function ProfileScreen() {
  const { user, profile: authProfile, updateProfile, loading: authLoading, calculateDueDate } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [lmpDate, setLmpDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const avatarFallbackTriedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authProfile) {
  setName(authProfile.full_name || "");
      setEmail(authProfile.email || user?.email || "");
      setPhoneNumber(authProfile.phone_number || "");
      setLmpDate(authProfile.lmp_date || "");
      setDueDate(authProfile.due_date || "");
      
      // Construct avatar URL (supports either stored path or full URL)
      if (authProfile.avatar_url) {
        if (/^https?:\/\//i.test(authProfile.avatar_url)) {
          // Already a full URL
          setAvatarUrl(authProfile.avatar_url);
        } else {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(authProfile.avatar_url);
          setAvatarUrl(publicUrl);
        }
      } else {
        setAvatarUrl(null);
      }
      // Expose debug info (dev only)
      if (typeof window !== 'undefined') {
        (window as any).__avatarDebug = {
          raw: authProfile.avatar_url,
          computed: avatarUrl,
          userId: authProfile.id
        };
      }
    }
  }, [authProfile, user]);

  useEffect(() => {
    if (lmpDate) {
      setDueDate(calculateDueDate(lmpDate));
    } else {
      setDueDate("");
    }
  }, [lmpDate, calculateDueDate]);

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile(
        { email, phone_number: phoneNumber, lmp_date: lmpDate, due_date: dueDate },
        avatarFile
      );
      toast({ title: "Profile updated successfully!" });
      setIsEditing(false);
      setAvatarFile(null); // Reset file input
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original state
    if (authProfile) {
  setName(authProfile.full_name || "");
        setEmail(authProfile.email || user?.email || "");
        setPhoneNumber(authProfile.phone_number || "");
        setLmpDate(authProfile.lmp_date || "");
  if (authProfile.avatar_url) {
          if (/^https?:\/\//i.test(authProfile.avatar_url)) {
            setAvatarUrl(authProfile.avatar_url);
          } else {
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(authProfile.avatar_url);
            setAvatarUrl(publicUrl);
          }
        } else {
          setAvatarUrl(null);
        }
    }
    setAvatarFile(null);
  };


  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
          {authProfile && (
            <Badge variant={authProfile.is_premium ? "default" : "secondary"}>
              {authProfile.is_premium ? "Premium Member" : "Standard"}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={handleAvatarClick}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => {
                      if (!avatarFallbackTriedRef.current && authProfile?.avatar_url) {
                        avatarFallbackTriedRef.current = true;
                        // Try deriving from just the file name
                        const fileName = authProfile.avatar_url.split('/').pop() || authProfile.avatar_url;
                        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                        console.debug('[Avatar] primary URL failed, trying fallback public URL', { fileName, publicUrl });
                        setAvatarUrl(publicUrl);
                      } else {
                        console.warn('[Avatar] failed to load, clearing image');
                        setAvatarUrl(null);
                      }
                    }}
                  />
                ) : (
                  <UserCircle className="w-24 h-24 text-gray-500" />
                )}
              </div>
              {isEditing && (
                <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer">
                  <Camera className="w-5 h-5" />
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="lmp">Last Menstrual Period</Label>
              <Input id="lmp" type="date" value={lmpDate} onChange={(e) => setLmpDate(e.target.value)} disabled={!isEditing} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edd">Expected Delivery Date</Label>
              <Input id="edd" type="date" value={dueDate} disabled />
            </div>
          </div>

          {!authProfile?.is_premium && !isEditing && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">Unlock Your Full Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 mb-4">Upgrade to Premium for unlimited AI nurse chats, priority support, and exclusive content.</p>
                <Button onClick={() => navigate('/premium')}>Upgrade to Premium</Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-end gap-4">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                {avatarUrl && (
                  <Button variant="outline" onClick={() => {
                    // Force revalidation of avatar URL
                    if (authProfile?.avatar_url) {
                      avatarFallbackTriedRef.current = false;
                      if (/^https?:\/\//i.test(authProfile.avatar_url)) {
                        setAvatarUrl(authProfile.avatar_url + (authProfile.avatar_url.includes('?') ? '&' : '?') + 't=' + Date.now());
                      } else {
                        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(authProfile.avatar_url);
                        setAvatarUrl(publicUrl + (publicUrl.includes('?') ? '&' : '?') + 't=' + Date.now());
                      }
                    }
                  }}>Reload Avatar</Button>
                )}
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}