import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user, initialized } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (initialized && isAuthenticated && user) {
      if (user.role === 'super_admin') {
        navigate('/super-admin', { replace: true });
      } else if (user.role === 'sub_admin') {
        navigate('/sub-admin', { replace: true });
      }
    }
  }, [initialized, isAuthenticated, user, navigate]);

  // Show loading while checking authentication
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Attempt login
      const result = await login(data.email, data.password);
  
      if (result.success) {
        toast.success('Login successful!');
  
        // Redirect based on user role
        if (result.user.role === 'super_admin') {
          navigate('/super-admin');
        } else if (result.user.role === 'sub_admin') {
          navigate('/sub-admin');
        }
      } else {
        // If the result is unsuccessful but no error is thrown, we handle here
        toast.error('Invalid credentials, please check your email and password.');
      }
    } catch (error) {
      // Check if the error has a response and display the error message
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);  // Error from backend
      } else {
        // Fallback error message if no specific message is received from API
        toast.error('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);  // Stop loading regardless of success or failure
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-10 items-center">
        {/* Left side: Brand / Hero copy */}
        <div className="hidden md:block text-slate-100 space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-800/60 px-4 py-1 border border-slate-700/60">
            <span className="h-7 w-7 rounded-full bg-primary-500/90 flex items-center justify-center text-xs font-semibold text-white">
              L
            </span>
            <span className="text-sm tracking-wide text-slate-200">
              Landing Super • Admin Console
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
            Welcome back to your
            <span className="text-primary-400"> Landing Super</span> dashboard
          </h1>

          <p className="text-sm lg:text-base text-slate-300/80 max-w-md">
            Manage landing pages, sub-admin access, and leads from a single,
            powerful control panel. Sign in to continue where you left off.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-slate-300/80">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="font-semibold text-slate-100 mb-1">Role-based access</p>
              <p className="text-slate-400">
                Separate workspaces for super admins and sub admins to keep control clean and secure.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="font-semibold text-slate-100 mb-1">Multi-landing support</p>
              <p className="text-slate-400">
                Assign, monitor and optimize multiple landing pages from one dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Right side: Login card */}
        <div className="w-full">
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-slate-100 px-6 py-8 sm:px-8 sm:py-9">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-50 border border-primary-100 shadow-sm">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Or{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 underline-offset-2 hover:underline"
                >
                  register as a sub admin
                </Link>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium uppercase tracking-wide text-slate-600 mb-1.5"
                  >
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="you@example.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium uppercase tracking-wide text-slate-600 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Enter your password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex justify-center items-center h-11 text-sm font-semibold tracking-wide"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>

              {/* Demo credentials box */}
              {/* <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-xs">
                <p className="text-slate-500 font-medium mb-1">
                  Demo credentials (for testing):
                </p>
                <div className="space-y-1 text-slate-500">
                  <p>
                    <span className="font-semibold text-slate-700">Super Admin:</span>{' '}
                    superadmin@example.com / <span className="font-mono">SuperAdmin@123</span>
                  </p>
              
                </div>
              </div> */}
              <p className="mt-4 text-center text-sm">
                <Link
                  to="/"
                  className="text-primary-600 hover:text-primary-500 font-medium underline-offset-2 hover:underline"
                >
                  ← Back to Landing Page
                </Link>
              </p>

            </form>
          </div>

          {/* Tiny footer hint */}
          <p className="mt-4 text-[11px] text-center text-slate-400">
            Secure access for internal teams only. If you&apos;re having trouble signing in,
            contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
