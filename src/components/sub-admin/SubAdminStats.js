import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Calendar,
  Globe
} from 'lucide-react';
import { subAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


const SubAdminStats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    convertedLeads: 0,
    qualifiedLeads: 0,
    landingPage: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, landingPageResponse] = await Promise.all([
        subAdminAPI.getDashboardStats(),
        subAdminAPI.getLandingPage(),
      ]);
      
      console.log('SubAdminStats API Responses:', {
        stats: statsResponse,
        landingPage: landingPageResponse
      });
      
      // Check if response.data.data exists, otherwise use response.data
      const statsData = statsResponse.data.data || statsResponse.data;
      const landingPageData = landingPageResponse.data.data || landingPageResponse.data;
      
      console.log('Setting stats with data:', {
        statsData,
        landingPageData
      });
      
      // Extract overview data from statsData
      // The backend returns: { success: true, data: { overview: { totalLeads, newLeads, ... } } }
      const overviewData = statsData.overview || statsData;
      
      // Ensure we're getting the correct total leads count from the aggregation
      // The backend uses aggregation to count ALL leads, not just a paginated subset
      const totalLeads = overviewData.totalLeads || 0;
      const newLeads = overviewData.newLeads || 0;
      const convertedLeads = overviewData.convertedLeads || 0;
      const qualifiedLeads = overviewData.qualifiedLeads || 0;
      
      console.log('Extracted stats:', {
        totalLeads,
        newLeads,
        convertedLeads,
        qualifiedLeads
      });
      
      setStats({
        totalLeads,
        newLeads,
        convertedLeads,
        qualifiedLeads,
        landingPage: landingPageData,
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
      name: 'Total Leads',
      value: stats.totalLeads || 0,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      name: 'New Leads',
      value: stats.newLeads || 0,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      name: 'Qualified Leads',
      value: stats.qualifiedLeads || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      name: 'Converted Leads',
      value: stats.convertedLeads || 0,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
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
          Welcome to your sub admin dashboard. Here's an overview of your assigned landing page.
        </p>
      </div>

      {/* Landing Page Info */}
      {(() => {
        let assignedLandingPage = null;
        if (Array.isArray(stats.landingPage) && stats.landingPage.length > 0) {
          assignedLandingPage = stats.landingPage[0];
        } else if (stats.landingPage && typeof stats.landingPage === 'object') {
          assignedLandingPage = stats.landingPage;
        }
        return (
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-primary-100">
                <Globe className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Assigned Landing Page
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {assignedLandingPage ? assignedLandingPage.name : 'Not assigned'}
                  </dd>
                  {assignedLandingPage && (
                    <>
                      {assignedLandingPage.description && (
                        <dd className="text-sm text-gray-500">{assignedLandingPage.description}</dd>
                      )}
                      {assignedLandingPage.url && (
                        <dd className="text-sm text-gray-500">
                          <a
                            href={assignedLandingPage.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-500"
                          >
                            {assignedLandingPage.url}
                          </a>
                        </dd>
                      )}
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          
          <button
            onClick={() => navigate('/sub-admin/leads')}
            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <FileText className="h-4 w-4 mr-2" />
            View All Leads
          </button>
          {/* <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <Download className="h-4 w-4 mr-2" />
            Export Leads
          </button> */}
          <button 
            onClick={() => navigate('/sub-admin/profile')}
            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            <Users className="h-4 w-4 mr-2" />
            Manage Profile
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
                <FileText className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                New lead collected from landing page
              </p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                Lead status updated to qualified
              </p>
              <p className="text-sm text-gray-500">4 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                Profile information updated
              </p>
              <p className="text-sm text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubAdminStats; 