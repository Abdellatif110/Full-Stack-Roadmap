/**
 * Full-Stack Roadmap - Premium SaaS Edition
 * v2.0 - Production Ready
 * 
 * Features:
 * - PWA Support with offline capabilities
 * - Theme management (Dark/Light mode)
 * - Progress tracking with localStorage
 * - Smooth animations and micro-interactions
 * - Accessibility-first design
 */

(function () {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        ANIMATION_DURATION: 300,
        SCROLL_OFFSET: 100,
        DEBOUNCE_DELAY: 150,
        TOAST_DURATION: 5000
    };

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const state = {
        theme: localStorage.getItem('theme') || 'dark',
        completedSteps: JSON.parse(localStorage.getItem('fullstackProgress')) || [],
        bookmarkedTools: JSON.parse(localStorage.getItem('bookmarkedTools')) || [],
        learnedTools: JSON.parse(localStorage.getItem('learnedTools')) || [],
        sidebarOpen: false,
        deferredPrompt: null
    };

    // ============================================
    // DOM ELEMENTS CACHE
    // ============================================
    const elements = {};

    function cacheElements() {
        elements.sidebar = document.getElementById('sidebar');
        elements.sidebarOverlay = document.getElementById('sidebarOverlay');
        elements.mobileToggle = document.getElementById('mobileToggle');
        elements.themeToggle = document.getElementById('themeToggle');
        elements.backToTop = document.getElementById('backToTop');
        elements.scrollTracker = document.getElementById('scrollTracker');
        elements.topNav = document.querySelector('.top-nav');
        elements.installBtn = document.getElementById('installBtn');
        elements.roadmapSteps = document.querySelectorAll('.roadmap-step');
        elements.progressBar = document.getElementById('overallProgressBar');
        elements.progressCount = document.getElementById('progressCount');
        elements.progressPercent = document.getElementById('progressPercent');
        elements.roadmapSearch = document.getElementById('roadmapSearch');
        elements.toolSearch = document.getElementById('toolSearch');
        elements.bookmarksContainer = document.getElementById('bookmarksContainer');
        elements.updateToast = document.getElementById('updateToast');
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ============================================
    // PWA & SERVICE WORKER
    // ============================================

    function initPWA() {
        // Skip service worker registration on file:// protocol or null origin to avoid CORS/Origin errors
        if (window.location.protocol === 'file:' || window.location.origin === 'null') {
            console.warn('[PWA] Service Worker registration skipped: Running on local filesystem. Use a local server to test PWA features.');
            updateAppMode('Local File Mode');
            return;
        }

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js')
                    .then(registration => {
                        console.log('[PWA] Service Worker registered:', registration.scope);

                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    showUpdateToast();
                                }
                            });
                        });
                    })
                    .catch(error => console.error('[PWA] Registration failed:', error));
            });
        }

        // Install prompt handling
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            state.deferredPrompt = e;
            if (elements.installBtn) {
                elements.installBtn.classList.remove('hidden');
            }
        });

        if (elements.installBtn) {
            elements.installBtn.addEventListener('click', handleInstallClick);
        }

        // Check if running as installed PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            updateAppMode('PWA Mode');
            if (elements.installBtn) {
                elements.installBtn.classList.add('hidden');
            }
        }
    }

    function handleInstallClick() {
        if (!state.deferredPrompt) return;

        state.deferredPrompt.prompt();
        state.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('[PWA] User accepted install');
            }
            state.deferredPrompt = null;
            if (elements.installBtn) {
                elements.installBtn.classList.add('hidden');
            }
        });
    }

    function updateAppMode(mode) {
        const modeEl = document.getElementById('app-mode');
        if (modeEl) {
            modeEl.innerHTML = `${mode} <i class="fas fa-rocket" aria-hidden="true"></i>`;
        }
    }

    function showUpdateToast() {
        if (elements.updateToast) {
            elements.updateToast.classList.add('visible');
        }
    }

    // ============================================
    // PERFORMANCE METRICS
    // ============================================

    function initPerformanceMetrics() {
        // Wait for paint metrics
        setTimeout(() => {
            if (performance && performance.getEntriesByType) {
                const paintEntries = performance.getEntriesByType('paint');
                const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');

                if (fcp) {
                    const fcpVal = Math.round(fcp.startTime);
                    const metricEl = document.getElementById('metric-fcp');
                    if (metricEl) {
                        metricEl.textContent = `${fcpVal} ms`;

                        // Color code based on performance
                        if (fcpVal < 1000) {
                            metricEl.style.color = 'var(--success)';
                        } else if (fcpVal < 2500) {
                            metricEl.style.color = 'var(--warning)';
                        } else {
                            metricEl.style.color = 'var(--error)';
                        }
                    }
                }
            }
        }, 3000);
    }

    // ============================================
    // THEME MANAGEMENT
    // ============================================

    function initTheme() {
        // Apply saved theme
        document.documentElement.setAttribute('data-theme', state.theme);
        updateThemeIcon();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                setTheme(newTheme);
            }
        });

        // Theme toggle click handler
        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', toggleTheme);
        }
    }

    function setTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon();
    }

    function toggleTheme() {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }

    function updateThemeIcon() {
        if (elements.themeToggle) {
            const icon = elements.themeToggle.querySelector('i');
            if (icon) {
                icon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    // ============================================
    // NAVIGATION & SCROLL
    // ============================================

    function initNavigation() {
        // Mobile sidebar toggle
        if (elements.mobileToggle) {
            elements.mobileToggle.addEventListener('click', toggleSidebar);
        }

        if (elements.sidebarOverlay) {
            elements.sidebarOverlay.addEventListener('click', closeSidebar);
        }

        // Close sidebar on link click (mobile)
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1025) {
                    closeSidebar();
                }
            });
        });

        // Scroll effects
        window.addEventListener('scroll', throttle(handleScroll, 16), { passive: true });

        // Back to top
        if (elements.backToTop) {
            elements.backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleAnchorClick);
        });
    }

    function toggleSidebar() {
        state.sidebarOpen = !state.sidebarOpen;

        if (elements.sidebar) {
            elements.sidebar.classList.toggle('open', state.sidebarOpen);
        }
        if (elements.sidebarOverlay) {
            elements.sidebarOverlay.classList.toggle('active', state.sidebarOpen);
        }
        if (elements.mobileToggle) {
            elements.mobileToggle.setAttribute('aria-expanded', state.sidebarOpen);
        }

        // Prevent body scroll when sidebar is open
        document.body.style.overflow = state.sidebarOpen ? 'hidden' : '';
    }

    function closeSidebar() {
        state.sidebarOpen = false;

        if (elements.sidebar) {
            elements.sidebar.classList.remove('open');
        }
        if (elements.sidebarOverlay) {
            elements.sidebarOverlay.classList.remove('active');
        }
        if (elements.mobileToggle) {
            elements.mobileToggle.setAttribute('aria-expanded', 'false');
        }

        document.body.style.overflow = '';
    }

    function handleScroll() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollY / docHeight) * 100;

        // Update scroll tracker
        if (elements.scrollTracker) {
            elements.scrollTracker.style.width = `${scrollPercent}%`;
        }

        // Update top nav appearance
        if (elements.topNav) {
            elements.topNav.classList.toggle('scrolled', scrollY > 20);
        }

        // Show/hide back to top button
        if (elements.backToTop) {
            elements.backToTop.classList.toggle('visible', scrollY > 500);
        }

        // Update active nav link
        updateActiveNavLink();
    }

    function handleAnchorClick(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const offset = CONFIG.SCROLL_OFFSET;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + CONFIG.SCROLL_OFFSET + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < bottom) {
                document.querySelectorAll('.nav-links a, .mob-link').forEach(link => {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');

                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                        link.setAttribute('aria-current', 'page');
                    }
                });
            }
        });
    }

    // Global scroll function for inline onclick handlers
    window.scrollToSection = function (sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
            const offset = CONFIG.SCROLL_OFFSET;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    };

    // ============================================
    // PROGRESS TRACKING
    // ============================================

    function initProgressTracking() {
        updateProgressUI();

        // Setup individual step buttons
        elements.roadmapSteps.forEach((step, index) => {
            const btn = step.querySelector('.step-complete-btn');
            if (btn) {
                // Ensure index is passed correctly from btn if needed, 
                // but we use the NodeList index here.
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent card toggle when marking complete
                    toggleStepComplete(index);
                });
            }
        });
    }

    function toggleStepExpand(step) {
        const isActive = step.classList.contains('active');

        // Close all other steps (accordion behavior)
        elements.roadmapSteps.forEach(s => {
            if (s !== step) {
                s.classList.remove('active');
            }
        });

        // Toggle current step
        step.classList.toggle('active', !isActive);
    }

    function toggleStepComplete(index) {
        const stepIndex = state.completedSteps.indexOf(index);

        if (stepIndex > -1) {
            state.completedSteps.splice(stepIndex, 1);
        } else {
            state.completedSteps.push(index);
        }

        localStorage.setItem('fullstackProgress', JSON.stringify(state.completedSteps));
        updateProgressUI();
    }

    function updateProgressUI() {
        const total = elements.roadmapSteps.length;
        const completed = state.completedSteps.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update progress bar
        if (elements.progressBar) {
            elements.progressBar.style.width = `${percent}%`;
            elements.progressBar.setAttribute('aria-valuenow', percent);
        }

        // Update text
        if (elements.progressCount) {
            elements.progressCount.textContent = `${completed}/${total} completed`;
        }
        if (elements.progressPercent) {
            elements.progressPercent.textContent = `${percent}%`;
        }

        // Update step states
        elements.roadmapSteps.forEach((step, index) => {
            const isCompleted = state.completedSteps.includes(index);
            step.classList.toggle('completed', isCompleted);

            const btn = step.querySelector('.step-complete-btn');
            if (btn) {
                btn.innerHTML = isCompleted
                    ? '<i class="fas fa-check-circle" aria-hidden="true"></i> <span>Completed</span>'
                    : '<i class="far fa-circle" aria-hidden="true"></i> <span>Mark Complete</span>';
            }
        });

        // Update timeline progress
        updateTimelineProgress();
    }

    function updateTimelineProgress() {
        const progressEl = document.getElementById('roadmapProgress');
        if (!progressEl || elements.roadmapSteps.length === 0) return;

        const completedSteps = document.querySelectorAll('.roadmap-step.completed').length;
        const totalSteps = elements.roadmapSteps.length;
        const percent = (completedSteps / totalSteps) * 100;

        progressEl.style.height = `${percent}%`;
    }

    // Global functions for inline onclick handlers
    window.toggleProgress = function (index) {
        toggleStepComplete(index);
    };

    window.toggleStepExpand = function (step) {
        toggleStepExpand(step);
    };

    // ============================================
    // ROADMAP SEARCH
    // ============================================

    function initRoadmapSearch() {
        if (!elements.roadmapSearch) return;

        elements.roadmapSearch.addEventListener('input', debounce((e) => {
            const term = e.target.value.toLowerCase().trim();

            elements.roadmapSteps.forEach(step => {
                const text = step.textContent.toLowerCase();
                const shouldShow = !term || text.includes(term);

                step.style.display = shouldShow ? 'block' : 'none';
                step.style.opacity = shouldShow ? '1' : '0';
            });
        }, CONFIG.DEBOUNCE_DELAY));
    }

    // ============================================
    // TOOLS DATA & RENDERING
    // ============================================

    const toolsData = [
        {
            category: "📦 Library / Frameworks",
            tools: [
                { name: "React", icon: "fab fa-react", level: "Beginner", what: "Declarative UI components." },
                { name: "Vue.js", icon: "fab fa-vuejs", level: "Beginner", what: "Progressive JS framework." },
                { name: "Angular", icon: "fab fa-angular", level: "Intermediate", what: "Enterprise-grade framework." },
                { name: "Svelte", icon: "fas fa-bolt", level: "Intermediate", what: "High-performance UI." },
                { name: "Next.js", icon: "fas fa-n", level: "Intermediate", what: "React for production (SSR/SSG)." },
                { name: "Nuxt", icon: "fab fa-vuejs", level: "Intermediate", what: "The intuitive Vue framework." }
            ]
        },
        {
            category: "🎨 CSS & UI Frameworks",
            tools: [
                { name: "Tailwind CSS", icon: "fas fa-wind", level: "Beginner", what: "Utility-first CSS framework." },
                { name: "Bootstrap", icon: "fab fa-bootstrap", level: "Beginner", what: "Responsive component library." },
                { name: "Sass", icon: "fab fa-sass", level: "Beginner", what: "Professional CSS extension." },
                { name: "Less", icon: "fab fa-less", level: "Intermediate", what: "Dynamic stylesheet language." },
                { name: "Bulma", icon: "fas fa-columns", level: "Beginner", what: "Modern CSS framework based on Flexbox." },
                { name: "Material-UI", icon: "fas fa-palette", level: "Intermediate", what: "React components via Material Design." },
                { name: "Chakra UI", icon: "fas fa-gem", level: "Intermediate", what: "Modular & accessible React components." },
                { name: "Styled Components", icon: "fas fa-code", level: "Intermediate", what: "CSS-in-JS for better styling." }
            ]
        },
        {
            category: "🖥️ Local Servers & Env",
            tools: [
                { name: "XAMPP", icon: "fas fa-server", level: "Beginner", what: "PHP dev environment with MariaDB." },
                { name: "WAMP", icon: "fas fa-server", level: "Beginner", what: "Windows web development environment." },
                { name: "MAMP", icon: "fas fa-server", level: "Beginner", what: "Local server for macOS and Windows." },
                { name: "Laragon", icon: "fas fa-server", level: "Beginner", what: "Modern, fast local development tool." },
                { name: "Docker", icon: "fab fa-docker", level: "Intermediate", what: "Container-based deployments." },
                { name: "NGINX", icon: "fas fa-network-wired", level: "Intermediate", what: "High-perf web server & load balancer." },
                { name: "Apache", icon: "fas fa-server", level: "Beginner", what: "The world's most used web server." }
            ]
        },
        {
            category: "🏗️ Bundlers & Build Tools",
            tools: [
                { name: "Vite", icon: "fas fa-bolt", level: "Beginner", what: "Next-gen frontend tooling." },
                { name: "Webpack", icon: "fas fa-box-open", level: "Intermediate", what: "Powerful static module bundler." },
                { name: "Rollup", icon: "fas fa-scroll", level: "Intermediate", what: "Compiles small pieces of code." },
                { name: "Parcel", icon: "fas fa-cube", level: "Beginner", what: "Zero configuration web app bundler." },
                { name: "ESBuild", icon: "fas fa-shipping-fast", level: "Advanced", what: "Extremely fast JS bundler." }
            ]
        },
        {
            category: "🚀 Runtimes & Package Managers",
            tools: [
                { name: "Node.js", icon: "fab fa-node-js", level: "Beginner", what: "JavaScript runtime on Chrome V8." },
                { name: "Deno", icon: "fas fa-dragon", level: "Intermediate", what: "Secure runtime for JS and TS." },
                { name: "Bun", icon: "fas fa-hamburger", level: "Intermediate", what: "Fast all-in-one JS runtime." },
                { name: "npm", icon: "fab fa-npm", level: "Beginner", what: "Standard Node Package Manager." },
                { name: "Yarn", icon: "fab fa-yarn", level: "Beginner", what: "Fast, reliable package manager." },
                { name: "pnpm", icon: "fas fa-box", level: "Beginner", what: "Fast, disk efficient package manager." }
            ]
        },
        {
            category: "☁️ Cloud & Hosting",
            tools: [
                { name: "AWS", icon: "fab fa-aws", level: "Advanced", what: "Comprehensive cloud platform." },
                { name: "Google Cloud", icon: "fab fa-google", level: "Advanced", what: "Google's suite of cloud services." },
                { name: "Azure", icon: "fab fa-microsoft", level: "Advanced", what: "Microsoft's cloud platform." },
                { name: "Vercel", icon: "fas fa-circle", level: "Beginner", what: "Frontend cloud optimized for Next.js." },
                { name: "Netlify", icon: "fas fa-cloud-upload-alt", level: "Beginner", what: "Build and deploy modern web projects." },
                { name: "Railway", icon: "fas fa-train", level: "Intermediate", what: "Simple cloud infrastructure." },
                { name: "Render", icon: "fas fa-layer-group", level: "Intermediate", what: "The easiest cloud to host everything." }
            ]
        },
        {
            category: "🔗 Database & BaaS",
            tools: [
                { name: "Supabase", icon: "fas fa-bolt", level: "Intermediate", what: "The Open Source Firebase alternative." },
                { name: "Firebase", icon: "fas fa-fire", level: "Beginner", what: "Backend-as-a-Service by Google." },
                { name: "MongoDB Atlas", icon: "fas fa-leaf", level: "Beginner", what: "Cloud-hosted MongoDB database." },
                { name: "PlanetScale", icon: "fas fa-database", level: "Intermediate", what: "Serverless MySQL database." },
                { name: "Neon", icon: "fas fa-bolt", level: "Intermediate", what: "Serverless Postgres database." }
            ]
        },
        {
            category: "💻 IDEs & Version Control",
            tools: [
                { name: "Git", icon: "fab fa-git-alt", level: "Beginner", what: "Distributed version control system." },
                { name: "GitHub", icon: "fab fa-github", level: "Beginner", what: "Hosting for git repositories." },
                { name: "GitLab", icon: "fab fa-gitlab", level: "Intermediate", what: "DevOps platform with git hosting." },
                { name: "Bitbucket", icon: "fab fa-bitbucket", level: "Intermediate", what: "Git repository management." },
                { name: "VS Code", icon: "fas fa-code", level: "Beginner", what: "Code editing. Redefined." },
                { name: "WebStorm", icon: "fas fa-brain", level: "Intermediate", what: "Smartest JS IDE by JetBrains." },
                { name: "Sublime Text", icon: "fas fa-file-code", level: "Beginner", what: "Sophisticated text editor." },
                { name: "Neovim", icon: "fas fa-terminal", level: "Advanced", what: "Hyperextensible Vim-based editor." }
            ]
        },
        {
            category: "🤖 AI Agents & Tools",
            tools: [
                { name: "Cursor", icon: "fas fa-mouse-pointer", level: "Beginner", what: "The AI-first code editor." },
                { name: "Antigravity", icon: "fas fa-rocket", level: "Beginner", what: "Advanced AI coding assistant." },
                { name: "GitHub Copilot", icon: "fab fa-github", level: "Beginner", what: "Your AI pair programmer." },
                { name: "Codeium", icon: "fas fa-magic", level: "Beginner", what: "Free AI code autocomplete." }
            ]
        },
        {
            category: "🧪 Testing & QA",
            tools: [
                { name: "Selenium", icon: "fas fa-microscope", level: "Advanced", what: "Browser automation framework." },
                { name: "Puppeteer", icon: "fas fa-dog", level: "Advanced", what: "Headless Chrome Node.js API." },
                { name: "Playwright", icon: "fas fa-theater-masks", level: "Intermediate", what: "Reliable cross-browser testing." },
                { name: "Cypress", icon: "fas fa-vial", level: "Intermediate", what: "Modern end-to-end testing." },
                { name: "Cucumber", icon: "fas fa-leaf", level: "Intermediate", what: "Tool for BDD testing." },
                { name: "Jest", icon: "fas fa-flask", level: "Beginner", what: "Delightful JavaScript testing." }
            ]
        },
        {
            category: "⚙️ Automation & Workflow",
            tools: [
                { name: "Zapier", icon: "fas fa-bolt", level: "Beginner", what: "Automate work across 5000+ apps." },
                { name: "Make", icon: "fas fa-puzzle-piece", level: "Intermediate", what: "Visual automation platform." },
                { name: "n8n", icon: "fas fa-project-diagram", level: "Advanced", what: "Self-hosted workflow automation." },
                { name: "Apache Airflow", icon: "fas fa-wind", level: "Advanced", what: "Programmatically author workflows." },
                { name: "GitHub Actions", icon: "fab fa-github-alt", level: "Intermediate", what: "Automate your dev workflow." }
            ]
        },
        {
            category: "📊 Analytics & Performance",
            tools: [
                { name: "PostHog", icon: "fas fa-hedgehog", level: "Intermediate", what: "Product OS with analytics." },
                { name: "Google Analytics", icon: "fab fa-google", level: "Beginner", what: "Digital analytics platform." },
                { name: "Plausible", icon: "fas fa-chart-bar", level: "Beginner", what: "Simple and privacy-friendly." },
                { name: "Umami", icon: "fas fa-chart-pie", level: "Beginner", what: "Self-hosted analytics." },
                { name: "PageSpeed Insights", icon: "fas fa-tachometer-alt", level: "Beginner", what: "Optimize page performance." },
                { name: "WebPageTest", icon: "fas fa-vial", level: "Intermediate", what: "Instant performance tests." },
                { name: "GTmetrix", icon: "fas fa-chart-line", level: "Beginner", what: "See how your site performs." },
                { name: "Calibre", icon: "fas fa-microscope", level: "Intermediate", what: "Automated speed testing." }
            ]
        },
        {
            category: "📑 Documentation & System Design",
            tools: [
                { name: "Notion", icon: "fas fa-book", level: "Beginner", what: "Your connected workspace." },
                { name: "Obsidian", icon: "fas fa-gem", level: "Beginner", what: "Sharp local knowledge base." },
                { name: "Astro", icon: "fas fa-rocket", level: "Intermediate", what: "The web framework for content." },
                { name: "Docusaurus", icon: "fas fa-book-open", level: "Intermediate", what: "Build documentation websites." },
                { name: "PlantUML", icon: "fas fa-draw-polygon", level: "Intermediate", what: "Create diagrams from text." },
                { name: "Draw.io", icon: "fas fa-project-diagram", level: "Beginner", what: "Security-first diagram software." },
                { name: "Miro", icon: "fas fa-sticky-note", level: "Beginner", what: "Visual collaboration platform." },
                { name: "Excalidraw", icon: "fas fa-pencil-alt", level: "Beginner", what: "Virtual whiteboard for sketching." }
            ]
        },
        {
            category: "📅 Project Management",
            tools: [
                { name: "Jira", icon: "fab fa-jira", level: "Intermediate", what: "Issue tracking & agile tool." },
                { name: "Trello", icon: "fab fa-trello", level: "Beginner", what: "Visual project management boards." },
                { name: "ClickUp", icon: "fas fa-check-double", level: "Beginner", what: "The app to replace them all." },
                { name: "Asana", icon: "fas fa-tasks", level: "Beginner", what: "Work management for teams." }
            ]
        }
    ];

    // ============================================
    // TOOLS RENDERING
    // ============================================

    function initTools() {
        // Initial render with delay to show skeleton
        setTimeout(() => {
            renderTools();
            if (elements.bookmarksContainer) {
                elements.bookmarksContainer.setAttribute('aria-busy', 'false');
            }
        }, 600);

        // Search handler
        if (elements.toolSearch) {
            elements.toolSearch.addEventListener('input', debounce(renderTools, CONFIG.DEBOUNCE_DELAY));
        }

        // Filter buttons
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-filter-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                renderTools();
            });
        });
    }

    function renderTools() {
        if (!elements.bookmarksContainer) {
            console.error('[Tools] Bookmarks container not found in DOM');
            return;
        }

        const searchTerm = elements.toolSearch ? elements.toolSearch.value.toLowerCase().trim() : '';
        const activeFilter = document.querySelector('.category-filter-btn.active')?.dataset.filter || 'all';

        console.log(`[Tools] Rendering with filter: ${activeFilter}, search: "${searchTerm}"`);

        // Clear skeletons on first render
        if (elements.bookmarksContainer.querySelector('.skeleton-loader')) {
            elements.bookmarksContainer.innerHTML = '';
        }

        const filteredCategories = toolsData.map(cat => ({
            ...cat,
            tools: cat.tools.filter(tool => {
                const matchSearch = !searchTerm ||
                    tool.name.toLowerCase().includes(searchTerm) ||
                    tool.what.toLowerCase().includes(searchTerm);

                if (activeFilter === 'bookmarked') {
                    return matchSearch && state.bookmarkedTools.includes(tool.name);
                }
                if (activeFilter === 'learned') {
                    return matchSearch && state.learnedTools.includes(tool.name);
                }
                return matchSearch;
            })
        })).filter(cat => cat && cat.tools && cat.tools.length > 0);

        console.log(`[Tools] Found ${filteredCategories.length} categories with tools`);

        if (filteredCategories.length === 0) {
            elements.bookmarksContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search" aria-hidden="true"></i>
                    <p>No tools found matching your criteria.</p>
                </div>
            `;
            return;
        }

        elements.bookmarksContainer.innerHTML = filteredCategories.map(catData => `
            <div class="bookmark-category">
                <div class="category-header">
                    <h3>${catData.category}</h3>
                </div>
                <div class="tools-grid">
                    ${catData.tools.map(tool => `
                        <article class="tool-card glass ${state.learnedTools.includes(tool.name) ? 'learned' : ''}">
                            <div class="tool-header">
                                <div class="tool-info">
                                    <div class="tool-icon">
                                        <i class="${tool.icon}" aria-hidden="true"></i>
                                    </div>
                                    <div class="tool-name">
                                        <h4>${tool.name}</h4>
                                        <span class="tag-level tag-${tool.level.toLowerCase()}">${tool.level}</span>
                                    </div>
                                </div>
                                <div class="tool-actions">
                                    <button 
                                        class="action-btn ${state.bookmarkedTools.includes(tool.name) ? 'active' : ''}" 
                                        onclick="window.toggleBookmark('${tool.name}')"
                                        aria-label="${state.bookmarkedTools.includes(tool.name) ? 'Remove bookmark' : 'Add bookmark'}"
                                        aria-pressed="${state.bookmarkedTools.includes(tool.name)}"
                                        data-action="bookmark"
                                    >
                                        <i class="fas fa-star" aria-hidden="true"></i>
                                    </button>
                                    <button 
                                        class="action-btn ${state.learnedTools.includes(tool.name) ? 'active' : ''}" 
                                        onclick="window.toggleLearned('${tool.name}')"
                                        aria-label="${state.learnedTools.includes(tool.name) ? 'Mark as not learned' : 'Mark as learned'}"
                                        aria-pressed="${state.learnedTools.includes(tool.name)}"
                                        data-action="learned"
                                    >
                                        <i class="fas fa-check-circle" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="tool-body">
                                <p>${tool.what}</p>
                            </div>
                        </article>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    window.toggleBookmark = function (name) {
        const index = state.bookmarkedTools.indexOf(name);
        if (index > -1) {
            state.bookmarkedTools.splice(index, 1);
        } else {
            state.bookmarkedTools.push(name);
        }
        localStorage.setItem('bookmarkedTools', JSON.stringify(state.bookmarkedTools));
        renderTools();
    };

    window.toggleLearned = function (name) {
        const index = state.learnedTools.indexOf(name);
        if (index > -1) {
            state.learnedTools.splice(index, 1);
        } else {
            state.learnedTools.push(name);
        }
        localStorage.setItem('learnedTools', JSON.stringify(state.learnedTools));
        renderTools();
    };

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================

    function initScrollAnimations() {
        // Counter animation for stats
        const animateCounters = () => {
            document.querySelectorAll('.stat-value').forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'), 10);
                if (!target || stat.classList.contains('animated')) return;

                stat.classList.add('animated');
                let current = 0;
                const increment = target / 50;
                const duration = 1500;
                const stepTime = duration / 50;

                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        stat.textContent = Math.ceil(current);
                        setTimeout(updateCounter, stepTime);
                    } else {
                        stat.textContent = target;
                    }
                };

                updateCounter();
            });
        };

        // Intersection Observer for reveal animations
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');

                    // Trigger counter animation for hero stats
                    if (entry.target.id === 'hero') {
                        animateCounters();
                    }

                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.reveal').forEach(el => {
            revealObserver.observe(el);
        });
    }

    // ============================================
    // KEYBOARD NAVIGATION
    // ============================================

    function initKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            // Close sidebar on Escape
            if (e.key === 'Escape' && state.sidebarOpen) {
                closeSidebar();
            }

            // Focus search on /
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                const searchInput = document.getElementById('roadmapSearch');
                if (searchInput) searchInput.focus();
            }
        });
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        cacheElements();
        initPWA();
        initTheme();
        initNavigation();
        initProgressTracking();
        initRoadmapSearch();
        initTools();
        initPerformanceMetrics();
        initScrollAnimations();
        initKeyboardNav();

        console.log('[App] Full-Stack Roadmap initialized');
    }

    // Start the app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
