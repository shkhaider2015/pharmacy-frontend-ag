import { Package, Truck, AlertTriangle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStats } from '../lib/queries/dashboard';

export default function Dashboard() {
  const { data, isLoading, isError, error } = useDashboardStats();

  const stats = [
    { title: 'Total Revenue', value: `$${(data?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'var(--accent-primary)' },
    { title: 'Active Products', value: data?.activeProducts?.toLocaleString() || '0', icon: Package, color: 'var(--accent-success)' },
    { title: 'Low Stock Items', value: data?.lowStockItems?.toLocaleString() || '0', icon: AlertTriangle, color: 'var(--accent-warning)' },
    { title: 'Pending Orders', value: data?.pendingOrders?.toLocaleString() || '0', icon: Truck, color: 'var(--accent-danger)' },
  ];

  if (isLoading) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-danger)' }}>
        Failed to load dashboard: {(error as Error)?.message}
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon color={stat.color} size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{stat.title}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Revenue Overview</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.salesData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} padding={{ left: 10, right: 10 }} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-glass-hover)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Expiring Soon</h3>
          {data?.expiringSoon?.length === 0 ? (
             <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No items expiring soon.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data?.expiringSoon?.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--accent-warning)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Batch {item.batchNumber} • {item.stock} units</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', fontWeight: 600 }}>In {item.daysRemaining} days</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
