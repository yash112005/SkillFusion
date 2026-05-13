import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Upload from './pages/Upload';
import Results from './pages/Results';
import DashboardCandidate from './pages/DashboardCandidate';
import DashboardRecruiter from './pages/DashboardRecruiter';
import JobDetails from './pages/JobDetails';
import DashboardAdmin from './pages/DashboardAdmin';
import PostJob from './pages/PostJob';
import CandidateAnalytics from './pages/CandidateAnalytics';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import ResumeBuilder from './pages/ResumeBuilder';
import Interview from './pages/Interview';
import Profile from './pages/Profile';
import MultiMatch from './pages/MultiMatch';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Feedback from './pages/Feedback';
import GamifiedCandidateFeedback from './components/GamifiedCandidateFeedback';

import Loader from './components/Loader';
import SkillyChat from './components/SkillyChat';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen={true} />;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <ErrorBoundary>
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/services" element={<Navigate to="/" />} />
            <Route path="/features" element={<Navigate to="/" />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/resetpassword/:token" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            
            <Route path="/upload" element={
              <ProtectedRoute allowedRoles={['candidate', 'recruiter']}>
                <Upload />
              </ProtectedRoute>
            } />

            <Route path="/results" element={
              <ProtectedRoute allowedRoles={['candidate', 'recruiter']}>
                <Results />
              </ProtectedRoute>
            } />

            <Route path="/multi-match" element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <MultiMatch />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/candidate" element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <DashboardCandidate />
              </ProtectedRoute>
            } />

            <Route path="/resume-builder" element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <ResumeBuilder />
              </ProtectedRoute>
            } />

            <Route path="/mock/interview" element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <Interview />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/candidate-feedback" element={
              <ProtectedRoute allowedRoles={['candidate', 'recruiter']}>
                <GamifiedCandidateFeedback />
              </ProtectedRoute>
            } />

            <Route path="/feedback" element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            } />

            <Route path="/jobs/:id" element={
              <ProtectedRoute>
                <JobDetails />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/recruiter" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <DashboardRecruiter />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/recruiter/candidate/:id" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <CandidateAnalytics />
              </ProtectedRoute>
            } />

            <Route path="/post-job" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <PostJob />
              </ProtectedRoute>
            } />

            <Route path="/edit-job/:id" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <PostJob />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardAdmin />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
        <SkillyChat />
      </div>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
