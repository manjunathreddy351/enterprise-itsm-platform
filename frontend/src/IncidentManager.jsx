import { useEffect, useState } from 'react';
import { Plus, RefreshCw, X, AlertTriangle, Search } from 'lucide-react';

const API = 'http://localhost:8084/api/incidents';

export default function IncidentManager() {
  const [incidents, setIncidents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    affectedService: '',
    assignedTeam: 'DevOps Team'
  });

  async function loadIncidents() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error('Unable to load incidents');
      setIncidents(await response.json());
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadIncidents();
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function createIncident(event) {
    event.preventDefault();

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Incident creation failed: ' + await response.text());
      }

      setMessage('Incident created successfully!');
      setForm({
        title: '',
        description: '',
        severity: 'MEDIUM',
        affectedService: '',
        assignedTeam: 'DevOps Team'
      });
      setShowForm(false);
      await loadIncidents();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function changeStatus(id, status) {
    try {
      const response = await fetch(
        `${API}/${id}/status?status=${encodeURIComponent(status)}`,
        { method: 'PATCH' }
      );

      if (!response.ok) throw new Error('Status update failed');

      setMessage('Incident status updated!');
      await loadIncidents();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function assignTeam(id, team) {
    try {
      const response = await fetch(
        `${API}/${id}/assign?team=${encodeURIComponent(team)}`,
        { method: 'PATCH' }
      );

      if (!response.ok) throw new Error('Team assignment failed');

      setMessage('Incident team updated!');
      await loadIncidents();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const filtered = incidents.filter(incident =>
    [
      incident.title,
      incident.description,
      incident.affectedService,
      incident.assignedTeam,
      incident.severity,
      incident.status
    ].some(value =>
      String(value ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="im">
      <div className="im-heading">
        <div>
          <h2>Incident Management</h2>
          <p>Monitor and manage production incidents.</p>
        </div>

        <button className="im-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={17} /> : <Plus size={17} />}
          {showForm ? 'Close form' : 'Create incident'}
        </button>
      </div>

      {message && <div className="im-message">{message}</div>}

      {showForm && (
        <form className="im-form" onSubmit={createIncident}>
          <h3><AlertTriangle size={19} /> Report a new incident</h3>

          <label>Incident title</label>
          <input
            name="title"
            value={form.title}
            onChange={updateField}
            required
            placeholder="Example: Production server down"
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={updateField}
            required
            placeholder="Describe what happened..."
          />

          <label>Severity</label>
          <select name="severity" value={form.severity} onChange={updateField}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <label>Affected service</label>
          <input
            name="affectedService"
            value={form.affectedService}
            onChange={updateField}
            placeholder="Example: Production Application"
          />

          <label>Assigned team</label>
          <select name="assignedTeam" value={form.assignedTeam} onChange={updateField}>
            <option>DevOps Team</option>
            <option>IT Support</option>
            <option>Network Team</option>
            <option>Security Team</option>
          </select>

          <button className="im-primary" type="submit">
            Submit incident
          </button>
        </form>
      )}

      <div className="im-toolbar">
        <div><strong>{incidents.length}</strong> total incidents</div>

        <div className="im-search">
          <Search size={16} />
          <input
            placeholder="Search incidents..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>

        <button className="im-refresh" onClick={loadIncidents}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="im-table-wrap">
        <table className="im-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Affected service</th>
              <th>Severity</th>
              <th>Assigned team</th>
              <th>Change team</th>
              <th>Status</th>
              <th>Update status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(incident => (
              <tr key={incident.id}>
                <td>#{incident.id}</td>
                <td><strong>{incident.title}</strong></td>
                <td>{incident.affectedService || '—'}</td>
                <td>
                  <span className={'im-severity ' + String(incident.severity).toLowerCase()}>
                    {incident.severity}
                  </span>
                </td>
                <td>{incident.assignedTeam || 'Unassigned'}</td>
                <td>
                  <select
                    value={incident.assignedTeam || ''}
                    onChange={event => assignTeam(incident.id, event.target.value)}
                  >
                    <option value="" disabled>Select team</option>
                    <option>DevOps Team</option>
                    <option>IT Support</option>
                    <option>Network Team</option>
                    <option>Security Team</option>
                  </select>
                </td>
                <td><span className="im-status">{incident.status}</span></td>
                <td>
                  <select
                    value={incident.status}
                    onChange={event => changeStatus(incident.id, event.target.value)}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="8" className="im-empty">No incidents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
