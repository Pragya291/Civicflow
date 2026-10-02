import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  AlertTriangle,
  Clock,
  HardHat,
  CheckCircle2,
  Trash2,
  Building2,
  Eye,
  Filter,
  Search,
  X,
  RefreshCw,
  MapPin,
  Calendar,
  AlertCircle,
  Plus
} from 'lucide-react';
import { complaintService, adminService } from '../services/api';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function AdminDashboardPage({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    high_severity: 0,
    medium_severity: 0,
    low_severity: 0,
    department_stats: [],
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Modals & Action States
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [showAddDept, setShowAddDept] = useState(false);

  const [assignForm, setAssignForm] = useState({
    department_id: '',
    notes: 'Dispatched road repair crew for emergency pothole filling.'
  });

  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login?redirect=/admin');
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [complaintsRes, statsRes, deptRes] = await Promise.all([
        complaintService.getComplaints(),
        complaintService.getDashboardStats(),
        adminService.getDepartments()
      ]);

      setComplaints(complaintsRes.complaints || []);
      setStats(statsRes);
      setDepartments(deptRes.departments || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await adminService.updateStatus(complaintId, newStatus);
      loadDashboardData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleOpenAssignModal = (comp) => {
    setSelectedComplaint(comp);
    setAssignForm({
      department_id: comp.assigned_department_id || (departments[0]?.id || ''),
      notes: 'Dispatched road repair crew for emergency pothole filling.'
    });
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.department_id) {
      alert('Please select a department.');
      return;
    }
    try {
      await adminService.assignDepartment(
        selectedComplaint.id,
        assignForm.department_id,
        assignForm.notes
      );
      setAssignModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert('Failed to assign department.');
    }
  };

  const handleDeleteComplaint = async (id, refId) => {
    if (window.confirm(`Are you sure you want to permanently delete complaint ${refId}?`)) {
      try {
        await adminService.deleteComplaint(id);
        loadDashboardData();
      } catch (err) {
        alert('Failed to delete complaint.');
      }
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) return;
    try {
      await adminService.addDepartment(newDepartmentName.trim());
      setNewDepartmentName('');
      setShowAddDept(false);
      const res = await adminService.getDepartments();
      setDepartments(res.departments || []);
    } catch (err) {
      alert('Failed to create department: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const statusMatch = statusFilter === 'All' || c.status === statusFilter;
    const severityMatch = severityFilter === 'All' || c.severity === severityFilter;
    const searchMatch =
      !searchTerm ||
      c.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location_name.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && severityMatch && searchMatch;
  });

  // Chart Data: Status Doughnut
  const statusChartData = {
    labels: ['Pending', 'In Progress', 'Resolved'],
    datasets: [
      {
        data: [stats.pending || 0, stats.in_progress || 0, stats.resolved || 0],
        backgroundColor: ['#d97706', '#2563eb', '#16a34a'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Chart Data: Severity Bar
  const severityChartData = {
    labels: ['High Severity', 'Medium Severity', 'Low Severity'],
    datasets: [
      {
        label: 'Complaint Count',
        data: [stats.high_severity || 0, stats.medium_severity || 0, stats.low_severity || 0],
        backgroundColor: ['#dc2626', '#ea580c', '#0284c7'],
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>MBMC Pothole Governance Dashboard</h2>
          <p>Administrative review, department allocation, and status monitoring console.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadDashboardData} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Refresh Data
          </button>
          <button onClick={() => setShowAddDept(!showAddDept)} className="btn btn-outline btn-sm">
            <Plus size={15} /> Add Department
          </button>
        </div>
      </div>

      {/* Add Department Inline Form */}
      {showAddDept && (
        <div className="card" style={{ marginBottom: '1.5rem', background: '#f8fafc' }}>
          <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
            <form onSubmit={handleCreateDepartment} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Building2 size={20} style={{ color: 'var(--primary)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Enter new department name (e.g. Ward 5 Rapid Response Cell)"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary btn-sm">Create Department</button>
              <button type="button" onClick={() => setShowAddDept(false)} className="btn btn-secondary btn-sm">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* KPI Statistics Cards */}
      <div className="stats-grid" style={{ marginTop: 0, marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon total"><AlertTriangle /></div>
          <div className="stat-details">
            <h4>{stats.total}</h4>
            <p>Total Complaints</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending"><Clock /></div>
          <div className="stat-details">
            <h4>{stats.pending}</h4>
            <p>Pending Action</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon progress"><HardHat /></div>
          <div className="stat-details">
            <h4>{stats.in_progress}</h4>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon resolved"><CheckCircle2 /></div>
          <div className="stat-details">
            <h4>{stats.resolved}</h4>
            <p>Resolved</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon high"><AlertCircle /></div>
          <div className="stat-details">
            <h4>{stats.high_severity}</h4>
            <p>High Severity</p>
          </div>
        </div>
      </div>

      {/* Chart.js Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1.05rem' }}>Complaints by Status</h3>
          </div>
          <div className="card-body" style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1.05rem' }}>Complaints by Severity</h3>
          </div>
          <div className="card-body" style={{ height: '260px' }}>
            <Bar
              data={severityChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Table Toolbar & Search */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by Complaint ID, description, or landmark..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '380px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</label>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Severity:</label>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="All">All Severities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Complaints Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Location</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Assigned Department</th>
              <th>Reported Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No complaints match the current filter or search criteria.
                </td>
              </tr>
            ) : (
              filteredComplaints.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ color: 'var(--primary)' }}>{c.complaint_id}</strong>
                  </td>
                  <td>
                    {c.photo ? (
                      <img
                        src={`/uploads/${c.photo}`}
                        alt="pothole"
                        style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedComplaint(c);
                          setDetailModalOpen(true);
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>None</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.location_name}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      {c.description.length > 55 ? `${c.description.substring(0, 55)}...` : c.description}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-sev-${c.severity.toLowerCase()}`}>
                      {c.severity}
                    </span>
                  </td>
                  <td>
                    {/* Status Dropdown selector */}
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      className={`form-select badge-status-${c.status.toLowerCase().replace(' ', '-')}`}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-full)' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: c.assigned_department === 'Not Assigned' ? '#d97706' : '#1e40af' }}>
                      {c.assigned_department}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {c.created_at ? c.created_at.split(' ')[0] : ''}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setDetailModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        title="View Full Details"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        onClick={() => handleOpenAssignModal(c)}
                        className="btn btn-outline btn-sm"
                        title="Assign Department"
                      >
                        <Building2 size={14} /> Assign
                      </button>

                      <button
                        onClick={() => handleDeleteComplaint(c.id, c.complaint_id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#dc2626' }}
                        title="Delete Invalid Report"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Department Modal */}
      {assignModalOpen && selectedComplaint && (
        <div className="modal-backdrop" onClick={() => setAssignModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Assign Department & Work Order</h3>
              <button 
                onClick={() => setAssignModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <strong>Complaint ID:</strong> {selectedComplaint.complaint_id} <br />
                  <strong>Location:</strong> {selectedComplaint.location_name}
                </div>

                <div className="form-group">
                  <label className="form-label">Select Municipal Department *</label>
                  <select
                    required
                    className="form-select"
                    value={assignForm.department_id}
                    onChange={(e) => setAssignForm({ ...assignForm, department_id: e.target.value })}
                  >
                    <option value="">-- Choose Department --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.department_name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Action Work Order / Engineering Remark</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                    placeholder="Instructions for the road maintenance crew..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setAssignModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Detail Modal */}
      {detailModalOpen && selectedComplaint && (
        <div className="modal-backdrop" onClick={() => setDetailModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 className="card-title">{selectedComplaint.complaint_id}</h3>
                <span className={`badge badge-sev-${selectedComplaint.severity.toLowerCase()}`}>
                  {selectedComplaint.severity}
                </span>
                <span className={`badge badge-status-${selectedComplaint.status.toLowerCase().replace(' ', '-')}`}>
                  {selectedComplaint.status}
                </span>
              </div>
              <button 
                onClick={() => setDetailModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {selectedComplaint.photo && (
                <div style={{ marginBottom: '1.25rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '280px', background: '#0f172a' }}>
                  <img
                    src={`/uploads/${selectedComplaint.photo}`}
                    alt="Pothole"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description</h5>
                <p style={{ fontSize: '0.95rem', color: '#1e293b', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  {selectedComplaint.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem', marginBottom: '1rem' }}>
                <div>
                  <strong>Location:</strong> {selectedComplaint.location_name}
                </div>
                <div>
                  <strong>Coordinates:</strong> {selectedComplaint.latitude}, {selectedComplaint.longitude}
                </div>
                <div>
                  <strong>Reporter:</strong> {selectedComplaint.reporter_name}
                </div>
                <div>
                  <strong>Reporter Contact:</strong> {selectedComplaint.reporter_mobile || selectedComplaint.reporter_email || 'N/A'}
                </div>
                <div>
                  <strong>Department:</strong> {selectedComplaint.assigned_department}
                </div>
                <div>
                  <strong>Submitted:</strong> {selectedComplaint.created_at}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setDetailModalOpen(false)} className="btn btn-secondary">
                Close
              </button>
              <button 
                onClick={() => {
                  setDetailModalOpen(false);
                  handleOpenAssignModal(selectedComplaint);
                }} 
                className="btn btn-primary"
              >
                Assign Department
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
