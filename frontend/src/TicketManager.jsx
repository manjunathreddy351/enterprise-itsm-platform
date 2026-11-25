import { useEffect, useState } from 'react';
import { Plus, RefreshCw, X, Ticket, Search } from 'lucide-react';

const API = 'http://localhost:8083/api/tickets';

export default function TicketManager() {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    requesterEmail: '',
    assignedTeam: 'IT Support',
    priority: 'MEDIUM'
  });

  async function loadTickets() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error('Unable to load tickets');
      setTickets(await response.json());
      setMessage('');
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function createTicket(event) {
    event.preventDefault();
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Ticket creation failed: ' + await response.text());
      }

      setMessage('Ticket created successfully!');
      setForm({
        title: '',
        description: '',
        requesterEmail: '',
        assignedTeam: 'IT Support',
        priority: 'MEDIUM'
      });
      setShowForm(false);
      await loadTickets();
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
      setMessage('Ticket status updated!');
      await loadTickets();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const filtered = tickets.filter(ticket =>
    [ticket.title, ticket.requesterEmail, ticket.assignedTeam, ticket.status]
      .some(value => String(value ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="tm">
      <div className="tm-heading">
        <div>
          <h2>Support Tickets</h2>
          <p>Create and manage employee support requests.</p>
        </div>
        <button className="tm-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={17} /> : <Plus size={17} />}
          {showForm ? 'Close form' : 'Create ticket'}
        </button>
      </div>

      {message && <div className="tm-message">{message}</div>}

      {showForm && (
        <form className="tm-form" onSubmit={createTicket}>
          <h3><Ticket size={19} /> Create new support ticket</h3>
          <label>Ticket title</label>
          <input name="title" value={form.title} onChange={updateField} required placeholder="Example: Laptop not working" />

          <label>Description</label>
          <textarea name="description" value={form.description} onChange={updateField} required placeholder="Describe the issue..." />

          <label>Requester email</label>
          <input type="email" name="requesterEmail" value={form.requesterEmail} onChange={updateField} required placeholder="employee@example.com" />

          <label>Assigned team</label>
          <select name="assignedTeam" value={form.assignedTeam} onChange={updateField}>
            <option>IT Support</option>
            <option>DevOps Team</option>
            <option>Network Team</option>
            <option>Security Team</option>
          </select>

          <label>Priority</label>
          <select name="priority" value={form.priority} onChange={updateField}>
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
            <option>CRITICAL</option>
          </select>

          <button className="tm-primary" type="submit">Submit ticket</button>
        </form>
      )}

      <div className="tm-toolbar">
        <div><strong>{tickets.length}</strong> total tickets</div>
        <div className="tm-search"><Search size={16} />
          <input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="tm-refresh" onClick={loadTickets}><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="tm-table-wrap">
        <table className="tm-table">
          <thead>
            <tr>
              <th>ID</th><th>Title</th><th>Requester</th>
              <th>Team</th><th>Priority</th><th>Status</th><th>Update status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ticket => (
              <tr key={ticket.id}>
                <td>#{ticket.id}</td>
                <td><strong>{ticket.title}</strong></td>
                <td>{ticket.requesterEmail}</td>
                <td>{ticket.assignedTeam}</td>
                <td><span className={'tm-priority ' + String(ticket.priority).toLowerCase()}>{ticket.priority}</span></td>
                <td><span className="tm-status">{ticket.status}</span></td>
                <td>
                  <select value={ticket.status} onChange={e => changeStatus(ticket.id, e.target.value)}>
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" className="tm-empty">No tickets found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
