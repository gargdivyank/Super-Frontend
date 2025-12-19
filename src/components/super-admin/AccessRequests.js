import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Building, Mail, Phone } from 'lucide-react';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AccessRequests = () => {
  const [accessRequests, setAccessRequests] = useState([]);
  const [landingPages, setLandingPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLandingPage, setSelectedLandingPage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsResponse, pagesResponse] = await Promise.all([
        superAdminAPI.getAccessRequests(),
        superAdminAPI.getLandingPages(),
      ]);
      
      console.log('AccessRequests API Responses:', {
        requests: requestsResponse,
        landingPages: pagesResponse
      });
      
      // Check if response.data.data exists, otherwise use response.data
      const requestsArray = requestsResponse.data.data || requestsResponse.data;
      const pagesArray = pagesResponse.data.data || pagesResponse.data;
      
      setAccessRequests(requestsArray);
      setLandingPages(pagesArray);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load access requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!selectedLandingPage) {
      toast.error('Please select a landing page');
      return;
    }

    try {
      await superAdminAPI.approveAccessRequest(requestId, selectedLandingPage);
      toast.success('Access request approved successfully');
      setShowModal(false);
      setSelectedRequest(null);
      setSelectedLandingPage('');
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Approval failed';
      toast.error(message);
    }
  };

  const handleReject = async (requestId) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      try {
        await superAdminAPI.rejectAccessRequest(requestId);
        toast.success('Access request rejected successfully');
        fetchData();
      } catch (error) {
        const message = error.response?.data?.message || 'Rejection failed';
        toast.error(message);
      }
    }
  };

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setSelectedLandingPage('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setSelectedLandingPage('');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Safety check to ensure accessRequests is an array
  if (!Array.isArray(accessRequests)) {
    console.error('accessRequests is not an array:', accessRequests);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">
          Error: Invalid data format received from server
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Access Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage sub admin access requests
        </p>
      </div>

      {/* Access Requests Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(accessRequests) && accessRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{request.name}</div>
                        <div className="text-sm text-gray-500">{request.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{request.companyName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{request.email}</span>
                      </div>
                      {request.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{request.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openApproveModal(request)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {request.status === 'approved' && (
                      <span className="text-green-600">Approved</span>
                    )}
                    {request.status === 'rejected' && (
                      <span className="text-red-600">Rejected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Approve Access Request
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Applicant Details</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-900"><strong>Name:</strong> {selectedRequest.name}</p>
                      <p className="text-sm text-gray-900"><strong>Email:</strong> {selectedRequest.email}</p>
                      <p className="text-sm text-gray-900"><strong>Company:</strong> {selectedRequest.companyName}</p>
                      {selectedRequest.phone && (
                        <p className="text-sm text-gray-900"><strong>Phone:</strong> {selectedRequest.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Landing Page
                    </label>
                    <select
                      value={selectedLandingPage}
                      onChange={(e) => setSelectedLandingPage(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Choose a landing page</option>
                      {landingPages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This will create a sub admin account and grant access to the selected landing page.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  disabled={!selectedLandingPage}
                  className="btn-primary sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve Request
                </button>
                <button
                  onClick={closeModal}
                  className="btn-secondary sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessRequests; 