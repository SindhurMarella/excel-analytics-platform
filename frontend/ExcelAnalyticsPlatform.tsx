import React, { useState, FormEvent, ChangeEvent } from 'react';
import { BarChart3, User, LogOut, Settings } from 'lucide-react';
import DashboardView from './DashboardView';

interface User {
  name: string;
  email: string;
  role: string;
}

const ExcelAnalyticsPlatform = () => {
  const [currentView, setCurrentView] = useState<'login' | 'dashboard'>('login');
  const [user, setUser] = useState<User | null>(null);

  const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setUser({ name: 'Sample User', email: formData.email, role: 'user' });
      setCurrentView('dashboard');
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">ExcelViz Pro</h1>
            <p className="text-white/70">Transform your data into insights</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex bg-white/10 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isLogin ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !isLogin ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {!isLogin && (
              <div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  required={!isLogin}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-white/60 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {currentView === 'login' && <LoginPage />}
      {currentView === 'dashboard' && user && (
        <DashboardView
          userName={user.name}
          onLogout={() => {
            setUser(null);
            setCurrentView('login');
          }}
        />
      )}
    </div>
  );
};

export default ExcelAnalyticsPlatform; 
