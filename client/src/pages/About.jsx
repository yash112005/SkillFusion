import { Link } from "react-router-dom";
import { Target, Users, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
            About SkillFusion
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            We are on a mission to bridge the gap between talented professionals
            and their dream roles using the power of Artificial Intelligence.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div className="animate-slide-up">
            <h3 className="text-3xl font-bold mb-6">Our Story</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
              The traditional hiring process is broken. Thousands of qualified
              candidates are filtered out by rigid ATS systems, while recruiters
              struggle to manually review endless stacks of resumes.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
              At SkillFusion, we believe talent deserves to be seen. Too often,
              resumes fail to reflect the true potential of candidates, leaving
              skills overlooked and opportunities missed. Our platform changes
              that. By harnessing AI-powered guidance, SkillFusion transforms
              generic resumes into tailored career stories that align perfectly
              with each job description. We don’t just match keywords — we
              highlight achievements, skills, and growth potential recruiters
              value most. With clarity, responsive design, and intelligent
              recommendations, we make resume building simple, impactful, and
              future-ready. Whether you’re a student stepping into the job
              market or a professional seeking your next big move, SkillFusion
              empowers you to stand out and succeed. Together, we’re redefining
              how resumes are made — one opportunity at a time.
            </p>
          </div>
          <div
            className="bg-gradient-to-br from-primary-400 to-indigo-600 rounded-2xl p-1 shadow-2xl animate-slide-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="bg-white dark:bg-dark-card rounded-xl p-8 h-full flex flex-col justify-center text-center">
              <h4 className="text-2xl font-bold mb-2">10M+</h4>
              <p className="text-gray-500 mb-6">Resumes Analyzed Globally</p>
              <h4 className="text-2xl font-bold mb-2">95%</h4>
              <p className="text-gray-500">Match Accuracy Rating</p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-12">Our Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="card text-center animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="w-16 h-16 mx-auto bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-2">Precision</h4>
              <p className="text-gray-600 dark:text-gray-400">
                We strive for exact matches that lead to long-term career
                satisfaction.
              </p>
            </div>
            <div
              className="card text-center animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="w-16 h-16 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-2">Inclusivity</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI is designed to reduce bias and focus purely on merit and
                capability.
              </p>
            </div>
            <div
              className="card text-center animate-slide-up"
              style={{ animationDelay: "300ms" }}
            >
              <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-2">Excellence</h4>
              <p className="text-gray-600 dark:text-gray-400">
                We constantly refine our models to provide the most cutting-edge
                analysis available.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-12 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-2xl font-bold mb-6">Ready to find your match?</h3>
          <Link to="/signup" className="btn-primary px-8 py-4 text-lg">
            Join SkillFusion Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
