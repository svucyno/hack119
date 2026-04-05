/**
 * HealthNexus - Main Application Logic
 */

const app = {
    // --- STATE ---
    getPatients: function() {
        const stored = localStorage.getItem('nexus_patients');
        if (stored) return JSON.parse(stored);
        
        // Default initial data for Demo
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
        localStorage.setItem('nexus_patients', JSON.stringify(defaults));
        return defaults;
    },
    
    savePatients: function(patients) {
        localStorage.setItem('nexus_patients', JSON.stringify(patients));
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

    // --- LOGIN LOGIC ---
    switchLogin: function(type) {
        // Update Buttons
        document.getElementById('btnSwitchHospital').classList.remove('active');
        document.getElementById('btnSwitchPatient').classList.remove('active');
        
        // Hide forms
        document.getElementById('formHospitalLogin').classList.add('hidden');
        document.getElementById('formPatientLogin').classList.add('hidden');

        if(type === 'hospital') {
            document.getElementById('btnSwitchHospital').classList.add('active');
            document.getElementById('formHospitalLogin').classList.remove('hidden');
        } else {
            document.getElementById('btnSwitchPatient').classList.add('active');
            document.getElementById('formPatientLogin').classList.remove('hidden');
        }
    },

    login: function(role) {
        // Save auth state
        localStorage.setItem('nexus_user_role', role);
        
        if(role === 'hospital') {
            this.navigate('hospital-dashboard');
            if (typeof this.renderPatients === 'function') this.renderPatients();
        } else if (role === 'patient') {
            this.navigate('patient-dashboard');
        }
    },

    logout: function() {
        // Clear auth state
        localStorage.removeItem('nexus_user_role');
        this.navigate('home');
    },

    getAuthRole: function() {
        return localStorage.getItem('nexus_user_role');
    },

    // --- HOSPITAL DASHBOARD ---
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


    renderPatientRecords: function(filterTerm = '') {
        const listContainer = document.getElementById('patientRecordsList');
        if (!listContainer) return;
        
        const patients = this.getPatients();
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

        // Auto-select first patient if none selected
        if (!this.selectedPatientId && filtered.length > 0) {
            this.selectPatient(filtered[0].id);
        }
    },

    selectPatient: function(id) {
        this.selectedPatientId = id;
        
        // Update active class in list
        document.querySelectorAll('.patient-record-card').forEach(card => {
            card.classList.remove('active');
        });
        const activeCard = Array.from(document.querySelectorAll('.patient-record-card')).find(c => c.innerHTML.includes(id));
        if (activeCard) activeCard.classList.add('active');

        const patient = this.getPatients().find(p => p.id === id);
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

    openFullDossier: function(id) {
        const patient = this.getPatients().find(p => p.id === id);
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
    triggerReportUpload: function(patientId) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Store report reference in patient data
                const patients = this.getPatients();
                const patient = patients.find(p => p.id === patientId);
                if (patient) {
                    if (!patient.reports) patient.reports = [];
                    patient.reports.push({
                        name: file.name,
                        size: (file.size / 1024).toFixed(1) + ' KB',
                        date: new Date().toISOString().split('T')[0],
                        type: file.name.split('.').pop().toUpperCase()
                    });
                    this.savePatients(patients);
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

    submitMedicineUpdate: function() {
        const name = document.getElementById('medName').value;
        const dose = document.getElementById('medDose').value;
        const freq = document.getElementById('medFreq').value;
        const courseEnd = document.getElementById('medCourseEnd').value;
        if (!name || !dose || !courseEnd) return;

        const patients = this.getPatients();
        const patient = patients.find(p => p.id === this._activePatientId);
        if (!patient) return;

        if (!patient.medications) patient.medications = [];
        patient.medications.push({
            name: name,
            dose: dose,
            frequency: freq,
            courseUntil: courseEnd
        });

        this.savePatients(patients);
        this.closeActionModal();
        this.selectPatient(this._activePatientId);
        this.showToast(`${name} ${dose} added to prescription`, 'success');
    },

    // --- 3. SCHEDULE FOLLOW-UP (Date Picker Modal) ---
    openFollowupModal: function(patientId) {
        this._activePatientId = patientId;
        const patient = this.getPatients().find(p => p.id === patientId);
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

    submitFollowupUpdate: function() {
        const date = document.getElementById('followupDate').value;
        if (!date) return;

        const patients = this.getPatients();
        const patient = patients.find(p => p.id === this._activePatientId);
        if (!patient) return;

        patient.nextAppt = date;
        this.savePatients(patients);
        this.closeActionModal();
        this.selectPatient(this._activePatientId);
        this.showToast(`Follow-up scheduled for ${date}`, 'success');
    },

    addPatient: function() {
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

        const patients = this.getPatients();
        
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

        patients.unshift(newPatient); // Add to top
        this.savePatients(patients);
        
        this.showToast(`Patient ${name} registered successfully with ID ${newId}`, 'success');
        
        // Reset form
        document.getElementById('addPatientForm').reset();
        const fileHint = document.getElementById('apFileNameDisplay');
        if(fileHint) fileHint.textContent = 'No file selected';
        
        // Switch back to patients tab and select the new patient
        this.selectedPatientId = newId; 
        this.renderPatientRecords(); // This will render the list and auto-select the current selectedPatientId
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

        // Sidebar responsive auto-collapse
        const handleResize = () => {
            const sidebar = document.getElementById('hospitalSidebar');
            if (sidebar) {
                if (window.innerWidth < 1024) {
                    sidebar.classList.add('collapsed');
                } else {
                    sidebar.classList.remove('collapsed');
                }
            }
        };
        window.addEventListener('resize', handleResize);
        setTimeout(handleResize, 50); // initial check

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
    }
};


// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Check for login type in URL (for login.html)
    if (window.location.pathname.includes('login.html')) {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type');
        if (type) app.switchLogin(type);
    }

    // Initial render / setup
    if (document.getElementById('patientRecordsList')) {
        app.renderPatientRecords();
    }
    
    app.initAnimations();
    app.initPillNav();
    app.initSpotlight();
});

