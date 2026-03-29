import React, { useState, useEffect,useCallback  } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Save, X, Search } from 'lucide-react';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const LandingPages = () => {
  const [landingPages, setLandingPages] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [showFormConfig, setShowFormConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState({});
  // const [formData, setFormData] = useState({
  //   name: '',
  //   url: '',
  //   description: ''
  // });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Form configuration state
  const [formConfig, setFormConfig] = useState({
    includeDefaultFields: {
      firstName: true,
      lastName: true,
      email: true,
      phone: false,
      company: false,
      message: false
    },
    formFields: []
  });

  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: []
  });

  // UTM generator state
  const PLATFORM_OPTIONS = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'google', label: 'Google Ads' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'twitter', label: 'Twitter / X' },
  ];

  const [utmConfig, setUtmConfig] = useState({
    platform: 'facebook',
    campaign: '',
    medium: 'social',
    baseUrl: '',
    pageName: '',
  });
  const [showUtmModal, setShowUtmModal] = useState(false);

  const getId = (obj) =>
    typeof obj === 'string' ? obj : (obj && (obj._id || obj.id)) || '';

  const buildUtmUrl = (baseUrl, { platform, medium, campaign }) => {
    try {
      if (!baseUrl || !platform) return '';
      const urlObj = new URL(baseUrl);
      urlObj.searchParams.set('utm_source', platform);
      urlObj.searchParams.set('utm_medium', medium || 'social');
      if (campaign) {
        urlObj.searchParams.set('utm_campaign', campaign);
      } else {
        urlObj.searchParams.delete('utm_campaign');
      }
      return urlObj.toString();
    } catch (err) {
      console.error('Invalid URL for UTM generation:', baseUrl, err);
      return baseUrl || '';
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const fetchLandingPages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await superAdminAPI.getLandingPages({
        page,
        limit,
        search: searchTerm !== '' ? searchTerm : undefined,
      });
      const pagesArray = response.data.data || response.data;
      setLandingPages(pagesArray);
      setTotal(response.data.total || response.data.count || pagesArray.length);
      setPaginationInfo(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching landing pages:', error);
      toast.error('Failed to load landing pages');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    fetchLandingPages();
  }, [fetchLandingPages]);

  // const fetchLandingPages = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await superAdminAPI.getLandingPages({
  //       page,
  //       limit,
  //       search: searchTerm !== '' ? searchTerm : undefined,
  //     });
  //     const pagesArray = response.data.data || response.data;
  //     setLandingPages(pagesArray);
  //     setTotal(response.data.total || response.data.count || pagesArray.length);
  //     setPaginationInfo(response.data.pagination || {});
  //   } catch (error) {
  //     console.error('Error fetching landing pages:', error);
  //     toast.error('Failed to load landing pages');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onSubmit = async (data) => {
    try {
      if (editingPage) {
        await superAdminAPI.updateLandingPage(getId(editingPage), data);
        toast.success('Landing page updated successfully');
      } else {
        await superAdminAPI.createLandingPage(data);
        toast.success('Landing page created successfully');
      }
      setShowModal(false);
      setEditingPage(null);
      reset();
      fetchLandingPages();
    } catch (error) {
      console.error('Error saving landing page:', error);
      toast.error('Failed to save landing page');
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    reset(page);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingPage(null);
    reset({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPage(null);
    reset();
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error('Invalid landing page');
      return;
    }
    if (window.confirm('Are you sure you want to delete this landing page?')) {
      try {
        await superAdminAPI.deleteLandingPage(id);
        toast.success('Landing page deleted successfully');
        fetchLandingPages();
      } catch (error) {
        console.error('Error deleting landing page:', error);
        toast.error('Failed to delete landing page');
      }
    }
  };

  // const handleFormConfig = async (page) => {
  //   try {
  //     const pid = getId(page);
  //     const response = await superAdminAPI.getLandingPageFormConfig(pid);
  //     setFormConfig(response.data.data);
  //     setShowFormConfig(pid);
  //   } catch (error) {
  //     console.error('Error fetching form config:', error);
  //     toast.error('Failed to load form configuration');
  //   }
  // };

  const saveFormConfig = async () => {
    try {
      await superAdminAPI.updateLandingPageFormFields(showFormConfig, formConfig);
      toast.success('Form configuration saved successfully');
      setShowFormConfig(null);
      fetchLandingPages();
    } catch (error) {
      console.error('Error saving form config:', error);
      toast.error('Failed to save form configuration');
    }
  };

  const addFormField = () => {
    if (!newField.name || !newField.label) {
      toast.error('Field name and label are required');
      return;
    }

    const field = {
      ...newField,
      order: formConfig.formFields.length
    };

    setFormConfig({
      ...formConfig,
      formFields: [...formConfig.formFields, field]
    });

    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: []
    });
  };

  const removeFormField = (index) => {
    const updatedFields = formConfig.formFields.filter((_, i) => i !== index);
    setFormConfig({
      ...formConfig,
      formFields: updatedFields
    });
  };

  const addOption = (fieldIndex) => {
    const field = formConfig.formFields[fieldIndex];
    if (!field.options) field.options = [];
    
    const option = prompt('Enter option value:');
    if (option) {
      const updatedFields = [...formConfig.formFields];
      updatedFields[fieldIndex].options.push({ value: option, label: option });
      setFormConfig({
        ...formConfig,
        formFields: updatedFields
      });
    }
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...formConfig.formFields];
    updatedFields[fieldIndex].options.splice(optionIndex, 1);
    setFormConfig({
      ...formConfig,
      formFields: updatedFields
    });
  };

  const renderFormFieldEditor = (field, index) => (
    <div key={index} className="border rounded-lg p-4 mb-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => {
              const updatedFields = [...formConfig.formFields];
              updatedFields[index].name = e.target.value;
              setFormConfig({ ...formConfig, formFields: updatedFields });
            }}
            className="input-field"
            placeholder="e.g., budget, project_type"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => {
              const updatedFields = [...formConfig.formFields];
              updatedFields[index].label = e.target.value;
              setFormConfig({ ...formConfig, formFields: updatedFields });
            }}
            className="input-field"
            placeholder="e.g., Budget, Project Type"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
          <select
            value={field.type}
            onChange={(e) => {
              const updatedFields = [...formConfig.formFields];
              updatedFields[index].type = e.target.value;
              setFormConfig({ ...formConfig, formFields: updatedFields });
            }}
            className="input-field"
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="textarea">Text Area</option>
            <option value="select">Select</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="url">URL</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required</label>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => {
                const updatedFields = [...formConfig.formFields];
                updatedFields[index].required = e.target.checked;
                setFormConfig({ ...formConfig, formFields: updatedFields });
              }}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Required field</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => {
              const updatedFields = [...formConfig.formFields];
              updatedFields[index].placeholder = e.target.value;
              setFormConfig({ ...formConfig, formFields: updatedFields });
            }}
            className="input-field"
            placeholder="Optional placeholder text"
          />
        </div>
      </div>

      {/* Options for select/radio fields */}
      {(field.type === 'select' || field.type === 'radio') && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
          <div className="space-y-2">
            {field.options && field.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option.value}
                  onChange={(e) => {
                    const updatedFields = [...formConfig.formFields];
                    updatedFields[index].options[optionIndex].value = e.target.value;
                    updatedFields[index].options[optionIndex].label = e.target.value;
                    setFormConfig({ ...formConfig, formFields: updatedFields });
                  }}
                  className="input-field flex-1"
                  placeholder="Option value"
                />
                <button
                  onClick={() => removeOption(index, optionIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addOption(index)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add Option
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={() => removeFormField(index)}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Remove Field
        </button>
      </div>
    </div>
  );

  const filteredPages = Array.isArray(landingPages) ? landingPages : [];

  const onNextPage = () => {
    if (paginationInfo.next) setPage(paginationInfo.next.page);
  };

  const onPrevPage = () => {
    if (paginationInfo.prev) setPage(paginationInfo.prev.page);
  };

  const onPageSelect = (num) => setPage(num);
  const totalPages = Math.ceil(total / limit) || 1;

  const renderPageNumbers = () => {
    const pagesArr = [];
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
    
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Pages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all landing pages in your system
          </p>
          <div className="mt-1 text-xs text-gray-500">
            Page {page} / {totalPages}. Showing {landingPages.length} of {total} landing pages.
          </div>
        </div>
        <button
          onClick={openCreateModal}
             className="btn-primary flex items-center w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Landing Page
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search landing pages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Landing Pages Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPages.map((page) => (
                <tr key={getId(page)} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{page.name}</div>
                    <div className="text-sm text-gray-500">{page.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-900 text-sm"
                    >
                      {page.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      page.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(page.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(page)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {/* <button
                        onClick={() => handleFormConfig(page)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Configure Form"
                      >
                        <Settings className="h-4 w-4" />
                      </button> */}
                      <button
                        onClick={() => {
                          setUtmConfig((prev) => ({
                            ...prev,
                            baseUrl: page.url,
                            pageName: page.name,
                          }));
                          setShowUtmModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 text-xs"
                        title="Generate UTM link"
                      >
                        UTM Link
                      </button>
                      <button
                        onClick={() => handleDelete(getId(page))}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="my-4 flex justify-center items-center space-x-1">
          <button onClick={onPrevPage} disabled={!paginationInfo.prev} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
          {renderPageNumbers()}
          <button onClick={onNextPage} disabled={!paginationInfo.next} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingPage ? 'Edit Landing Page' : 'Create Landing Page'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        className={`input-field mt-1 ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="Enter landing page name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        {...register('description')}
                        rows={3}
                        className="input-field mt-1"
                        placeholder="Enter description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">URL</label>
                      <input
                        type="url"
                        {...register('url', { 
                          required: 'URL is required',
                          pattern: {
                            value: /^https?:\/\/.+/,
                            message: 'Please enter a valid URL starting with http:// or https://'
                          }
                        })}
                        className={`input-field mt-1 ${errors.url ? 'border-red-500' : ''}`}
                        placeholder="https://example.com"
                      />
                      {errors.url && (
                        <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        {...register('status')}
                        className="input-field mt-1"
                        defaultValue="active"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3 sm:w-auto"
                  >
                    {editingPage ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* UTM Generator Modal */}
      {showUtmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowUtmModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Generate UTM link
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Choose the traffic source and campaign to get a shareable tracking URL.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUtmModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    {utmConfig.pageName && (
                      <span className="inline-flex items-center rounded-full bg-primary-50 text-primary-700 px-3 py-1 text-xs font-medium">
                        Page: <span className="ml-1 truncate max-w-[180px]">{utmConfig.pageName}</span>
                      </span>
                    )}
                    <div>
                      <p className="block text-xs font-medium text-gray-700 mb-1">
                        Base URL
                      </p>
                      <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-[11px] text-gray-700 break-all">
                        {utmConfig.baseUrl || 'No URL selected'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Platform (utm_source)
                      </label>
                      <select
                        className="input-field text-sm"
                        value={utmConfig.platform}
                        onChange={(e) =>
                          setUtmConfig((prev) => ({
                            ...prev,
                            platform: e.target.value,
                          }))
                        }
                      >
                        {PLATFORM_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-gray-400">
                        Example: facebook, instagram, youtube
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Medium (utm_medium)
                      </label>
                      <input
                        type="text"
                        className="input-field text-sm"
                        value={utmConfig.medium}
                        onChange={(e) =>
                          setUtmConfig((prev) => ({
                            ...prev,
                            medium: e.target.value,
                          }))
                        }
                        placeholder="social"
                      />
                      <p className="mt-1 text-[11px] text-gray-400">
                        Channel type, e.g. social, cpc, email
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Campaign (utm_campaign)
                      </label>
                      <input
                        type="text"
                        className="input-field text-sm"
                        value={utmConfig.campaign}
                        onChange={(e) =>
                          setUtmConfig((prev) => ({
                            ...prev,
                            campaign: e.target.value,
                          }))
                        }
                        placeholder="e.g. holi_sale_2026"
                      />
                      <p className="mt-1 text-[11px] text-gray-400">
                        Optional: specific offer or promotion name.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-gray-700">
                        Generated URL
                      </label>
                      <span className="text-[11px] text-gray-400">
                        Use this link in your ads or social posts.
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        readOnly
                        className="input-field text-xs flex-1"
                        value={
                          utmConfig.baseUrl
                            ? buildUtmUrl(utmConfig.baseUrl, {
                                platform: utmConfig.platform,
                                medium: utmConfig.medium,
                                campaign: utmConfig.campaign,
                              })
                            : ''
                        }
                      />
                      <button
                        type="button"
                        className="btn-primary text-xs whitespace-nowrap"
                        onClick={() => {
                          if (!utmConfig.baseUrl) return;
                          const url = buildUtmUrl(utmConfig.baseUrl, {
                            platform: utmConfig.platform,
                            medium: utmConfig.medium,
                            campaign: utmConfig.campaign,
                          });
                          if (!url) return;
                          navigator.clipboard
                            .writeText(url)
                            .then(() => toast.success('Copied to clipboard'))
                            .catch(() => toast.error('Failed to copy'));
                        }}
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowUtmModal(false)}
                  className="btn-secondary sm:mt-0 sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Configuration Modal */}
      {showFormConfig && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowFormConfig(null)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Configure Form Fields
                  </h3>
                  <button
                    onClick={() => setShowFormConfig(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Default Fields Configuration */}
                <div className="mb-8">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Default Fields</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(formConfig.includeDefaultFields).map(([field, enabled]) => (
                      <label key={field} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => {
                            setFormConfig({
                              ...formConfig,
                              includeDefaultFields: {
                                ...formConfig.includeDefaultFields,
                                [field]: e.target.checked
                              }
                            });
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Form Fields */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-700">Custom Form Fields</h4>
                    <button
                      onClick={addFormField}
                      className="btn-primary text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Field
                    </button>
                  </div>

                  {/* New Field Form */}
                  <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Add New Field</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                        <input
                          type="text"
                          value={newField.name}
                          onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                          className="input-field"
                          placeholder="e.g., budget, project_type"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Label</label>
                        <input
                          type="text"
                          value={newField.label}
                          onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                          className="input-field"
                          placeholder="e.g., Budget, Project Type"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                        <select
                          value={newField.type}
                          onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                          className="input-field"
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="textarea">Text Area</option>
                          <option value="select">Select</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="radio">Radio</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="url">URL</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center mt-3">
                      <input
                        type="checkbox"
                        checked={newField.required}
                        onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Required field</span>
                    </div>
                  </div>

                  {/* Existing Fields */}
                  {formConfig.formFields.map((field, index) => renderFormFieldEditor(field, index))}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={saveFormConfig}
                  className="btn-primary sm:ml-3 sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </button>
                <button
                  onClick={() => setShowFormConfig(null)}
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

export default LandingPages; 