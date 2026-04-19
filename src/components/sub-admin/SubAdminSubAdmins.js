import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, User, Building, Phone, Edit, Trash2 } from 'lucide-react';
import { subAdminAPI } from '../../services/api';
import { hasPermission, PERMISSIONS } from '../../constants/permissions';
import { useAuth } from '../../contexts/AuthContext';

const permissionLabelMap = {
  [PERMISSIONS.DASHBOARD_VIEW]: 'Dashboard',
  [PERMISSIONS.LEADS_VIEW]: 'Leads (View)',
  [PERMISSIONS.LEADS_EDIT]: 'Leads (Edit)',
  [PERMISSIONS.ANALYTICS_VIEW]: 'Analytics',
  [PERMISSIONS.LANDING_PAGES_VIEW]: 'Landing pages (View)',
  [PERMISSIONS.LANDING_PAGES_MANAGE]: 'Landing pages (Manage)',
  [PERMISSIONS.SUB_ADMINS_VIEW]: 'Sub admins (View)',
  [PERMISSIONS.SUB_ADMINS_MANAGE]: 'Sub admins (Manage)',
  [PERMISSIONS.PROFILE_VIEW]: 'Profile (View)',
  [PERMISSIONS.PROFILE_EDIT]: 'Profile (Edit)',
};

const SubAdminSubAdmins = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState({});

  const assignablePermissions = useMemo(
    () =>
      [
        { key: PERMISSIONS.DASHBOARD_VIEW, label: 'Dashboard' },
        { key: PERMISSIONS.LEADS_VIEW, label: 'Leads (View)' },
        { key: PERMISSIONS.LEADS_EDIT, label: 'Leads (Edit)' },
        { key: PERMISSIONS.ANALYTICS_VIEW, label: 'Analytics' },
        { key: PERMISSIONS.PROFILE_VIEW, label: 'Profile (View)' },
        { key: PERMISSIONS.PROFILE_EDIT, label: 'Profile (Edit)' },
      ].filter((p) => hasPermission(user, p.key)),
    [user]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchItems = useCallback(async () => {
    try {
      setListLoading(true);
      const res = await subAdminAPI.getSubAdmins({
        page,
        limit,
        search: debouncedSearch !== '' ? debouncedSearch : undefined,
      });
      const arr = res.data.data || res.data || [];
      const paged = Array.isArray(arr) ? arr : [];
      const totalCount = res.data.total ?? paged.length;
      setItems(paged);
      setTotal(totalCount);
      setPaginationInfo(res.data.pagination || {});

      if (paged.length === 0 && totalCount > 0 && page > 1) {
        setPage(1);
      }
    } catch (error) {
      console.error('Failed to load sub admins:', error);
      toast.error('Failed to load users');
    } finally {
      setListLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (adminId) => {
    setOpenDropdownId((prev) => (prev === adminId ? null : adminId));
  };

  const openCreateModal = () => {
    setEditingAdmin(null);
    reset({
      name: '',
      email: '',
      password: '',
      companyName: '',
      phone: '',
      permissions: assignablePermissions.map((p) => p.key),
    });
    setShowModal(true);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    const perms = Array.isArray(admin.permissions) ? admin.permissions : [];
    reset({
      name: admin.name || '',
      email: admin.email || '',
      companyName: admin.companyName || '',
      phone: admin.phone || '',
      password: '',
      permissions: perms.length > 0 ? perms : assignablePermissions.map((p) => p.key),
    });
    setShowModal(true);
  };

  const handleDelete = async (admin) => {
    const adminId = admin._id || admin.id;
    if (!adminId) {
      toast.error('Invalid user ID');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await subAdminAPI.deleteSubAdmin(adminId);
      toast.success('User deleted successfully');
      fetchItems();
    } catch (error) {
      const message = error.response?.data?.message || 'Delete failed';
      toast.error(message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAdmin(null);
  };

  const onSubmit = async (data) => {
    const permissions = Array.isArray(data.permissions) ? data.permissions : [];

    try {
      if (!hasPermission(user, PERMISSIONS.SUB_ADMINS_MANAGE)) {
        toast.error('You do not have permission to manage users');
        return;
      }

      if (editingAdmin) {
        const adminId = editingAdmin._id || editingAdmin.id;
        const payload = {
          name: data.name,
          email: data.email,
          companyName: data.companyName,
          phone: data.phone,
          permissions,
        };
        if (data.password && data.password.trim() !== '') {
          payload.password = data.password;
        }
        await subAdminAPI.updateSubAdmin(adminId, payload);
        toast.success('User updated successfully');
      } else {
        await subAdminAPI.createSubAdmin({
          ...data,
          permissions,
        });
        toast.success('User created successfully');
      }
      closeModal();
      fetchItems();
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

  const onNextPage = () => {
    if (paginationInfo.next) setPage(paginationInfo.next.page);
  };

  const onPrevPage = () => {
    if (paginationInfo.prev) setPage(paginationInfo.prev.page);
  };

  const onPageSelect = (num) => setPage(num);

  const renderPageNumbers = () => {
    const pagesArr = [];
    for (let i = 1; i <= totalPages; i++) {
      pagesArr.push(
        <button
          key={i}
          type="button"
          onClick={() => onPageSelect(i)}
          className={`mx-1 rounded px-2 py-1 border ${
            i === page ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
          }`}
          disabled={i === page || listLoading}
        >
          {i}
        </button>
      );
    }
    return pagesArr;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sub Admins / Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add users only for your assigned landing page.
          </p>
          <div className="mt-1 text-xs text-gray-500">
            Page {page} / {totalPages}. Showing {items.length} of {total} users.
          </div>
        </div>
        {hasPermission(user, PERMISSIONS.SUB_ADMINS_MANAGE) && (
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <User className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search sub admins..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="input-field pl-10"
          autoComplete="off"
        />
      </div>

      <div className="rounded-lg bg-white shadow-md p-6 relative">
        {listLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70"
            aria-busy="true"
            aria-label="Loading users"
          >
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
          </div>
        )}
        <table className="w-full min-w-[640px] table-auto divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module access
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                {hasPermission(user, PERMISSIONS.SUB_ADMINS_MANAGE) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(items || []).map((admin) => {
                const rowId = admin._id || admin.id;
                return (
                  <tr key={rowId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                          {admin.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {admin.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{admin.companyName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          admin.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : admin.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => toggleDropdown(rowId)}
                          className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 focus:outline-none"
                        >
                          View permissions
                          <span className="text-xs">▼</span>
                        </button>
                        {openDropdownId === rowId && (
                          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b">
                              Module permissions
                            </div>
                            <ul className="py-1 text-sm max-h-48 overflow-y-auto">
                              {(admin.permissions || []).length > 0 ? (
                                (admin.permissions || []).map((permission) => (
                                  <li
                                    key={permission}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-50"
                                  >
                                    {permissionLabelMap[permission] || permission}
                                  </li>
                                ))
                              ) : (
                                <li className="px-4 py-2 text-gray-500">Default role access</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '-'}
                    </td>
                    {hasPermission(user, PERMISSIONS.SUB_ADMINS_MANAGE) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(admin)}
                            className="text-primary-600 hover:text-primary-900"
                            aria-label="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(admin)}
                            className="text-red-600 hover:text-red-900"
                            aria-label="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {(items || []).length === 0 && !listLoading && (
                <tr>
                  <td
                    colSpan={hasPermission(user, PERMISSIONS.SUB_ADMINS_MANAGE) ? 6 : 5}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No users found for your assigned landing page.
                  </td>
                </tr>
              )}
            </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-2 py-2">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={!paginationInfo.prev || listLoading}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        {renderPageNumbers()}
        <button
          type="button"
          onClick={onNextPage}
          disabled={!paginationInfo.next || listLoading}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingAdmin ? 'Edit user' : 'Create user'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Users are assigned to the same landing page(s) as your account. You cannot assign other pages.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        className={`input-field mt-1 ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="Enter full name"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        className={`input-field mt-1 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="Enter email address"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company name</label>
                      <input
                        type="text"
                        {...register('companyName', { required: 'Company name is required' })}
                        className={`input-field mt-1 ${errors.companyName ? 'border-red-500' : ''}`}
                        placeholder="Enter company name"
                      />
                      {errors.companyName && (
                        <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        {...register('phone')}
                        className="input-field mt-1"
                        placeholder="Enter phone number (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {editingAdmin ? 'New password (optional)' : 'Password'}
                      </label>
                      <input
                        type="password"
                        {...register('password', {
                          validate: (v) => {
                            if (editingAdmin && (!v || v.trim() === '')) return true;
                            if (!editingAdmin && (!v || v.trim() === '')) {
                              return 'Password is required';
                            }
                            if (v.length < 6) return 'Password must be at least 6 characters';
                            return true;
                          },
                        })}
                        className={`input-field mt-1 ${errors.password ? 'border-red-500' : ''}`}
                        placeholder={editingAdmin ? 'Leave blank to keep current password' : 'Enter password'}
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Module access</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {assignablePermissions.map((permission) => (
                          <label key={permission.key} className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              value={permission.key}
                              {...register('permissions')}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            {permission.label}
                          </label>
                        ))}
                      </div>
                      {assignablePermissions.length === 0 && (
                        <p className="text-sm text-gray-500">No module permissions available to assign.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn-primary sm:ml-3 sm:w-auto">
                    {editingAdmin ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={closeModal} className="btn-secondary sm:mt-0 sm:w-auto">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminSubAdmins;
