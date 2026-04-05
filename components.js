// Components for HealthNexus Platform
const components = {
    navbar: `
    <nav class="navbar" id="mainNav">
        <div class="nav-container">
            <a href="index.html" class="logo">
                <i class="fa-solid fa-heart-pulse"></i>
                <span>HealthNexus</span>
            </a>
            <ul class="nav-links">
                <li><a href="#view-home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#faq">FAQ</a></li>
            </ul>
            <div class="nav-actions">
                <a href="login.html" class="btn-sos">Login</a>
            </div>
            <div class="mobile-toggle">
                <i class="fa-solid fa-bars"></i>
            </div>
        </div>
    </nav>
    `,
    footer: `
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-brand">
                <div class="footer-logo">
                    <i class="fa-solid fa-heart-pulse"></i>
                    <span>HealthNexus</span>
                </div>
                <p>Empowering healthcare through technology and compassion. Your 24/7 smart health shield.</p>
                <div class="footer-social">
                    <a href="#"><i class="fa-brands fa-linkedin"></i></a>
                    <a href="#"><i class="fa-brands fa-youtube"></i></a>
                    <a href="#"><i class="fa-brands fa-instagram"></i></a>
                    <a href="#"><i class="fa-brands fa-x-twitter"></i></a>
                </div>
            </div>
            
            <div class="footer-contact">
                <h4>Contact Us</h4>
                <p><i class="fa-solid fa-envelope"></i> support@healthnexus.com</p>
                <p><i class="fa-brands fa-google"></i> nexus.health@gmail.com</p>
                <p><i class="fa-solid fa-phone"></i> +1 (555) 000-HEALTH</p>
                <div class="footer-location">
                    <i class="fa-solid fa-location-dot"></i> Nexus Tower, Tech City
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 HealthNexus Platform. All rights reserved.</p>
            <div class="footer-legal">
                <a href="#">Privacy Policy</a>
                <span class="separator">|</span>
                <a href="#">Terms of Service</a>
            </div>
        </div>
    </footer>
    `
};

// Function to inject components
function injectComponents() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (navbarPlaceholder) {
        navbarPlaceholder.innerHTML = components.navbar;
    }
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = components.footer;
    }
}

// Mobile toggle logic and listeners
document.addEventListener('DOMContentLoaded', () => {
    injectComponents();
    
    // Smooth scroll for anchor links
    document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a[href^="#"]');
        if (anchor) {
            const href = anchor.getAttribute('href');
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        }
    });
});
