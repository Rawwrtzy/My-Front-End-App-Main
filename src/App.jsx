import { useState, useRef, useEffect } from "react";
import "./styles/style.css";

// 1. Reusable Components
import Header from "./components/header";
import Navbar from "./components/Navbar";
import NotificationSystem from "./components/NotificationSystem";

// 2. Page Views
import AuthScreen from "./pages/AuthScreen";
import Dashboard from "./pages/Dashboard";
import PatientMonitoring from "./pages/PatientMonitoring";
import QueueManagement from "./pages/QueueManagement";

function App() {
  // Counter for notification IDs to avoid impure Date.now()
  const notificationIdRef = useRef(0);

  // ========================
  // ROUTING & NAVIGATION STATE
  // ========================
  const [currentPage, setCurrentPage] = useState("dashboard"); // dashboard, patientMonitoring, queueManagement, settings, reports
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // -------------------------
  // AUTHENTICATION & USER STATE
  // -------------------------
  const [activeTab, setActiveTab] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // -------------------------
  // LOGIN FORM STATE (CONTROLLED COMPONENT)
  // -------------------------
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  const [loginErrors, setLoginErrors] = useState({});

  // -------------------------
  // SIGNUP FORM STATE (CONTROLLED COMPONENT)
  // -------------------------
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [signupErrors, setSignupErrors] = useState({});

  // -------------------------
  // UI STATE
  // -------------------------
  const [notifications, setNotifications] = useState([]);

  // -------------------------
  // PATIENT REGISTRATION STATE
  // -------------------------
  const [patient, setPatient] = useState({
    id: "",
    name: "",
    age: "",
    sex: "Male",
    contact: ""
  });
  const [patientErrors, setPatientErrors] = useState({});

  // -------------------------
  // VITALS STATE
  // -------------------------
  const [vitals, setVitals] = useState({
    temperature: 36.8,
    bloodPressure: "120/80",
    pulseRate: 72,
    weight: 65,
    height: 170,
    status: "Normal" // System status based on vitals
  });
  const [vitalErrors, setVitalErrors] = useState({});

  // -------------------------
  // QUEUE MANAGEMENT STATE
  // -------------------------
  const [queueNumber, setQueueNumber] = useState(15);
  const [queueStatus, setQueueStatus] = useState("InxActive"); // Active or Closed

  // -------------------------
  // RECENT PATIENTS STATE
  // -------------------------
  const [recentPatients, setRecentPatients] = useState([]);

  // -------------------------
  // SYSTEM SETTINGS STATE
  // -------------------------
  const [systemSettings, setSystemSettings] = useState({
    darkMode: false,
    soundNotifications: true,
    maxQueueSize: 50,
    workingHours: "08:00-17:00",
    clinicName: "QuickCare Clinic",
    notificationSound: "enabled"
  });
  const [settingsErrors, setSettingsErrors] = useState({});

  // -------------------------
  // DEVICES & SENSORS STATE
  // -------------------------
  const [devices, setDevices] = useState([
    { id: 1, name: "Temperature Sensor A", type: "Temperature", location: "Room 1", status: "online", lastUpdate: "2:30 PM" },
    { id: 2, name: "Blood Pressure Monitor", type: "BP Monitor", location: "Room 2", status: "online", lastUpdate: "2:28 PM" },
    { id: 3, name: "Pulse Oximeter", type: "Oxygen", location: "Room 3", status: "offline", lastUpdate: "1:45 PM" },
    { id: 4, name: "Weight Scale", type: "Scale", location: "Waiting Area", status: "online", lastUpdate: "2:25 PM" }
  ]);

  // -------------------------
  // USER MANAGEMENT STATE
  // -------------------------
  const [pendingUsers, setPendingUsers] = useState([
    { id: 1, name: "Dr. Sarah Johnson", email: "sarah.johnson@clinic.com", role: "Doctor", requestedAt: "2:15 PM", status: "pending" },
    { id: 2, name: "Nurse Maria Gonzales", email: "maria.gonzales@clinic.com", role: "Nurse", requestedAt: "1:50 PM", status: "pending" },
    { id: 3, name: "Admin Tech Support", email: "tech.support@clinic.com", role: "Admin", requestedAt: "1:20 PM", status: "pending" }
  ]);
  const [approvedUsers, setApprovedUsers] = useState([
    { id: 101, name: currentUser?.name || "Admin User", email: "admin@clinic.com", role: "Admin", approvedAt: "Today" }
  ]);

  // -------------------------
  // THRESHOLDS & ALERTS STATE
  // -------------------------
  const [thresholds, setThresholds] = useState({
    temperature: { min: 36, max: 38 },
    pulseRate: { min: 60, max: 100 },
    bloodPressureSystolic: { min: 90, max: 140 },
    bloodPressureDiastolic: { min: 60, max: 90 },
    weight: { min: 40, max: 150 },
    deviceUptimeWarning: 95 // Alert if device uptime falls below this percentage
  });

  const [alertHistory, setAlertHistory] = useState([
    { id: 1, type: "vital", severity: "warning", message: "High pulse rate detected (115 bpm)", timestamp: "2:30 PM", resolved: false },
    { id: 2, type: "device", severity: "info", message: "Pulse Oximeter offline", timestamp: "1:45 PM", resolved: true },
    { id: 3, type: "vital", severity: "normal", message: "Temperature reading normal", timestamp: "12:10 PM", resolved: true }
  ]);

  // -------------------------
  // VITAL READINGS HISTORY (FOR GRAPHS)
  // -------------------------
  const [vitalReadingsHistory, setVitalReadingsHistory] = useState({
    daily: [
      { time: "08:00", temp: 36.5, pulse: 68, bp: "118/76" },
      { time: "10:00", temp: 36.8, pulse: 72, bp: "120/80" },
      { time: "12:00", temp: 37.2, pulse: 75, bp: "122/82" },
      { time: "14:00", temp: 37.0, pulse: 70, bp: "119/79" },
      { time: "16:00", temp: 36.9, pulse: 73, bp: "121/80" }
    ],
    weekly: [
      { day: "Mon", avgTemp: 36.8, avgPulse: 72, avgBP: "120/80" },
      { day: "Tue", avgTemp: 36.9, avgPulse: 73, avgBP: "121/81" },
      { day: "Wed", avgTemp: 37.0, avgPulse: 75, avgBP: "122/82" },
      { day: "Thu", avgTemp: 36.7, avgPulse: 70, avgBP: "119/78" },
      { day: "Fri", avgTemp: 36.8, avgPulse: 71, avgBP: "120/79" },
      { day: "Sat", avgTemp: 36.6, avgPulse: 69, avgBP: "118/77" },
      { day: "Sun", avgTemp: 36.9, avgPulse: 72, avgBP: "121/80" }
    ],
    monthly: [
      { week: "Week 1", avgTemp: 36.8, avgPulse: 72, avgBP: "120/80" },
      { week: "Week 2", avgTemp: 36.9, avgPulse: 73, avgBP: "121/81" },
      { week: "Week 3", avgTemp: 37.0, avgPulse: 74, avgBP: "122/82" },
      { week: "Week 4", avgTemp: 36.8, avgPulse: 72, avgBP: "120/80" }
    ]
  });

  // -------------------------
  // DEVICE UPTIME TRACKING
  // -------------------------
  const [deviceUptimeMetrics, setDeviceUptimeMetrics] = useState({
    daily: { "Temperature Sensor A": 99.8, "Blood Pressure Monitor": 99.5, "Pulse Oximeter": 85.2, "Weight Scale": 100 },
    weekly: { "Temperature Sensor A": 98.5, "Blood Pressure Monitor": 96.8, "Pulse Oximeter": 80.3, "Weight Scale": 99.2 },
    monthly: { "Temperature Sensor A": 97.2, "Blood Pressure Monitor": 95.5, "Pulse Oximeter": 78.6, "Weight Scale": 98.8 }
  });

  // -------------------------
  // REPORT PERIOD STATE
  // -------------------------
  const [reportPeriod, setReportPeriod] = useState("daily"); // daily, weekly, monthly
  // ========================
  // BACKEND INTEGRATION 
  // ========================
  
  // Replace with your actual token from HTTPie
  const API_TOKEN = authToken;
  const API_URL = "http://127.0.0.1:8000/api";

  const refreshAutoId = () => {
    fetch(`${API_URL}/patients/`, {
      headers: { "Authorization": `Token ${authToken}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        const highestId = Math.max(...data.map(p => parseInt(p.patient_id.replace(/\D/g, '')) || 0));
        setPatient(prev => ({ ...prev, id: `QC-${highestId + 1}` }));
      } else {
        setPatient(prev => ({ ...prev, id: `QC-1001` }));
      }
    });
  };

  // Fetch patients when the dashboard loads

  useEffect(() => {
    if (isAuthenticated) {
      fetch(`${API_URL}/patients/`, {
        headers: {
          "Authorization": `Token ${API_TOKEN}`,
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(data => {
          // Format Django data, making sure to grab all fields for the View Details button
          
          const formattedPatients = data.map(p => ({
            id: p.patient_id,
            name: p.name,
            age: p.age,
            sex: p.sex,
            contact: p.contact,
            registeredAt: p.registered_at
              ? new Date(p.registered_at).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
              })
              : "Date unknown"
          }));
          setRecentPatients(formattedPatients);

          // Calculate the next ID based on the database
        // --- COPY AND PASTE THIS EXACTLY HERE ---
        // --- PUT THIS RIGHT AFTER setRecentPatients(formattedPatients); ---
        if (data.length > 0) {
          // Extracts numbers from "QC-XXXX", ignores bad data, finds the highest, adds 1
          const highestId = Math.max(...data.map(p => {
            const num = parseInt(p.patient_id.replace(/\D/g, ''));
            return isNaN(num) ? 0 : num;
          }));
          
          setPatient(prev => ({ ...prev, id: `QC-${highestId + 1}` }));
        } else {
          setPatient(prev => ({ ...prev, id: `QC-1001` }));
        }
        // ----------------------------------------
        })
        .catch(err => console.error("Error fetching patients:", err));
    }
  }, [isAuthenticated]); // Only run when the user logs in
  // ========================
  // FORM VALIDATION FUNCTIONS
  // ========================
  useEffect(() => {
  if (isAuthenticated && currentPage === "users") {
    fetch(`${API_URL}/users/`, {
      headers: { 
        "Authorization": `Token ${API_TOKEN}`,
        "Content-Type": "application/json"
      }
    })
    .then(res => res.json())
    .then(data => {
      const mapped = data.map(u => ({
        id: u.id,
        name: u.first_name || u.last_name 
          ? `${u.first_name || ''} ${u.last_name || ''}`.trim() 
          : u.username,
        email: u.email,
        // isStaff and isActive are the key permissions from Django
        isStaff: u.is_staff, 
        isActive: u.is_active,
        requestedAt: new Date(u.date_joined).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      // Filter based on the 'isActive' boolean (is_active in Django)
      setPendingUsers(mapped.filter(u => !u.isActive));
      setApprovedUsers(mapped.filter(u => u.isActive));
    })
    .catch(err => console.error("User fetch error:", err));
  }
}, [isAuthenticated, currentPage]); // Re-runs when you switch to the Users tab

  // Validate login form
  const validateLoginForm = () => {
    const errors = {};
    if (!loginForm.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      errors.email = "Email is invalid";
    }
    if (!loginForm.password) {
      errors.password = "Password is required";
    } else if (loginForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    return errors;
  };

  // Validate signup form
  const validateSignupForm = () => {
    const errors = {};
    if (!signupForm.fullName) {
      errors.fullName = "Full name is required";
    } else if (signupForm.fullName.length < 3) {
      errors.fullName = "Full name must be at least 3 characters";
    }
    if (!signupForm.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signupForm.email)) {
      errors.email = "Email is invalid";
    }
    if (!signupForm.password) {
      errors.password = "Password is required";
    } else if (signupForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  // Validate patient form
  // Validate patient form (Upgraded with Strict Formatting)
  const validatePatientForm = () => {
    const errors = {};
    
    // ID Check
    if (!patient.id) {
      errors.id = "Patient ID is required";
    }

    // Name Check: Only letters, spaces, and standard name punctuation
    if (!patient.name.trim()) {
      errors.name = "Name is required";
    } else if (!/^[a-zA-Z\s.,'-]+$/.test(patient.name)) {
      errors.name = "Name can only contain letters and spaces";
    }

    // Age Check: Must be a realistic number
    const ageNum = parseInt(patient.age);
    if (patient.age === "" || isNaN(ageNum)) {
      errors.age = "Age is required";
    } else if (ageNum < 0 || ageNum > 150) {
      errors.age = "Please enter a valid age (0-150)";
    }

    // Contact Check: Exactly 11 digits starting with 09
    if (!patient.contact) {
      errors.contact = "Contact is required";
    } else if (!/^09\d{9}$/.test(patient.contact.replace(/\s/g, ''))) {
      errors.contact = "Must be 11 digits starting with 09 (e.g., 09123456789)";
    }

    return errors;
  };

  // Validate vitals form
  const validateVitalsForm = () => {
    const errors = {};
    if (vitals.temperature < 35 || vitals.temperature > 42) {
      errors.temperature = "Temperature must be between 35°C and 42°C";
    }
    if (vitals.pulseRate < 40 || vitals.pulseRate > 200) {
      errors.pulseRate = "Pulse rate must be between 40 and 200 bpm";
    }
    if (vitals.weight < 5 || vitals.weight > 300) {
      errors.weight = "Weight must be between 5 and 300 kg";
    }
    if (vitals.height < 50 || vitals.height > 250) {
      errors.height = "Height must be between 50 and 250 cm";
    }
    return errors;
  };

  // ========================
  // STATE UPDATE HANDLERS
  // ========================

  // Handle login form changes
  const handleLoginFormChange = (field, value) => {
    setLoginForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (loginErrors[field]) {
      setLoginErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Handle login form submission
  // The REAL Authentication Function
const handleLoginSubmit = (e) => {
    e.preventDefault();
    const errors = validateLoginForm();
    
    if (Object.keys(errors).length === 0) {
      
      fetch("http://127.0.0.1:8000/api-token-auth/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // MANDATORY: Django's default auth expects the key to be "username"
          username: loginForm.email, 
          password: loginForm.password
        })
      })
      .then(response => {
        if (!response.ok) throw new Error("Invalid credentials");
        return response.json();
      })
      .then(data => {
        setAuthToken(data.token); //[cite: 2]
        setIsAuthenticated(true); //
        setCurrentUser({ name: loginForm.email, role: "Admin" });
        setCurrentPage("dashboard");
        addNotification("Welcome back to QuickCare!");
      })
      .catch(error => {
        console.error("Login Error:", error);
        setLoginErrors({ email: "Invalid username or password" });
        addNotification("Login failed. Check your credentials.");
      });
    }
  };

  // Handle signup form changes
  const handleSignupFormChange = (field, value) => {
    setSignupForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (signupErrors[field]) {
      setSignupErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Handle signup form submission
  // Handle signup form submission (REAL DJANGO REGISTRATION)
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    const errors = validateSignupForm();
    
    if (Object.keys(errors).length === 0) {
      
      // 1. Send the new account data to Django
      fetch("http://127.0.0.1:8000/api/register/", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // Django's default User model requires a 'username'. 
          // We will use the email as the username to keep it simple.
          username: signupForm.email, 
          email: signupForm.email,
          password: signupForm.password,
          first_name: signupForm.fullName // Save their name here
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Registration failed. Email might be taken.");
        }
        return response.json();
      })
      .then(data => {
        // 2. SUCCESS! The account is saved in the database.
        addNotification("Account created successfully! Please log in.");
        
        // Clear the form
        setSignupForm({ fullName: "", email: "", password: "", confirmPassword: "" });
        setSignupErrors({});
        
        // 3. Automatically switch the UI to the Login tab
        setActiveTab("login"); 
      })
      .catch(error => {
        console.error("Signup Error:", error);
        setSignupErrors({ email: "Registration failed. This email may already exist." });
        addNotification("Could not create account. Please try again.");
      });

    } else {
      setSignupErrors(errors);
      addNotification("Please fix the errors in the form");
    }
  };

  // Handle patient data updates
  const handlePatientChange = (field, value) => {
    setPatient(prev => ({
      ...prev,
      [field]: field === "age" ? parseInt(value) || "" : value
    }));
    // Clear error when user modifies field
    if (patientErrors[field]) {
      setPatientErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Handle vitals updates and recalculate status
  const handleVitalsChange = (field, value) => {
    const numValue = field === "bloodPressure" ? value : parseFloat(value) || "";
    
    const newVitals = {
      ...vitals,
      [field]: numValue
    };
    
    // Update system status based on vitals if they're valid
    if (typeof numValue === "number") {
      const status = calculateVitalStatus(newVitals);
      newVitals.status = status;
    }
    
    setVitals(newVitals);
    
    // Clear error when user modifies field
    if (vitalErrors[field]) {
      setVitalErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Calculate system status based on vital readings
  const calculateVitalStatus = (vitalData) => {
    const temp = vitalData.temperature;
    const pulse = vitalData.pulseRate;
    
    if (temp < 36 || temp > 38 || pulse < 60 || pulse > 100) {
      return "Warning";
    }
    return "Normal";
  };

  // Queue management - Call next patient
  const handleCallNextPatient = () => {
    if (queueNumber < systemSettings.maxQueueSize && queueStatus === "Active") {
      setQueueNumber(prev => prev + 1);
      addNotification(`Calling Queue ${queueNumber + 1}`);
    } else if (queueNumber >= systemSettings.maxQueueSize) {
      addNotification("Queue limit reached");
    }
  };

  // Register new patient and add to recent list
  // Register new patient via API
  // Register new patient via API
  // =========================================================================
  // 🚀 Register new patient via Django API (Task 4 & 7: Send Data)
  // =========================================================================
  // Register new patient via Django API (Upgraded with Duplicate Check)
  const handleRegisterPatient = (e) => {
    e.preventDefault();
    const errors = validatePatientForm();
    
    // Check for duplicate patient (Same exact name AND contact)
    const isDuplicate = recentPatients.some(
      p => p.name.toLowerCase().trim() === patient.name.toLowerCase().trim() && 
           p.contact === patient.contact
    );

    if (isDuplicate) {
      addNotification("Error: This patient is already registered!");
      setPatientErrors({ name: "Duplicate entry", contact: "Duplicate entry" });
      return; // Stop the submission immediately
    }

    if (Object.keys(errors).length === 0) {
      // 1. Send data to Django
      fetch(`${API_URL}/patients/`, {
        method: "POST", 
        headers: {
          "Authorization": `Token ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          patient_id: patient.id,
          name: patient.name,
          age: parseInt(patient.age),
          sex: patient.sex || "Male",
          contact: patient.contact
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Backend rejected the save.");
        }
        return response.json();
      })
      .then(savedPatient => {
        // 2. Success! Update the UI with the form data
        const newPatient = {
          id: patient.id,
          name: patient.name, 
          age: patient.age,
          sex: patient.sex,
          contact: patient.contact,
          registeredAt: new Date().toLocaleTimeString()
        };
        
        setRecentPatients(prev => [newPatient, ...prev]);
        addNotification(`Patient ${patient.name} registered securely!`); 
        setPatientErrors({}); // Keep this line that you already have
        
        // --- COPY AND PASTE THIS EXACTLY BELOW IT ---
        // --- PUT THIS RIGHT AFTER setPatientErrors({}); ---
        setPatient(prev => {
          // Takes the ID that was JUST saved, extracts the number, and adds 1
          const currentIdNum = parseInt(prev.id.replace(/\D/g, ''));
          const nextId = `QC-${(isNaN(currentIdNum) ? 1000 : currentIdNum) + 1}`;
          
          return {
            id: nextId, 
            name: "", 
            age: "", 
            sex: "Male", 
            contact: ""
          };
        });
        // --------------------------------------------
      })
      .catch(error => {
        console.error(error);
        addNotification("Error connecting to backend database!"); 
      });

    } else {
      setPatientErrors(errors);
      addNotification("Please fix the highlighted errors");
    }
  };

  // Handle vitals form submission
  // Handle vitals form submission (SEND TO DJANGO)
  const handleVitalsSubmit = (e) => {
    e.preventDefault(); 
    const errors = validateVitalsForm();
    
    // We cannot save vitals if we don't know WHICH patient they belong to!
    if (!selectedPatientId) {
      addNotification("Error: No patient selected!");
      return;
    }

    if (Object.keys(errors).length === 0) {
      
      // Send the vitals to Django
      fetch(`${API_URL}/vitals/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${authToken}`, // Secure access
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // Make sure these keys match your Django VitalSign models.py exact field names!
          patient: selectedPatientId, 
          temperature: vitals.temperature,
          blood_pressure: vitals.bloodPressure, // Usually snake_case in Django
          pulse_rate: vitals.pulseRate,
          weight: vitals.weight,
          height: vitals.height,
          status: vitals.status
        })
      })
      .then(response => {
        if (!response.ok) throw new Error("Failed to save vitals");
        return response.json();
      })
      .then(data => {
        addNotification(`Vitals securely recorded - Status: ${vitals.status}`);
        setVitalErrors({});
        // Optional: You could fetch the updated vitals history here
      })
      .catch(error => {
        console.error("Vitals Error:", error);
        addNotification("Database error: Could not save vitals.");
      });

    } else {
      setVitalErrors(errors);
      addNotification("Please fix the vital values");
    }
  };

  // Remove patient from recent list
  const handleRemovePatient = (patientId) => {
    // 1. Ask for confirmation so users don't delete by accident
    if (window.confirm(`Are you sure you want to delete patient ${patientId}?`)) {
      
      // 2. Send the DELETE request to Django
      fetch(`${API_URL}/patients/${patientId}/delete/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Token ${authToken}`,
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        if (!response.ok) throw new Error("Failed to delete from database");
        
        // 3. If backend success, remove from the React state (the UI)
        setRecentPatients(prev => prev.filter(p => p.id !== patientId));
        addNotification("Patient deleted from database.");

        // 4. Recalculate the Auto-ID immediately
        // This ensures the next registration uses a fresh ID
        refreshAutoId(); 
      })
      .catch(error => {
        console.error("Delete error:", error);
        addNotification("Error: Could not delete from server.");
      });
    }
  };
  // Toggle queue status
  const handleToggleQueueStatus = () => {
    const newStatus = queueStatus === "Active" ? "Closed" : "Active";
    setQueueStatus(newStatus);
    addNotification(`Queue status changed to: ${newStatus}`);
  };

  // Handle settings form changes
  const handleSettingsChange = (field, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: field === "maxQueueSize" ? parseInt(value) : value
    }));
    // Clear error when user modifies field
    if (settingsErrors[field]) {
      setSettingsErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Validate and submit settings
  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    
    if (!systemSettings.clinicName) {
      errors.clinicName = "Clinic name is required";
    }
    if (!systemSettings.workingHours) {
      errors.workingHours = "Working hours are required";
    }
    if (systemSettings.maxQueueSize < 5 || systemSettings.maxQueueSize > 100) {
      errors.maxQueueSize = "Queue size must be between 5 and 100";
    }
    
    if (Object.keys(errors).length === 0) {
      addNotification("Settings saved successfully!");
      setSettingsErrors({});
    } else {
      setSettingsErrors(errors);
      addNotification("Please fix the settings errors");
    }
  };

  // Toggle boolean settings
  const handleToggleSetting = (setting) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Add notification to list
  const addNotification = (message) => {
    const id = ++notificationIdRef.current;
    setNotifications(prev => [...prev, { id, message }]);
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Handle authentication
  const handleLogin = (fullName) => {
    setCurrentUser({ name: fullName, role: "Admin", loginTime: new Date().toLocaleTimeString() });
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
    addNotification(`Welcome, ${fullName}!`);
  };

  // ========================
  // USER MANAGEMENT HANDLERS
  // ========================

  // Accept pending user
  // APPROVE: Tells Django to set is_active to true
// APPROVE: Access granted, moves user to "Approved Users" list
const handleAcceptUser = (userId) => {
  fetch(`${API_URL}/users/${userId}/approve/`, {
    method: "PATCH",
    headers: {
      "Authorization": `Token ${API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ is_active: true })
  })
  .then(res => {
    if (!res.ok) throw new Error("Approval failed");
    addNotification("User approved and granted access.");
    // This will trigger the useEffect to re-fetch and move the user to Approved
    setCurrentPage("users"); 
  })
  .catch(() => addNotification("Error approving user."));
};

// DECLINE & REMOVE: Both delete the user from the database
const handleRemoveUser = (userId, type = "request") => {
  const message = type === "request" 
    ? "Are you sure you want to decline this request?" 
    : "Are you sure you want to remove this approved user?";

  if (window.confirm(message)) {
    fetch(`${API_URL}/users/${userId}/`, {
      method: "DELETE",
      headers: { "Authorization": `Token ${API_TOKEN}` }
    })
    .then(res => {
      if (!res.ok) throw new Error("Delete failed");
      addNotification(type === "request" ? "Request declined." : "User removed.");
      setCurrentPage("users");
    })
    .catch(() => addNotification("Error deleting user."));
  }
};

  // Remove approved user
  const handleRemoveApprovedUser = (userId) => {
    const user = approvedUsers.find(u => u.id === userId);
    if (user) {
      setApprovedUsers(prev => prev.filter(u => u.id !== userId));
      addNotification(`User ${user.name} has been removed`);
    }
  };

  // ========================
  // THRESHOLD & ALERT HANDLERS
  // ========================

  // Update thresholds
  const handleUpdateThreshold = (field, minOrMax, value) => {
    setThresholds(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [minOrMax]: parseFloat(value)
      }
    }));
  };

  // Save thresholds
  const handleSaveThresholds = () => {
    addNotification("Thresholds updated successfully!");
  };

  // Check vital against threshold and create alert
  const checkVitalThreshold = (vital, value, threshold) => {
    if (value < threshold.min) {
      return { exceeded: true, type: "low", severity: "warning" };
    }
    if (value > threshold.max) {
      return { exceeded: true, type: "high", severity: "warning" };
    }
    return { exceeded: false, type: "normal", severity: "normal" };
  };

  // Resolve alert
  const handleResolveAlert = (alertId) => {
    setAlertHistory(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    addNotification("Alert resolved");
  };

  // Clear all alerts
  const handleClearAllAlerts = () => {
    setAlertHistory(prev => prev.map(alert => ({ ...alert, resolved: true })));
    addNotification("All alerts marked as resolved");
  };

  // ========================
  // NAVIGATION HANDLERS
  // ========================

  // Navigate to a specific page
  const handleNavigate = (page) => {
    setCurrentPage(page);
    addNotification(`Navigated to ${page.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
  };

  // Navigate to patient monitoring with selected patient
  // Navigate to the Patient page and display the data
  // Navigate to the Patient page and display the data
const handleViewPatient = (patientId) => {
  // 1. We still find the patient if you need to log it or use it for logic
  const selected = recentPatients.find(p => p.id === patientId);

  if (selected) {
    // 2. ONLY set the ID for the View/Monitoring page
    // This tells the "Patients" tab which person to display
    setSelectedPatientId(patientId);

    // 3. Switch the UI to the Patients tab
    setCurrentPage("patientMonitoring");

    setPatient(prev => ({
      id: prev.id, // Keep the current ID (or auto-ID) intact
      name: "",
      age: "",
      sex: "Male",
      contact: ""
    }));

    // ⚠️ CRITICAL: Ensure you do NOT have a line like: setPatient(selected);
    // Removing that line is what keeps the Registration Form empty.
  }
    
    if (selected) {
      // 1. Pass the data to the state so the details screen can display it
      setPatient({
        id: selected.id,
        name: selected.name,
        age: selected.age || "", 
        sex: selected.sex || "Male",
        contact: selected.contact || ""
      });
      
      // 2. Tell the system WHICH patient is actively being viewed
      setSelectedPatientId(patientId);
      
      // 3. Switch the tab to the "Patients" (monitoring) screen
      setCurrentPage("patientMonitoring");
      
      addNotification(`Viewing details for ${selected.name}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    setCurrentPage("dashboard");
    setSelectedPatientId(null);
  };

  // Get selected patient data
  const getSelectedPatient = () => {
    if (!selectedPatientId) return null;
    return recentPatients.find(p => p.id === selectedPatientId);
  };

  return (
    <>
      <Header />

      {!isAuthenticated ? (
        // -------------------------
        // LOGIN / SIGNUP SCREEN
        // -------------------------
        <div className="auth-container">

          <div className="auth-tabs">
            <button 
              className={activeTab === "login" ? "active" : ""} 
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button 
              className={activeTab === "signup" ? "active" : ""} 
              onClick={() => setActiveTab("signup")}
            >
              Signup
            </button>
          </div>

          {activeTab === "login" && (
            <form className="auth-box" onSubmit={handleLoginSubmit}>
              <h2>Admin Login</h2>
              
              <div className="form-group">
                <input 
                  type="email" 
                  placeholder="Email"
                  value={loginForm.email}
                  onChange={(e) => handleLoginFormChange("email", e.target.value)}
                  className={loginErrors.email ? "input-error" : ""}
                />
                {loginErrors.email && <span className="error-message">{loginErrors.email}</span>}
              </div>
              
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => handleLoginFormChange("password", e.target.value)}
                  className={loginErrors.password ? "input-error" : ""}
                />
                {loginErrors.password && <span className="error-message">{loginErrors.password}</span>}
              </div>
              
              <button type="submit" className="btn-submit">
                Login
              </button>
            </form>
          )}

          {activeTab === "signup" && (
            <form className="auth-box" onSubmit={handleSignupSubmit}>
              <h2>Create Admin Account</h2>
              
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Full Name"
                  value={signupForm.fullName}
                  onChange={(e) => handleSignupFormChange("fullName", e.target.value)}
                  className={signupErrors.fullName ? "input-error" : ""}
                />
                {signupErrors.fullName && <span className="error-message">{signupErrors.fullName}</span>}
              </div>
              
              <div className="form-group">
                <input 
                  type="email" 
                  placeholder="Email"
                  value={signupForm.email}
                  onChange={(e) => handleSignupFormChange("email", e.target.value)}
                  className={signupErrors.email ? "input-error" : ""}
                />
                {signupErrors.email && <span className="error-message">{signupErrors.email}</span>}
              </div>
              
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Password"
                  value={signupForm.password}
                  onChange={(e) => handleSignupFormChange("password", e.target.value)}
                  className={signupErrors.password ? "input-error" : ""}
                />
                {signupErrors.password && <span className="error-message">{signupErrors.password}</span>}
              </div>
              
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Confirm Password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => handleSignupFormChange("confirmPassword", e.target.value)}
                  className={signupErrors.confirmPassword ? "input-error" : ""}
                />
                {signupErrors.confirmPassword && <span className="error-message">{signupErrors.confirmPassword}</span>}
              </div>
              
              <button type="submit" className="btn-submit">
                Signup
              </button>
            </form>
          )}

        </div>

      ) : (
        // ========================
        // AUTHENTICATED DASHBOARD WITH NAVIGATION
        // ========================
        <div className="dashboard-wrapper">

          {/* NAVIGATION NAVBAR */}
          <nav className="navbar">
            <div className="nav-items">
              <button 
                className={`nav-link ${currentPage === "dashboard" ? "active" : ""}`}
                onClick={() => handleNavigate("dashboard")}
              >
                Dashboard
              </button>
              <button 
                className={`nav-link ${currentPage === "patientMonitoring" ? "active" : ""}`}
                onClick={() => handleNavigate("patientMonitoring")}
              >
                Patients
              </button>
              <button 
                className={`nav-link ${currentPage === "queueManagement" ? "active" : ""}`}
                onClick={() => handleNavigate("queueManagement")}
              >
                Queue
              </button>
              <button 
                className={`nav-link ${currentPage === "reports" ? "active" : ""}`}
                onClick={() => handleNavigate("reports")}
              >
                Reports
              </button>
              <button 
                className={`nav-link ${currentPage === "devices" ? "active" : ""}`}
                onClick={() => handleNavigate("devices")}
              >
                Devices
              </button>
              <button 
                className={`nav-link ${currentPage === "users" ? "active" : ""}`}
                onClick={() => handleNavigate("users")}
              >
                Users
              </button>
              <button 
                className={`nav-link ${currentPage === "settings" ? "active" : ""}`}
                onClick={() => handleNavigate("settings")}
              >
                Settings
              </button>
            </div>

            <div className="navbar-right">
              <div className="user-section">
                <span className="user-name">{currentUser?.name}</span>
                <span className="user-role">{currentUser?.role}</span>
              </div>
              <button 
                className="logout-btn-nav"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsAuthenticated(false); 
                  setCurrentUser(null);
                  setCurrentPage("dashboard");
                  addNotification("Signed out successfully");
                }}
              >
                Sign Out
              </button>
            </div>
          </nav>

          {/* SIDEBAR NAVIGATION */}
          <aside style={{display: 'none'}}></aside>

          {/* MAIN CONTENT AREA */}
          <main className="dashboard-content">

            {/* Notifications */}
            <div className="notifications-container">
              {notifications.map((notif) => (
                <div key={notif.id} className="notification">
                  {notif.message}
                </div>
              ))}
            </div>

            {/* ============================== */}
            {/* PAGE: DASHBOARD */}
            {/* ============================== */}
            {currentPage === "dashboard" && (
              <div className="page-content">
                <section className="card card-full">
                  <h2>Dashboard Overview</h2>
                  <div className="dashboard-stats">
                    <div className="stat-card">
                      <div className="stat-number">{recentPatients.length}</div>
                      <div className="stat-label">Recent Patients</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{queueNumber}</div>
                      <div className="stat-label">Current Queue</div>
                    </div>
                    <div className="stat-card">
                      <div className={`stat-number ${vitals.status.toLowerCase()}`}>{vitals.status}</div>
                      <div className="stat-label">Last Vitals Status</div>
                    </div>
                    <div className="stat-card">
                      <div className={`stat-number ${queueStatus.toLowerCase()}`}>{queueStatus}</div>
                      <div className="stat-label">Queue Status</div>
                    </div>
                  </div>
                </section>

                {/* Patient Registration Form */}
                <section className="card">
                  <h2>Patient Registration Form</h2>
                  <form onSubmit={handleRegisterPatient}>
                    <div className="form-group">
                      <label>Patient ID *</label>
                      <input 
                        type="text" 
                        value={patient.id || "Loading..."} 
                        disabled 
                        style={{ backgroundColor: "#e9ecef", color: "#6c757d", cursor: "not-allowed", fontWeight: "bold" }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Full Name *</label>
                      <input 
                        type="text" 
                        value={patient.name} 
                        onChange={(e) => handlePatientChange("name", e.target.value)}
                        placeholder="Enter patient name" 
                        className={patientErrors.name ? "input-error" : ""}
                      />
                      {patientErrors.name && <span className="error-message">{patientErrors.name}</span>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Age *</label>
                        <input 
                          type="number" 
                          value={patient.age} 
                          onChange={(e) => handlePatientChange("age", e.target.value)}
                          placeholder="Age" 
                          className={patientErrors.age ? "input-error" : ""}
                        />
                        {patientErrors.age && <span className="error-message">{patientErrors.age}</span>}
                      </div>

                      <div className="form-group">
                        <label>Sex *</label>
                        <select 
                          value={patient.sex} 
                          onChange={(e) => handlePatientChange("sex", e.target.value)}
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Contact Number *</label>
                      <input 
                        type="tel" 
                        value={patient.contact} 
                        onChange={(e) => handlePatientChange("contact", e.target.value)}
                        placeholder="09123456789" 
                        className={patientErrors.contact ? "input-error" : ""}
                      />
                      {patientErrors.contact && <span className="error-message">{patientErrors.contact}</span>}
                    </div>

                    <button type="submit" className="btn-submit primary">
                      Register Patient
                    </button>
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
                            <button 
                              onClick={() => handleViewPatient(person.id)}
                              className="view-btn"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={() => handleRemovePatient(person.id)}
                              className="remove-btn"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No patients registered yet</p>
                  )}
                </section>
              </div>
            )}

            {/* ============================== */}
            {/* PAGE: PATIENT MONITORING */}
            {/* ============================== */}
            {currentPage === "patientMonitoring" && (
              <div className="page-content">
                <button className="back-button" onClick={handleBackToDashboard}>
                  ← Back to Dashboard
                </button>

                {selectedPatientId && getSelectedPatient() ? (
                  <>
                    <section className="card card-full">
                      <h2>Patient Details - {getSelectedPatient()?.name}</h2>
                      <div className="patient-details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Patient Name:</span>
                          <span className="detail-value">{getSelectedPatient()?.name}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Patient Age:</span>
                          <span className="detail-value">{patient.age} years</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Sex:</span>
                          <span className="detail-value">{patient.sex}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Contact:</span>
                          <span className="detail-value">{patient.contact}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Patient ID:</span>
                          <span className="detail-value">{patient.id}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Registered At:</span>
                          <span className="detail-value">{getSelectedPatient()?.registeredAt}</span>
                        </div>
                      </div>
                    </section>

                    {/* Vitals Monitoring Form */}
                    <section className="card">
                      <h2>Vitals Monitoring</h2>
                      <form onSubmit={handleVitalsSubmit}>
                        <div className="vitals-grid">
                          <div className="vital-input">
                            <label>Temperature (°C) *</label>
                            <input 
                              type="number" 
                              step="0.1"
                              value={vitals.temperature}
                              onChange={(e) => handleVitalsChange("temperature", e.target.value)}
                              className={vitalErrors.temperature ? "input-error" : ""}
                            />
                            {vitalErrors.temperature && <span className="error-message">{vitalErrors.temperature}</span>}
                          </div>

                          <div className="vital-input">
                            <label>Blood Pressure *</label>
                            <input 
                              type="text" 
                              value={vitals.bloodPressure}
                              onChange={(e) => handleVitalsChange("bloodPressure", e.target.value)}
                              placeholder="120/80"
                            />
                          </div>

                          <div className="vital-input">
                            <label>Pulse Rate (bpm) *</label>
                            <input 
                              type="number"
                              value={vitals.pulseRate}
                              onChange={(e) => handleVitalsChange("pulseRate", e.target.value)}
                              className={vitalErrors.pulseRate ? "input-error" : ""}
                            />
                            {vitalErrors.pulseRate && <span className="error-message">{vitalErrors.pulseRate}</span>}
                          </div>

                          <div className="vital-input">
                            <label>Weight (kg) *</label>
                            <input 
                              type="number"
                              step="0.1"
                              value={vitals.weight}
                              onChange={(e) => handleVitalsChange("weight", e.target.value)}
                              className={vitalErrors.weight ? "input-error" : ""}
                            />
                            {vitalErrors.weight && <span className="error-message">{vitalErrors.weight}</span>}
                          </div>

                          <div className="vital-input">
                            <label>Height (cm) *</label>
                            <input 
                              type="number"
                              value={vitals.height}
                              onChange={(e) => handleVitalsChange("height", e.target.value)}
                              className={vitalErrors.height ? "input-error" : ""}
                            />
                            {vitalErrors.height && <span className="error-message">{vitalErrors.height}</span>}
                          </div>
                        </div>
                        
                        <div className={`vital-status ${vitals.status.toLowerCase()}`}>
                          <p><strong>Health Status:</strong> {vitals.status}</p>
                        </div>

                        <button type="submit" className="btn-submit primary">
                          Update Patient Vitals
                        </button>
                      </form>
                    </section>

                    <section className="card">
                      <h2>Vital Readings Summary</h2>
                      <div className="vitals-summary">
                        <div className="vital-display">
                          <span className="vital-label">Temperature</span>
                          <span className="vital-value">{vitals.temperature}°C</span>
                        </div>
                        <div className="vital-display">
                          <span className="vital-label">Blood Pressure</span>
                          <span className="vital-value">{vitals.bloodPressure}</span>
                        </div>
                        <div className="vital-display">
                          <span className="vital-label">Pulse Rate</span>
                          <span className="vital-value">{vitals.pulseRate} bpm</span>
                        </div>
                        <div className="vital-display">
                          <span className="vital-label">Weight</span>
                          <span className="vital-value">{vitals.weight} kg</span>
                        </div>
                        <div className="vital-display">
                          <span className="vital-label">Height</span>
                          <span className="vital-value">{vitals.height} cm</span>
                        </div>
                        <div className="vital-display">
                          <span className="vital-label">Status</span>
                          <span className={`vital-value ${vitals.status.toLowerCase()}`}>{vitals.status}</span>
                        </div>
                      </div>
                    </section>
                  </>
                ) : (
                  <section className="card">
                    <p className="empty-state">Please select a patient from the dashboard to view details</p>
                  </section>
                )}
              </div>
            )}

            {/* ============================== */}
            {/* PAGE: QUEUE MANAGEMENT */}
            {/* ============================== */}
            {currentPage === "queueManagement" && (
              <div className="page-content">
                <section className="card card-full">
                  <h2>Queue Management System</h2>
                  <div className="queue-display">
                    <div className="queue-main">
                      <p className={`queue-number-large ${queueStatus.toLowerCase()}`}>
                        {queueNumber}
                      </p>
                      <p className="queue-label">Current Queue Number</p>
                    </div>
                    <div className="queue-info">
                      <p><strong>Status:</strong> <span className={`badge ${queueStatus.toLowerCase()}`}>{queueStatus}</span></p>
                      <p><strong>Max Capacity:</strong> {systemSettings.maxQueueSize}</p>
                      <p><strong>Patients Registered:</strong> {recentPatients.length}</p>
                      <p><strong>Queue Progress:</strong> {Math.round((queueNumber / systemSettings.maxQueueSize) * 100)}%</p>
                    </div>
                  </div>
                </section>

                <section className="card">
                  <h2>Queue Controls</h2>
                  <div className="queue-actions-large">
                    <button onClick={handleCallNextPatient} className="primary large">
                      📢 Call Next Patient (#{queueNumber + 1})
                    </button>
                    <button onClick={handleToggleQueueStatus} className="secondary large">
                      {queueStatus === "Active" ? "🔴 Close Queue" : "🟢 Open Queue"}
                    </button>
                  </div>
                  <div className="queue-progress-bar">
                    <div className="progress" style={{width: `${(queueNumber / systemSettings.maxQueueSize) * 100}%`}}></div>
                  </div>
                </section>

                <section className="card">
                  <h2>Waiting Patients</h2>
                  {recentPatients.length > 0 ? (
                    <div className="waiting-patients-list">
                      {recentPatients.map((person, index) => (
                        <div key={person.id} className="waiting-patient">
                          <div className="patient-position">{index + 1}</div>
                          <div className="patient-waiting-info">
                            <p className="patient-name">{person.name}</p>
                            <p className="patient-registered">Registered at {person.registeredAt}</p>
                          </div>
                          <div className="patient-wait-time">
                            <span className="wait-label">Waiting</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No patients in queue</p>
                  )}
                </section>
              </div>
            )}

            {/* ============================== */}
            {/* PAGE: SETTINGS */}
            {/* ============================== */}
            {currentPage === "settings" && (
              <div className="page-content">
                <section className="card">
                  <h2>System Settings & Configuration</h2>
                  <form onSubmit={handleSettingsSubmit}>
                    <div className="form-group">
                      <label>Clinic Name *</label>
                      <input 
                        type="text"
                        value={systemSettings.clinicName}
                        onChange={(e) => handleSettingsChange("clinicName", e.target.value)}
                        placeholder="Enter clinic name"
                        className={settingsErrors.clinicName ? "input-error" : ""}
                      />
                      {settingsErrors.clinicName && <span className="error-message">{settingsErrors.clinicName}</span>}
                    </div>

                    <div className="form-group">
                      <label>Working Hours *</label>
                      <input 
                        type="text"
                        value={systemSettings.workingHours}
                        onChange={(e) => handleSettingsChange("workingHours", e.target.value)}
                        placeholder="08:00-17:00"
                        className={settingsErrors.workingHours ? "input-error" : ""}
                      />
                      {settingsErrors.workingHours && <span className="error-message">{settingsErrors.workingHours}</span>}
                    </div>

                    <div className="form-group">
                      <label>Max Queue Size (5-100) *</label>
                      <input 
                        type="number"
                        min="5"
                        max="100"
                        value={systemSettings.maxQueueSize}
                        onChange={(e) => handleSettingsChange("maxQueueSize", e.target.value)}
                        className={settingsErrors.maxQueueSize ? "input-error" : ""}
                      />
                      {settingsErrors.maxQueueSize && <span className="error-message">{settingsErrors.maxQueueSize}</span>}
                    </div>

                    <div className="settings-toggles">
                      <div className="toggle-item">
                        <label>Dark Mode</label>
                        <input 
                          type="checkbox"
                          checked={systemSettings.darkMode}
                          onChange={() => handleToggleSetting("darkMode")}
                        />
                      </div>
                      <div className="toggle-item">
                        <label>Sound Notifications</label>
                        <input 
                          type="checkbox"
                          checked={systemSettings.soundNotifications}
                          onChange={() => handleToggleSetting("soundNotifications")}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-submit primary">
                      Save Settings
                    </button>
                  </form>
                </section>

                <section className="card">
                  <h2>Vital Sign Thresholds</h2>
                  <form onSubmit={handleSaveThresholds}>
                    <p className="section-description">Set alert thresholds for vital sign readings</p>
                    
                    <div className="threshold-grid">
                      <div className="threshold-group">
                        <h3>Temperature (°C)</h3>
                        <div className="threshold-inputs">
                          <div className="threshold-input">
                            <label>Min</label>
                            <input 
                              type="number"
                              step="0.1"
                              value={thresholds.temperature.min}
                              onChange={(e) => handleUpdateThreshold("temperature", "min", e.target.value)}
                            />
                          </div>
                          <div className="threshold-input">
                            <label>Max</label>
                            <input 
                              type="number"
                              step="0.1"
                              value={thresholds.temperature.max}
                              onChange={(e) => handleUpdateThreshold("temperature", "max", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="threshold-group">
                        <h3>Pulse Rate (bpm)</h3>
                        <div className="threshold-inputs">
                          <div className="threshold-input">
                            <label>Min</label>
                            <input 
                              type="number"
                              value={thresholds.pulseRate.min}
                              onChange={(e) => handleUpdateThreshold("pulseRate", "min", e.target.value)}
                            />
                          </div>
                          <div className="threshold-input">
                            <label>Max</label>
                            <input 
                              type="number"
                              value={thresholds.pulseRate.max}
                              onChange={(e) => handleUpdateThreshold("pulseRate", "max", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="threshold-group">
                        <h3>BP Systolic</h3>
                        <div className="threshold-inputs">
                          <div className="threshold-input">
                            <label>Min</label>
                            <input 
                              type="number"
                              value={thresholds.bloodPressureSystolic.min}
                              onChange={(e) => handleUpdateThreshold("bloodPressureSystolic", "min", e.target.value)}
                            />
                          </div>
                          <div className="threshold-input">
                            <label>Max</label>
                            <input 
                              type="number"
                              value={thresholds.bloodPressureSystolic.max}
                              onChange={(e) => handleUpdateThreshold("bloodPressureSystolic", "max", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="threshold-group">
                        <h3>BP Diastolic</h3>
                        <div className="threshold-inputs">
                          <div className="threshold-input">
                            <label>Min</label>
                            <input 
                              type="number"
                              value={thresholds.bloodPressureDiastolic.min}
                              onChange={(e) => handleUpdateThreshold("bloodPressureDiastolic", "min", e.target.value)}
                            />
                          </div>
                          <div className="threshold-input">
                            <label>Max</label>
                            <input 
                              type="number"
                              value={thresholds.bloodPressureDiastolic.max}
                              onChange={(e) => handleUpdateThreshold("bloodPressureDiastolic", "max", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="threshold-group">
                        <h3>Weight (kg)</h3>
                        <div className="threshold-inputs">
                          <div className="threshold-input">
                            <label>Min</label>
                            <input 
                              type="number"
                              step="0.1"
                              value={thresholds.weight.min}
                              onChange={(e) => handleUpdateThreshold("weight", "min", e.target.value)}
                            />
                          </div>
                          <div className="threshold-input">
                            <label>Max</label>
                            <input 
                              type="number"
                              step="0.1"
                              value={thresholds.weight.max}
                              onChange={(e) => handleUpdateThreshold("weight", "max", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="threshold-group">
                        <h3>Device Uptime Alert</h3>
                        <div className="threshold-inputs">
                          <div className="threshold-input full-width">
                            <label>Alert if below (%)</label>
                            <input 
                              type="number"
                              min="0"
                              max="100"
                              value={thresholds.deviceUptimeWarning}
                              onChange={(e) => setThresholds(prev => ({ ...prev, deviceUptimeWarning: parseFloat(e.target.value) }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn-submit primary">
                      Save Thresholds
                    </button>
                  </form>
                </section>

                <section className="card">
                  <h2>Current Configuration</h2>
                  <div className="settings-display">
                    <div className="setting-display-item">
                      <span className="setting-label">Clinic Name:</span>
                      <span className="setting-value">{systemSettings.clinicName}</span>
                    </div>
                    <div className="setting-display-item">
                      <span className="setting-label">Working Hours:</span>
                      <span className="setting-value">{systemSettings.workingHours}</span>
                    </div>
                    <div className="setting-display-item">
                      <span className="setting-label">Max Queue Size:</span>
                      <span className="setting-value">{systemSettings.maxQueueSize}</span>
                    </div>
                    <div className="setting-display-item">
                      <span className="setting-label">Dark Mode:</span>
                      <span className="setting-value">{systemSettings.darkMode ? "Enabled" : "Disabled"}</span>
                    </div>
                    <div className="setting-display-item">
                      <span className="setting-label">Sound Notifications:</span>
                      <span className="setting-value">{systemSettings.soundNotifications ? "Enabled" : "Disabled"}</span>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ============================== */}
            {/* PAGE: REPORTS & ANALYTICS */}
            {/* ============================== */}
            {currentPage === "reports" && (
              <div className="page-content">
                {/* ALERTS SECTION */}
                <section className="card card-full">
                  <div className="alerts-header">
                    <h2>⚠️ Alerts & Notifications</h2>
                    <button onClick={handleClearAllAlerts} className="btn-secondary">Clear All</button>
                  </div>
                  <div className="alerts-list">
                    {alertHistory.length > 0 ? (
                      alertHistory.map((alert) => (
                        <div key={alert.id} className={`alert-item severity-${alert.severity} ${alert.resolved ? 'resolved' : ''}`}>
                          <div className="alert-content">
                            <span className={`alert-type ${alert.type}`}>{alert.type.toUpperCase()}</span>
                            <span className="alert-message">{alert.message}</span>
                            <span className="alert-time">{alert.timestamp}</span>
                          </div>
                          {!alert.resolved && (
                            <button 
                              onClick={() => handleResolveAlert(alert.id)}
                              className="btn-resolve"
                            >
                              Resolve
                            </button>
                          )}
                          {alert.resolved && <span className="alert-resolved-badge">✓ Resolved</span>}
                        </div>
                      ))
                    ) : (
                      <p className="empty-state">No alerts</p>
                    )}
                  </div>
                </section>

                {/* REPORT PERIOD SELECTOR */}
                <section className="card">
                  <h2>Vital Signs Report</h2>
                  <div className="report-period-selector">
                    <button 
                      onClick={() => setReportPeriod("daily")}
                      className={`period-btn ${reportPeriod === "daily" ? "active" : ""}`}
                    >
                      📅 Daily
                    </button>
                    <button 
                      onClick={() => setReportPeriod("weekly")}
                      className={`period-btn ${reportPeriod === "weekly" ? "active" : ""}`}
                    >
                      📊 Weekly
                    </button>
                    <button 
                      onClick={() => setReportPeriod("monthly")}
                      className={`period-btn ${reportPeriod === "monthly" ? "active" : ""}`}
                    >
                      📈 Monthly
                    </button>
                  </div>

                  {reportPeriod === "daily" && (
                    <div className="report-content">
                      <div className="report-grid">
                        <div className="chart-container">
                          <h3>Temperature Trend</h3>
                          <div className="simple-chart temperature">
                            {vitalReadingsHistory.daily.map((reading, idx) => (
                              <div key={idx} className="chart-bar" style={{height: `${(reading.temp / 40) * 200}px`}} title={`${reading.temp}°C @ ${reading.time}`}></div>
                            ))}
                          </div>
                          <div className="chart-labels">
                            {vitalReadingsHistory.daily.map((reading, idx) => (
                              <span key={idx}>{reading.time}</span>
                            ))}
                          </div>
                        </div>

                        <div className="chart-container">
                          <h3>Pulse Rate Trend</h3>
                          <div className="simple-chart pulse">
                            {vitalReadingsHistory.daily.map((reading, idx) => (
                              <div key={idx} className="chart-bar" style={{height: `${(reading.pulse / 120) * 200}px`}} title={`${reading.pulse} bpm @ ${reading.time}`}></div>
                            ))}
                          </div>
                          <div className="chart-labels">
                            {vitalReadingsHistory.daily.map((reading, idx) => (
                              <span key={idx}>{reading.time}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="vital-stats">
                        <h3>Daily Vitals Summary</h3>
                        <div className="stats-grid">
                          {vitalReadingsHistory.daily.map((reading, idx) => (
                            <div key={idx} className="stat-item">
                              <div className="stat-time">{reading.time}</div>
                              <div className="stat-details">
                                <div>🌡️ {reading.temp}°C</div>
                                <div>❤️ {reading.pulse} bpm</div>
                                <div>🩺 {reading.bp}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {reportPeriod === "weekly" && (
                    <div className="report-content">
                      <div className="report-grid">
                        <div className="chart-container">
                          <h3>Weekly Avg Temperature</h3>
                          <div className="simple-chart temperature">
                            {vitalReadingsHistory.weekly.map((reading, idx) => (
                              <div key={idx} className="chart-bar" style={{height: `${(reading.avgTemp / 40) * 200}px`}} title={`${reading.avgTemp}°C`}></div>
                            ))}
                          </div>
                          <div className="chart-labels">
                            {vitalReadingsHistory.weekly.map((reading, idx) => (
                              <span key={idx}>{reading.day}</span>
                            ))}
                          </div>
                        </div>

                        <div className="chart-container">
                          <h3>Weekly Avg Pulse Rate</h3>
                          <div className="simple-chart pulse">
                            {vitalReadingsHistory.weekly.map((reading, idx) => (
                              <div key={idx} className="chart-bar" style={{height: `${(reading.avgPulse / 120) * 200}px`}} title={`${reading.avgPulse} bpm`}></div>
                            ))}
                          </div>
                          <div className="chart-labels">
                            {vitalReadingsHistory.weekly.map((reading, idx) => (
                              <span key={idx}>{reading.day}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {reportPeriod === "monthly" && (
                    <div className="report-content">
                      <div className="report-grid">
                        <div className="chart-container">
                          <h3>Monthly Avg Temperature</h3>
                          <div className="simple-chart temperature">
                            {vitalReadingsHistory.monthly.map((reading, idx) => (
                              <div key={idx} className="chart-bar" style={{height: `${(reading.avgTemp / 40) * 200}px`}} title={`${reading.avgTemp}°C`}></div>
                            ))}
                          </div>
                          <div className="chart-labels">
                            {vitalReadingsHistory.monthly.map((reading, idx) => (
                              <span key={idx}>{reading.week}</span>
                            ))}
                          </div>
                        </div>

                        <div className="chart-container">
                          <h3>Monthly Avg Pulse Rate</h3>
                          <div className="simple-chart pulse">
                            {vitalReadingsHistory.monthly.map((reading, idx) => (
                              <div key={idx} className="chart-bar" style={{height: `${(reading.avgPulse / 120) * 200}px`}} title={`${reading.avgPulse} bpm`}></div>
                            ))}
                          </div>
                          <div className="chart-labels">
                            {vitalReadingsHistory.monthly.map((reading, idx) => (
                              <span key={idx}>{reading.week}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* DEVICE UPTIME SECTION */}
                <section className="card">
                  <h2>Device Uptime Report</h2>
                  <div className="report-period-selector">
                    <button 
                      onClick={() => setReportPeriod("daily")}
                      className={`period-btn ${reportPeriod === "daily" ? "active" : ""}`}
                    >
                      📅 Daily
                    </button>
                    <button 
                      onClick={() => setReportPeriod("weekly")}
                      className={`period-btn ${reportPeriod === "weekly" ? "active" : ""}`}
                    >
                      📊 Weekly
                    </button>
                    <button 
                      onClick={() => setReportPeriod("monthly")}
                      className={`period-btn ${reportPeriod === "monthly" ? "active" : ""}`}
                    >
                      📈 Monthly
                    </button>
                  </div>

                  <div className="uptime-metrics">
                    {Object.entries(
                      reportPeriod === "daily" ? deviceUptimeMetrics.daily :
                      reportPeriod === "weekly" ? deviceUptimeMetrics.weekly :
                      deviceUptimeMetrics.monthly
                    ).map(([device, uptime]) => (
                      <div key={device} className="uptime-item">
                        <div className="uptime-info">
                          <h3>{device}</h3>
                          <div className="uptime-bar-container">
                            <div className="uptime-bar">
                              <div 
                                className={`uptime-fill ${uptime >= thresholds.deviceUptimeWarning ? 'good' : 'warning'}`}
                                style={{width: `${uptime}%`}}
                              ></div>
                            </div>
                            <span className="uptime-percentage">{uptime}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* QUICK STATS */}
                <section className="card card-full">
                  <h2>Overview Statistics</h2>
                  <div className="analytics-grid">
                    <div className="analytics-card">
                      <h3>Total Patients</h3>
                      <div className="analytics-value">{recentPatients.length}</div>
                      <p className="analytics-subtitle">Registered this session</p>
                    </div>
                    <div className="analytics-card">
                      <h3>Active Alerts</h3>
                      <div className="analytics-value">{alertHistory.filter(a => !a.resolved).length}</div>
                      <p className="analytics-subtitle">Requiring attention</p>
                    </div>
                    <div className="analytics-card">
                      <h3>Devices Online</h3>
                      <div className="analytics-value">{devices.filter(d => d.status === "online").length}/{devices.length}</div>
                      <p className="analytics-subtitle">Connected sensors</p>
                    </div>
                    <div className="analytics-card">
                      <h3>Queue Status</h3>
                      <div className={`analytics-value ${queueStatus.toLowerCase()}`}>{queueStatus}</div>
                      <p className="analytics-subtitle">System operational</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ============================== */}
            {/* PAGE: DEVICES & SENSORS */}
            {/* ============================== */}
            {currentPage === "devices" && (
              <div className="page-content">
                <section className="card card-full">
                  <h2>Device & Sensor Management</h2>
                  <div className="devices-summary">
                    <div className="summary-stat">
                      <span className="stat-label">Total Devices</span>
                      <span className="stat-value">{devices.length}</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-label">Online</span>
                      <span className="stat-value online">{devices.filter(d => d.status === "online").length}</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-label">Offline</span>
                      <span className="stat-value offline">{devices.filter(d => d.status === "offline").length}</span>
                    </div>
                  </div>
                </section>

                <section className="card">
                  <h2>Connected Devices</h2>
                  {devices.length > 0 ? (
                    <div className="devices-list">
                      {devices.map((device) => (
                        <div key={device.id} className={`device-item status-${device.status}`}>
                          <div className="device-header">
                            <div className="device-info">
                              <h3 className="device-name">{device.name}</h3>
                              <p className="device-type">{device.type} | Location: {device.location}</p>
                            </div>
                            <div className={`device-status-badge ${device.status}`}>
                              <span className="status-dot"></span>
                              {device.status.toUpperCase()}
                            </div>
                          </div>
                          <div className="device-footer">
                            <p className="device-update">Last updated: {device.lastUpdate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No devices connected</p>
                  )}
                </section>

                <section className="card">
                  <h2>Device Status Legend</h2>
                  <div className="legend">
                    <div className="legend-item">
                      <span className="legend-badge online">●</span>
                      <span>Device is online and functioning properly</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-badge offline">●</span>
                      <span>Device is offline or not responding</span>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ============================== */}
            {/* PAGE: USER MANAGEMENT */}
            {/* ============================== */}
            {currentPage === "users" && (
              <div className="page-content">
                <section className="card card-full">
                  <h2>User Management System</h2>
                  <div className="users-summary">
                    <div className="summary-stat">
                      <span className="stat-label">Pending Requests</span>
                      <span className="stat-value pending">{pendingUsers.length}</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-label">Approved Users</span>
                      <span className="stat-value approved">{approvedUsers.length}</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-label">Total Users</span>
                      <span className="stat-value">{pendingUsers.length + approvedUsers.length}</span>
                    </div>
                  </div>
                </section>

                {/* Pending User Requests */}
                <section className="card">
                  <h2>Pending User Requests</h2>
                  {pendingUsers.length > 0 ? (
                    <div className="users-request-list">
                      {pendingUsers.map((user) => (
                        <div key={user.id} className="user-request-item">
                          <div className="user-request-info">
                            <h3 className="user-name">{user.name}</h3>
                            <p className="user-email">{user.email}</p>
                            <p className="user-meta"><strong>Role:</strong> {user.role} | <strong>Requested:</strong> {user.requestedAt}</p>
                          </div>
                          <div className="user-request-actions">
                            <button 
                              className="btn-accept"
                              onClick={() => handleAcceptUser(user.id)}
                            >
                              ✓ Accept
                            </button>
                            <button 
                              className="btn-decline"
                              onClick={() => handleRemoveUser(user.id, "request")}
                            >
                              ✗ Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No pending user requests</p>
                  )}
                </section>

                {/* Approved Users */}
                <section className="card">
                  <h2>Approved Users</h2>
                  {approvedUsers.length > 0 ? (
                    <div className="users-approved-list">
                      {approvedUsers.map((user) => (
                        <div key={user.id} className="user-approved-item">
                          <div className="user-approved-info">
                            <h3 className="user-name">{user.name}</h3>
                            <p className="user-email">{user.email}</p>
                            <p className="user-meta"><strong>Role:</strong> {user.role} | <strong>Approved:</strong> {user.approvedAt}</p>
                          </div>
                          <div className="user-approved-status">
                            <span className="status-badge approved">✓ Approved</span>
                            {user.id !== 101 && (
                              <button 
                                className="btn-remove-user"
                                onClick={() => handleRemoveUser(user.id)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No approved users</p>
                  )}
                </section>
              </div>
            )}

          </main>
        </div>
      )}

      <footer>
        <p>© 2026 QuickCare Healthcare System</p>
      </footer>
    </>
  );
}

export default App;
