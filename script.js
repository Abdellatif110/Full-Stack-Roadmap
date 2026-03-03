/**
 * Full-Stack Roadmap PWA Edition
 * v1.3 (SaaS Premium)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. PWA & Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(reg => {
                    console.log('[PWA] Service Worker registered:', reg.scope);
                    reg.update();
                })
                .catch(err => console.error('[PWA] Registration failed:', err));
        });
    }

    // 2. Install App Logic
    let deferredPrompt;
    const installBtn = document.getElementById('installBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) installBtn.classList.remove('hidden');
    });

    if (installBtn) {
        installBtn.addEventListener('click', (e) => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                deferredPrompt = null;
                installBtn.classList.add('hidden');
            });
        });
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
        const modeEl = document.getElementById('app-mode');
        if (modeEl) modeEl.innerHTML = 'Studio Mode <i class="fas fa-rocket"></i>';
        if (installBtn) installBtn.classList.add('hidden');
    }

    // 3. Performance Metrics
    const logPerformance = () => {
        if (performance && performance.getEntriesByType('paint')) {
            const paintEntries = performance.getEntriesByType('paint');
            const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            if (fcp) {
                const fcpVal = Math.round(fcp.startTime);
                const metricEl = document.getElementById('metric-fcp');
                if (metricEl) {
                    metricEl.innerText = `${fcpVal} ms`;
                    metricEl.style.color = fcpVal < 1000 ? '#10b981' : (fcpVal < 2500 ? '#f59e0b' : '#ef4444');
                }
            }
        }
    };
    setTimeout(logPerformance, 3000);

    // 4. Tools Data & Logic
    const toolsData = [
        {
            category: "1️⃣ Frontend Essentials",
            tools: [
                { name: "React", icon: "fab fa-react", level: "Beginner", what: "A JavaScript library for building user interfaces." },
                { name: "Svelte", icon: "fas fa-bolt", level: "Intermediate", what: "High-performance framework without virtual DOM." },
                { name: "Next.js", icon: "fas fa-n", level: "Intermediate", what: "The React framework for production with SSR/SSG." },
                { name: "Tailwind CSS", icon: "fas fa-wind", level: "Beginner", what: "Utility-first CSS framework for fast UI design." }
            ]
        },
        {
            category: "2️⃣ Backend & Database",
            tools: [
                { name: "Node.js", icon: "fab fa-node-js", level: "Beginner", what: "JavaScript runtime built on Chrome's V8 engine." },
                { name: "PostgreSQL", icon: "fas fa-database", level: "Intermediate", what: "Advanced open-source relational database." },
                { name: "Redis", icon: "fas fa-bolt", level: "Advanced", what: "In-memory data structure store, used as cache." },
                { name: "Docker", icon: "fab fa-docker", level: "Intermediate", what: "Standardize environments with containerization." }
            ]
        },
        {
            category: "3️⃣ DevOps & Deployment",
            tools: [
                { name: "AWS", icon: "fab fa-aws", level: "Advanced", what: "Comprehensive cloud computing platform." },
                { name: "Vercel", icon: "fas fa-circle", level: "Beginner", what: "Frontend cloud optimized for Next.js." },
                { name: "GitHub Actions", icon: "fab fa-github", level: "Intermediate", what: "Automated workflows for CI/CD." }
            ]
        }
    ];

    let bookmarkedTools = JSON.parse(localStorage.getItem('bookmarkedTools')) || [];
    let learnedTools = JSON.parse(localStorage.getItem('learnedTools')) || [];

    const renderTools = () => {
        const container = document.getElementById('bookmarksContainer');
        const searchInput = document.getElementById('toolSearch');
        if (!container) return;

        // Simulate loading feel
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const activeFilter = document.querySelector('.category-filter-btn.active')?.dataset.filter || 'all';

        // Clear skeletons if first render
        if (container.querySelector('.skeleton-loader')) {
            container.innerHTML = '';
        }

        const filteredCategories = toolsData.map(cat => ({
            ...cat,
            tools: cat.tools.filter(tool => {
                const matchSearch = tool.name.toLowerCase().includes(searchTerm) || tool.what.toLowerCase().includes(searchTerm);
                if (activeFilter === 'bookmarked') return matchSearch && bookmarkedTools.includes(tool.name);
                if (activeFilter === 'learned') return matchSearch && learnedTools.includes(tool.name);
                return matchSearch;
            })
        })).filter(cat => cat.tools.length > 0);

        if (filteredCategories.length === 0) {
            container.innerHTML = '<div class="empty-state" style="text-align:center; padding: 4rem; color: var(--text-dim);"><i class="fas fa-search fa-3x mb-1"></i><p>No tools found matching your criteria.</p></div>';
            return;
        }

        container.innerHTML = '';
        filteredCategories.forEach((catData) => {
            const categoryHTML = document.createElement('div');
            categoryHTML.className = 'bookmark-category reveal active';
            categoryHTML.style.marginBottom = '3rem';
            categoryHTML.innerHTML = `
                <div class="category-header glass" style="padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-size: 1rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em;">${catData.category}</h3>
                </div>
                <div class="tools-grid">
                    ${catData.tools.map(tool => `
                        <div class="tool-card glass ${learnedTools.includes(tool.name) ? 'learned' : ''}">
                            <div class="tool-header">
                                <div class="tool-info">
                                    <div class="tool-icon"><i class="${tool.icon}"></i></div>
                                    <div class="tool-name"><h4>${tool.name}</h4><span class="tag tag-level">${tool.level}</span></div>
                                </div>
                                <div class="tool-actions">
                                    <button class="action-btn ${bookmarkedTools.includes(tool.name) ? 'active' : ''}" onclick="window.toggleBookmark('${tool.name}')"><i class="fas fa-star"></i></button>
                                    <button class="action-btn" onclick="window.toggleLearned('${tool.name}')" style="color: ${learnedTools.includes(tool.name) ? 'var(--success)' : 'inherit'}"><i class="fas fa-check-circle"></i></button>
                                </div>
                            </div>
                            <div class="tool-body"><p>${tool.what}</p></div>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(categoryHTML);
        });
    };

    window.toggleBookmark = (name) => {
        bookmarkedTools = bookmarkedTools.includes(name) ? bookmarkedTools.filter(t => t !== name) : [...bookmarkedTools, name];
        localStorage.setItem('bookmarkedTools', JSON.stringify(bookmarkedTools));
        renderTools();
    };

    window.toggleLearned = (name) => {
        learnedTools = learnedTools.includes(name) ? learnedTools.filter(t => t !== name) : [...learnedTools, name];
        localStorage.setItem('learnedTools', JSON.stringify(learnedTools));
        renderTools();
    };

    // 5. App UI Logic
    const roadmapSteps = document.querySelectorAll('.roadmap-step');
    const overallProgressFill = document.getElementById('overallProgressBar');
    const progressCountText = document.getElementById('progressCount');
    const progressPercentText = document.getElementById('progressPercent');
    const themeToggle = document.getElementById('themeToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const roadmapSearch = document.getElementById('roadmapSearch');
    const toolSearch = document.getElementById('toolSearch');
    const topNav = document.querySelector('.top-nav');
    const backToTop = document.getElementById('backToTop');
    const scrollTracker = document.getElementById('scrollTracker');

    let completedSteps = JSON.parse(localStorage.getItem('fullstackProgress')) || [];

    const updateProgress = () => {
        const total = 13;
        const count = completedSteps.length;
        const p = Math.round((count / total) * 100);
        if (overallProgressFill) overallProgressFill.style.width = `${p}%`;
        if (progressCountText) progressCountText.innerText = `${count}/${total} done`;
        if (progressPercentText) progressPercentText.innerText = `${p}%`;

        roadmapSteps.forEach((step, idx) => {
            const btn = step.querySelector('.step-complete-btn');
            if (completedSteps.includes(idx)) {
                step.classList.add('completed');
                step.classList.add('active');
                if (btn) btn.innerHTML = '<i class="fas fa-check-circle"></i> Complete';
            } else {
                step.classList.remove('completed');
                if (btn) btn.innerHTML = '<i class="far fa-circle"></i> Done';
            }
        });
    };

    window.toggleProgress = (idx) => {
        completedSteps = completedSteps.includes(idx) ? completedSteps.filter(i => i !== idx) : [...completedSteps, idx];
        localStorage.setItem('fullstackProgress', JSON.stringify(completedSteps));
        updateProgress();
    };

    // Roadmap Search
    if (roadmapSearch) {
        roadmapSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            roadmapSteps.forEach(step => {
                const text = step.innerText.toLowerCase();
                step.style.display = text.includes(term) ? 'block' : 'none';
            });
        });
    }

    if (toolSearch) {
        toolSearch.addEventListener('input', renderTools);
    }

    // Mobile Navigation
    const toggleSidebar = () => {
        sidebar.classList.toggle('open');
    };

    if (mobileToggle) mobileToggle.addEventListener('click', toggleSidebar);

    // Scroll Effects
    window.addEventListener('scroll', () => {
        const scroll = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;

        // Progress bar at top
        if (scrollTracker) scrollTracker.style.width = `${(scroll / height) * 100}%`;

        // Navbar glass effect
        if (topNav) {
            if (scroll > 20) topNav.classList.add('scrolled');
            else topNav.classList.remove('scrolled');
        }

        // Back to top button
        if (backToTop) {
            if (scroll > 500) backToTop.classList.add('visible');
            else backToTop.classList.remove('visible');
        }
    }, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Theme Toggle
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            themeToggle.innerHTML = next === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        });
    }

    // Filters
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTools();
        });
    });

    // Boot
    setTimeout(() => {
        updateProgress();
        renderTools();
    }, 800); // Slight delay to show skeleton

    // Intersection Observer for Reveal Anims
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.id === 'hero') {
                    document.querySelectorAll('.stat-value').forEach(stat => {
                        const target = +stat.getAttribute('data-target');
                        let count = 0;
                        const update = () => {
                            if (count < target) { count += target / 40; stat.innerText = Math.ceil(count); setTimeout(update, 25); }
                            else stat.innerText = target;
                        };
                        update();
                    });
                }
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});
