import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import image from "../assets/Gemini_Generated_Image_9gwinw9gwinw9gwi.png";
const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "candidate") return "/dashboard/candidate";
    if (user.role === "recruiter") return "/dashboard/recruiter";
    return "/dashboard/admin";
  };

  const navLinks = [
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Upload", path: "/upload" },
    { name: "Results", path: "/results" },
    { name: "Build Resume", path: "/resume-builder" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
              {/* Show only the S-icon part of the image */}
              <div className="overflow-hidden flex-shrink-0" style={{width: '56px', height: '56px'}}>
                <img
                  src={image}
                  alt="SkillFusion Logo"
                  className="h-14 md:h-20 w-auto object-contain object-left max-w-none"
                  style={{marginLeft: '0'}}
                />
              </div>
              {/* Text rendered in HTML so color adapts to theme */}
              <span className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Skill<span className="text-primary-600 dark:text-primary-400">Fusion</span>
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-bg"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-bg transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 p-1 pr-3 rounded-full border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start hidden xl:flex">
                    <span className="text-sm font-medium leading-tight text-gray-900 dark:text-white">
                      {user.name.split(" ")[0]}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-100 dark:border-dark-border py-2 animate-slide-up origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-3" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    <div className="h-px bg-gray-100 dark:bg-dark-border my-2"></div>
                    <button
                      onClick={logout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary py-2 px-5 text-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <div className="lg:hidden flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-bg transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <div
        className={`lg:hidden fixed top-20 left-0 w-full bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border shadow-xl z-50 transition-transform duration-300 ease-in-out transform origin-top ${isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"}`}
      >
        <div className="px-4 py-6 space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="block px-4 py-3 rounded-xl text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-dark-bg"
            >
              {link.name}
            </Link>
          ))}

          <div className="h-px bg-gray-200 dark:bg-dark-border my-4"></div>

          {user ? (
            <div className="space-y-2">
              <div className="flex items-center px-4 py-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white font-bold mr-3">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white leading-none mb-1">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <Link
                to={getDashboardLink()}
                className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10 hover:bg-primary-100 dark:hover:bg-primary-900/20"
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10 hover:bg-primary-100 dark:hover:bg-primary-900/20"
              >
                <UserIcon className="w-5 h-5 mr-3" />
                Profile
              </Link>
              <button
                onClick={logout}
                className="flex items-center w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Link
                to="/login"
                className="flex items-center justify-center px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-dark-border font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
