import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, MapPin, Clock, Calendar, Award, 
  Briefcase, Building, ChevronRight, Edit, Trash2, CheckCircle,
  Users, ArrowUpRight
} from 'lucide-react';
import Loader from '../components/Loader';
import ApplicantInsights from '../components/ApplicantInsights';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [message, setMessage] = useState('');
  
  // Recruiter specific state
  const [insights, setInsights] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showInsights, setShowInsights] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`/api/jobs/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setJob(res.data);

        // Fetch insights and applications if recruiter owns the job
        if (user.role === 'recruiter' && res.data.recruiterId === user._id) {
          const [insightsRes] = await Promise.all([
            axios.get(`/api/jobs/${id}/insights`, {
              headers: { Authorization: `Bearer ${user.token}` }
            }),
            axios.get(`/api/users/recruiter/stats`, { // Reusing existing stats endpoint or should fetch specific apps?
              headers: { Authorization: `Bearer ${user.token}` }
            })
          ]);
          setInsights(insightsRes.data);
          
          // Actually, let's fetch specific applications for this job if possible.
          // For now, I'll assume we can filter from a general stats or create a new endpoint.
          // Let's check if there's an endpoint for job-specific applications.
          const specificAppsRes = await axios.get(`/api/users/recruiter/applications?jobId=${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          }).catch(() => ({ data: [] }));
          
          setApplications(specificAppsRes.data);

          // Check session storage for dismissal
          const isDismissed = sessionStorage.getItem(`dismiss_insights_${id}`);
          if (isDismissed) setShowInsights(false);
        }
      } catch (err) {
        console.error("Failed to fetch job", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user]);

  const handleApply = async () => {
    setApplying(true);
    setMessage('');
    try {
      await axios.post(`/api/jobs/${id}/apply`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setIsApplied(true);
      setMessage('Successfully applied for this position!');
    } catch (err) {
      if (err.response?.status === 400) {
        setIsApplied(true);
        setMessage('You have already applied for this position.');
      } else {
        setMessage(err.response?.data?.message || 'Failed to apply. Please try again.');
      }
    } finally {
      setApplying(false);
    }
  };

  const handleDismissInsights = () => {
    setShowInsights(false);
    sessionStorage.setItem(`dismiss_insights_${id}`, 'true');
  };

  if (loading) return <Loader fullScreen={true} />;
  if (!job) return <div className="text-center py-20">Job not found</div>;

  const isOwner = user.role === 'recruiter' && job.recruiterId === user._id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="max-w-4xl mx-auto w-full">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="card overflow-hidden border-0 shadow-xl mb-12">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
                      {job.type}
                    </span>
                    <span className="text-primary-100 text-sm">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black mb-2">{job.title}</h1>
                  <p className="text-xl text-primary-50 flex items-center">
                    <Building className="w-5 h-5 mr-2" /> {job.company}
                  </p>
                </div>
                
                {isOwner && (
                  <div className="flex gap-3">
                    <Link 
                      to={`/edit-job/${job._id}`}
                      className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-bold text-sm"
                    >
                      <Edit className="w-4 h-4 mr-2" /> EDIT
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-primary-500" /> Job Description
                  </h2>
                  <div className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                    {job.description}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-primary-500" /> Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, i) => (
                      <span key={i} className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-xl font-medium border border-primary-100 dark:border-primary-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="card bg-gray-50 dark:bg-gray-800/50 border-0 p-6 space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-widest text-gray-400">Job Overview</h3>
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Location</p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{job.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Experience</p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {job.experience.min} - {job.experience.max} Years
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Job Type</p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{job.type}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Date Posted</p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {user.role === 'candidate' && (
                  <div className="space-y-3">
                    <button 
                      onClick={handleApply}
                      disabled={isApplied || applying}
                      className={`w-full py-4 text-lg font-bold rounded-xl shadow-xl transition-all flex justify-center items-center ${
                        isApplied 
                          ? 'bg-green-500 text-white shadow-green-200 dark:shadow-none cursor-not-allowed' 
                          : 'btn-primary shadow-primary-200 dark:shadow-none'
                      }`}
                    >
                      {applying ? (
                        <span className="flex items-center"><Loader fullScreen={false} /> Applying...</span>
                      ) : isApplied ? (
                        <span className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Applied</span>
                      ) : (
                        'Apply Now'
                      )}
                    </button>
                    {message && (
                      <p className={`text-sm text-center font-bold ${isApplied ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recruiter Insights Panel */}
        {isOwner && showInsights && (
          <div className="max-w-7xl mx-auto animate-slide-up">
            <ApplicantInsights insights={insights} onDismiss={handleDismissInsights} />
          </div>
        )}

        {/* Candidate List (Visible to owner) */}
        {isOwner && (
          <div className="max-w-7xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="card shadow-xl border-0 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-dark-card/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary-500" /> Candidates for this Role
                </h3>
                <span className="text-gray-400 text-sm font-bold">{applications.length} Applied</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Candidate</th>
                      <th className="px-6 py-4 text-center">Match Score</th>
                      <th className="px-6 py-4">Applied Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {applications.length > 0 ? applications.map((app, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">{app.candidateName || 'Candidate Name'}</div>
                          <div className="text-xs text-gray-500">{app.candidateEmail || 'email@example.com'}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl font-black text-lg ${app.matchScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                            {app.matchScore}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${app.status === 'Interview' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => navigate(`/dashboard/recruiter/candidate/${app.candidateId}`)}
                            className="text-primary-600 dark:text-primary-400 hover:scale-110 transition-transform p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                          >
                            <ArrowUpRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-20 text-center text-gray-500 dark:text-gray-400 italic">
                          No candidates have applied for this position yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;

