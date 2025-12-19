import React, { useState, useEffect, useRef } from 'react';
import { Download, Search, Filter, Calendar, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { subAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SubAdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedLeads, setExpandedLeads] = useState(new Set());
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState({});
  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchTimeoutRef = useRef(null);

  // Debounce search term to prevent cursor loss
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // When filter changes, reset to page 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    fetchLeads();
  }, [page, limit, debouncedSearchTerm, statusFilter, dateFilter]);

  // Helper function to convert dateFilter to startDate/endDate
  const getDateRange = (dateFilter) => {
    if (dateFilter === 'all') {
      return { startDate: undefined, endDate: undefined };
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    switch (dateFilter) {
      case 'today':
        return {
          startDate: startDate.toISOString(),
          endDate: today.toISOString()
        };
      case 'week':
        startDate.setDate(today.getDate() - 7);
        return {
          startDate: startDate.toISOString(),
          endDate: today.toISOString()
        };
      case 'month':
        startDate.setDate(today.getDate() - 30);
        return {
          startDate: startDate.toISOString(),
          endDate: today.toISOString()
        };
      default:
        return { startDate: undefined, endDate: undefined };
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange(dateFilter);
      const filters = {
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        search: debouncedSearchTerm !== '' ? debouncedSearchTerm : undefined,
      };
      const response = await subAdminAPI.getLeads(filters);
      const leadsArray = response.data.data || response.data;
      setLeads(leadsArray);
      setTotal(response.data.total || response.data.count || leadsArray.length);
      setPaginationInfo(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await subAdminAPI.exportLeads();
      // response.data.data is an array of objects
      const leads = response.data.data || [];
      if (!leads.length) {
        toast.error('No leads to export');
        return;
      }
      // Convert to CSV - exclude IP Address column
      const allHeaders = Object.keys(leads[0]);
      const headers = allHeaders.filter(h => h !== 'IP Address' && h !== 'ipAddress');
      const csvRows = [headers.join(',')];
      for (const row of leads) {
        csvRows.push(headers.map(h => {
          let val = row[h] ?? '';
          // Escape quotes and commas
          if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
            val = '"' + val.replace(/"/g, '""') + '"';
          }
          return val;
        }).join(','));
      }
      const csvString = csvRows.join('\r\n');
      // Download
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Leads exported successfully');
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Failed to export leads');
    }
  };

  const toggleLeadExpansion = (leadId) => {
    const newExpanded = new Set(expandedLeads);
    if (newExpanded.has(leadId)) {
      newExpanded.delete(leadId);
    } else {
      newExpanded.add(leadId);
    }
    setExpandedLeads(newExpanded);
  };

  const getId = (obj) =>
    typeof obj === 'string' ? obj : (obj && (obj._id || obj.id)) || '';

  const renderDynamicFields = (lead) => {
    if (!lead.dynamicFields || Object.keys(lead.dynamicFields).length === 0) {
      return null;
    }

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Form Fields:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(lead.dynamicFields).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="font-medium text-gray-600">{key}:</span>
              <span className="ml-2 text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const filteredLeads = (Array.isArray(leads) ? leads : []).filter(lead => {
    const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      lead.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.dynamicFields && Object.values(lead.dynamicFields).some(value => 
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const leadDate = new Date(lead.createdAt);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = leadDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = leadDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = leadDate >= monthAgo;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', text: 'New' },
      contacted: { color: 'bg-yellow-100 text-yellow-800', text: 'Contacted' },
      qualified: { color: 'bg-green-100 text-green-800', text: 'Qualified' },
      converted: { color: 'bg-purple-100 text-purple-800', text: 'Converted' },
      lost: { color: 'bg-red-100 text-red-800', text: 'Lost' },
    };

    const config = statusConfig[status] || statusConfig.new;

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const renderLeadDetails = (lead) => {
    const leadKey = getId(lead);
    const isExpanded = expandedLeads.has(leadKey);

    return (
      <>
        <tr key={leadKey} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <button
                onClick={() => {
                  const next = new Set(expandedLeads);
                  next.has(leadKey) ? next.delete(leadKey) : next.add(leadKey);
                  setExpandedLeads(next);
                }}
                className="mr-2 text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {lead.firstName} {lead.lastName}
                </div>
                {lead.company && (
                  <div className="text-sm text-gray-500">{lead.company}</div>
                )}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{lead.email}</div>
            {lead.phone && (
              <div className="text-sm text-gray-500">{lead.phone}</div>
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {getStatusBadge(lead.status)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {lead.source || 'Direct'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {new Date(lead.createdAt).toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {lead.lastContacted 
              ? new Date(lead.lastContacted).toLocaleDateString()
              : 'Never'
            }
          </td>
        </tr>
        {isExpanded && (
          <tr>
            <td colSpan="6" className="px-6 py-4 bg-gray-50">
              <div className="space-y-3">
                {/* Standard Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Standard Information:</h4>
                    <div className="space-y-1 text-sm">
                      {lead.firstName && <div><span className="font-medium">First Name:</span> {lead.firstName}</div>}
                      {lead.lastName && <div><span className="font-medium">Last Name:</span> {lead.lastName}</div>}
                      {lead.email && <div><span className="font-medium">Email:</span> {lead.email}</div>}
                      {lead.phone && <div><span className="font-medium">Phone:</span> {lead.phone}</div>}
                      {/* {lead.company && <div><span className="font-medium">Company:</span> {lead.company}</div>}
                      {lead.message && <div><span className="font-medium">Message:</span> {lead.message}</div>} */}
                    </div>
                  </div>

                  {/* Additional Lead Info */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Lead Details:</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Status:</span> {lead.status}</div>
                      <div><span className="font-medium">Source:</span> {lead.source || 'Direct'}</div>
                      {/* <div><span className="font-medium">IP Address:</span> {lead.ipAddress || 'N/A'}</div>
                      <div><span className="font-medium">Created:</span> {new Date(lead.createdAt).toLocaleString()}</div>
                      {lead.updatedAt && (
                        <div><span className="font-medium">Last Updated:</span> {new Date(lead.updatedAt).toLocaleString()}</div>
                      )} */}
                    </div>
                  </div>
                </div>

                {/* Dynamic Fields */}
                {renderDynamicFields(lead)}
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Safety check to ensure leads is an array
  if (!Array.isArray(leads)) {
    console.error('leads is not an array:', leads);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">
          Error: Invalid data format received from server
        </div>
      </div>
    );
  }

  // Pagination controls
  const onNextPage = () => {
    if (paginationInfo.next) setPage(paginationInfo.next.page);
  };
  const onPrevPage = () => {
    if (paginationInfo.prev) setPage(paginationInfo.prev.page);
  };
  const onPageSelect = (num) => {
    setPage(num);
  };
  const totalPages = Math.ceil(total / limit) || 1;
  const renderPageNumbers = () => {
    let pagesArr = [];
    for (let i = 1; i <= totalPages; i++) {
      pagesArr.push(
        <button
          key={i}
          onClick={() => onPageSelect(i)}
          className={`mx-1 rounded px-2 py-1 border ${i === page ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'}`}
          disabled={i === page}
        >
          {i}
        </button>
      );
    }
    return pagesArr;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage leads from your assigned landing page
          </p>
        </div>
        <button
          onClick={handleExport}
          className="btn-secondary flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Leads
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => renderLeadDetails(lead))}
            </tbody>
          </table>
        </div>

        {leads.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'No leads have been collected yet.'
              }
            </p>
          </div>
        )}
      </div>
        {/* Pagination Controls */}
      <div className="my-4 flex justify-center items-center space-x-1">
        <button onClick={onPrevPage} disabled={!paginationInfo.prev} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
        {renderPageNumbers()}
        <button onClick={onNextPage} disabled={!paginationInfo.next} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-500">Total Leads</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {leads.filter(lead => lead.status === 'new').length}
            </div>
            <div className="text-sm text-gray-500">New Leads</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {leads.filter(lead => lead.status === 'converted').length}
            </div>
            <div className="text-sm text-gray-500">Converted</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {leads.filter(lead => lead.status === 'qualified').length}
            </div>
            <div className="text-sm text-gray-500">Qualified</div>
          </div>
        </div>
      </div>

    
     
    </div>
  );
};

export default SubAdminLeads; 