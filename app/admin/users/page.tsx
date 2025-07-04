"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { GLASSY_CONTAINER_CLASSES, GLASSY_BUTTON_CLASSES } from "@/lib/utils/styles";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ORGANIZER" | "JOE";
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: "USER" | "ORGANIZER" | "JOE") => {
    setUpdating(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        // Update the local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        alert('Failed to update user role');
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <ProtectedRoute requiredRole="JOE">
      <div className="min-h-screen flex flex-col items-center pt-8">
        <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
          User Management Dashboard
        </h1>

        <div className={`${GLASSY_CONTAINER_CLASSES} w-full max-w-6xl mx-4`}>
          <h2 className="text-2xl font-bold mb-6 text-[#333333]">
            Manage User Roles
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-700 font-medium">Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-700 font-medium">No users found.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-white/50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Current Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Member Since</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/30 hover:bg-white/20 transition-colors">
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {user.name || 'No name'}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          user.role === 'JOE' ? 'bg-purple-200 text-purple-800' :
                          user.role === 'ORGANIZER' ? 'bg-blue-200 text-blue-800' :
                          'bg-green-200 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {(['USER', 'ORGANIZER', 'JOE'] as const).map((role) => (
                            <button
                              key={role}
                              onClick={() => updateUserRole(user.id, role)}
                              disabled={user.role === role || updating === user.id}
                              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                                user.role === role
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-white/60 hover:bg-white/80 text-gray-800 border-white/70 hover:border-white/90'
                              } ${updating === user.id ? 'opacity-50' : ''}`}
                            >
                              {updating === user.id ? 'Updating...' : `Set ${role}`}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}