export const PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: 'dashboard.view',
  LEADS_VIEW: 'leads.view',
  LEADS_EDIT: 'leads.edit',
  ANALYTICS_VIEW: 'analytics.view',
  LANDING_PAGES_VIEW: 'landingPages.view',
  LANDING_PAGES_MANAGE: 'landingPages.manage',
  SUB_ADMINS_VIEW: 'subAdmins.view',
  SUB_ADMINS_MANAGE: 'subAdmins.manage',
  PROFILE_VIEW: 'profile.view',
  PROFILE_EDIT: 'profile.edit',
});

const DEFAULT_PERMISSIONS_BY_ROLE = Object.freeze({
  super_admin: Object.values(PERMISSIONS),
  sub_admin: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.LEADS_EDIT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SUB_ADMINS_VIEW,
    PERMISSIONS.SUB_ADMINS_MANAGE,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_EDIT,
  ],
});

export const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  const valid = new Set(Object.values(PERMISSIONS));
  return [...new Set(permissions)].filter((p) => valid.has(p));
};

export const resolveUserPermissions = (user) => {
  const explicit = normalizePermissions(user?.permissions);
  if (explicit.length > 0) {
    return explicit;
  }
  if (Array.isArray(user?.permissions) && user.permissions.length === 0) {
    return [];
  }
  return DEFAULT_PERMISSIONS_BY_ROLE[user?.role] || [];
};

export const hasPermission = (user, permission) =>
  resolveUserPermissions(user).includes(permission);
