import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { User, Save, Upload, Camera } from 'lucide-react';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  timezone: string;
  avatar?: string;
}

interface ProfileSettingsProps {
  profileData: ProfileData;
  onUpdateProfile: (data: ProfileData, avatarFile?: File) => Promise<void>;
}

export function ProfileSettings({ profileData, onUpdateProfile }: ProfileSettingsProps) {
  const [localProfileData, setLocalProfileData] = useState(profileData);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profileData.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when profileData prop changes
  useEffect(() => {
    setLocalProfileData(profileData);
    setAvatarPreview(profileData.avatar || null);
  }, [profileData]);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setLocalProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!localProfileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!localProfileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!localProfileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(localProfileData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before saving.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await onUpdateProfile(localProfileData, avatarFile || undefined);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Store the file and create preview
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
        toast({
          title: "Avatar Selected",
          description: "Click 'Save Changes' to update your profile picture.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      handleSave();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          aria-label={isSaving ? "Saving profile" : "Save profile changes"}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div 
              className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer relative overflow-hidden"
              onClick={handleAvatarClick}
              aria-label="Change profile picture"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleAvatarClick();
                }
              }}
            >
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-primary" />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute -bottom-2 -right-2 rounded-full p-2"
              onClick={handleAvatarClick}
              aria-label="Upload new profile picture"
            >
              <Upload className="h-3 w-3" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              aria-hidden="true"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {localProfileData.firstName} {localProfileData.lastName}
            </h3>
            <p className="text-muted-foreground">{localProfileData.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={localProfileData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              onKeyDown={handleKeyDown}
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
            />
            {errors.firstName && (
              <p id="firstName-error" className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={localProfileData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              onKeyDown={handleKeyDown}
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
            />
            {errors.lastName && (
              <p id="lastName-error" className="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={localProfileData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onKeyDown={handleKeyDown}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={localProfileData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={localProfileData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}