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
        if(role === 'hospital') {
            this.navigate('hospital-dashboard');
            this.renderPatients();
        } else if (role === 'patient') {
            this.navigate('patient-dashboard');
        }
    },

    logout: function() {
        this.navigate('home');
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
        // Find by simple iteration or event logic (event logic is simple via click usually but here we hardcode mapping)
        event.currentTarget.classList.add('active');

        // Hide all tabs
        document.querySelectorAll('#view-hospital-dashboard .tab-content').forEach(el => {
            el.classList.add('hidden');
        });

        // Show active
        document.getElementById(`hosp-tab-${tabId}`).classList.remove('hidden');

        // Lazy render
        if (tabId === 'doctors') this.renderDoctors();
        if (tabId === 'patients') this.renderPatients();
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

    getDoctors: function() {
        let doctors = localStorage.getItem('nexus_doctors');
        if (!doctors) {
            // Mock doctors if None exist
            const mockDoctors = [
                { id: 'DOC-1', name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', status: 'available' },
                { id: 'DOC-2', name: 'Dr. Michael Chen', specialty: 'Pediatrics', status: 'busy' },
                { id: 'DOC-3', name: 'Dr. Emily Carter', specialty: 'Neurology', status: 'surgery' },
                { id: 'DOC-4', name: 'Dr. James Wilson', specialty: 'Oncology', status: 'offline' }
            ];
            localStorage.setItem('nexus_doctors', JSON.stringify(mockDoctors));
            return mockDoctors;
        }
        return JSON.parse(doctors);
    },

    saveDoctors: function(doctors) {
        localStorage.setItem('nexus_doctors', JSON.stringify(doctors));
    },

    renderDoctors: function() {
        const container = document.getElementById('doctorCardsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        const doctors = this.getDoctors();
        
        doctors.forEach((doc, idx) => {
            let statusIcon = 'status-offline';
            let statusText = 'Offline';
            if (doc.status === 'available') { statusIcon = 'status-available'; statusText = 'Available'; }
            if (doc.status === 'busy') { statusIcon = 'status-busy'; statusText = 'Busy'; }
            if (doc.status === 'surgery') { statusIcon = 'status-surgery'; statusText = 'In Surgery'; }

            const card = document.createElement('div');
            card.className = 'doc-card';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <div class="pat-avatar"><i class="fa-solid fa-user-doctor"></i></div>
                        <div>
                            <h4 style="color: var(--text-primary); margin:0;">${doc.name}</h4>
                            <small style="color: var(--text-secondary);">${doc.specialty}</small>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 1.5rem;">
                    <div style="position: relative; display: inline-block; width: 100%;">
                        <button class="radix-dropdown-trigger" onclick="app.toggleDoctorDropdown('${doc.id}', event)" style="width: 100%;">
                            <span style="display: flex; align-items: center; gap: 0.5rem;">
                                <span class="status-dot ${statusIcon}"></span> ${statusText}
                            </span>
                            <i class="fa-solid fa-chevron-down" style="font-size: 0.8rem; opacity: 0.7;"></i>
                        </button>
                        <div id="dropdown-${doc.id}" class="radix-dropdown-content" data-state="closed">
                            <div class="radix-dropdown-item" onclick="app.updateDoctorStatus('${doc.id}', 'available', event)">
                                <span class="status-dot status-available"></span> Available
                            </div>
                            <div class="radix-dropdown-item" onclick="app.updateDoctorStatus('${doc.id}', 'busy', event)">
                                <span class="status-dot status-busy"></span> Busy
                            </div>
                            <div class="radix-dropdown-item" onclick="app.updateDoctorStatus('${doc.id}', 'surgery', event)">
                                <span class="status-dot status-surgery"></span> In Surgery
                            </div>
                            <div class="radix-dropdown-item" onclick="app.updateDoctorStatus('${doc.id}', 'offline', event)">
                                <span class="status-dot status-offline"></span> Offline
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Attach global click listener to close dropdowns if clicked outside
        if(!window.dropdownListenerAdded) {
            document.addEventListener('click', (e) => {
                document.querySelectorAll('.radix-dropdown-content').forEach(dropdown => {
                    if (dropdown.getAttribute('data-state') === 'open') {
                        dropdown.setAttribute('data-state', 'closed');
                    }
                });
            });
            window.dropdownListenerAdded = true;
        }
    },

    toggleDoctorDropdown: function(doctorId, event) {
        event.stopPropagation(); // prevent global click from instantly closing
        
        // Close all others first
        document.querySelectorAll('.radix-dropdown-content').forEach(d => {
            if(d.id !== `dropdown-${doctorId}`) {
                d.setAttribute('data-state', 'closed');
            }
        });

        const dropdown = document.getElementById(`dropdown-${doctorId}`);
        if(dropdown) {
            const currentState = dropdown.getAttribute('data-state');
            dropdown.setAttribute('data-state', currentState === 'open' ? 'closed' : 'open');
        }
    },

    updateDoctorStatus: function(doctorId, newStatus, event) {
        event.stopPropagation();
        
        let doctors = this.getDoctors();
        const docIndex = doctors.findIndex(d => d.id === doctorId);
        if (docIndex > -1) {
            doctors[docIndex].status = newStatus;
            this.saveDoctors(doctors);
            this.renderDoctors();
        }
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

