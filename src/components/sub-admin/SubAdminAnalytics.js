import React, { useState, useEffect, useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { subAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TIME_VIEWS = [
  { id: 'daily', label: 'Daily' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

const KPI_CONFIG = [
  { key: 'new', label: 'New', className: 'from-slate-800 to-slate-900' },
  { key: 'contacted', label: 'Contacted', className: 'from-cyan-500 to-teal-600' },
  { key: 'qualified', label: 'Qualified', className: 'from-emerald-500 to-green-600' },
  { key: 'closed', label: 'Closed', className: 'from-violet-500 to-fuchsia-600' },
];

const SOURCE_COLORS = ['#2563eb', '#0d9488', '#7c3aed', '#ea580c', '#64748b', '#db2777'];
const LOCATION_COLOR = '#2563eb';
const DEVICE_COLORS = { Mobile: '#2563eb', Desktop: '#0d9488', Unknown: '#94a3b8' };

const emptyAnalytics = {
  kpis: { new: 0, contacted: 0, qualified: 0, closed: 0 },
  leadsOverTime: { daily: [], monthly: [], yearly: [] },
  bySource: [],
  byLocation: [],
  byDevice: [],
  locationBreakdown: {
    city: [],
    state: [],
    country: [],
  },
};

const SubAdminAnalytics = () => {
  const [assignedPages, setAssignedPages] = useState([]);
  const [timeView, setTimeView] = useState('daily');
  const [locationView, setLocationView] = useState('city');
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [lpRes, anRes] = await Promise.all([
          subAdminAPI.getLandingPage(),
          subAdminAPI.getAnalytics(),
        ]);
        const raw = lpRes.data?.data;
        const pages = Array.isArray(raw) ? raw : raw ? [raw] : [];
        if (!cancelled) setAssignedPages(pages.filter(Boolean));

        const d = anRes.data?.data || emptyAnalytics;
        if (!cancelled) {
          setAnalytics({
            kpis: d.kpis || emptyAnalytics.kpis,
            leadsOverTime: d.leadsOverTime || emptyAnalytics.leadsOverTime,
            bySource: d.bySource || [],
            byLocation: d.byLocation || [],
            byDevice: d.byDevice || [],
            locationBreakdown: d.locationBreakdown || emptyAnalytics.locationBreakdown,
          });
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          toast.error('Failed to load analytics');
          setAnalytics(emptyAnalytics);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const timeSeriesData = useMemo(() => {
    const bucket = analytics.leadsOverTime?.[timeView] || [];
    return bucket.map((row) => ({
      period: row.period,
      leads: row.leads,
    }));
  }, [analytics.leadsOverTime, timeView]);

  const sourceChartData = useMemo(
    () =>
      (analytics.bySource || []).map((s) => ({
        name: s.source || 'Unknown',
        leads: s.count,
      })),
    [analytics.bySource]
  );

  const locationChartData = useMemo(() => {
    const raw = analytics.locationBreakdown?.[locationView] || [];

    return raw.map((item) => {
      const value =
        locationView === 'city'
          ? item.city
          : locationView === 'state'
            ? item.state
            : item.country;

      return {
        name:
          value && value.length > 24
            ? `${value.slice(0, 22)}…`
            : value || 'Unknown',
        full: value || 'Unknown',
        leads: item.count || 0,
      };
    });
  }, [analytics.locationBreakdown, locationView]);

  const deviceChartData = useMemo(
    () =>
      (analytics.byDevice || []).map((d) => ({
        name: d.device || 'Unknown',
        value: d.count,
      })),
    [analytics.byDevice]
  );

  const scopeDescription = useMemo(() => {
    if (assignedPages.length === 0) {
      return 'No landing page assigned yet. Analytics will appear here once you have access to a page.';
    }
    if (assignedPages.length === 1) {
      return `Leads and metrics for your page: ${assignedPages[0].name}`;
    }
    return `Combined analytics for your ${assignedPages.length} assigned landing pages: ${assignedPages.map((p) => p.name).join(', ')}`;
  }, [assignedPages]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">{scopeDescription}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-600">
          Data matches the <span className="font-medium text-gray-900">Leads</span> tab — only leads from
          landing pages you are assigned to.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KPI_CONFIG.map((kpi) => (
              <div
                key={kpi.key}
                className={`overflow-hidden rounded-xl bg-gradient-to-br ${kpi.className} p-5 text-white shadow-md`}
              >
                <p className="text-sm font-medium text-white/90">{kpi.label}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums">
                  {analytics.kpis[kpi.key] ?? 0}
                </p>
                <p className="mt-1 text-xs text-white/70">
                  {kpi.key === 'closed' ? 'Converted + lost' : 'Leads'}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Leads over time</h2>
                <div className="flex rounded-lg border border-gray-200 p-0.5">
                  {TIME_VIEWS.map((tv) => (
                    <button
                      key={tv.id}
                      type="button"
                      onClick={() => setTimeView(tv.id)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        timeView === tv.id
                          ? 'bg-primary-600 text-white shadow'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tv.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-72 w-full">
                {timeSeriesData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-gray-500">No leads in this range yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="subAdminColorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                        }}
                        labelStyle={{ fontWeight: 600 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="leads"
                        stroke="#2563eb"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#subAdminColorLeads)"
                        name="Leads"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Leads by source</h2>
              <div className="h-72 w-full">
                {sourceChartData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-gray-500">No source data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceChartData} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        angle={-25}
                        textAnchor="end"
                        height={56}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                        }}
                      />
                      <Bar dataKey="leads" name="Leads" radius={[4, 4, 0, 0]}>
                        {sourceChartData.map((_, i) => (
                          <Cell key={`c-${i}`} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Leads by location</h2>

                <div className="inline-flex w-fit rounded-lg border border-gray-200 bg-gray-50 p-1">
                  {['city', 'state', 'country'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setLocationView(level)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                        locationView === level
                          ? 'bg-primary-600 text-white shadow'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mb-3 text-xs text-gray-500">
                Showing {locationChartData.length}{' '}
                {locationView === 'city'
                  ? 'cities'
                  : locationView === 'state'
                    ? 'states'
                    : 'countries'}
              </p>

              <div className="h-72 w-full">
                {locationChartData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-gray-500">No location data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={locationChartData}
                      margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={110}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                      />
                      <Tooltip
                        formatter={(value) => [value, 'Leads']}
                        labelFormatter={(label, payload) =>
                          payload && payload[0]?.payload?.full
                            ? payload[0].payload.full
                            : label
                        }
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                        }}
                      />
                      <Bar dataKey="leads" name="Leads" fill={LOCATION_COLOR} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Leads by device</h2>
              <p className="mb-2 text-xs text-gray-500">Mobile includes phone and tablet.</p>
              <div className="h-72 w-full">
                {deviceChartData.length === 0 || deviceChartData.every((d) => d.value === 0) ? (
                  <p className="py-16 text-center text-sm text-gray-500">No device data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={96}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                      >
                        {deviceChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={DEVICE_COLORS[entry.name] || '#94a3b8'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [value, 'Leads']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubAdminAnalytics;
