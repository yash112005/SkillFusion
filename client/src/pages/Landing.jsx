import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle,
  Zap,
  Shield,
  TrendingUp,
  Sparkles,
  Layers,
  Search,
  BarChart3,
  Star,
  Check,
  Mail,
  Phone,
} from "lucide-react";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payLoading, setPayLoading] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactStatus, setContactStatus] = useState(null);

  const handleSubscribe = async (planName) => {
    if (!user) { navigate("/login"); return; }
    if (planName === "Free") { navigate("/upload"); return; }
    setPayLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) { alert("Razorpay SDK failed to load."); return; }
      const res = await axios.post("/api/payment/create-order", { plan: planName }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const options = {
        key: "rzp_test_mock_key_id",
        amount: res.data.amount,
        currency: res.data.currency,
        name: "SkillFusion",
        description: `${planName} Plan Subscription`,
        order_id: res.data.orderId,
        handler: (response) => navigate(`/payment-success?payment_id=${response.razorpay_payment_id}`),
        prefill: { name: user.name || "SkillFusion User", email: user.email || "" },
        theme: { color: "#6366f1" },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => alert(`Payment failed: ${r.error.description}`));
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Error initiating checkout. Please configure Razorpay keys.");
    } finally {
      setPayLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus("sending");
    try {
      await axios.post("/api/contact", contactForm);
      setContactStatus("success");
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setContactStatus(null), 5000);
    } catch {
      setContactStatus("error");
    }
  };

  const pricingTiers = [
    {
      name: "Free", price: "₹0", period: "",
      description: "Basic resume matching for everyone.",
      features: ["5 Matches per month", "Basic match score", "Standard support"],
      cta: "Get Started", popular: false,
    },
    {
      name: "Pro", price: "₹299", period: "/mo",
      description: "Advanced analytics for serious candidates.",
      features: ["Unlimited matches", "Detailed AI suggestions", "ATS Keyword Analysis", "Priority support"],
      cta: "Subscribe Pro", popular: true,
    },
    {
      name: "Enterprise", price: "₹999", period: "/mo",
      description: "Tools for recruiters and hiring managers.",
      features: ["Everything in Pro", "Recruiter Dashboard", "Bulk JD uploads", "Export analytics reports"],
      cta: "Subscribe Enterprise", popular: false,
    },
  ];
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 bg-white dark:bg-dark-bg transition-colors duration-300 dark:bg-stars">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-100/50 dark:hidden rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/50 dark:hidden rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-cyan-500/10 rounded-[100%] blur-[120px] pointer-events-none"></div>
        <div className="hidden dark:block absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="hidden dark:block absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            <div className="w-full lg:w-1/2 text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium text-sm mb-6 border border-primary-100 dark:border-primary-800/50">
                <Sparkles className="w-4 h-4 mr-2" />
                <span>The new standard for resume matching</span>
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
                Match Your Skills <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-500">
                  With AI Precision
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Struggling to tailor your resume? Tired of screening mismatched
                profiles? SkillFusion uses AI to instantly match resumes with
                job descriptions — so you can focus on what matters
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-cyan-400 dark:to-teal-400 shadow-lg dark:shadow-glow hover:scale-105 transition-all duration-300 text-lg w-full sm:w-auto"
                >
                  <span>Start Matching Now</span>
                </Link>
                <Link
                  to="/about"
                  className="w-full sm:w-auto px-8 py-4 text-lg rounded-full font-semibold border-2 border-gray-200 dark:border-dark-border/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-all text-center backdrop-blur-sm"
                >
                  How it Works
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> No
                  credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Cancel
                  anytime
                </div>
              </div>
            </div>

            <div
              className="w-full lg:w-1/2 relative animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="relative rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-2xl overflow-hidden z-20 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-dark-border px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="flex-1 text-center text-xs font-medium text-gray-500">
                    skillfusion.ai/dashboard
                  </div>
                </div>
                <div className="p-6 sm:p-8 bg-white dark:bg-dark-card">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center text-xl font-bold text-green-500">
                      92%
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[85, 95, 70, 90].map((val, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-600 dark:text-gray-400">
                            Skill {i + 1}
                          </span>
                          <span className="text-gray-500">{val}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-indigo-500 h-2 rounded-full"
                            style={{ width: `${val}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-100 dark:bg-yellow-900/30 rounded-full blur-2xl z-0"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-200 dark:bg-primary-900/30 rounded-full blur-2xl z-0"></div>
              <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 glass rounded-xl p-4 shadow-xl z-30 animate-float border border-white/50 dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      ATS Score
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      Excellent
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 dark:bg-slate-900/50 border-y border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">
              Why SkillFusion
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              The edge you need in today's job market
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Our platform goes beyond simple keyword matching to understand the
              semantic context of your experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 mx-auto bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400 shadow-inner">
                <Zap className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Instant AI Analysis
              </h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Upload your files and get a highly detailed match score and
                skill gap analysis in mere seconds.
              </p>
            </div>

            <div className="card text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 mx-auto bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 shadow-inner">
                <Shield className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                ATS Optimized
              </h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Never get filtered out again. Ensure your resume contains the
                exact terminology ATS bots are looking for.
              </p>
            </div>

            <div className="card text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 mx-auto bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center mb-6 text-green-600 dark:text-green-400 shadow-inner">
                <Layers className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Actionable Insights
              </h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Don't just get a score. Receive specific, paragraph-by-paragraph
                advice on what to add or modify.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-8">
                  <div className="card bg-gray-50 dark:bg-dark-card border-none shadow-md text-center p-6">
                    <Search className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      Semantic Search
                    </h5>
                  </div>
                  <div className="card bg-gray-50 dark:bg-dark-card border-none shadow-md text-center p-6">
                    <BarChart3 className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      Visual Analytics
                    </h5>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="card bg-gray-50 dark:bg-dark-card border-none shadow-md text-center p-6">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      Smart Scoring
                    </h5>
                  </div>
                  <div className="card bg-gray-50 dark:bg-dark-card border-none shadow-md p-6 bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex flex-col justify-center min-h-[160px]">
                    <h4 className="text-2xl font-bold mb-2">10x</h4>
                    <p className="text-primary-100 font-medium">
                      Faster application prep time
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <h2 className="text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">
                Powerful Features
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Everything you need to optimize your applications
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mt-1">
                    <span className="font-bold">1</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                     AI-Powered Resume Guidance
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                     Smart analysis of job descriptions,
 Suggests relevant skills, keywords, and achievements, Helps resumes align with recruiter expectations.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mt-1">
                    <span className="font-bold">2</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      Job-Specific Resume Builder
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                     Create tailored resumes for each application,Avoid generic one-size-fits-all resumes,Highlight the most impactful experiences for the role
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mt-1">
                    <span className="font-bold">3</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Skill & Keyword Matching
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                       Detects required skills from job postings,Ensures resumes pass ATS (Applicant Tracking Systems), Improves chances of being shortlisted.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mt-1">
                    <span className="font-bold">4</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    User-Friendly Interface
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                        Clean, responsive design,Easy-to-use editor with drag-and-drop sections,Works seamlessly across devices.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mt-1">
                    <span className="font-bold">5</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Personalization Options
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                        Multiple templates to fit different styles,
- Customize sections (education, projects, achievements),
- Add highlights that make you stand out.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mt-1">
                    <span className="font-bold">6</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Real-Time Feedback
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                        Instant suggestions on formatting, clarity, and relevance,
- AI checks for missing details or weak phrasing,
- Helps polish resumes before submission.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mt-1">
                    <span className="font-bold">7</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                   Secure & Private
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                       Data protection and confidentiality,
- Resumes stored securely with user control,
- No sharing without consent.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Pricing</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h3>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Choose the plan that best fits your career or hiring goals. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`card relative ${
                  tier.popular
                    ? "border-2 border-primary-500 transform scale-105 shadow-2xl z-10"
                    : "hover:-translate-y-1 transition-transform duration-300"
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 inset-x-0 -mt-4 flex justify-center">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{tier.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 h-12">{tier.description}</p>
                  <div className="flex items-baseline mb-8">
                    <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{tier.price}</span>
                    {tier.period && <span className="text-xl text-gray-500 ml-2">{tier.period}</span>}
                  </div>
                  <button
                    onClick={() => handleSubscribe(tier.name)}
                    disabled={payLoading}
                    className={`w-full py-4 rounded-full font-bold transition-all ${
                      tier.popular
                        ? "bg-primary-600 text-white hover:bg-primary-500 shadow-lg hover:shadow-primary-500/30"
                        : "bg-indigo-50 text-indigo-700 dark:bg-gray-800 dark:text-white hover:bg-indigo-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {payLoading ? "Processing..." : tier.cta}
                  </button>
                </div>
                <div className="px-8 pb-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <ul className="space-y-4">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="flex-shrink-0 w-5 h-5 text-green-500 mr-3 mt-0.5" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-white dark:bg-dark-bg border-t border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Contact</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h3>
            <p className="text-xl text-gray-600 dark:text-gray-400">Have questions about SkillFusion? We're here to help.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="card flex items-start space-x-4 hover:-translate-y-1 transition-transform duration-300">
                <div className="p-3 bg-primary-100 text-primary-600 rounded-full dark:bg-primary-900/30 flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Email Us</h4>
                  <p className="text-gray-600 dark:text-gray-400">ynamdeo248@gmail.com</p>
                  <p className="text-gray-600 dark:text-gray-400">support@skillfusion.ai</p>
                </div>
              </div>
              <div className="card flex items-start space-x-4 hover:-translate-y-1 transition-transform duration-300">
                <div className="p-3 bg-primary-100 text-primary-600 rounded-full dark:bg-primary-900/30 flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Call Us</h4>
                  <p className="text-gray-600 dark:text-gray-400">+91 8269142883</p>
                </div>
              </div>
              <div className="card bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border-primary-100 dark:border-primary-800/30">
                <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Office Hours</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Monday – Friday: 9am – 6pm IST</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Saturday: 10am – 2pm IST</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">We typically respond within 24 hours.</p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Send a Message</h3>

              {contactStatus === "success" && (
                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                  ✅ Message sent! We'll get back to you soon.
                </div>
              )}
              {contactStatus === "error" && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium">
                  ❌ Something went wrong. Please try again.
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Your Name</label>
                  <input
                    type="text" required value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="input-field" placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email Address</label>
                  <input
                    type="email" required value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="input-field" placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Subject</label>
                  <input
                    type="text" required value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="input-field" placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Message</label>
                  <textarea
                    required rows="4" value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="input-field resize-none" placeholder="Your message here..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={contactStatus === "sending"}
                  className="btn-primary w-full py-3"
                >
                  {contactStatus === "sending" ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
