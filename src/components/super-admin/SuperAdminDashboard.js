import React, { useMemo, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Globe,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  LineChart
} from 'lucide-react';
import LandingPages from './LandingPages';
import SubAdmins from './SubAdmins';
// import AccessRequests from './AccessRequests';
import AllLeads from './AllLeads';
import DashboardStats from './DashboardStats';
import Analytics from './Analytics';
import { hasPermission, PERMISSIONS } from '../../constants/permissions';

const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/super-admin', icon: BarChart3, component: DashboardStats, permission: PERMISSIONS.DASHBOARD_VIEW },
    { name: 'Landing Pages', href: '/super-admin/landing-pages', icon: Globe, component: LandingPages, permission: PERMISSIONS.LANDING_PAGES_VIEW },
    { name: 'Sub Admins', href: '/super-admin/sub-admins', icon: Users, component: SubAdmins, permission: PERMISSIONS.SUB_ADMINS_VIEW },
    // { name: 'Access Requests', href: '/super-admin/access-requests', icon: FileText, component: AccessRequests },
    { name: 'All Leads', href: '/super-admin/leads', icon: FileText, component: AllLeads, permission: PERMISSIONS.LEADS_VIEW },
    { name: 'Analytics', href: '/super-admin/analytics', icon: LineChart, component: Analytics, permission: PERMISSIONS.ANALYTICS_VIEW },
  ];
  const allowedNavigation = navigation.filter((item) => hasPermission(user, item.permission));
  const firstAllowedPath = useMemo(
    () => allowedNavigation[0]?.href || '/login',
    [allowedNavigation]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
  <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setSidebarOpen(false)} />
  <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gray-900 text-white">
    {/* Sidebar Header */}
    <div className="flex h-16 items-center justify-between px-4">
      <h1 className="text-xl font-semibold text-white">Super Admin</h1>
      <button
        onClick={() => setSidebarOpen(false)}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="h-6 w-6" />
      </button>
    </div>

    {/* Navigation Items */}
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

    {/* Mobile User Info and Logout Section */}
    <div className="border-t border-gray-700 p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {/* User Avatar */}
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

      {/* Logout Button */}
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
    {/* Sidebar Header */}
    <div className="flex items-center h-16 px-4 border-b border-gray-700">
      <h1 className="text-xl font-semibold text-white">Super Admin</h1>
    </div>

    {/* Sidebar Navigation */}
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

    {/* User Info & Logout Section */}
    <div className="border-t border-gray-700 p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {/* User Avatar */}
          <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
      </div>
      {/* Logout Button */}
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
  {/* Mobile Menu Button */}
  <button
    type="button"
    className="p-2.5 text-gray-700 lg:hidden rounded-full hover:bg-gray-200 transition"
    onClick={() => setSidebarOpen(true)}
  >
    <Menu className="h-6 w-6" />
  </button>

  {/* Main content area */}
  <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center">
    {/* Left side (optional, for logo or additional items) */}
    <div className="flex flex-1"></div>

    {/* User Info Section */}
    <div className="flex items-center gap-x-4 lg:gap-x-6">
      <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
      <div className="flex items-center gap-x-4">
        <span className="text-sm font-medium text-gray-700">Welcome, {user?.name}</span>
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
                element={hasPermission(user, PERMISSIONS.DASHBOARD_VIEW) ? <DashboardStats /> : <Navigate to={firstAllowedPath} replace />}
              />
              <Route
                path="/landing-pages"
                element={hasPermission(user, PERMISSIONS.LANDING_PAGES_VIEW) ? <LandingPages /> : <Navigate to={firstAllowedPath} replace />}
              />
              <Route
                path="/sub-admins"
                element={hasPermission(user, PERMISSIONS.SUB_ADMINS_VIEW) ? <SubAdmins /> : <Navigate to={firstAllowedPath} replace />}
              />
              <Route
                path="/leads"
                element={hasPermission(user, PERMISSIONS.LEADS_VIEW) ? <AllLeads /> : <Navigate to={firstAllowedPath} replace />}
              />
              <Route
                path="/analytics"
                element={hasPermission(user, PERMISSIONS.ANALYTICS_VIEW) ? <Analytics /> : <Navigate to={firstAllowedPath} replace />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard; 