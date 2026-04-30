import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Server, DollarSign, Database } from 'lucide-react';
import Loader from '../components/Loader';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get('/api/users/admin/stats', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const usersRes = await axios.get('/api/users/admin/users', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.token]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">System Admin</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of platform health, users, and revenue.</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card flex items-center p-6 space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{stats?.totalUsers || 0}</h3>
            </div>
          </div>
          
          <div className="card flex items-center p-6 space-x-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg dark:bg-indigo-900/30">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Matches Processed</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{stats?.totalMatches || 0}</h3>
            </div>
          </div>

          <div className="card flex items-center p-6 space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">MRR</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">${stats?.revenue || 0}</h3>
            </div>
          </div>

          <div className="card flex items-center p-6 space-x-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recruiters</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{stats?.recruitersCount || 0}</h3>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h3>
            <input 
              type="text" 
              placeholder="Search users..." 
              className="input-field max-w-xs py-2 text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700' :
                        u.role === 'recruiter' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        u.subscriptionPlan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                        u.subscriptionPlan === 'Pro' ? 'bg-green-100 text-green-700' :
                        'text-gray-500'
                      }`}>
                        {u.subscriptionPlan}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
