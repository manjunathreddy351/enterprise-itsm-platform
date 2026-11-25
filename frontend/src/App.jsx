import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, Ticket, AlertTriangle,
  Monitor, Bell, BarChart3, RefreshCw, Search,
  ShieldCheck, Menu
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis,
  YAxis, Tooltip, CartesianGrid
} from 'recharts';
import './App.css';
import NotificationManager from './NotificationManager';
import AssetManager from './AssetManager';
import EmployeeManager from './EmployeeManager';
import IncidentManager from './IncidentManager';
import TicketManager from './TicketManager';

const API = {
  dashboard: 'http://localhost:8087/api/dashboard',
  Employees: 'http://localhost:8082/api/employees',
  Tickets: 'http://localhost:8083/api/tickets',
  Incidents: 'http://localhost:8084/api/incidents',
  Assets: 'http://localhost:8086/api/assets',
  Notifications: 'http://localhost:8085/api/notifications'
};

const navigation = [
  ['Dashboard', LayoutDashboard],
  ['Employees', Users],
  ['Tickets', Ticket],
  ['Incidents', AlertTriangle],
  ['Assets', Monitor],
  ['Notifications', Bell],
  ['Reports', BarChart3]
];

export default function App() {
  const [page, setPage] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API.dashboard);
      if (!response.ok) throw new Error('Dashboard service error');
      setStats(await response.json());

      if (API[page]) {
        const result = await fetch(API[page]);
        if (!result.ok) throw new Error(page + ' service error');
        const data = await result.json();
        setRecords(Array.isArray(data) ? data : []);
      } else {
        setRecords([]);
      }
    } catch (e) {
      setError(e.message + '. Check that your Docker services are running.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [page]);

  const cards = stats ? [
    ['Total Employees', stats.totalEmployees, Users, 'blue'],
    ['Total Tickets', stats.totalTickets, Ticket, 'purple'],
    ['Open Tickets', stats.openTickets, Bell, 'orange'],
    ['Resolved Tickets', stats.resolvedTickets, ShieldCheck, 'green'],
    ['Total Incidents', stats.totalIncidents, AlertTriangle, 'red'],
    ['Critical Incidents', stats.criticalIncidents, AlertTriangle, 'pink'],
    ['Total Assets', stats.totalAssets, Monitor, 'cyan'],
    ['Assigned Assets', stats.assignedAssets, Users, 'indigo']
  ] : [];

  const chartData = stats ? [
    { name: 'Employees', total: stats.totalEmployees },
    { name: 'Tickets', total: stats.totalTickets },
    { name: 'Incidents', total: stats.totalIncidents },
    { name: 'Assets', total: stats.totalAssets }
  ] : [];

  const [tickets, setTickets] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(API.Tickets).then(r => r.json()),
      fetch(API.Incidents).then(r => r.json()),
      fetch(API.Assets).then(r => r.json())
    ]).then(([t, i, a]) => {
      setTickets(Array.isArray(t) ? t : []);
      setIncidents(Array.isArray(i) ? i : []);
      setAssets(Array.isArray(a) ? a : []);
    }).catch(err => console.error("Chart data error:", err));
  }, []);

  const countBy = (items, field, values) =>
    values.map(value => ({
      name: value,
      total: items.filter(item =>
        String(item[field] || '').toUpperCase() === value
      ).length
    }));

  const ticketStatusData = countBy(
    tickets, 'status',
    ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
  );

  const incidentSeverityData = countBy(
    incidents, 'severity',
    ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  );

  const assetStatusData = countBy(
    assets, 'status',
    ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED']
  );

  const filtered = records.filter(record =>
    Object.values(record).some(value =>
      String(value ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo"><ShieldCheck size={26} /></div>
          <div><strong>ITSM<span>PRO</span></strong><small>Enterprise Platform</small></div>
        </div>

        <p className="nav-heading">WORKSPACE</p>
        {navigation.map(([name, Icon]) => (
          <button key={name}
            className={'nav-link ' + (page === name ? 'selected' : '')}
            onClick={() => { setPage(name); setSearch(''); }}>
            <Icon size={19} /> {name}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="online"><span /> All systems operational</div>
          <div className="profile">
            <div className="avatar">M</div>
            <div><strong>Administrator</strong><small>IT Operations</small></div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <small>Workspace / {page}</small>
            <h1>{page}</h1>
          </div>
          <div className="top-actions">
            <div className="search">
              <Search size={17} />
              <input placeholder="Search records..." value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="refresh" onClick={refresh}>
              <RefreshCw size={17} /> Refresh
            </button>
            <div className="avatar">M</div>
          </div>
        </header>

        <section className="content">
          <div className="welcome">
            <div>
              <h2>{page === 'Dashboard' ? 'Welcome back, Administrator' : page + ' Management'}</h2>
              <p>Manage and monitor your enterprise IT operations.</p>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {(page === 'Dashboard' || page === 'Reports') && (
            <>
              <div className="section-title">
                <h3>Platform Overview</h3><span>Live backend statistics</span>
              </div>

              <div className="stats-grid">
                {cards.map(([title, value, Icon, color]) => (
                  <div className="stat-card" key={title}>
                    <div className={'stat-icon ' + color}><Icon size={22} /></div>
                    <h2>{value ?? '—'}</h2>
                    <p>{title}</p>
                    <small><span className="live-dot" /> Live data</small>
                  </div>
                ))}
              </div>

              <div className="section-title chart-title">
                <h3>Service Distribution</h3><span>Records by service</span>
              </div>
              <div className="chart-card">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#635bdb" radius={[7, 7, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="section-title chart-title">
                <h3>Ticket Status</h3>
                <span>Live ticket records</span>
              </div>

              <div className="chart-grid">
                <div className="chart-card">
                  <h3>Ticket Status</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={ticketStatusData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#635bdb" radius={[7, 7, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>Incident Severity</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={incidentSeverityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#ef647c" radius={[7, 7, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>Asset Status</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={assetStatusData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#19b98a" radius={[7, 7, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="section-title chart-title">
                <h3>Recent Activity</h3>
                <span>Latest tickets and incidents</span>
              </div>

              <div className="records-card">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Status / Severity</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ...tickets.map(item => ({
                          ...item,
                          activityType: 'Ticket',
                          activityTitle: item.title,
                          activityStatus: item.status,
                          activityDate: item.createdAt
                        })),
                        ...incidents.map(item => ({
                          ...item,
                          activityType: 'Incident',
                          activityTitle: item.title,
                          activityStatus: item.severity,
                          activityDate: item.createdAt
                        }))
                      ]
                        .sort((a, b) =>
                          new Date(b.activityDate || 0) -
                          new Date(a.activityDate || 0)
                        )
                        .slice(0, 8)
                        .map((item, index) => (
                          <tr key={item.activityType + '-' + item.id + '-' + index}>
                            <td>{item.activityType}</td>
                            <td>{item.activityTitle || '—'}</td>
                            <td>{item.activityStatus || '—'}</td>
                            <td>
                              {item.activityDate
                                ? new Date(item.activityDate).toLocaleString()
                                : '—'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {page === 'Tickets' && <TicketManager />}
          {page === 'Incidents' && <IncidentManager />}
          {page === 'Employees' && <EmployeeManager />}
          {page === 'Assets' && <AssetManager />}
          {page === 'Notifications' && <NotificationManager />}

          {!['Dashboard', 'Reports', 'Tickets', 'Incidents', 'Employees', 'Assets', 'Notifications'].includes(page) && (
            <div className="records-card">
              <div className="section-title">
                <h3>{page}</h3><span>{filtered.length} records</span>
              </div>
              {loading ? <p>Loading records...</p> :
                filtered.length === 0 ? <p className="empty">No records found.</p> :
                <div className="table-scroll">
                  <table>
                    <thead><tr>
                      {Object.keys(filtered[0]).map(key =>
                        <th key={key}>{key}</th>
                      )}
                    </tr></thead>
                    <tbody>
                      {filtered.map((record, index) => (
                        <tr key={record.id ?? index}>
                          {Object.values(record).map((value, i) =>
                            <td key={i}>{String(value ?? '—')}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          )}

          <footer>ITSM PRO · Enterprise IT Service Management Platform</footer>
        </section>
      </main>
    </div>
  );
}
