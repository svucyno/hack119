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
        });
    },

    addPatient: function() {
        const name = document.getElementById('apName').value;
        const age = document.getElementById('apAge').value;
        const gender = document.getElementById('apGender').value;
        const condition = document.getElementById('apCondition').value;
        const prescription = document.getElementById('apPrescription').value;
        const reportsInput = document.getElementById('apReports');
        let reportsCount = 0;
        if (reportsInput && reportsInput.files) {
            reportsCount = reportsInput.files.length;
        }
        
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
            prescription: prescription,
            reportsAttached: reportsCount,
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

