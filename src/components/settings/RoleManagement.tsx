import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { User, Role } from '@/types';
import { userService } from '@/services/dataService';

interface RoleStats {
  role: Role;
  count: number;
}

interface RoleManagementProps {
  users: User[];
  onUsersUpdate: () => void;
}

export function RoleManagement({ users, onUsersUpdate }: RoleManagementProps) {
  const [roleStats, setRoleStats] = useState<RoleStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadRoleStats();
  }, []);

  const loadRoleStats = async () => {
    try {
      setLoading(true);
      const stats = await userService.getRoleStats();
      // The stats are already in the correct format {role: string, count: number}
      // We just need to ensure the role is typed correctly
      setRoleStats(stats.map(stat => ({
        role: stat.role as Role,
        count: stat.count
      })));
    } catch (error) {
      console.error('Error loading role stats:', error);
      toast({
        title: "Error",
        description: "Failed to load role statistics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      setUpdatingUserId(userId);
      await userService.updateRole(userId, newRole);
      
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
      
      // Refresh users and role stats
      onUsersUpdate();
      loadRoleStats();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleVariant = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'MANAGER':
        return 'default';
      case 'CONTRIBUTOR':
        return 'secondary';
      case 'VIEWER':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getRoleDescription = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'Full access to all features and settings';
      case 'MANAGER':
        return 'Can manage content and team members';
      case 'CONTRIBUTOR':
        return 'Can create and edit their own content';
      case 'VIEWER':
        return 'Can view content and analytics only';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 text-center py-4">Loading role statistics...</div>
        ) : (
          roleStats && roleStats.length > 0 ? (
            roleStats.map((stat) => (
              <Card key={stat.role} className="p-4">
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleVariant(stat.role)}>{stat.role}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {getRoleDescription(stat.role)}
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-4 text-center py-4 text-muted-foreground">
              No role statistics available
            </div>
          )
        )}
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Role Access Permissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Function/Page</th>
                <th className="text-center p-2">ADMIN</th>
                <th className="text-center p-2">MANAGER</th>
                <th className="text-center p-2">CONTRIBUTOR</th>
                <th className="text-center p-2">VIEWER</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2 font-medium">Dashboard</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Campaign Management</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">❌</td>
                <td className="text-center p-2">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Post Creation/Edit</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Task Management</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">View Only</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Goal Management</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Asset Management</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Ambassador Management</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">❌</td>
                <td className="text-center p-2">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Analytics Access</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">Limited</td>
                <td className="text-center p-2">Public Only</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">User Management</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">❌</td>
                <td className="text-center p-2">❌</td>
                <td className="text-center p-2">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Role Management</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">❌</td>
                <td className="text-center p-2">❌</td>
                <td className="text-center p-2">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">System Settings</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">❌</td>
                <td className="text-center p-2">❌</td>
                <td className="text-center p-2">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Billing Management</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">❌</td>
                <td className="text-center p-2">❌</td>
                <td className="text-center p-2">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Security Settings</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">❌</td>
                <td className="text-center p-2">❌</td>
                <td className="text-center p-2">❌</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>✅ = Full Access | ❌ = No Access | View Only = Read-only access | Limited = Restricted access</p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Role-Based Access Control</h3>
        <p className="text-muted-foreground mb-4">
          This system implements role-based access control to ensure users have appropriate access to perform their job functions while maintaining security.
          Only ADMIN users can manage roles and permissions.
        </p>
        <div className="space-y-4">
          {users && users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">{user.name}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={user.role} 
                    onValueChange={(value) => handleRoleChange(user.id, value as Role)}
                    disabled={updatingUserId === user.id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  {updatingUserId === user.id && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No users available
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}