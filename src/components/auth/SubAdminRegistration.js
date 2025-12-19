import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Building, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const SubAdminRegistration = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'sub_admin',
        companyName: data.companyName,
        phone: data.phone,
      };

      await registerUser(userData);
      toast.success('Registration successful! Please wait for super admin approval.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
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

      {/* right side  */}
      <div className="max-w-md w-full space-y-4 bg-white/95 shadow-lg rounded-lg px-6 py-6">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-primary-100 mb-2">
            <User className="h-7 w-7 text-primary-600" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">Register as Sub Admin</h2>
          <p className="mt-1 text-xs text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your account
            </Link>
          </p>
        </div>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-700">Full Name</label>
              <div className="relative mt-0.5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`input-field pl-10 py-2 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Full name"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                />
              </div>
              {errors.name && (
                <p className="mt-0.5 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700">Email address</label>
              <div className="relative mt-0.5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input-field pl-10 py-2 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Email"
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
                <p className="mt-0.5 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-xs font-medium text-gray-700">Company Name</label>
              <div className="relative mt-0.5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="companyName"
                  type="text"
                  autoComplete="organization"
                  className={`input-field pl-10 py-2 ${errors.companyName ? 'border-red-500' : ''}`}
                  placeholder="Company name"
                  {...register('companyName', {
                    required: 'Company name is required',
                  })}
                />
              </div>
              {errors.companyName && (
                <p className="mt-0.5 text-xs text-red-600">{errors.companyName.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-medium text-gray-700">Phone Number</label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                className={`input-field py-2 ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="Phone number"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Invalid phone number',
                  },
                })}
              />
              {errors.phone && (
                <p className="mt-0.5 text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700">Password</label>
              <div className="relative mt-0.5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field pl-10 pr-10 py-2 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Password"
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
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-0.5 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700">Confirm Password</label>
              <div className="relative mt-0.5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field pl-10 pr-10 py-2 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Repeat password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-0.5 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center items-center h-10 text-sm"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Register'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">
              After registration, your account will be reviewed by the super admin.
            </p>
          </div>
          <p className="mt-2 text-center text-xs">
            <Link
              to="/"
              className="text-primary-600 hover:text-primary-500 font-medium underline-offset-2 hover:underline"
            >
              ← Back to Landing Page
            </Link>
          </p>
        </form>
      </div>
    </div>
    </div>
  );
};

export default SubAdminRegistration;
