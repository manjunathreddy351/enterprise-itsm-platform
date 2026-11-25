import { useEffect, useState } from 'react';
import { Plus, Search, RefreshCw, Pencil, Trash2, X } from 'lucide-react';

const API = 'http://localhost:8086/api/assets';

const emptyForm = {
  assetName: '',
  assetTag: '',
  category: 'LAPTOP',
  manufacturer: '',
  model: '',
  serialNumber: '',
  location: '',
  assignedTo: ''
};

export default function AssetManager() {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadAssets() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error('Could not load assets');
      setAssets(await response.json());
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAssets();
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage('');
  }

  function openEdit(asset) {
    setEditingId(asset.id);
    setForm({
      assetName: asset.assetName || '',
      assetTag: asset.assetTag || '',
      category: asset.category || 'LAPTOP',
      manufacturer: asset.manufacturer || '',
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      location: asset.location || '',
      assignedTo: asset.assignedTo || ''
    });
    setShowForm(true);
    setMessage('');
  }

  async function saveAsset(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        }
      );

      if (!response.ok) {
        throw new Error('Unable to save asset. Check the asset service.');
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      setMessage(editingId ? 'Asset updated successfully.' : 'Asset added successfully.');
      await loadAssets();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(id, status) {
    try {
      const response = await fetch(
        `${API}/${id}/status?status=${encodeURIComponent(status)}`,
        { method: 'PATCH' }
      );
      if (!response.ok) throw new Error('Unable to update asset status');
      setMessage('Asset status updated.');
      setError('');
      await loadAssets();
    } catch (err) {
      setError(err.message);
    }
  }

  async function assignAsset(id) {
    const employeeEmail = window.prompt('Enter employee email address:');
    if (!employeeEmail) return;

    try {
      const response = await fetch(
        `${API}/assign?employeeEmail=${encodeURIComponent(employeeEmail)}`,
        { method: 'PATCH' }
      );
      if (!response.ok) throw new Error('Unable to assign asset');
      setMessage('Asset assignment request completed.');
      setError('');
      await loadAssets();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteAsset(id) {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to delete asset');
      setMessage('Asset deleted successfully.');
      setError('');
      await loadAssets();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredAssets = assets.filter(asset =>
    [
      asset.assetName,
      asset.assetTag,
      asset.category,
      asset.manufacturer,
      asset.model,
      asset.serialNumber,
      asset.assignedTo,
      asset.location
    ].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="am">
      <div className="am-heading">
        <div>
          <h2>IT Asset Management</h2>
          <p>Track, assign and manage company IT assets</p>
        </div>
        <button className="am-primary" onClick={openCreate}>
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {message && <div className="am-message">{message}</div>}
      {error && <div className="am-error">{error}</div>}

      <div className="am-stats">
        <div><span>Total Assets</span><strong>{assets.length}</strong></div>
        <div><span>Available</span><strong>{assets.filter(a => a.status === 'AVAILABLE').length}</strong></div>
        <div><span>Assigned</span><strong>{assets.filter(a => a.status === 'ASSIGNED').length}</strong></div>
        <div><span>Maintenance</span><strong>{assets.filter(a => a.status === 'MAINTENANCE').length}</strong></div>
      </div>

      {showForm && (
        <form className="am-form" onSubmit={saveAsset}>
          <div className="am-form-heading">
            <h3>{editingId ? 'Edit Asset' : 'Add New Asset'}</h3>
            <button type="button" className="am-close" onClick={() => setShowForm(false)}>
              <X size={18} />
            </button>
          </div>

          <label>Asset Name</label>
          <input name="assetName" value={form.assetName} onChange={updateField} required />

          <label>Asset Tag</label>
          <input name="assetTag" value={form.assetTag} onChange={updateField} required />

          <label>Category</label>
          <select name="category" value={form.category} onChange={updateField}>
            <option value="LAPTOP">Laptop</option>
            <option value="DESKTOP">Desktop</option>
            <option value="MONITOR">Monitor</option>
            <option value="PRINTER">Printer</option>
            <option value="NETWORK">Network Device</option>
            <option value="OTHER">Other</option>
          </select>

          <label>Manufacturer</label>
          <input name="manufacturer" value={form.manufacturer} onChange={updateField} />

          <label>Model</label>
          <input name="model" value={form.model} onChange={updateField} />

          <label>Serial Number</label>
          <input name="serialNumber" value={form.serialNumber} onChange={updateField} />

          <label>Location</label>
          <input name="location" value={form.location} onChange={updateField} />

          <label>Assigned Employee Email (optional)</label>
          <input name="assignedTo" type="email" value={form.assignedTo} onChange={updateField} />

          <button className="am-primary" type="submit">
            {editingId ? 'Update Asset' : 'Save Asset'}
          </button>
        </form>
      )}

      <div className="am-toolbar">
        <div className="am-search">
          <Search size={16} />
          <input
            placeholder="Search assets..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <button className="am-refresh" onClick={loadAssets}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="am-table-wrap">
        <table className="am-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Asset</th>
              <th>Asset Tag</th>
              <th>Category</th>
              <th>Model</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(asset => (
              <tr key={asset.id}>
                <td>#{asset.id}</td>
                <td><strong>{asset.assetName}</strong><small>{asset.manufacturer}</small></td>
                <td>{asset.assetTag}</td>
                <td>{asset.category}</td>
                <td>{asset.model}</td>
                <td>{asset.assignedTo || 'Unassigned'}</td>
                <td>
                  <select
                    className="am-status"
                    value={asset.status}
                    onChange={event => updateStatus(asset.id, event.target.value)}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="RETIRED">RETIRED</option>
                  </select>
                </td>
                <td>
                  <div className="am-actions">
                    <button className="am-edit" onClick={() => openEdit(asset)} title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button className="am-assign" onClick={() => assignAsset(asset.id)} title="Assign">
                      Assign
                    </button>
                    <button className="am-delete" onClick={() => deleteAsset(asset.id)} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAssets.length === 0 && (
              <tr><td colSpan="8" className="am-empty">No assets found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="am-count">Showing {filteredAssets.length} of {assets.length} assets</p>
    </section>
  );
}
