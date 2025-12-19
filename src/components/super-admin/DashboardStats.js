import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Globe, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DashboardStats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLandingPages: 0,
    totalSubAdmins: 0,
    totalLeads: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple endpoints
      const [landingPages, subAdmins, leads, accessRequests] = await Promise.all([
        superAdminAPI.getLandingPages(),
        superAdminAPI.getSubAdmins(),
        superAdminAPI.getAllLeads(),
        superAdminAPI.getAccessRequests(),
      ]);

      console.log('Dashboard API Responses:', {
        landingPages,
        subAdmins,
        leads,
        accessRequests
      });

      // Check if response.data.data exists, otherwise use response.data
      const landingPagesArray = landingPages.data.data || landingPages.data;
      const subAdminsArray = subAdmins.data.data || subAdmins.data;
      const leadsArray = leads.data.data || leads.data;
      const accessRequestsArray = accessRequests.data.data || accessRequests.data;

      // Use total from API response for leads (handles pagination)
      const totalLeads = leads.data.total || leads.data.count || leadsArray.length;

      const pendingRequests = accessRequestsArray.filter(req => req.status === 'pending').length;
      const approvedRequests = accessRequestsArray.filter(req => req.status === 'approved').length;
      const rejectedRequests = accessRequestsArray.filter(req => req.status === 'rejected').length;

      console.log('Setting dashboard stats:', {
        totalLandingPages: landingPagesArray.length,
        totalSubAdmins: subAdminsArray.length,
        totalLeads,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
      });
      
      setStats({
        totalLandingPages: landingPagesArray.length,
        totalSubAdmins: subAdminsArray.length,
        totalLeads,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Landing Pages',
      value: stats.totalLandingPages || 0,
      icon: Globe,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      name: 'Total Sub Admins',
      value: stats.totalSubAdmins || 0,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      name: 'Total Leads',
      value: stats.totalLeads || 0,
      icon: FileText,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      name: 'Pending Requests',
      value: stats.pendingRequests || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      name: 'Approved Requests',
      value: stats.approvedRequests || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      name: 'Rejected Requests',
      value: stats.rejectedRequests || 0,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Safety check to ensure stats object is properly structured
  if (!stats || typeof stats !== 'object') {
    console.error('stats is not properly structured:', stats);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">
          Error: Invalid stats data received from server
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your super admin dashboard. Here's an overview of your system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(stat.value || 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button 
          onClick={() => navigate('/super-admin/landing-pages')}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Globe className="h-4 w-4 mr-2" />
            Add Landing Page
          </button>
          <button
           onClick={() => navigate('/super-admin/sub-admins')}
           className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <Users className="h-4 w-4 mr-2" />
            Create Sub Admin
          </button>
          <button 
           onClick={() => navigate('/super-admin/leads')}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            <FileText className="h-4 w-4 mr-2" />
            View All Leads
          </button>
          <button 
           onClick={() => navigate('/super-admin/sub-admins')}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
            <Clock className="h-4 w-4 mr-2" />
            Review Requests
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                New sub admin request approved
              </p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Globe className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                New landing page created
              </p>
              <p className="text-sm text-gray-500">4 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                25 new leads collected
              </p>
              <p className="text-sm text-gray-500">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats; 