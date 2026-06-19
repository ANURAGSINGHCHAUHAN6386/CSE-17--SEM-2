import React, { useState } from "react";

// Inline SVGs for StudentHub
const AcademicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.231-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M12 13.49v.01" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

export default function StudentHub({ students, setStudents }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    course: "B.Tech",
    marks: "",
    avatar: "🧑‍💻"
  });

  const [searchQuery, setSearchQuery] = useState("");

  const avatars = ["🧑‍💻", "👩‍💻", "👨‍🎓", "👩‍🎓", "🌟", "🚀", "🎨", "⚽"];

  // Password strength evaluation
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: "", color: "" };
    if (pass.length < 6) return { label: "Weak", color: "var(--danger)" };
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    
    if (hasLetters && hasNumbers && hasSpecial && pass.length >= 8) {
      return { label: "Strong", color: "var(--success)" };
    }
    return { label: "Moderate", color: "var(--accent-gold)" };
  };

  const strength = getPasswordStrength(formData.password);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) {
      alert("Please enter a valid student name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const numericMarks = parseInt(formData.marks);
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      alert("Marks must be a number between 0 and 100.");
      return;
    }

    // Add Student
    const newStudent = {
      id: "ST-" + Math.floor(1000 + Math.random() * 9000),
      name: formData.name,
      email: formData.email,
      course: formData.course,
      marks: numericMarks,
      avatar: formData.avatar,
      registeredDate: new Date().toLocaleDateString()
    };

    const updatedStudents = [newStudent, ...students];
    setStudents(updatedStudents);
    localStorage.setItem("nexus_hub_students", JSON.stringify(updatedStudents));

    // Reset Form
    setFormData({
      name: "",
      email: "",
      password: "",
      course: "B.Tech",
      marks: "",
      avatar: "🧑‍💻"
    });

    alert("Student registered successfully!");
  };

  const handleRemoveStudent = (studentId) => {
    if (window.confirm("Are you sure you want to remove this student record?")) {
      const updated = students.filter(s => s.id !== studentId);
      setStudents(updated);
      localStorage.setItem("nexus_hub_students", JSON.stringify(updated));
    }
  };

  // Performance grade
  const getPerformanceBadge = (marks) => {
    if (marks >= 90) return { text: "Outstanding", class: "badge-success" };
    if (marks >= 75) return { text: "Excellent", class: "badge-success" };
    if (marks >= 50) return { text: "Satisfactory", class: "badge-warning" };
    return { text: "Needs Focus", class: "badge-danger" };
  };

  // Filtering
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="student-hub fade-in" style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
      
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>Student Directory Portal</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Onboard new student entries and manage performance records dynamically.</p>
      </div>

      {/* Main Grid: Onboarding vs. Directory */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "2.5rem", alignItems: "start" }}>
        
        {/* Onboarding Form Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h3 style={{ fontSize: "1.25rem", textAlign: "center" }}>Student Onboarding</h3>
          
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column" }}>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                className="form-input" 
                placeholder="e.g. Anurag Chauhan" 
                value={formData.name} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Active Email</label>
              <input 
                type="email" 
                name="email" 
                required 
                className="form-input" 
                placeholder="e.g. student@abes.edu" 
                value={formData.email} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Portal Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                className="form-input" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={handleInputChange} 
              />
              {strength.label && (
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: strength.color, marginTop: "2px" }}>
                  Strength: {strength.label}
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Enrolled Course</label>
                <select name="course" className="form-select" value={formData.course} onChange={handleInputChange}>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Marks (%)</label>
                <input 
                  type="number" 
                  name="marks" 
                  min="0" 
                  max="100" 
                  required 
                  className="form-input" 
                  placeholder="0-100" 
                  value={formData.marks} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Profile Avatar</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                {avatars.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatar: av }))}
                    style={{
                      fontSize: "1.3rem",
                      padding: "0.5rem",
                      borderRadius: "8px",
                      border: "1px solid " + (formData.avatar === av ? "var(--primary)" : "var(--border-color)"),
                      backgroundColor: formData.avatar === av ? "var(--primary-glow)" : "var(--bg-secondary)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)"
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              Register Student
            </button>
          </form>
        </div>

        {/* Directory Listing Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Header Search Filter */}
          <div className="glass-card" style={{ padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <h3 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AcademicIcon /> Registered Student Directory ({filteredStudents.length})
            </h3>
            
            <div style={{ position: "relative", width: "260px" }}>
              <input 
                type="text" 
                placeholder="Search by name or course..." 
                className="form-input" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 1rem 0.5rem 2.25rem", fontSize: "0.85rem" }}
              />
              <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                <SearchIcon />
              </span>
            </div>
          </div>

          {/* Directory Cards Grid */}
          {filteredStudents.length === 0 ? (
            <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
              <h4 style={{ marginBottom: "0.5rem" }}>No records match your search</h4>
              <p style={{ color: "var(--text-muted)" }}>Try searching for a different course or name.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {filteredStudents.map((student) => {
                const badge = getPerformanceBadge(student.marks);
                return (
                  <div key={student.id} className="glass-card fade-in" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <span style={{ fontSize: "2.5rem", lineHeight: "1" }}>{student.avatar}</span>
                      <div style={{ flex: "1" }}>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{student.name}</h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>ID: {student.id}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveStudent(student.id)} 
                        style={{
                          background: "none", border: "none", color: "var(--danger)", 
                          fontSize: "1.15rem", cursor: "pointer", padding: "4px"
                        }}
                        title="Remove student"
                      >
                        &times;
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Course Enrolled:</span>
                        <span style={{ fontWeight: "700", color: "var(--text-heading)" }}>{student.course}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Academic Marks:</span>
                        <span style={{ fontWeight: "700" }}>{student.marks}%</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Email:</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>{student.email}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Join Date:</span>
                        <span>{student.registeredDate}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "center" }}>
                      <span className={`badge ${badge.class}`} style={{ width: "100%", textAlign: "center", display: "block" }}>
                        {badge.text}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
