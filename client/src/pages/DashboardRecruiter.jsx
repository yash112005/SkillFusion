import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, FileText, Activity, ArrowUpRight, Plus, 
  Search, Filter, MoreVertical, Edit, Trash2, 
  ExternalLink, MapPin, Clock, Calendar, AlertCircle, Briefcase, Medal
} from 'lucide-react';
import Loader from '../components/Loader';

const DashboardRecruiter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) return;
      
      try {
        const [statsRes, jobsRes] = await Promise.all([
          axios.get('/api/users/recruiter/stats', {
            headers: { Authorization: `Bearer ${user.token}` }
          }),
          axios.get('/api/jobs/my', {
            headers: { Authorization: `Bearer ${user.token}` }
          })
        ]);
        setStats(statsRes.data);
        setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.token]);

  const handleDelete = async () => {
    if (!deleteId || !user?.token) return;
    try {
      await axios.delete(`/api/jobs/${deleteId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setJobs(jobs.filter(job => job._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete job:", err);
      alert("Failed to delete job. Please try again.");
    }
  };

  const filteredJobs = Array.isArray(jobs) ? jobs.filter(job => 
    (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.company || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return <Loader fullScreen={true} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Recruiter Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your recruitment performance and manage job postings.</p>
          </div>
          <Link to="/post-job" className="btn-primary flex items-center justify-center py-3 px-6 shadow-lg hover:scale-105 transition-transform no-underline">
            <Plus className="w-5 h-5 mr-2" />
            Post New Job
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card flex items-center space-x-4 bg-gradient-to-br from-white to-blue-50 dark:from-dark-card dark:to-blue-900/10 border-l-4 border-l-blue-500">
            <div className="p-4 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Total Postings</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{jobs.length}</h3>
            </div>
          </div>
          <div className="card flex items-center space-x-4 bg-gradient-to-br from-white to-indigo-50 dark:from-dark-card dark:to-indigo-900/10 border-l-4 border-l-indigo-500">
            <div className="p-4 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Total Applicants</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats?.totalApplicants || 0}</h3>
            </div>
          </div>
          <div className="card flex items-center space-x-4 bg-gradient-to-br from-white to-green-50 dark:from-dark-card dark:to-green-900/10 border-l-4 border-l-green-500">
            <div className="p-4 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Match Efficiency</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats?.avgMatchScore || 0}%</h3>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Job Postings</h2>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by title or company..." 
                className="input-field pl-10 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div key={job._id} className="card group hover:shadow-2xl transition-all border-0 ring-1 ring-gray-200 dark:ring-gray-800 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => navigate(`/edit-job/${job._id}`)}
                      className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteId(job._id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{job.title}</h3>
                <p className="text-sm font-medium text-primary-600 mb-4">{job.company}</p>
                
                <div className="space-y-3 mt-auto">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {job.type}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(job.skills || []).slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-400 rounded uppercase tracking-tighter">
                        {skill}
                      </span>
                    ))}
                    {(job.skills || []).length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-400 rounded">
                        +{(job.skills || []).length - 3} more
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="flex items-center text-xs font-bold text-primary-600 hover:underline"
                  >
                    DETAILS <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            ))}

            {filteredJobs.length === 0 && (
              <div className="col-span-full py-20 text-center card bg-transparent border-2 border-dashed border-gray-200 dark:border-gray-800 shadow-none hover:translate-y-0">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No jobs found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  {searchTerm ? `No results for "${searchTerm}". Try a different query.` : "You haven't posted any jobs yet. Start by creating your first job description."}
                </p>
                {!searchTerm && (
                  <Link to="/post-job" className="btn-primary mt-6 inline-block px-8 no-underline">
                    Post My First Job
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card shadow-lg border-0 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-dark-card/50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-500" /> Top Potential Candidates
            </h3>
            <button className="text-primary-600 dark:text-primary-400 text-sm font-bold hover:underline">View All Candidates</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4 font-medium">Candidate</th>
                  <th className="px-6 py-4 font-medium">Applied Role</th>
                  <th className="px-6 py-4 font-medium text-center">Match Score</th>
                  <th className="px-6 py-4 font-medium text-center">Badge</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {stats?.recentApplicants?.map((app, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{app.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">{app.role}</td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl font-black text-lg ${app.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {app.score}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => navigate('/candidate-feedback')}
                        className={`p-2 rounded-lg transition-all transform hover:scale-110 ${app.score >= 80 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' : app.score >= 50 ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-600'}`}
                        title="View Gamified Badge"
                      >
                        <Medal className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${app.status === 'Interview' ? 'bg-blue-100 text-blue-700' : app.status === 'Reviewed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : 'bg-orange-100 text-orange-700'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/dashboard/recruiter/candidate/${app.id}`)}
                        className="text-primary-600 dark:text-primary-400 hover:scale-110 transition-transform p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                        title="View Full Analytics"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card max-w-md w-full rounded-2xl shadow-2xl p-8 transform animate-scale-up">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Delete Job Posting?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
              This action cannot be undone. All associated candidate matches and analytics for this job will be permanently removed.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 px-6 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-3 px-6 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-all"
              >
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardRecruiter;
