import { useEffect, useState } from 'react';
import { Plus, Search, RefreshCw, Send, X, Bell } from 'lucide-react';

const API = 'http://localhost:8085/api/notifications';

const emptyForm = {
  subject: '',
  recipient: '',
  message: '',
  type: 'GENERAL'
};

export default function NotificationManager() {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadNotifications() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error('Could not load notifications');
      setNotifications(await response.json());
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function createNotification(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error('Unable to create notification');

      setForm(emptyForm);
      setShowForm(false);
      setMessage('Notification created successfully.');
      await loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  }

  async function markAsSent(id) {
    try {
      const response = await fetch(`${API}/${id}/sent`, {
        method: 'PATCH'
      });

      if (!response.ok) throw new Error('Unable to update notification');

      setMessage('Notification marked as sent.');
      setError('');
      await loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = notifications.filter(item =>
    [item.subject, item.recipient, item.message, item.type, item.status]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="nm">
      <div className="nm-heading">
        <div>
          <h2>Notification Management</h2>
          <p>Manage system alerts and notification history</p>
        </div>
        <button className="nm-primary" onClick={() => {
          setForm(emptyForm);
          setShowForm(true);
          setMessage('');
        }}>
          <Plus size={16} /> Create Notification
        </button>
      </div>

      {message && <div className="nm-message">{message}</div>}
      {error && <div className="nm-error">{error}</div>}

      <div className="nm-stats">
        <div><span>Total Notifications</span><strong>{notifications.length}</strong></div>
        <div><span>Sent</span><strong>{notifications.filter(n => n.status === 'SENT').length}</strong></div>
        <div><span>Pending</span><strong>{notifications.filter(n => n.status !== 'SENT').length}</strong></div>
      </div>

      {showForm && (
        <form className="nm-form" onSubmit={createNotification}>
          <div className="nm-form-heading">
            <h3><Bell size={17} /> New Notification</h3>
            <button type="button" className="nm-close" onClick={() => setShowForm(false)}>
              <X size={18} />
            </button>
          </div>

          <label>Subject</label>
          <input name="subject" value={form.subject} onChange={updateField} required />

          <label>Recipient Email</label>
          <input name="recipient" type="email" value={form.recipient} onChange={updateField} required />

          <label>Notification Type</label>
          <select name="type" value={form.type} onChange={updateField}>
            <option value="GENERAL">General</option>
            <option value="TICKET">Ticket</option>
            <option value="INCIDENT">Incident</option>
            <option value="ASSET">Asset</option>
          </select>

          <label>Message</label>
          <textarea name="message" value={form.message} onChange={updateField} required />

          <button className="nm-primary" type="submit">
            <Send size={15} /> Save Notification
          </button>
        </form>
      )}

      <div className="nm-toolbar">
        <div className="nm-search">
          <Search size={16} />
          <input
            placeholder="Search notifications..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <button className="nm-refresh" onClick={loadNotifications}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="nm-list">
        {filtered.map(item => (
          <article className="nm-card" key={item.id}>
            <div className="nm-icon"><Bell size={19} /></div>
            <div className="nm-content">
              <div className="nm-card-heading">
                <h3>{item.subject}</h3>
                <span className={`nm-status ${item.status?.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
              <p>{item.message}</p>
              <div className="nm-details">
                <span>To: {item.recipient}</span>
                <span>Type: {item.type}</span>
                <span>ID: #{item.id}</span>
              </div>
            </div>
            {item.status !== 'SENT' && (
              <button className="nm-send" onClick={() => markAsSent(item.id)}>
                Mark Sent
              </button>
            )}
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="nm-empty">No notifications found.</div>
        )}
      </div>

      <p className="nm-count">
        Showing {filtered.length} of {notifications.length} notifications
      </p>
    </section>
  );
}
