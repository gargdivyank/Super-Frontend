import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subAdminAPI } from '../../services/api';
import { 
  FileText, 
  BarChart3, 
  User,
  Users,
  LogOut,
  Menu,
  X,
  LineChart
} from 'lucide-react';
import SubAdminLeads from './SubAdminLeads';
import SubAdminProfile from './SubAdminProfile';
import SubAdminStats from './SubAdminStats';
import SubAdminAnalytics from './SubAdminAnalytics';
import SubAdminSubAdmins from './SubAdminSubAdmins';
import { hasPermission, PERMISSIONS } from '../../constants/permissions';

const SubAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [landingPage, setLandingPage] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // useEffect(() => {
  //   fetchLandingPage();
  // }, []);

  // const fetchLandingPage = async () => {
  //   try {
  //     const response = await subAdminAPI.getLandingPage();
  //     const landingPageData = response.data.data || response.data;
  //     setLandingPage(landingPageData && landingPageData.length > 0 ? landingPageData[0] : null);
  //   } catch (error) {
  //     console.error('Error fetching landing page:', error);
  //   }
  // };
  const fetchLandingPage = useCallback(async () => {
    try {
      const response = await subAdminAPI.getLandingPage();
      const landingPageData = response.data.data || response.data;
  
      setLandingPage(
        landingPageData && landingPageData.length > 0
          ? landingPageData[0]
          : null
      );
    } catch (error) {
      console.error('Error fetching landing page:', error);
    }
  }, [setLandingPage]);
  
  useEffect(() => {
    fetchLandingPage();
  }, [fetchLandingPage]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/sub-admin', icon: BarChart3, component: SubAdminStats, permission: PERMISSIONS.DASHBOARD_VIEW },
    { name: 'Leads', href: '/sub-admin/leads', icon: FileText, component: SubAdminLeads, permission: PERMISSIONS.LEADS_VIEW },
    { name: 'Analytics', href: '/sub-admin/analytics', icon: LineChart, component: SubAdminAnalytics, permission: PERMISSIONS.ANALYTICS_VIEW },
    { name: 'Sub Admins / Users', href: '/sub-admin/sub-admins', icon: Users, component: SubAdminSubAdmins, permission: PERMISSIONS.SUB_ADMINS_VIEW },
    { name: 'Profile', href: '/sub-admin/profile', icon: User, component: SubAdminProfile, permission: PERMISSIONS.PROFILE_VIEW },
  ];
  const allowedNavigation = navigation.filter((item) => hasPermission(user, item.permission));
  const firstAllowedPath = allowedNavigation[0]?.href || '/login';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gray-900 text-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-white">Sub Admin</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {allowedNavigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.href);
                  setSidebarOpen(false);
                }}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
              >
                <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
                {item.name}
              </button>
            ))}
          </nav>

          {/* Mobile User Info & Logout Section */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-gray-900 text-white">
        <div className="flex flex-col flex-grow">
          <div className="flex items-center h-16 px-4 border-b border-gray-700">
            <h1 className="text-xl font-semibold text-white">Sub Admin</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {allowedNavigation.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
              >
                <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
                {item.name}
              </button>
            ))}
          </nav>
          
          {/* User info and logout */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
                {user?.landingPage && (
                  <p className="text-xs text-gray-500">Landing Page: {user.landingPage.name}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center gap-x-4">
                <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
                {landingPage && (
                  <span className="text-sm text-gray-500">| {landingPage.name}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route
                path="/"
                element={hasPermission(user, PERMISSIONS.DASHBOARD_VIEW) ? <SubAdminStats /> : <Navigate to={firstAllowedPath} replace />}
              />
              <Route
                path="/leads"
                element={hasPermission(user, PERMISSIONS.LEADS_VIEW) ? <SubAdminLeads /> : <Navigate to={firstAllowedPath} replace />}
              />
              <Route
                path="/analytics"
                element={hasPermission(user, PERMISSIONS.ANALYTICS_VIEW) ? <SubAdminAnalytics /> : <Navigate to={firstAllowedPath} replace />}
              />
              <Route
                path="/profile"
                element={hasPermission(user, PERMISSIONS.PROFILE_VIEW) ? <SubAdminProfile /> : <Navigate to={firstAllowedPath} replace />}
              />
              <Route
                path="/sub-admins"
                element={hasPermission(user, PERMISSIONS.SUB_ADMINS_VIEW) ? <SubAdminSubAdmins /> : <Navigate to={firstAllowedPath} replace />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SubAdminDashboard; 