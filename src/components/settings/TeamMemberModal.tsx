import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { User, X, Shield } from 'lucide-react';
import { Role, User as UserType } from '@/types';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (member: Partial<UserType>) => Promise<void>;
  onInvite?: (email: string, role: string) => Promise<{ invitationLink: string }>;
  member?: UserType | null;
}

export function TeamMemberModal({ isOpen, onClose, onSubmit, onInvite, member }: TeamMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CONTRIBUTOR' as Role,
    password: '',
  });
  const [invitationLink, setInvitationLink] = useState('');
  const [showInvitationLink, setShowInvitationLink] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when member changes or modal opens
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        role: member.role || 'CONTRIBUTOR',
        password: '',
      });
      setAvatarPreview(member.avatar || null);
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'CONTRIBUTOR',
        password: '',
      });
      setAvatarPreview(null);
    }
    setAvatarFile(null);
    setErrors({});
    setInvitationLink('');
    setShowInvitationLink(false);
  }, [member, isOpen]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password is required for new members
    if (!member && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
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
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // If we're inviting a new member (no existing member and no password)
      if (!member && !formData.password && onInvite) {
        // Send invitation
        const result = await onInvite(formData.email, formData.role);
        setInvitationLink(result.invitationLink);
        setShowInvitationLink(true);
        
        toast({
          title: "Invitation Sent",
          description: `Invitation sent to ${formData.email}. Copy the link and send it to the team member.`,
        });
      } else {
        // Prepare data for submission
        const submitData: Partial<UserType> = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        
        // Include password only for new members
        if (!member && formData.password) {
          (submitData as any).password = formData.password;
        }
        
        // Handle avatar upload if a file is provided
        if (avatarFile) {
          try {
            // Import the asset service to upload the avatar
            const { assetService } = await import('@/services/dataService');
            
            // Upload the avatar file
            const uploadedAsset = await assetService.upload(avatarFile);
            if (uploadedAsset) {
              submitData.avatar = uploadedAsset.url;
            }
          } catch (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            toast({
              title: "Avatar Upload Failed",
              description: "Failed to upload avatar. Member will be created without avatar.",
              variant: "destructive",
            });
          }
        } else if (avatarPreview && !avatarFile) {
          // Keep existing avatar if no new file is selected
          submitData.avatar = avatarPreview;
        }
        
        await onSubmit(submitData);
        
        // Close modal and reset form
        onClose();
        toast({
          title: member ? "Member Updated" : "Member Added",
          description: member 
            ? "Team member has been updated successfully." 
            : "New team member has been added successfully.",
        });
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || (member 
          ? "Failed to update team member. Please try again." 
          : "Failed to add team member. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">
          {member ? "Edit Team Member" : "Add Team Member"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <div 
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer relative overflow-hidden"
                onClick={handleAvatarClick}
                aria-label="Change profile picture"
                role="button"
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
              </div>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  aria-label="Remove avatar"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={handleAvatarClick}
            >
              {avatarPreview ? "Change Avatar" : "Upload Avatar"}
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          
          {!member && !showInvitationLink && (
            <div className="space-y-2">
              <Label htmlFor="password">Password (leave blank to send invitation) *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500">{errors.password}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Leave password blank to send an invitation link via email. The team member will set their own password.
              </p>
            </div>
          )}
          
          {showInvitationLink && (
            <div className="space-y-2">
              <Label>Invitation Link</Label>
              <div className="flex gap-2">
                <Input
                  value={invitationLink}
                  readOnly
                />
                <Button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(invitationLink);
                    toast({
                      title: "Copied",
                      description: "Invitation link copied to clipboard.",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Copy this link and send it to the team member. They will be able to set their password and access the platform.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {formData.role === 'ADMIN' && 'Full access to all platform features and settings'}
              {formData.role === 'MANAGER' && 'Can manage content and team members'}
              {formData.role === 'CONTRIBUTOR' && 'Can create and edit their own content'}
              {formData.role === 'VIEWER' && 'Can view content and analytics only'}
            </p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (member ? 'Update Member' : 'Add Member')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}