import StatCard from "../components/StatCard";

export default function Dashboard({
  recentPatients,
  queueNumber,
  vitalsStatus,
  queueStatus,
  patient,
  patientErrors,
  onPatientChange,
  onRegisterPatient,
  onViewPatient,
  onRemovePatient
}) {
  return (
    <div className="page-content">
      {/* Overview Section */}
      <section className="card card-full">
        <h2>Dashboard Overview</h2>
        <div className="dashboard-stats">
          <StatCard number={recentPatients.length} label="Recent Patients" />
          <StatCard number={queueNumber} label="Current Queue" />
          <StatCard number={vitalsStatus} label="Last Vitals Status" statusClass={vitalsStatus} />
          <StatCard number={queueStatus} label="Queue Status" statusClass={queueStatus} />
        </div>
      </section>

      {/* Patient Registration Form */}
      <section className="card">
        <h2>Patient Registration Form</h2>
        <form onSubmit={onRegisterPatient}>
          <div className="form-group">
            <label>Patient ID *</label>
            <input 
              type="text" 
              value={patient.id} 
              onChange={(e) => onPatientChange("id", e.target.value)}
              placeholder="e.g., QC-1023" 
              className={patientErrors.id ? "input-error" : ""}
            />
            {patientErrors.id && <span className="error-message">{patientErrors.id}</span>}
          </div>
          {/* ... Add the rest of your Patient inputs (Name, Age, Sex, Contact) here exactly as they were, just swap handlePatientChange for onPatientChange ... */}
          <button type="submit" className="btn-submit primary">Register Patient</button>
        </form>
      </section>

      {/* Recent Patients List */}
      <section className="card">
        <h2>Recently Registered Patients</h2>
        {recentPatients.length > 0 ? (
          <div className="patient-list">
            {recentPatients.map((person) => (
              <div key={person.id} className="patient-item">
                <div className="patient-info">
                  <p className="patient-name">{person.name}</p>
                  <p className="patient-time">{person.registeredAt}</p>
                </div>
                <div className="patient-actions">
                  <button onClick={() => onViewPatient(person.id)} className="view-btn">View Details</button>
                  <button onClick={() => onRemovePatient(person.id)} className="remove-btn">Remove</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No patients registered yet</p>
        )}
      </section>
    </div>
  );
}