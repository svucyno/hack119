/**
 * HealthNexus - Main Application Logic
 */
import { db, auth, collection, getDocs, doc, setDoc, getDoc, updateDoc, query, orderBy, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from './firebase-config.js';

const app = {
    // --- STATE ---
    // --- FIREBASE STATE ---
    getPatients: async function() {
        try {
            const q = query(collection(db, "patients"), orderBy("id", "asc"));
            const querySnapshot = await getDocs(q);
            let patients = [];
            querySnapshot.forEach((doc) => {
                patients.push(doc.data());
            });

            if (patients.length > 0) return patients;

            // Default initial data for Demo if Firestore is empty
            const defaults = [
                { 
                    id: 'PT-001', name: 'Rahul Sharma', age: 45, gender: 'Male', 
                    condition: 'Diabetes Type 2', status: 'stable', 
                    lastVisit: '2026-04-02', nextAppt: '2026-04-10',
                    bloodGroup: 'O+', weight: '72kg', heartRate: '72 bpm',
                    phone: '+91 98765 43210',
                    address: 'Skyline Heights, Mumbai, MH',
                    disease_desc: 'Chronic metabolic disorder characterized by high blood sugar levels. Requires continuous monitoring and dietary control.',
                    past_history: [
                        { date: '2026-03-20', event: 'Routine Checkup', result: 'HbA1c 6.8', status: 'stable' },
                        { date: '2026-01-15', event: 'Emergency Check', result: 'Glucose 210 mg/dL', status: 'elevated' }
                    ],
                    medications: [
                        { name: 'Metformin', dose: '500mg', courseUntil: '2026-05-10', frequency: 'Twice daily' },
                        { name: 'Glipizide', dose: '5mg', courseUntil: '2026-04-25', frequency: 'Before breakfast' }
                    ]
                },
                { 
                    id: 'PT-002', name: 'Priya Patel', age: 32, gender: 'Female', 
                    condition: 'Hypertension', status: 'monitoring', 
                    lastVisit: '2026-03-28', nextAppt: '2026-04-08',
                    bloodGroup: 'A-', weight: '58kg', heartRate: '88 bpm',
                    phone: '+91 99887 76655',
                    address: 'Pune Hills Sector 4, Pune, MH',
                    disease_desc: 'Elevated blood pressure condition. Patient currently on ACE inhibitors. Regular monitoring advised.',
                    past_history: [
                        { date: '2026-02-14', event: 'Initial Screen', result: 'BP 145/95', status: 'monitoring' },
                        { date: '2025-12-01', event: 'General Health', result: 'All systems normal', status: 'stable' }
                    ],
                    medications: [
                        { name: 'Lisinopril', dose: '10mg', courseUntil: 'Ongoing', frequency: 'Once daily' },
                        { name: 'Amlodipine', dose: '5mg', courseUntil: '2026-04-20', frequency: 'At bedtime' }
                    ]
                },
                { 
                    id: 'PT-003', name: 'Amit Kumar', age: 58, gender: 'Male', 
                    condition: 'Cardiac Arrhythmia', status: 'critical', 
                    lastVisit: '2026-04-04', nextAppt: '2026-04-06',
                    bloodGroup: 'B+', weight: '84kg', heartRate: '102 bpm',
                    phone: '+91 88776 65544', email: 'amit.kumar@nexus.com',
                    address: 'Orchid Residency, Bangalore, KA',
                    disease_desc: 'Irregular heartbeat condition. Higher risk of stroke and heart failure. requires immediate medical attention.',
                    past_history: [
                        { date: '2026-03-30', event: 'ECG Test', result: 'Atrial Fibrillation', status: 'critical' },
                        { date: '2026-01-10', event: 'Holter Monit.', result: 'Occasional Skips', status: 'monitoring' }
                    ]
                },
                { 
                    id: 'PT-004', name: 'Sneha Reddy', age: 24, gender: 'Female', 
                    condition: 'Post-Surgery Recovery', status: 'stable', 
                    lastVisit: '2026-04-01', nextAppt: '2026-04-15',
                    bloodGroup: 'AB+', weight: '54kg', heartRate: '68 bpm',
                    phone: '+91 77665 54433', email: 'sneha.reddy@nexus.com',
                    address: 'Sector 23, Jubilee Hills, Hyderabad',
                    disease_desc: 'Patient recovering from appendectomy. No complications recorded. Wound healing proceeding as expected.',
                    past_history: [
                        { date: '2026-03-25', event: 'Surgeons Followup', result: 'Healing Well', status: 'stable' },
                        { date: '2026-03-20', event: 'Appendectomy', result: 'Surgery Successful', status: 'recovery' }
                    ]
                }
            ];
            
            // Seed Firestore
            for (const p of defaults) {
                await setDoc(doc(db, "patients", p.id), p);
            }
            return defaults;
        } catch (e) {
            console.error("Firebase fetch error: ", e);
            return [];
        }
    },
    
    savePatients: async function(patients) {
        // Individual save handled by specific methods (addPatient/updateMedicine)
        // This is kept for compatibility but logic is decentralised for Firebase
    },
    
    savePatient: async function(patient) {
        try {
            await setDoc(doc(db, "patients", patient.id), patient);
        } catch (e) {
            console.error("Error saving patient: ", e);
        }
    },

    getPatientById: async function(id) {
        try {
            const patients = await this.getPatients();
            return patients.find(p => p.id === id) || null;
        } catch (e) {
            console.error("Error fetching patient: ", e);
            return null;
        }
    },
    
    // --- NAVIGATION LOGIC ---
    toggleFaq: function(button) {
        const item = button.parentElement;
        const allItems = document.querySelectorAll('.faq-item');
        
        allItems.forEach(i => {
            if (i !== item) i.classList.remove('active');
        });

        item.classList.toggle('active');
    },

    navigate: function(viewId, loginType = null) {
        // Handle multi-page routing
        const pageMap = {
            'home': 'index.html',
            'login': 'login.html',
            'hospital-dashboard': 'hospital-dashboard.html',
            'patient-dashboard': 'patient-dashboard.html'
        };

        if (pageMap[viewId]) {
            let url = pageMap[viewId];
            if (viewId === 'login' && loginType) {
                url += `?type=${loginType}`;
            }
            window.location.href = url;
        } else {
            // Internal section navigation (anchors)
            window.location.hash = viewId;
        }
    },

    currentAuthRole: 'hospital',
    currentAuthMode: 'login',

    // --- LOGIN LOGIC ---
    switchLogin: function(type) {
        this.currentAuthRole = type;
        
        // Update Buttons
        document.getElementById('btnSwitchHospital').classList.remove('active');
        document.getElementById('btnSwitchPatient').classList.remove('active');
        
        if (type === 'hospital') {
            document.getElementById('btnSwitchHospital').classList.add('active');
        } else {
            document.getElementById('btnSwitchPatient').classList.add('active');
        }
        
        this.switchAuthMode(this.currentAuthMode); // re-apply current login/signup mode for new role
    },

    // --- AUTH LOGIC (REAL FIREBASE) ---
    initAuthListener: function() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                const userData = await this.getUserData(user.uid);
                let actualRole = userData ? userData.role : null;
                
                // Fallback for race conditions or missing Firestore documents
                if (!actualRole) {
                    actualRole = localStorage.getItem('nexus_pending_role') || 'patient';
                }

                let actualName = userData ? (userData.name || 'User') : (localStorage.getItem('nexus_pending_name') || 'User');

                localStorage.setItem('nexus_user_role', actualRole);
                localStorage.setItem('nexus_user_name', actualName);
                if (userData && userData.patientId) {
                    localStorage.setItem('nexus_patient_id', userData.patientId);
                }
                
                // Refresh UI
                if (typeof components !== 'undefined') components.renderNavbar();
                
                // Route protection: if on login page, go to dashboard
                if (window.location.pathname.includes('login.html')) {
                    localStorage.removeItem('nexus_pending_role'); // Clean up pending role
                    this.navigate(actualRole === 'hospital' ? 'hospital-dashboard' : 'patient-dashboard');
                }
            } else {
                // User is signed out
                localStorage.removeItem('nexus_user_role');
                localStorage.removeItem('nexus_patient_id');
                
                // Refresh UI
                if (typeof components !== 'undefined') components.renderNavbar();

                // Route protection: if on dashboard, go to home
                if (window.location.pathname.includes('dashboard.html')) {
                    this.navigate('login');
                }
            }
        });
    },

    getUserData: async function(uid) {
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                return userDoc.data();
            } else {
                return null; // Return null so we can check pending_role
            }
        } catch (e) {
            console.error("Error fetching user data:", e);
            return null;
        }
    },

    login: async function(role) {
        localStorage.setItem('nexus_pending_role', role); // Store intended role for missing documents
        
        const emailId = role === 'hospital' ? 'hospEmail' : 'patEmail';
        const passId = role === 'hospital' ? 'hospPass' : 'patPass';
        
        const email = document.getElementById(emailId).value;
        const password = document.getElementById(passId).value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Logged in as:", userCredential.user.email);
            // Redirection happens in initAuthListener
        } catch (error) {
            console.error("Login failed:", error.code, error.message);
            alert("Login Failed: " + error.message);
        }
    },

    logout: async function() {
        try {
            await signOut(auth);
            this.navigate('home');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    },

    signUp: async function(role) {
        localStorage.setItem('nexus_pending_role', role); // Store intended role for race condition
        
        const nameId = role === 'hospital' ? 'regHospName' : 'regName';
        const emailId = role === 'hospital' ? 'regHospEmail' : 'regEmail';
        const passId = role === 'hospital' ? 'regHospPass' : 'regPass';
        
        const name = document.getElementById(nameId).value;
        const email = document.getElementById(emailId).value;
        const password = document.getElementById(passId).value;

        localStorage.setItem('nexus_pending_name', name);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            if (role === 'patient') {
                // 1. Create Patient Record
                const patientId = `PT-${new Date().getTime().toString().slice(-4)}`;
                const newPatient = {
                    id: patientId,
                    name: name,
                    email: email,
                    age: 25, // Default
                    gender: 'TBD',
                    condition: 'General Wellness',
                    status: 'stable',
                    lastVisit: new Date().toISOString().split('T')[0],
                    vitals: { bp: { sys: 120, dia: 80 }, sugar: { val: 100 }, hemo: { val: 14 } }
                };
                
                await setDoc(doc(db, "patients", patientId), newPatient);
                
                // 2. Create User Map record
                await setDoc(doc(db, "users", user.uid), {
                    role: 'patient',
                    patientId: patientId,
                    email: email,
                    name: name
                });
            } else if (role === 'hospital') {
                // Create User Map record for Hospital
                await setDoc(doc(db, "users", user.uid), {
                    role: 'hospital',
                    email: email,
                    name: name
                });
            }

            console.log("Registered and mapped successfully");
            // Redirection happens in initAuthListener
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Registration Failed: " + error.message);
        }
    },

    switchAuthMode: function(mode) {
        this.currentAuthMode = mode;
        
        const loginBtn = document.getElementById('btnModeLogin');
        const signupBtn = document.getElementById('btnModeSignup');
        
        // Hide all forms first
        document.getElementById('formPatientLogin')?.classList.add('hidden');
        document.getElementById('formPatientSignup')?.classList.add('hidden');
        document.getElementById('formHospitalLogin')?.classList.add('hidden');
        document.getElementById('formHospitalSignup')?.classList.add('hidden');

        // Reset buttons
        if (loginBtn) loginBtn.classList.remove('active');
        if (signupBtn) signupBtn.classList.remove('active');

        if (mode === 'signup') {
            if (signupBtn) signupBtn.classList.add('active');
            if (this.currentAuthRole === 'hospital') {
                document.getElementById('formHospitalSignup')?.classList.remove('hidden');
            } else {
                document.getElementById('formPatientSignup')?.classList.remove('hidden');
            }
        } else {
            if (loginBtn) loginBtn.classList.add('active');
            if (this.currentAuthRole === 'hospital') {
                document.getElementById('formHospitalLogin')?.classList.remove('hidden');
            } else {
                document.getElementById('formPatientLogin')?.classList.remove('hidden');
            }
        }
    },

    getAuthRole: function() {
        return localStorage.getItem('nexus_user_role');
    },

    updateUserProfileUI: function() {
        const userName = localStorage.getItem('nexus_user_name') || 'User';
        const role = localStorage.getItem('nexus_user_role');
        const patientId = localStorage.getItem('nexus_patient_id') || 'NEX-8241';
        
        // Extract initials (e.g. "John Doe" -> "JD")
        const initials = userName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        
        if (role === 'patient') {
            const firstName = userName.split(' ')[0];
            const greeting = document.getElementById('patTopbarGreeting');
            if (greeting) greeting.innerHTML = `Good morning, ${firstName} 👋`;
            
            const patName = document.getElementById('patSidebarName');
            if (patName) patName.textContent = userName;
            
            const patRole = document.getElementById('patSidebarRole');
            if (patRole) patRole.textContent = `Patient · ${patientId}`;
            
            const patSideAv = document.getElementById('patSidebarAvatar');
            if (patSideAv) patSideAv.textContent = initials;
            
            const patTopAv = document.getElementById('patTopbarAvatar');
            if (patTopAv) patTopAv.textContent = initials;
            
        } else if (role === 'hospital') {
            const hospName = document.getElementById('hospUserName');
            if (hospName) hospName.textContent = userName;
        }
    },

    // --- HOSPITAL DASHBOARD ---

    switchHospitalTab: function(tabId) {
        // Update nav styling
        const navItems = document.querySelectorAll('#view-hospital-dashboard .sidebar-nav li');
        navItems.forEach(item => item.classList.remove('active'));
        // Find by simple iteration or event logic (event logic is simple via click usually but here we hardcode mapping)
        event.currentTarget.classList.add('active');

    toggleSidebar: function() {
        const sidebar = document.getElementById('hospitalSidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    },

    switchHospitalTab: function(event, tabId) {
        // Update nav styling
        const navItems = document.querySelectorAll('#view-hospital-dashboard .sidebar-nav li');
        navItems.forEach(item => item.classList.remove('active'));
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        }


        // Hide all tabs
        document.querySelectorAll('#view-hospital-dashboard .tab-content').forEach(el => {
            el.classList.add('hidden');
        });

        // Show active
        document.getElementById(`hosp-tab-${tabId}`).classList.remove('hidden');

    },

    renderPatients: function() {
        const tbody = document.getElementById('patientTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        const patients = this.getPatients();
        
        if (patients.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No patients registered</td></tr>`;
            return;
        }

        patients.forEach(p => {
            const statusClass = p.status === 'Stable' ? 'stable' : 'critical';
            const row = `
                <tr>
                    <td><strong>${p.id}</strong></td>
                    <td>${p.name}</td>
                    <td>${p.age} / ${p.gender.charAt(0)}</td>
                    <td>${p.condition}</td>
                    <td><span class="status ${statusClass}">${p.status}</span></td>
                    <td><button class="btn-outline-sm">View details</button></td>
                </tr>
            `;
            tbody.innerHTML += row;


        // Render doctor cards when that tab opens
        if (tabId === 'doctors') {
            this.renderDoctors();
        }
    },

    // --- DOCTOR DATA ---
    hospitals: [
        { id: 'h1', name: 'HealthNexus Central' },
        { id: 'h2', name: 'Metro Clinic' },
        { id: 'h3', name: 'Northside General' }
    ],

    doctors: [
        { id: 1, name: 'Dr. Arjun Mehta',   specialty: 'Cardiologist',       icon: 'fa-heart-pulse',    status: 'available', hospitalId: 'h1', patients: 8,  since: '08:00 AM', accent: '#38BDF8' },
        { id: 2, name: 'Dr. Priya Sharma',   specialty: 'Neurologist',         icon: 'fa-brain',          status: 'busy',      hospitalId: 'h2', patients: 5,  since: '09:30 AM', accent: '#A78BFA' },
        { id: 3, name: 'Dr. Rajan Das',      specialty: 'Orthopedic Surgeon',  icon: 'fa-bone',           status: 'surgery',   hospitalId: 'h1', patients: 3,  since: '07:00 AM', accent: '#FB7185' },
        { id: 4, name: 'Dr. Nisha Kapoor',   specialty: 'Pediatrician',        icon: 'fa-child-reaching', status: 'available', hospitalId: 'h3', patients: 12, since: '08:30 AM', accent: '#34D399' },
        { id: 5, name: 'Dr. Samuel Okafor',  specialty: 'General Physician',   icon: 'fa-stethoscope',    status: 'offline',   hospitalId: 'h2', patients: 0,  since: '—',        accent: '#64748B' },
        { id: 6, name: 'Dr. Tanvi Reddy',    specialty: 'Ophthalmologist',     icon: 'fa-eye',            status: 'available', hospitalId: 'h3', patients: 6,  since: '09:00 AM', accent: '#FBBF24' },
        { id: 7, name: 'Dr. Kiran Bose',     specialty: 'Dermatologist',       icon: 'fa-hand-holding-medical', status: 'busy', hospitalId: 'h1', patients: 4, since: '10:00 AM', accent: '#F472B6' },
        { id: 8, name: 'Dr. Aditya Singh',   specialty: 'Radiologist',         icon: 'fa-radiation',      status: 'surgery',   hospitalId: 'h2', patients: 2,  since: '06:30 AM', accent: '#EF4444' },
    ],

    statusLabels: {
        available: '🟢 Available',
        busy:      '🟡 Busy (Consultation)',
        surgery:   '🔴 In Surgery',
        offline:   '⚫ Offline',
    },

    renderDoctors: function(hospitalFilter = 'all') {
        const grid = document.getElementById('doctorCardsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const filtered = this.doctors.filter(d => hospitalFilter === 'all' || d.hospitalId === hospitalFilter);

        filtered.forEach((doc, idx) => {
            const labelText = this.statusLabels[doc.status] || doc.status;

            const card = document.createElement('div');
            card.className = 'doc-card';
            card.dataset.status = doc.status;
            card.style.setProperty('--card-accent', doc.accent);
            card.style.transitionDelay = `${idx * 60}ms`;

            card.innerHTML = `
                <div class="doc-avatar-wrap">
                    <div class="doc-avatar">
                        <i class="fa-solid ${doc.icon}"></i>
                    </div>
                    <span class="doc-status-badge ${doc.status}" id="doc-badge-${doc.id}"></span>
                </div>
                <div class="doc-name">${doc.name}</div>
                <div class="doc-specialty"><i class="fa-solid fa-circle-dot"></i>${doc.specialty}</div>
                <div class="doc-meta">
                    <span class="doc-meta-chip"><i class="fa-solid fa-users"></i> ${doc.patients} Patients</span>
                    <span class="doc-meta-chip"><i class="fa-regular fa-clock"></i> Since ${doc.since}</span>
                </div>
                <div class="doc-status-display" id="doc-status-display-${doc.id}">
                    <span class="status-dot ${doc.status}"></span>
                    <span class="doc-status-label">${labelText}</span>
                </div>
            `;

            grid.appendChild(card);

            // Stagger entrance animation
            requestAnimationFrame(() => {
                setTimeout(() => card.classList.add('visible'), idx * 80);
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.doc-status-select-wrap')) {
                document.querySelectorAll('.doc-dropdown.open').forEach(dd => dd.classList.remove('open'));
                document.querySelectorAll('.doc-status-btn.open').forEach(btn => btn.classList.remove('open'));
            }
        }, { capture: true });
    },

    handleHospitalChange: function(select) {
        const hospitalId = select.value;
        this.renderDoctors(hospitalId);
    },

    filterDoctors: function(status, clickedBtn) {
        // Update active state on filter buttons
        document.querySelectorAll('.doc-filter-btn').forEach(btn => btn.classList.remove('active'));
        clickedBtn.classList.add('active');

        // Show/hide cards with animation
        const cards = document.querySelectorAll('#doctorCardsGrid .doc-card');
        cards.forEach(card => {
            const cardStatus = card.dataset.status;
            if (status === 'all' || cardStatus === status) {
                card.style.display = '';
                requestAnimationFrame(() => card.classList.add('visible'));
            } else {
                card.classList.remove('visible');
                // delay display:none until fade-out
                setTimeout(() => {
                    if (!card.classList.contains('visible')) card.style.display = 'none';
                }, 400);
            }
        });
    },


    setDocStatus: function(docId, newStatus) {
        const doc = this.doctors.find(d => d.id === docId);
        if (!doc) return;
        doc.status = newStatus;

        // Update badge animation class
        const badge = document.getElementById(`doc-badge-${docId}`);
        const dot   = document.querySelector(`#doc-btn-${docId} .status-dot`);
        const label = document.getElementById(`doc-label-${docId}`);

        if (badge) badge.className = `doc-status-badge ${newStatus}`;
        if (dot)   dot.className   = `status-dot ${newStatus}`;
        if (label) label.textContent = this.statusLabels[newStatus];

        // Update selected state in dropdown items
        const dd = document.getElementById(`doc-dd-${docId}`);
        if (dd) {
            dd.querySelectorAll('.doc-dropdown-item').forEach(item => item.classList.remove('selected'));
            const items = dd.querySelectorAll('.doc-dropdown-item');
            const keys  = Object.keys(this.statusLabels);
            const idx   = keys.indexOf(newStatus);
            if (items[idx]) items[idx].classList.add('selected');
        }

        // Close dropdown
        this.toggleDocDropdown(-1); // close all
    },


    renderPatientRecords: async function(filterTerm = '') {
        const listContainer = document.getElementById('patientRecordsList');
        if (!listContainer) return;
        
        const patients = await this.getPatients();
        const filtered = patients.filter(p => 
            p.name.toLowerCase().includes(filterTerm.toLowerCase()) || 
            p.id.toLowerCase().includes(filterTerm.toLowerCase())
        );

        listContainer.innerHTML = '';
        
        if (filtered.length === 0) {
            listContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">No records found matching "${filterTerm}"</div>`;
            return;
        }

        filtered.forEach((p, idx) => {
            const card = document.createElement('div');
            const patientStatus = (p.status || 'stable').toLowerCase();
            card.className = `patient-record-card ${this.selectedPatientId === p.id ? 'active' : ''}`;
            card.setAttribute('data-glow', '');
            card.onclick = () => this.selectPatient(p.id);
            card.style.transitionDelay = `${idx * 50}ms`;

            card.innerHTML = `
                <div class="record-avatar">
                    <i class="fa-solid fa-user-injured"></i>
                </div>
                <div class="record-info">
                    <div class="record-name-row">
                        <span class="record-name">${p.name}</span>
                        <span class="status-pill ${patientStatus}">${patientStatus}</span>
                    </div>
                    <div class="record-meta">
                        <span>${p.id}</span>
                        <span>•</span>
                        <span>Age ${p.age || '—'}</span>
                    </div>
                    <div class="record-condition">
                        <i class="fa-solid fa-wave-square"></i>
                        <span>${p.condition || 'N/A'}</span>
                    </div>
                </div>
            `;
            listContainer.appendChild(card);
            
            // Trigger entrance animation
            setTimeout(() => card.classList.add('active'), idx * 50);

        });

    addPatient: function() {
=======
        // Auto-select first patient if none selected
        if (!this.selectedPatientId && filtered.length > 0) {
            this.selectPatient(filtered[0].id);
        }
    },

    selectPatient: async function(id) {
        this.selectedPatientId = id;
        
        // Update active class in list
        document.querySelectorAll('.patient-record-card').forEach(card => {
            card.classList.remove('active');
        });
        const activeCard = Array.from(document.querySelectorAll('.patient-record-card')).find(c => c.innerHTML.includes(id));
        if (activeCard) activeCard.classList.add('active');

        const patients = await this.getPatients();
        const patient = patients.find(p => p.id === id);
        const detailPanel = document.getElementById('patientDetailPanel');
        if (!detailPanel || !patient) return;

        detailPanel.innerHTML = `
            <div class="detail-content">
                <div class="detail-header">
                    <div class="detail-avatar-large">
                        <i class="fa-solid fa-user-injured"></i>
                    </div>
                    <div class="detail-title-area">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                            <h2 style="margin: 0;">${patient.name}</h2>
                            <span class="status-pill ${(patient.status || 'stable').toLowerCase()}" style="font-size: 0.75rem; padding: 0.2rem 0.8rem; text-transform: capitalize;">${patient.status || 'stable'}</span>
                        </div>
                        <div class="record-meta" style="font-size: 1rem;">
                            <span>${patient.id}</span>
                            <span>•</span>
                            <span>${patient.age} years old</span>
                            <span>•</span>
                            <span>${patient.gender}</span>
                        </div>
                    </div>
                    <button class="btn-primary-sm" onclick="app.openFullDossier('${patient.id}')" style="margin-left: auto;">
                        <i class="fa-solid fa-expand"></i> Complete Details
                    </button>
                </div>

                <div class="detail-info-grid">
                    <div class="info-item">
                        <span class="info-label">Current Medical Condition</span>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <span class="info-value">${patient.condition || 'Not Recorded'}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Next Clinical Session</span>
                        <span class="info-value" style="color: var(--accent-blue); font-size: 1.3rem;">${patient.nextAppt || 'TBD'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Baseline Vitals & Markers</span>
                        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                            <span class="info-value"><i class="fa-solid fa-droplet" style="color: #ef4444; margin-right: 0.5rem; font-size: 0.9rem;"></i>${patient.bloodGroup || 'TBD'}</span>
                            <span class="info-value" style="font-size: 0.9rem; opacity: 0.7;"><i class="fa-solid fa-heart-pulse" style="color: #ec4899; margin-right: 0.5rem; font-size: 0.9rem;"></i>${patient.heartRate || '—'} bpm</span>
                        </div>
                    </div>
                </div>

                <div class="detail-actions">
                    <button class="action-btn primary" onclick="app.triggerReportUpload('${patient.id}')">
                        <i class="fa-solid fa-file-medical"></i>
                        Add Medical Report
                    </button>
                    <button class="action-btn" onclick="app.openMedicineModal('${patient.id}')">
                        <i class="fa-solid fa-capsules"></i>
                        Update Medicines
                    </button>
                    <button class="action-btn" onclick="app.openFollowupModal('${patient.id}')">
                        <i class="fa-solid fa-calendar-check"></i>
                        Schedule Follow-up
                    </button>
                </div>
            </div>
        `;
    },

    searchPatients: function(query) {
        this.renderPatientRecords(query);
    },

    openFullDossier: async function(id) {
        this._activePatientId = id;
        const patients = await this.getPatients();
        const patient = patients.find(p => p.id === id);
        if (!patient) return;

        const overlay = document.getElementById('fullDossierOverlay');
        const content = document.getElementById('dossierContent');
        if (!overlay || !content) return;

        content.innerHTML = `
            <!-- Recent Activity Highlight (Redesigned) -->
            <div class="dossier-section" style="background: rgba(56, 189, 248, 0.08); border-left: 5px solid var(--accent-blue); padding: 1.2rem;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 1.2rem;">
                        <div style="font-size: 1.8rem; color: var(--accent-blue);"><i class="fa-solid fa-calendar-check"></i></div>
                        <div>
                            <h4 style="margin: 0; color: white; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">Clinical Visit Summary</h4>
                            <p style="margin: 0.2rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">
                                <span style="color: var(--accent-blue); font-weight: 700;">LAST VISIT:</span> ${patient.lastVisit} &nbsp; 
                                <span style="opacity: 0.4;">|</span> &nbsp;
                                <span style="color: var(--text-light); font-weight: 700;">PREVIOUS UPDATE:</span> ${patient.past_history?.[0]?.date || 'First Record'}
                            </p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span class="status-pill ${(patient.status || 'stable').toLowerCase()}" style="font-size: 0.85rem; padding: 0.4rem 1rem;">${patient.status || 'Stable'}</span>
                    </div>
                </div>
            </div>

            <!-- Demographic & Identity Profile -->
            <div class="dossier-section">
                <span class="section-label">Personal Identity & Contact</span>
                <div class="dossier-profile-grid">
                    <div class="profile-card-static" style="padding: 0.5rem; text-align: center;">
                        <div class="detail-avatar-large" style="width:90px; height:90px; font-size:2.5rem; margin: 0 auto 1rem auto;">
                            <i class="fa-solid fa-user-injured"></i>
                        </div>
                        <h1 style="font-size:2rem; color:var(--text-primary); margin-bottom:0.3rem; letter-spacing: -1px;">${patient.name}</h1>
                        <p style="color:var(--text-secondary); font-size:1rem; opacity: 0.8;">Patient ID: ${patient.id}</p>
                    </div>
                    <div class="profile-details-list">
                        <div class="detail-info-grid" style="grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                            <div class="info-item">
                                <span class="info-label">Full Name</span>
                                <span class="info-value">${patient.name}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Gender / Age</span>
                                <span class="info-value">${patient.gender || '—'} / ${patient.age || '—'} Yrs</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Contact Number</span>
                                <span class="info-value">${patient.phone || 'Not Provided'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Blood Group</span>
                                <span class="info-value">${patient.bloodGroup || 'TBD'}</span>
                            </div>
                            <div class="info-item" style="grid-column: span 2;">
                                <span class="info-label">Residential Address</span>
                                <span class="info-value">${patient.address || 'Address not on file'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Recording Weight</span>
                                <span class="info-value">${patient.weight || '—'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Disease & Condition Profile (Enhanced) -->
            <div class="dossier-section">
                <span class="section-label">Primary Diagnosis & Condition</span>
                <div style="background: rgba(56, 189, 248, 0.05); padding: 1.2rem; border-radius: var(--border-radius-md); border: 1px solid rgba(56, 189, 248, 0.2); margin-bottom: 1rem;">
                    <h2 style="margin: 0 0 0.5rem 0; color: var(--accent-blue); font-size: 1.5rem;">${patient.condition}</h2>
                    <p style="margin: 0; color: var(--text-light); line-height: 1.6; font-size: 0.95rem;">
                        ${patient.disease_desc || 'No detailed diagnostic description available.'}
                    </p>
                </div>
            </div>

            <!-- Medication Strategy & Treatment Duration -->
            <div class="dossier-section">
                <span class="section-label">Active Prescription & Medication Plan</span>
                <div class="medication-grid">
                    ${(patient.medications || []).map(m => `
                        <div class="med-card">
                            <div class="med-icon"><i class="fa-solid fa-capsules"></i></div>
                            <div class="med-info">
                                <span class="med-name">${m.name}</span>
                                <span class="med-dose">${m.dose} • ${m.frequency}</span>
                            </div>
                            <div class="med-duration">Use Until: ${m.courseUntil}</div>
                        </div>
                    `).join('') || '<p style="color:var(--text-secondary);">No active medications recorded.</p>'}
                </div>
            </div>

            <!-- Vital Trends & Next Milestone -->
            <div class="dossier-section" style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                <div>
                    <span class="section-label">Clinical Vital Trends</span>
                    <div class="dossier-vital-stats" style="grid-template-columns: repeat(2, 1fr);">
                        <div class="vital-box stable">
                            <span class="vital-label">Heart Rate (Avg)</span>
                            <span class="vital-value">${patient.heartRate || '—'}</span>
                        </div>
                        <div class="vital-box stable">
                            <span class="vital-label">Oxygen Saturation</span>
                            <span class="vital-value">98.2%</span>
                        </div>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--accent-blue); border-radius: var(--border-radius-md); padding: 1rem; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                    <span class="section-label" style="margin-bottom: 0.5rem; color: var(--accent-blue);">Next Milestone</span>
                    <div style="font-size: 1.4rem; font-weight: 800; color: white;">${patient.nextAppt}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.3rem;">Follow-up Consultation</div>
                </div>
            </div>

            <!-- Immersive Medical History -->
            <div class="dossier-section">
                <span class="section-label">Chronological Medical History</span>
                <div class="timeline">
                    ${(patient.past_history || []).map(h => `
                        <div class="timeline-item">
                            <span class="tm-date">${h.date}</span>
                            <span class="tm-title">${h.event} • <span style="text-transform: capitalize; color: var(--accent-blue); font-size: 0.85rem;">${h.status}</span></span>
                            <p class="tm-desc">Clinical Result: <strong>${h.result}</strong></p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // prevent scrolling
    },

    closeFullDossier: function() {
        const overlay = document.getElementById('fullDossierOverlay');
        if (overlay) overlay.classList.add('hidden');
        document.body.style.overflow = ''; // restore scrolling
    },

    // --- ACTION MODAL HELPERS ---
    _activePatientId: null,

    openActionModal: function(htmlContent) {
        const overlay = document.getElementById('actionModalOverlay');
        const content = document.getElementById('actionModalContent');
        if (!overlay || !content) return;
        content.innerHTML = htmlContent;
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
    },

    closeActionModal: function() {
        const overlay = document.getElementById('actionModalOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
        this._activePatientId = null;
    },

    showToast: function(message, type) {
        const toast = document.createElement('div');
        toast.className = 'nexus-toast ' + (type || 'success');
        toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i> ${message}`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('visible'));
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    },

    // --- 1. ADD MEDICAL REPORT (File Upload) ---
    triggerReportUpload: async function(patientId) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Store report reference in patient data
                const patients = await this.getPatients();
                const patient = patients.find(p => p.id === patientId);
                if (patient) {
                    if (!patient.reports) patient.reports = [];
                    patient.reports.push({
                        name: file.name,
                        size: (file.size / 1024).toFixed(1) + ' KB',
                        date: new Date().toISOString().split('T')[0],
                        type: file.name.split('.').pop().toUpperCase()
                    });
                    await this.savePatient(patient);
                    this.selectPatient(patientId);
                }
                this.showToast(`Report "${file.name}" attached successfully`, 'success');
            }
            fileInput.remove();
        });
        document.body.appendChild(fileInput);
        fileInput.click();
    },

    // --- 2. UPDATE MEDICINES (Modal Form) ---
    openMedicineModal: function(patientId) {
        this._activePatientId = patientId;
        this.openActionModal(`
            <div class="action-modal-header">
                <h3><i class="fa-solid fa-capsules" style="color: var(--accent-blue); margin-right: 0.6rem;"></i>Update Medicines</h3>
                <button class="modal-close-btn" onclick="app.closeActionModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form onsubmit="event.preventDefault(); app.submitMedicineUpdate();" class="action-modal-form">
                <div class="modal-input-group">
                    <label>Medicine Name</label>
                    <input type="text" id="medName" placeholder="e.g. Amlodipine" required>
                </div>
                <div class="modal-input-row">
                    <div class="modal-input-group">
                        <label>Dosage</label>
                        <input type="text" id="medDose" placeholder="e.g. 5mg" required>
                    </div>
                    <div class="modal-input-group">
                        <label>Frequency</label>
                        <select id="medFreq" required>
                            <option value="Once daily">Once daily</option>
                            <option value="Twice daily">Twice daily</option>
                            <option value="Three times daily">Three times daily</option>
                            <option value="As needed">As needed</option>
                            <option value="Weekly">Weekly</option>
                        </select>
                    </div>
                </div>
                <div class="modal-input-group">
                    <label>Course End Date</label>
                    <input type="date" id="medCourseEnd" required>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; margin-top: 1rem;">
                    <i class="fa-solid fa-plus" style="margin-right: 0.5rem;"></i>Add Medication
                </button>
            </form>
        `);
    },

    submitMedicineUpdate: async function() {
        const name = document.getElementById('medName').value;
        const dose = document.getElementById('medDose').value;
        const freq = document.getElementById('medFreq').value;
        const courseEnd = document.getElementById('medCourseEnd').value;
        if (!name || !dose || !courseEnd) return;

        const patients = await this.getPatients();
        const patient = patients.find(p => p.id === this._activePatientId);
        if (!patient) return;

        if (!patient.medications) patient.medications = [];
        patient.medications.push({
            name: name,
            dose: dose,
            frequency: freq,
            courseUntil: courseEnd
        });

        await this.savePatient(patient);
        this.closeActionModal();
        this.selectPatient(this._activePatientId);
        this.showToast(`${name} ${dose} added to prescription`, 'success');
    },

    // --- 3. SCHEDULE FOLLOW-UP (Date Picker Modal) ---
    openFollowupModal: async function(patientId) {
        this._activePatientId = patientId;
        const patients = await this.getPatients();
        const patient = patients.find(p => p.id === patientId);
        const currentAppt = patient?.nextAppt || '';

        this.openActionModal(`
            <div class="action-modal-header">
                <h3><i class="fa-solid fa-calendar-check" style="color: var(--accent-blue); margin-right: 0.6rem;"></i>Schedule Follow-up</h3>
                <button class="modal-close-btn" onclick="app.closeActionModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form onsubmit="event.preventDefault(); app.submitFollowupUpdate();" class="action-modal-form">
                <div class="modal-input-group">
                    <label>Current Appointment</label>
                    <input type="text" value="${currentAppt || 'Not Scheduled'}" disabled style="opacity: 0.5;">
                </div>
                <div class="modal-input-group">
                    <label>New Follow-up Date</label>
                    <input type="date" id="followupDate" required>
                </div>
                <div class="modal-input-group">
                    <label>Reason / Notes (optional)</label>
                    <input type="text" id="followupNotes" placeholder="e.g. BP review, post-surgery check">
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; margin-top: 1rem;">
                    <i class="fa-solid fa-calendar-plus" style="margin-right: 0.5rem;"></i>Confirm Appointment
                </button>
            </form>
        `);
    },

    submitFollowupUpdate: async function() {
        const date = document.getElementById('followupDate').value;
        if (!date) return;

        const patients = await this.getPatients();
        const patient = patients.find(p => p.id === this._activePatientId);
        if (!patient) return;

        patient.nextAppt = date;
        await this.savePatient(patient);
        this.closeActionModal();
        this.selectPatient(this._activePatientId);
        this.showToast(`Follow-up scheduled for ${date}`, 'success');
    },

    addPatient: async function() {

        const name = document.getElementById('apName').value;
        const age = document.getElementById('apAge').value;
        const gender = document.getElementById('apGender').value;
        const condition = document.getElementById('apCondition').value;

        

        const bloodGroup = document.getElementById('apBloodGroup').value;
        const phone = document.getElementById('apPhone').value;
        const email = document.getElementById('apEmail').value || 'N/A';
        const address = document.getElementById('apAddress').value;
        const reportInput = document.getElementById('apMedicalReport');
        const reportFile = reportInput ? reportInput.files[0] : null;


        // simple validation
        if(!name || !age || !gender || !condition || !phone || !address) {
            this.showToast('Please fill in all mandatory fields', 'error');
            return;
        }

        // Mandatory Unique ID Generation (Format: PT-YYYYMMDD-XXXX)
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.floor(1000 + Math.random() * 9000);
        const newId = `PT-${dateStr}-${randomStr}`;
        
        const newPatient = {
            id: newId,
            name: name,
            age: parseInt(age),
            gender: gender,
            condition: condition,

            status: 'Stable' // default
        });

        this.savePatients(patients);

            status: 'stable',
            lastVisit: now.toISOString().split('T')[0],
            nextAppt: 'Pending',
            bloodGroup: bloodGroup,
            phone: phone,
            email: email,
            address: address,
            weight: '—',
            heartRate: '—',
            reportAttached: reportFile ? reportFile.name : null,
            past_history: [
                { 
                    date: now.toISOString().split('T')[0], 
                    event: 'Initial Registration', 
                    result: reportFile ? `Registered with preliminary report: ${reportFile.name}` : 'Registered via Hospital Portal', 
                    status: 'stable' 
                }
            ]
        };


        await this.savePatient(newPatient);
        
        this.showToast(`Patient ${name} registered successfully with ID ${newId}`, 'success');
        
        // Reset form
        document.getElementById('addPatientForm').reset();
        const fileHint = document.getElementById('apFileNameDisplay');
        if(fileHint) fileHint.textContent = 'No file selected';
        
        // Switch back to patients tab and select the new patient
        this.selectedPatientId = newId; 
        await this.renderPatientRecords(); // This will render the list and auto-select the current selectedPatientId
        this.switchHospitalTab(null, 'patients');
        
        // Trigger selectPatient to show details immediately
        this.selectPatient(newId);
    },

    // --- PATIENT DASHBOARD ---
    switchPatientTab: function(event, tabId) {
        const navItems = document.querySelectorAll('#view-patient-dashboard .sidebar-nav li');
        navItems.forEach(item => item.classList.remove('active'));
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        }

        document.querySelectorAll('#view-patient-dashboard .tab-content').forEach(el => {
            el.classList.add('hidden');
        });

        document.getElementById(`pat-tab-${tabId}`).classList.remove('hidden');
    },

    triggerSOS: function() {
        const confirmation = confirm("WARNING: You are about to trigger an Emergency SOS. Local hospitals and emergency contacts will be notified. Proceed?");
        if(confirmation) {
            alert("🚨 SOS SIGNAL DEPLOYED 🚨\nLocation tracked. Emergency services and your family contacts have been dispatched.");
        }
    },

    handleChat: function() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if(!text) return;

        const chatWindow = document.getElementById('chatWindow');
        
        // Insert User message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message user';
        userMsg.innerHTML = `<div class="msg-bubble">${text}</div>`;
        chatWindow.appendChild(userMsg);
        
        input.value = '';
        
        // Scroll to bottom
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Simulate AI bot response delay
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = 'chat-message bot';
            
            // Dummy AI Logic
            let reply = "I understand. Is there anything else you'd like me to look into?";
            const textLower = text.toLowerCase();
            if(textLower.includes('headache') || textLower.includes('pain')) {
                reply = "Based on your symptoms, you might need some rest. Have you taken any of your prescribed painkillers today?";
            } else if (textLower.includes('appointment')) {
                reply = "You have an upcoming appointment with Dr. Smith today at 2:30 PM. Would you like to reschedule?";
            } else if (textLower.includes('hello') || textLower.includes('hi')) {
                reply = "Hello! How are you feeling today?";
            }

            botMsg.innerHTML = `<div class="msg-bubble">${reply}</div>`;
            chatWindow.appendChild(botMsg);
            chatWindow.scrollTop = chatWindow.scrollHeight;
            
        }, 1000);
    },

    // --- ANIMATIONS ---
    initAnimations: function() {
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-reveal, .stagger-item').forEach(el => {
            observer.observe(el);
        });
        
        // Initialize Lucide Icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        this.initSmoothScroll();
    },

    initSmoothScroll: function() {
        document.querySelectorAll('a[href^="index.html#"], a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                const targetId = href.split('#')[1];
                const targetElement = document.getElementById(targetId);

                // Only prevent default if we're on the same page (index.html)
                if (targetElement && (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/'))) {
                    e.preventDefault();
                    const offset = 80; // Navbar height offset
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = targetElement.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Update hash without jump
                    history.pushState(null, null, '#' + targetId);
                }
            });
        });

        // Initial scroll if hash exists
        if (window.location.hash) {
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    const offset = 80;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = target.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 600);
        }
    },
    
    // --- GSAP PILLNAV ---
    initPillNav: function() {
        if (typeof gsap === 'undefined') return;

        const ease = 'power3.easeOut';
        const circles = document.querySelectorAll('.pill .hover-circle');
        const pills = document.querySelectorAll('.pill');
        const logo = document.getElementById('pill-logo');
        const logoImg = document.getElementById('pill-logo-img');
        const navItems = document.getElementById('pill-nav-items');
        const hamburger = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu-popover');
        let isMobileMenuOpen = false;
        
        const tlRefs = [];
        const activeTwRefs = [];

        const layout = () => {
            circles.forEach((circle, index) => {
                const pill = circle.parentElement;
                const rect = pill.getBoundingClientRect();
                const w = rect.width;
                const h = rect.height;
                if (w === 0 || h === 0) return;

                const R = ((w * w) / 4 + h * h) / (2 * h);
                const D = Math.ceil(2 * R) + 2;
                const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
                const originY = D - delta;

                circle.style.width = `${D}px`;
                circle.style.height = `${D}px`;
                circle.style.bottom = `-${delta}px`;

                gsap.set(circle, {
                    xPercent: -50,
                    scale: 0,
                    transformOrigin: `50% ${originY}px`
                });

                const label = pill.querySelector('.pill-label');
                const white = pill.querySelector('.pill-label-hover');

                if (label) gsap.set(label, { y: 0 });
                if (white) gsap.set(white, { y: h + 12, opacity: 0 });

                if (tlRefs[index]) tlRefs[index].kill();
                
                const tl = gsap.timeline({ paused: true });
                tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);
                if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
                if (white) {
                    gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
                    tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
                }
                tlRefs[index] = tl;
            });
        };

        layout();
        window.addEventListener('resize', layout);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(layout);
        }

        pills.forEach((pill, i) => {
            pill.addEventListener('mouseenter', () => {
                const tl = tlRefs[i];
                if (!tl) return;
                if (activeTwRefs[i]) activeTwRefs[i].kill();
                activeTwRefs[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: 'auto' });
            });
            pill.addEventListener('mouseleave', () => {
                const tl = tlRefs[i];
                if (!tl) return;
                if (activeTwRefs[i]) activeTwRefs[i].kill();
                activeTwRefs[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: 'auto' });
            });
        });

        if (mobileMenu) {
            gsap.set(mobileMenu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
        }

        // Hamburger click logic
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                isMobileMenuOpen = !isMobileMenuOpen;
                const lines = hamburger.querySelectorAll('.hamburger-line');
                if (isMobileMenuOpen) {
                    gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
                    gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
                    gsap.set(mobileMenu, { visibility: 'visible' });
                    gsap.fromTo(mobileMenu, 
                        { opacity: 0, y: 10, scaleY: 1 }, 
                        { opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease, transformOrigin: 'top center' }
                    );
                } else {
                    gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
                    gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
                    gsap.to(mobileMenu, {
                        opacity: 0, y: 10, scaleY: 1, duration: 0.2, ease, transformOrigin: 'top center',
                        onComplete: () => gsap.set(mobileMenu, { visibility: 'hidden' })
                    });
                }
            });

            // Expose a public function to close the menu on link click
            this.toggleMobileMenu = () => {
                if(isMobileMenuOpen) hamburger.click();
            };
        }

        let logoTween;
        if (logoImg) {
            logo.addEventListener('mouseenter', () => {
                if (logoTween) logoTween.kill();
                gsap.set(logoImg, { rotate: 0 });
                logoTween = gsap.to(logoImg, { rotate: 360, duration: 0.2, ease, overwrite: 'auto' });
            });
        }

        if (logo) {
            gsap.set(logo, { scale: 0 });
            gsap.to(logo, { scale: 1, duration: 0.6, ease });
        }

        if (navItems) {
            gsap.set(navItems, { width: 0, overflow: 'hidden' });
            gsap.to(navItems, { width: 'auto', duration: 0.6, ease });
        }
    },

    initSpotlight: function() {
        // Disabled active pointer tracking to fulfill "don't move it" requirement.
        // The glow is now static and centered in CSS.
    },

    handleRegistrationFile: function(input) {
        const display = document.getElementById('apFileNameDisplay');
        if (input.files && input.files[0]) {
            display.textContent = input.files[0].name;
            display.style.color = 'var(--accent-blue)';
        } else {
            display.textContent = 'No file selected';
            display.style.color = 'var(--text-secondary)';
        }
    },

    // --- PATIENT DASHBOARD DYNAMIC LOGIC ---
    initPatientDashboard: async function() {
        const patientId = localStorage.getItem('nexus_patient_id');
        if (!patientId) {
            console.error("No patient ID found in session.");
            return;
        }

        const patient = await this.getPatientById(patientId);
        if (!patient) {
            console.error("Patient record not found in Firestore.");
            return;
        }

        // 1. Update Identity & Morning Greeting
        const welcomeEl = document.querySelector('.topbar-left h1');
        if (welcomeEl) welcomeEl.innerHTML = `Good morning, ${patient.name.split(' ')[0]} 👋`;
        
        const sbName = document.querySelector('.sb-user-name');
        if (sbName) sbName.textContent = patient.name;
        
        const sbRole = document.querySelector('.sb-user-role');
        if (sbRole) sbRole.textContent = `Patient · ${patient.id.split('-').pop()}`;
        
        const avatarEls = document.querySelectorAll('.sb-user-av, .tb-av');
        const initials = patient.name.split(' ').map(n => n[0]).join('').toUpperCase();
        avatarEls.forEach(el => el.textContent = initials);

        // 2. Update Stats (Assuming data exists or using defaults)
        // For the demo, we map patient fields to the dashboard vitals
        const vitals = {
            bp: patient.bp || { sys: 120, dia: 80 },
            sugar: patient.sugar || { val: 108 },
            hemo: patient.hemo || { val: 13.8 }
        };

        const bpVal = document.querySelector('.stat-card:nth-child(1) .stat-val');
        if (bpVal) bpVal.innerHTML = `${vitals.bp.sys}<span class="stat-unit">/${vitals.bp.dia} mmHg</span>`;
        
        const sugarVal = document.querySelector('.stat-card:nth-child(2) .stat-val');
        if (sugarVal) sugarVal.innerHTML = `${vitals.sugar.val}<span class="stat-unit">mg/dL</span>`;
        
        const hemoVal = document.querySelector('.stat-card:nth-child(3) .stat-val');
        if (hemoVal) hemoVal.innerHTML = `${vitals.hemo.val}<span class="stat-unit">g/dL</span>`;

        // 3. Update Health Story Narrative
        const storyText = document.querySelector('.story-text');
        if (storyText) {
            const risk = (patient.status || 'stable').toLowerCase() === 'stable' ? 'Low-Risk' : 'Monitoring required';
            storyText.innerHTML = `
                Over the past 30 days, ${patient.name.split(' ')[0]}'s health profile has been evaluated.
                Current diagnosis: <mark>${patient.condition}</mark>. 
                Latest BP is <mark>${vitals.bp.sys}/${vitals.bp.dia} mmHg</mark>.
                Next clinical milestone is scheduled for <mark>${patient.nextAppt || 'TBD'}</mark>.
                Overall status remains <mark>${patient.status || 'Stable'}</mark>.
            `;
        }

        // 4. Update Prescription highlights
        const medSummary = document.querySelector('.card:has(.fa-pills) .card-head + div'); // Adjust selector as needed
        // Assuming there's a meds section we want to update

        // 5. Store vitals in app state for AI context
        this._currentPatientVitals = vitals;
    },

    handleAiChat: function() {
        const input = document.getElementById('aiChatInput');
        const chatWindow = document.getElementById('aiChatWindow');
        if (!input || !chatWindow) return;

        const text = input.value.trim();
        if (!text) return;

        // 1. Append User Message
        const userMsg = document.createElement('div');
        userMsg.style = "display:flex; gap:12px; align-self:flex-end; max-width:85%; flex-direction:row-reverse; margin-bottom:20px;";
        userMsg.innerHTML = `
            <div style="width:32px; height:32px; border-radius:50%; background:var(--glass); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:0.8rem; color:var(--accent2); font-weight:700;">JD</div>
            <div style="background:var(--accent); color:#fff; padding:12px 18px; border-radius:16px 0 16px 16px; font-size:0.9rem; line-height:1.5; box-shadow: 0 4px 15px rgba(108,99,255,0.3);">
                ${text}
            </div>
        `;
        chatWindow.appendChild(userMsg);
        input.value = '';
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // 2. Typing Indicator
        const typingId = 'ai-typing-' + Date.now();
        const typingMsg = document.createElement('div');
        typingMsg.id = typingId;
        typingMsg.style = "display:flex; gap:12px; align-self:flex-start; max-width:85%; margin-bottom:20px;";
        typingMsg.innerHTML = `
            <div style="width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg, var(--accent), var(--accent2)); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:0.8rem; color:#fff;">
              <i class="fa-solid fa-robot"></i>
            </div>
            <div style="background:rgba(255,255,255,0.06); padding:14px 18px; border-radius:0 16px 16px 16px; font-size:0.9rem; line-height:1.6; border:1px solid var(--border); color: var(--muted);">
              Nexus AI is thinking...
            </div>
        `;
        chatWindow.appendChild(typingMsg);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // 3. Simulated AI Response
        setTimeout(() => {
            typingMsg.remove();
            
            const vitals = this._currentPatientVitals || { bp: { sys: 120, dia: 80 }, sugar: { val: 108 }, hemo: { val: 13.8 } };
            const firstName = localStorage.getItem('nexus_user_name')?.split(' ')[0] || 'John';
            
            let response = `I'm here to help, ${firstName}. Based on your latest records, your BP is ${vitals.bp.sys}/${vitals.bp.dia} and blood sugar is ${vitals.sugar.val} mg/dL.`;
            
            const lowText = text.toLowerCase();
            if (lowText.includes('sugar') || lowText.includes('diabetes')) {
                response = `Your current blood sugar is <strong style="color:var(--warn);">${vitals.sugar.val} mg/dL</strong>. Since this is in the borderline range, I recommend focusing on a fiber-rich diet and staying hydrated. Would you like a meal plan?`;
            } else if (lowText.includes('bp') || lowText.includes('pressure') || lowText.includes('heart')) {
                response = `Your blood pressure is <strong style="color:var(--accent2);">${vitals.bp.sys}/${vitals.bp.dia} mmHg</strong>, which is within the normal range. Great job maintaining your cardiovascular health!`;
            } else if (lowText.includes('hemoglobin') || lowText.includes('blood')) {
                response = `Your hemoglobin level is <strong style="color:var(--accent2);">${vitals.hemo.val} g/dL</strong>. This is very healthy for an adult male. No signs of anemia detected.`;
            } else if (lowText.includes('hello') || lowText.includes('hi')) {
                response = `Hello ${firstName}! I'm Nexus, your health assistant. How are you feeling today? I can help you understand your reports or book an appointment.`;
            }

            const aiMsg = document.createElement('div');
            aiMsg.style = "display:flex; gap:12px; align-self:flex-start; max-width:85%; margin-bottom:20px;";
            aiMsg.innerHTML = `
                <div style="width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg, var(--accent), var(--accent2)); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:0.8rem; color:#fff;">
                  <i class="fa-solid fa-robot"></i>
                </div>
                <div style="background:rgba(255,255,255,0.06); padding:14px 18px; border-radius:0 16px 16px 16px; font-size:0.9rem; line-height:1.6; border:1px solid var(--border);">
                  ${response}
                </div>
            `;
            chatWindow.appendChild(aiMsg);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 1500);
    },

    addFamilyMember: function() {
        const memberName = prompt("Enter Family Member Name:");
        if (!memberName) return;
        
        const relation = prompt("Enter Relation (e.g. Sister, Brother):");
        if (!relation) return;

        this.showToast(`Request sent to ${memberName} (${relation}). Once they approve, you'll see their vitals here.`, 'info');
        
        // Simulate a new member card being added (visually only for now)
        const container = document.querySelector('#viewFamilyConnect .g3');
        if (container) {
            const newCard = document.createElement('div');
            newCard.className = 'card stat-card';
            newCard.style = "position:relative; overflow:hidden; border-color:var(--accent);";
            newCard.innerHTML = `
                <div style="position:absolute; top:0; right:0; padding:8px 12px; background:rgba(108,99,255,0.1); font-size:0.6rem; font-weight:700; color:var(--accent); border-bottom-left-radius:12px;">PENDING</div>
                <div class="stat-top"><div class="stat-icon ic-red" style="background:rgba(108,99,255,0.1); color:var(--accent);">${memberName.substring(0,2).toUpperCase()}</div><span class="chip c-warn">Waiting</span></div>
                <div>
                    <div class="stat-name">${relation} (${memberName})</div>
                    <div style="font-size:0.75rem; color:var(--muted); margin-top:10px;">Waiting for synchronization...</div>
                </div>
            `;
            // Insert before the "Add New Member" button
            container.insertBefore(newCard, document.getElementById('addFamilyMemberBtn'));
        }
    },
};


// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
    // 0. Start Auth listener
    app.initAuthListener();

    // Check for login type in URL (for login.html)
    if (window.location.pathname.includes('login.html')) {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type');
        if (type) app.switchLogin(type);
    }

    // Initial render / setup
    if (document.getElementById('patientRecordsList')) {
        app.updateUserProfileUI();
        await app.renderPatientRecords();
    }

    if (document.getElementById('sideNav') && window.location.pathname.includes('patient-dashboard.html')) {
        app.updateUserProfileUI();
        await app.initPatientDashboard();
    }
    
    app.initAnimations();
    app.initPillNav();
    app.initSpotlight();
});

// Expose app to global window for HTML event handlers
window.app = app;
