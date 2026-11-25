import { useEffect, useState } from 'react';
import { Plus, Search, RefreshCw, Pencil, Trash2, X } from 'lucide-react';

const API = 'http://localhost:8082/api/employees';

const emptyForm = {
  fullName: '',
  email: '',
  department: '',
  jobTitle: '',
  phone: ''
};

export default function EmployeeManager() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadEmployees() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error('Could not load employees');
      setEmployees(await response.json());
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadEmployees();
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

  function openEdit(employee) {
    setEditingId(employee.id);
    setForm({
      fullName: employee.fullName || '',
      email: employee.email || '',
      department: employee.department || '',
      jobTitle: employee.jobTitle || '',
      phone: employee.phone || ''
    });
    setShowForm(true);
    setMessage('');
  }

  async function saveEmployee(event) {
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
        throw new Error('Unable to save employee. Check the employee service.');
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      setMessage(editingId ? 'Employee updated successfully.' : 'Employee added successfully.');
      await loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteEmployee(id) {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to delete employee');
      setMessage('Employee deleted successfully.');
      setError('');
      await loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredEmployees = employees.filter(employee =>
    [
      employee.fullName,
      employee.email,
      employee.department,
      employee.jobTitle
    ].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="em">
      <div className="em-heading">
        <div>
          <h2>Employee Management</h2>
          <p>Manage your organization's employee records</p>
        </div>
        <button className="em-primary" onClick={openCreate}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {message && <div className="em-message">{message}</div>}
      {error && <div className="em-error">{error}</div>}

      {showForm && (
        <form className="em-form" onSubmit={saveEmployee}>
          <div className="em-form-heading">
            <h3>{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
            <button type="button" className="em-close" onClick={() => setShowForm(false)}>
              <X size={18} />
            </button>
          </div>

          <label>Full Name</label>
          <input name="fullName" value={form.fullName} onChange={updateField} required />

          <label>Email Address</label>
          <input name="email" type="email" value={form.email} onChange={updateField} required />

          <label>Department</label>
          <input name="department" value={form.department} onChange={updateField} required />

          <label>Job Title</label>
          <input name="jobTitle" value={form.jobTitle} onChange={updateField} required />

          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={updateField} />

          <button className="em-primary" type="submit">
            {editingId ? 'Update Employee' : 'Save Employee'}
          </button>
        </form>
      )}

      <div className="em-toolbar">
        <div className="em-search">
          <Search size={16} />
          <input
            placeholder="Search employees..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <button className="em-refresh" onClick={loadEmployees}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="em-table-wrap">
        <table className="em-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Email</th>
              <th>Department</th>
              <th>Job Title</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(employee => (
              <tr key={employee.id}>
                <td>#{employee.id}</td>
                <td><strong>{employee.fullName}</strong></td>
                <td>{employee.email}</td>
                <td>{employee.department}</td>
                <td>{employee.jobTitle}</td>
                <td>{employee.phone}</td>
                <td>
                  <div className="em-actions">
                    <button className="em-edit" onClick={() => openEdit(employee)} title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button className="em-delete" onClick={() => deleteEmployee(employee.id)} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredEmployees.length === 0 && (
              <tr><td colSpan="7" className="em-empty">No employees found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="em-count">Showing {filteredEmployees.length} of {employees.length} employees</p>
    </section>
  );
}
