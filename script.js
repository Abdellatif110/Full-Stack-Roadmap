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

    function safeParseJSON(key, fallback) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return fallback;
            const parsed = JSON.parse(item);
            return (parsed !== null && Array.isArray(parsed) === Array.isArray(fallback)) ? parsed : fallback;
        } catch (e) {
            console.warn(`[App] Invalid JSON for ${key}, using default.`);
            return fallback;
        }
    }

    const state = {
        theme: localStorage.getItem('theme') || 'dark',
        completedSteps: safeParseJSON('fullstackProgress', []),
        bookmarkedTools: safeParseJSON('bookmarkedTools', []),
        learnedTools: safeParseJSON('learnedTools', []),
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
        if (window.location.protocol === 'file:' || window.location.origin === 'null') {
            updateAppMode('Local File Mode');
            return;
        }

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js')
                    .then(registration => {
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    showUpdateToast();
                                }
                            });
                        });
                    })
                    .catch(error => console.warn('[PWA] Registration failed:', error));
            });
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            state.deferredPrompt = e;
            if (elements.installBtn) elements.installBtn.classList.remove('hidden');
        });

        if (elements.installBtn) {
            elements.installBtn.addEventListener('click', handleInstallClick);
        }

        if (window.matchMedia('(display-mode: standalone)').matches) {
            updateAppMode('PWA Mode');
            if (elements.installBtn) elements.installBtn.classList.add('hidden');
        }
    }

    function handleInstallClick() {
        if (!state.deferredPrompt) return;
        state.deferredPrompt.prompt();
        state.deferredPrompt.userChoice.then(() => {
            state.deferredPrompt = null;
            if (elements.installBtn) elements.installBtn.classList.add('hidden');
        });
    }

    function updateAppMode(mode) {
        const modeEl = document.getElementById('app-mode');
        if (modeEl) modeEl.innerHTML = `${mode} <i class="fas fa-rocket" aria-hidden="true"></i>`;
    }

    function showUpdateToast() {
        if (elements.updateToast) elements.updateToast.classList.add('visible');
    }

    // ============================================
    // THEME MANAGEMENT
    // ============================================

    function initTheme() {
        document.documentElement.setAttribute('data-theme', state.theme);
        updateThemeIcon();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });

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
        setTheme(state.theme === 'dark' ? 'light' : 'dark');
    }

    function updateThemeIcon() {
        if (elements.themeToggle) {
            const icon = elements.themeToggle.querySelector('i');
            if (icon) icon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // ============================================
    // NAVIGATION & SCROLL
    // ============================================

    function initNavigation() {
        if (elements.mobileToggle) elements.mobileToggle.addEventListener('click', toggleSidebar);
        if (elements.sidebarOverlay) elements.sidebarOverlay.addEventListener('click', closeSidebar);

        document.querySelectorAll('.nav-links a, .mob-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1025) closeSidebar();
            });
        });

        window.addEventListener('scroll', throttle(handleScroll, 16), { passive: true });

        if (elements.backToTop) {
            elements.backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleAnchorClick);
        });
    }

    function toggleSidebar() {
        state.sidebarOpen = !state.sidebarOpen;
        if (elements.sidebar) elements.sidebar.classList.toggle('open', state.sidebarOpen);
        if (elements.sidebarOverlay) elements.sidebarOverlay.classList.toggle('active', state.sidebarOpen);
        if (elements.mobileToggle) elements.mobileToggle.setAttribute('aria-expanded', state.sidebarOpen);
        document.body.style.overflow = state.sidebarOpen ? 'hidden' : '';
    }

    function closeSidebar() {
        state.sidebarOpen = false;
        if (elements.sidebar) elements.sidebar.classList.remove('open');
        if (elements.sidebarOverlay) elements.sidebarOverlay.classList.remove('active');
        if (elements.mobileToggle) elements.mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function handleScroll() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollY / docHeight) * 100;

        if (elements.scrollTracker) elements.scrollTracker.style.width = `${scrollPercent}%`;
        if (elements.topNav) elements.topNav.classList.toggle('scrolled', scrollY > 20);
        if (elements.backToTop) elements.backToTop.classList.toggle('visible', scrollY > 500);

        updateActiveNavLink();
    }

    function handleAnchorClick(e) {
        const href = this.getAttribute('href');
        if (href === '#' || !href.startsWith('#')) return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - CONFIG.SCROLL_OFFSET;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
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
                    if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
                });
            }
        });
    }

    // ============================================
    // PROGRESS TRACKING
    // ============================================

    function initProgressTracking() {
        updateProgressUI();
        elements.roadmapSteps.forEach((step, index) => {
            const btn = step.querySelector('.step-complete-btn');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleStepComplete(index);
                });
            }
        });
    }

    function toggleStepComplete(index) {
        const stepIndex = state.completedSteps.indexOf(index);
        if (stepIndex > -1) state.completedSteps.splice(stepIndex, 1);
        else state.completedSteps.push(index);
        localStorage.setItem('fullstackProgress', JSON.stringify(state.completedSteps));
        updateProgressUI();
    }

    function updateProgressUI() {
        const total = elements.roadmapSteps.length;
        const completed = state.completedSteps.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        if (elements.progressBar) elements.progressBar.style.width = `${percent}%`;
        if (elements.progressCount) elements.progressCount.textContent = `${completed}/${total} completed`;
        if (elements.progressPercent) elements.progressPercent.textContent = `${percent}%`;

        elements.roadmapSteps.forEach((step, index) => {
            const isCompleted = state.completedSteps.includes(index);
            step.classList.toggle('completed', isCompleted);
            const btn = step.querySelector('.step-complete-btn');
            if (btn) {
                btn.innerHTML = isCompleted
                    ? '<i class="fas fa-check-circle"></i> <span>Completed</span>'
                    : '<i class="far fa-circle"></i> <span>Mark Complete</span>';
            }
        });

        const timelineProgress = document.getElementById('roadmapProgress');
        if (timelineProgress && total > 0) {
            timelineProgress.style.height = `${(completed / total) * 100}%`;
        }
    }

    window.toggleProgress = toggleStepComplete;
    window.toggleStepExpand = function(card) {
        const step = card.parentElement;
        const isActive = step.classList.contains('active');
        elements.roadmapSteps.forEach(s => s.classList.remove('active'));
        if (!isActive) step.classList.add('active');
    };

    // ============================================
    // TOOLS & BOOKMARKS
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
        }
    ];

    function initTools() {
        if (elements.toolSearch) elements.toolSearch.addEventListener('input', debounce(renderTools, CONFIG.DEBOUNCE_DELAY));
        
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderTools();
            });
        });

        // Delay initial render slightly to ensure everything is ready
        setTimeout(renderTools, 100);
    }

    function renderTools() {
        if (!elements.bookmarksContainer) return;

        const searchTerm = elements.toolSearch ? elements.toolSearch.value.toLowerCase().trim() : '';
        const activeFilter = document.querySelector('.category-filter-btn.active')?.dataset.filter || 'all';

        const filtered = toolsData.map(cat => ({
            ...cat,
            tools: cat.tools.filter(tool => {
                const matchesSearch = !searchTerm || tool.name.toLowerCase().includes(searchTerm) || tool.what.toLowerCase().includes(searchTerm);
                if (activeFilter === 'bookmarked') return matchesSearch && state.bookmarkedTools.includes(tool.name);
                if (activeFilter === 'learned') return matchesSearch && state.learnedTools.includes(tool.name);
                return matchesSearch;
            })
        })).filter(cat => cat.tools.length > 0);

        if (filtered.length === 0) {
            elements.bookmarksContainer.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No tools found.</p></div>';
            return;
        }

        elements.bookmarksContainer.innerHTML = filtered.map(cat => `
            <div class="bookmark-category">
                <div class="category-header"><h3>${cat.category}</h3></div>
                <div class="tools-grid">
                    ${cat.tools.map(tool => `
                        <article class="tool-card glass ${state.learnedTools.includes(tool.name) ? 'learned' : ''}">
                            <div class="tool-header">
                                <div class="tool-info">
                                    <div class="tool-icon"><i class="${tool.icon}"></i></div>
                                    <div class="tool-name">
                                        <h4>${tool.name}</h4>
                                        <span class="tag-level tag-${tool.level.toLowerCase()}">${tool.level}</span>
                                    </div>
                                </div>
                                <div class="tool-actions">
                                    <button class="action-btn ${state.bookmarkedTools.includes(tool.name) ? 'active' : ''}" onclick="window.toggleBookmark('${tool.name}')">
                                        <i class="fas fa-star"></i>
                                    </button>
                                    <button class="action-btn ${state.learnedTools.includes(tool.name) ? 'active' : ''}" onclick="window.toggleLearned('${tool.name}')">
                                        <i class="fas fa-check-circle"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="tool-body"><p>${tool.what}</p></div>
                        </article>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        elements.bookmarksContainer.setAttribute('aria-busy', 'false');
    }

    window.toggleBookmark = function(name) {
        const i = state.bookmarkedTools.indexOf(name);
        if (i > -1) state.bookmarkedTools.splice(i, 1);
        else state.bookmarkedTools.push(name);
        localStorage.setItem('bookmarkedTools', JSON.stringify(state.bookmarkedTools));
        renderTools();
    };

    window.toggleLearned = function(name) {
        const i = state.learnedTools.indexOf(name);
        if (i > -1) state.learnedTools.splice(i, 1);
        else state.learnedTools.push(name);
        localStorage.setItem('learnedTools', JSON.stringify(state.learnedTools));
        renderTools();
    };

    // ============================================
    // ANIMATIONS
    // ============================================

    function initAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
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
        initTools();
        initAnimations();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();
