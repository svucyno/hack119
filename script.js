/**
 * HealthNexus - Main Application Logic
 */

const app = {
    // --- STATE ---
    getPatients: function() {
        const stored = localStorage.getItem('nexus_patients');
        if (stored) return JSON.parse(stored);
        
        // Default initial data if empty
        const defaults = [
            { id: 'NEX-1001', name: 'James Wilson', age: 45, gender: 'Male', condition: 'Hypertension Management', status: 'Stable' },
            { id: 'NEX-1002', name: 'Sarah Connor', age: 32, gender: 'Female', condition: 'Post-surgery recovery', status: 'Stable' },
            { id: 'NEX-1003', name: 'Robert Fox', age: 67, gender: 'Male', condition: 'Severe Asthma Attack', status: 'Critical' },
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

    switchHospitalTab: function(tabId) {
        // Update nav styling
        const navItems = document.querySelectorAll('#view-hospital-dashboard .sidebar-nav li');
        navItems.forEach(item => item.classList.remove('active'));
        event.currentTarget.classList.add('active');

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
    doctors: [
        { id: 1, name: 'Dr. Arjun Mehta',   specialty: 'Cardiologist',       icon: 'fa-heart-pulse',    status: 'available', patients: 8,  since: '08:00 AM', accent: '#38BDF8' },
        { id: 2, name: 'Dr. Priya Sharma',   specialty: 'Neurologist',         icon: 'fa-brain',          status: 'busy',      patients: 5,  since: '09:30 AM', accent: '#A78BFA' },
        { id: 3, name: 'Dr. Rajan Das',      specialty: 'Orthopedic Surgeon',  icon: 'fa-bone',           status: 'surgery',   patients: 3,  since: '07:00 AM', accent: '#FB7185' },
        { id: 4, name: 'Dr. Nisha Kapoor',   specialty: 'Pediatrician',        icon: 'fa-child-reaching', status: 'available', patients: 12, since: '08:30 AM', accent: '#34D399' },
        { id: 5, name: 'Dr. Samuel Okafor',  specialty: 'General Physician',   icon: 'fa-stethoscope',    status: 'offline',   patients: 0,  since: '—',        accent: '#64748B' },
        { id: 6, name: 'Dr. Tanvi Reddy',    specialty: 'Ophthalmologist',     icon: 'fa-eye',            status: 'available', patients: 6,  since: '09:00 AM', accent: '#FBBF24' },
        { id: 7, name: 'Dr. Kiran Bose',     specialty: 'Dermatologist',       icon: 'fa-hand-holding-medical', status: 'busy', patients: 4, since: '10:00 AM', accent: '#F472B6' },
        { id: 8, name: 'Dr. Aditya Singh',   specialty: 'Radiologist',         icon: 'fa-radiation',      status: 'surgery',   patients: 2,  since: '06:30 AM', accent: '#EF4444' },
    ],

    statusLabels: {
        available: '🟢 Available',
        busy:      '🟡 Busy (Consultation)',
        surgery:   '🔴 In Surgery',
        offline:   '⚫ Offline',
    },

    renderDoctors: function() {
        const grid = document.getElementById('doctorCardsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        this.doctors.forEach((doc, idx) => {
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


    renderPatients: function() {
        const container = document.getElementById('patientCardsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        const patients = this.getPatients();
        
        if (patients.length === 0) {
            container.innerHTML = `<div style="text-align:center; grid-column: 1 / -1; padding: 2rem;">No patients registered</div>`;
            return;
        }

        patients.forEach((p, idx) => {
            const statusClass = p.status === 'Stable' ? 'stable' : 'critical';
            
            const mockReports = p.reports ? p.reports : "No reports uploaded.";
            const mockPresc = p.prescription ? p.prescription : "No prescriptions issued yet.";

            const card = document.createElement('div');
            card.className = 'pat-card';
            
            card.innerHTML = `
                <div class="pat-card-header" onclick="app.togglePatientSummary(${idx})">
                    <div class="pat-avatar"><i class="fa-solid fa-hospital-user"></i></div>
                    <div>
                        <h4 style="color: var(--text-primary); margin:0;">${p.name}</h4>
                        <small style="color: var(--text-secondary);">${p.id}</small>
                    </div>
                </div>
                <!-- Initially hidden summary -->
                <div class="pat-details" id="pat-summary-${idx}" style="display: none;">
                    <p><strong>Name:</strong> <span>${p.name}</span></p>
                    <p><strong>Age/Gender:</strong> <span>${p.age} / ${p.gender}</span></p>
                    <p><strong>Status:</strong> <span class="status ${statusClass}">${p.status}</span></p>
                    <div class="pat-actions">
                        <button class="btn-outline-sm" onclick="app.togglePatientDetails(${idx})">View details</button>
                    </div>
                </div>
                <!-- Initially hidden extended details -->
                <div class="pat-extended-details" id="pat-ext-${idx}">
                    <p style="margin-bottom:0.5rem; display:block;"><strong>Reports:</strong><br/> <span style="color:var(--text-light); font-size:0.9rem;">${mockReports}</span></p>
                    <p style="display:block;"><strong>Prescription:</strong><br/> <span style="color:var(--text-light); font-size:0.9rem;">${mockPresc}</span></p>
                </div>
            `;
            container.appendChild(card);
        });
    },

    togglePatientSummary: function(idx) {
        const summary = document.getElementById('pat-summary-' + idx);
        const ext = document.getElementById('pat-ext-' + idx);
        if(summary.style.display === 'none') {
            summary.style.display = 'block';
        } else {
            summary.style.display = 'none';
            ext.style.display = 'none'; // hide extended too
        }
    },

    togglePatientDetails: function(idx) {
        const ext = document.getElementById('pat-ext-' + idx);
        if(ext.style.display === 'none' || ext.style.display === '') {
            ext.style.display = 'block';
        } else {
            ext.style.display = 'none';
        }
    },

    addPatient: function() {
        const name = document.getElementById('apName').value;
        const age = document.getElementById('apAge').value;
        const gender = document.getElementById('apGender').value;
        const condition = document.getElementById('apCondition').value;
        const reportsInput = document.getElementById('apReports');
        const reports = reportsInput && reportsInput.files && reportsInput.files.length > 0 ? reportsInput.files[0].name : '';
        const prescription = document.getElementById('apPrescription') ? document.getElementById('apPrescription').value : '';
        
        // simple validation
        if(!name || !age || !condition) return;

        const patients = this.getPatients();
        const newId = 'NEX-' + Math.floor(1000 + Math.random() * 9000);
        
        patients.push({
            id: newId,
            name: name,
            age: age,
            gender: gender,
            condition: condition,
            reports: reports,
            prescription: prescription,
            status: 'Stable' // default
        });

        this.savePatients(patients);

        // Reset form
        document.getElementById('addPatientForm').reset();
        
        alert(`Patient ${name} added successfully with ID: ${newId}`);
        
        // Go back to table view
        document.querySelector('.sidebar-nav li').click(); // programmatic click to first tab
        this.renderPatients();
    },

    // --- PATIENT DASHBOARD ---
    switchPatientTab: function(tabId) {
        const navItems = document.querySelectorAll('#view-patient-dashboard .sidebar-nav li');
        navItems.forEach(item => item.classList.remove('active'));
        event.currentTarget.classList.add('active');

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
    if (document.getElementById('patientTableBody')) {
        app.renderPatients();
    }
    
    app.initAnimations();
    app.initPillNav();
});

