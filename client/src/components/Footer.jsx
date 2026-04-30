import { Link } from "react-router-dom";
import { useState } from "react";
import image from "../assets/Gemini_Generated_Image_sgcsl0sgcsl0sgcs.png";
const Footer = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <footer className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 pt-12 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link
              to="/"
              className="mb-4 inline-block bg-white/10 p-2 rounded-xl backdrop-blur-sm"
            >
              {!imgError ? (
                <img
                  src="/logo.png"
                  alt="SkillFusion Logo"
                  className="h-12 w-auto object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className="w-14 h-14 rounded-xl shadow-lg shadow-primary-500/30"
                    style={{
                      backgroundImage: `url(${image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <span className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                    SkillFusion
                  </span>
                </div>
              )}
            </Link>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Empowering candidates and recruiters with AI-driven resume and job
              description matching to build better teams, faster.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/faq"
                  className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                >
                  Services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Download App
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="#"
                aria-label="Get it on Google Play"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 border border-gray-700 dark:border-gray-600 transition-all duration-200 hover:scale-105 hover:shadow-lg group"
              >
                <svg
                  className="w-6 h-6 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.18 1.14a1.5 1.5 0 0 0-.68 1.3v19.12a1.5 1.5 0 0 0 .68 1.3l.08.05 10.71-10.71v-.25L3.26 1.09l-.08.05Z"
                    fill="url(#ps_a)"
                  />
                  <path
                    d="m17.54 15.44-3.57-3.57v-.26l3.57-3.57.08.05 4.23 2.4c1.21.69 1.21 1.81 0 2.5l-4.23 2.4-.08.05Z"
                    fill="url(#ps_b)"
                  />
                  <path
                    d="m17.62 15.39-3.65-3.65L3.18 22.43c.4.42 1.05.47 1.78.05l12.66-7.09Z"
                    fill="url(#ps_c)"
                  />
                  <path
                    d="M3.18 1.57C2.45 1.15 1.8 1.2 1.4 1.62l10.79 10.77 3.65-3.65L3.18 1.57Z"
                    fill="url(#ps_d)"
                  />
                  <defs>
                    <linearGradient
                      id="ps_a"
                      x1="12.75"
                      y1="2.31"
                      x2="-1.52"
                      y2="12"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#00A0FF" />
                      <stop offset="1" stopColor="#00AFFF" />
                    </linearGradient>
                    <linearGradient
                      id="ps_b"
                      x1="22.49"
                      y1="12"
                      x2="12.75"
                      y2="12"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#FFD800" />
                      <stop offset="1" stopColor="#FF8A00" />
                    </linearGradient>
                    <linearGradient
                      id="ps_c"
                      x1="14.47"
                      y1="13.77"
                      x2="1.1"
                      y2="25.9"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#FF3A44" />
                      <stop offset="1" stopColor="#C31162" />
                    </linearGradient>
                    <linearGradient
                      id="ps_d"
                      x1="-0.15"
                      y1="-0.8"
                      x2="7.42"
                      y2="7.84"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#32A071" />
                      <stop offset="1" stopColor="#2DA771" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-left">
                  <p className="text-gray-400 text-[10px] leading-none mb-0.5">
                    GET IT ON
                  </p>
                  <p className="text-white font-semibold text-sm leading-none">
                    Google Play
                  </p>
                </div>
              </a>

              <a
                href="#"
                aria-label="Download on the App Store"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 border border-gray-700 dark:border-gray-600 transition-all duration-200 hover:scale-105 hover:shadow-lg group"
              >
                <svg
                  className="w-6 h-6 flex-shrink-0 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
                </svg>
                <div className="text-left">
                  <p className="text-gray-400 text-[10px] leading-none mb-0.5">
                    DOWNLOAD ON THE
                  </p>
                  <p className="text-white font-semibold text-sm leading-none">
                    App Store
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} SkillFusion AI. All rights
            reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 hover:text-primary-500 cursor-pointer text-sm">
              Privacy Policy
            </span>
            <span className="text-gray-400 hover:text-primary-500 cursor-pointer text-sm">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
