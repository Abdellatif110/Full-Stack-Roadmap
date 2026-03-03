/**
 * Full-Stack Roadmap PWA Edition
 * v1.2 (2026)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. PWA & Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(reg => {
                    console.log('[PWA] Service Worker registered:', reg.scope);
                    reg.update();
                    reg.onupdatefound = () => {
                        const installingWorker = reg.installing;
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                document.getElementById('updateToast').classList.remove('hidden');
                            }
                        };
                    };
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
        installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', (e) => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            deferredPrompt = null;
            installBtn.classList.add('hidden');
        });
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
        document.getElementById('app-mode').innerHTML = 'Studio Mode <i class="fas fa-rocket"></i>';
        installBtn.classList.add('hidden');
    }

    // 3. Performance Metrics
    const logPerformance = () => {
        if (performance && performance.getEntriesByType('paint')) {
            const paintEntries = performance.getEntriesByType('paint');
            const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            if (fcp) {
                const fcpVal = Math.round(fcp.startTime);
                document.getElementById('metric-fcp').innerText = `${fcpVal} ms`;
                document.getElementById('metric-fcp').style.color = fcpVal < 1000 ? '#10b981' : (fcpVal < 2500 ? '#f59e0b' : '#ef4444');
            }
        }
    };
    setTimeout(logPerformance, 3000);

    // 4. Tools Data & Logic
    const toolsData = [
        {
            category: "1️⃣ Frontend Libraries & Frameworks",
            tools: [
                { name: "React", icon: "fab fa-react", level: "Beginner", cat: "Frontend", what: "A JavaScript library for building user interfaces.", why: "Component-based, huge ecosystem.", lifecycle: "Frontend UI layer", link: "#", explanation: "<strong>Component architecture:</strong> Encourages breaking UI into reusable pieces. <br><strong>CSR:</strong> Primarily Client-Side Rendering. <br><strong>When to choose:</strong> Most versatile." },
                { name: "Vue.js", icon: "fab fa-vuejs", level: "Beginner", cat: "Frontend", what: "The Progressive JavaScript Framework.", why: "Low barrier to entry, powerful templating.", lifecycle: "Frontend UI layer", link: "#", explanation: "<strong>Architecture:</strong> Flexible, template-based. <br><strong>When to choose:</strong> For clean HTML separation." },
                { name: "Angular", icon: "fab fa-angular", level: "Intermediate", cat: "Frontend", what: "The web development framework for professionals.", why: "Complete toolkit out-of-the-box.", lifecycle: "Frontend UI layer", link: "#" },
                { name: "Svelte", icon: "fas fa-bolt", level: "Intermediate", cat: "Frontend", what: "Cybernetically enhanced web apps.", why: "No virtual DOM, ultra-fast.", lifecycle: "Frontend UI layer", link: "#" },
                { name: "Next.js", icon: "fas fa-n", level: "Intermediate", cat: "Frontend", what: "The React Framework for the Web.", why: "Built-in SSR/SSG, excellent SEO.", lifecycle: "Frontend + Serverless API", link: "#", explanation: "<strong>SSR vs CSR:</strong> Supports both. <br><strong>When to choose:</strong> Production-grade React apps." },
                { name: "Nuxt.js", icon: "fab fa-vuejs", level: "Intermediate", cat: "Frontend", what: "The Intuitive Vue Framework.", why: "Universal Vue.js Applications.", lifecycle: "Frontend + Serverless API", link: "#" }
            ],
            comparison: {
                headers: ["Feature", "React", "Vue", "Angular", "Svelte"],
                rows: [
                    ["Learning Curve", "Medium", "Easy", "Hard", "Easy"],
                    ["State Management", "External (Redux/Zustand)", "Built-in (Pinia)", "Built-in (RxJS)", "Built-in"],
                    ["Performance", "High (Virtual DOM)", "High (Virtual DOM)", "Medium", "Ultra High (No VDOM)"],
                    ["Ecosystem", "Massive", "Large", "Corporate/Stable", "Growing"]
                ]
            }
        },
        {
            category: "2️⃣ CSS Frameworks & Preprocessors",
            tools: [
                { name: "Bootstrap", icon: "fab fa-bootstrap", level: "Beginner", cat: "Frontend", what: "CSS framework for developing responsive sites.", why: "Huge component library.", lifecycle: "Styling", link: "#" },
                { name: "Tailwind CSS", icon: "fas fa-wind", level: "Beginner", cat: "Frontend", what: "Utility-first CSS framework.", why: "Fast prototyping.", lifecycle: "Styling", link: "#", explanation: "<strong>Utility-first:</strong> Inline classes instead of custom CSS." },
                { name: "Sass", icon: "fab fa-sass", level: "Beginner", cat: "Frontend", what: "Syntactically Awesome Style Sheets.", why: "Variables, nesting, mixins.", lifecycle: "Styling", link: "#", explanation: "<strong>Preprocessor:</strong> Adds logic to CSS." },
                { name: "Material-UI", icon: "fas fa-cube", level: "Intermediate", cat: "Frontend", what: "React components for faster development.", why: "Material Design compliance.", lifecycle: "UI Components", link: "#" },
                { name: "Styled Components", icon: "fas fa-paint-brush", level: "Intermediate", cat: "Frontend", what: "CSS-in-JS library.", why: "Automatic vendor prefixing and scoping.", lifecycle: "Styling", link: "#" }
            ]
        },
        {
            category: "3️⃣ Local Servers / Dev Environment",
            tools: [
                { name: "XAMPP", icon: "fas fa-server", level: "Beginner", cat: "Backend", what: "Apache + MariaDB + PHP + Perl.", why: "Local PHP environment.", lifecycle: "Local Server", link: "#" },
                { name: "Docker", icon: "fab fa-docker", level: "Intermediate", cat: "DevOps", what: "App containerization.", why: "Environment consistency.", lifecycle: "DevOps", link: "#", explanation: "<strong>Containers:</strong> Isolated OS-level virtualization." },
                { name: "NGINX", icon: "fas fa-network-wired", level: "Intermediate", cat: "Cloud", what: "Web server / Reverse Proxy.", why: "Load balancing and performance.", lifecycle: "Cloud/Servers", link: "#" }
            ]
        },
        {
            category: "4️⃣ Runtimes & Package Managers",
            tools: [
                { name: "Node.js", icon: "fab fa-node-js", level: "Beginner", cat: "Backend", what: "JavaScript runtime on V8.", why: "Server-side JS.", lifecycle: "Backend", link: "#" },
                { name: "Bun", icon: "fas fa-hamburger", level: "Advanced", cat: "Backend", what: "Fast all-in-one runtime.", why: "Performance.", lifecycle: "Backend", link: "#" },
                { name: "npm", icon: "fab fa-npm", level: "Beginner", cat: "Productivity", what: "Default package manager.", why: "Standard.", lifecycle: "Dev Tooling", link: "#" }
            ]
        },
        {
            category: "5️⃣ Cloud & Deployment",
            tools: [
                { name: "AWS", icon: "fab fa-aws", level: "Advanced", cat: "Cloud", what: "Amazon cloud services.", why: "Scale.", lifecycle: "Cloud", link: "#" },
                { name: "Vercel", icon: "fas fa-v", level: "Beginner", cat: "Cloud", what: "Frontend cloud.", why: "Optimized Next.js.", lifecycle: "Deployment", link: "#" },
                { name: "Supabase", icon: "fas fa-bolt", level: "Intermediate", cat: "Cloud", what: "Open source Firebase.", why: "PostgreSQL BaaS.", lifecycle: "Backend", link: "#" }
            ]
        }
    ];

    const renderTools = () => {
        const toolSearchTerm = toolSearch.value.toLowerCase();
        const activeFilter = document.querySelector('.category-filter-btn.active').dataset.filter;
        bookmarksContainer.innerHTML = '';

        toolsData.forEach((catData, catIndex) => {
            const filteredTools = catData.tools.filter(tool => {
                const match = tool.name.toLowerCase().includes(toolSearchTerm) || tool.what.toLowerCase().includes(toolSearchTerm);
                if (activeFilter === 'bookmarked') return match && bookmarkedTools.includes(tool.name);
                if (activeFilter === 'learned') return match && learnedTools.includes(tool.name);
                return match;
            });

            if (filteredTools.length === 0) return;

            const categoryHTML = document.createElement('div');
            categoryHTML.className = 'bookmark-category reveal active collapsed';
            categoryHTML.innerHTML = `
                <div class="category-header glass" onclick="this.parentElement.classList.toggle('collapsed')">
                    <div class="category-title"><i class="fas fa-chevron-down"></i> <span>${catData.category}</span></div>
                    <div class="category-stats">${filteredTools.length} Tools</div>
                </div>
                <div class="tools-grid">
                    ${filteredTools.map(tool => `
                        <div class="tool-card glass ${learnedTools.includes(tool.name) ? 'learned' : ''}">
                            <div class="tool-header">
                                <div class="tool-info">
                                    <div class="tool-icon"><i class="${tool.icon}"></i></div>
                                    <div class="tool-name"><h4>${tool.name}</h4><div class="tool-tags"><span class="tag tag-level">${tool.level}</span></div></div>
                                </div>
                                <div class="tool-actions">
                                    <button class="action-btn bookmark-btn ${bookmarkedTools.includes(tool.name) ? 'active' : ''}" onclick="event.stopPropagation(); window.toggleBookmark('${tool.name}')"><i class="fas fa-star"></i></button>
                                    <button class="action-btn learned-btn ${learnedTools.includes(tool.name) ? 'active' : ''}" onclick="event.stopPropagation(); window.toggleLearned('${tool.name}')"><i class="fas fa-check-circle"></i></button>
                                </div>
                            </div>
                            <div class="tool-body"><p>${tool.what}</p></div>
                        </div>
                    `).join('')}
                </div>
            `;
            bookmarksContainer.appendChild(categoryHTML);
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
    const toolSearch = document.getElementById('toolSearch');
    const roadmapSearch = document.getElementById('roadmapSearch');

    let completedSteps = JSON.parse(localStorage.getItem('fullstackProgress')) || [];
    let bookmarkedTools = JSON.parse(localStorage.getItem('bookmarkedTools')) || [];
    let learnedTools = JSON.parse(localStorage.getItem('learnedTools')) || [];

    const updateProgress = () => {
        const total = roadmapSteps.length;
        const count = completedSteps.length;
        const p = Math.round((count / total) * 100);
        if(overallProgressFill) overallProgressFill.style.width = `${p}%`;
        if(progressCountText) progressCountText.innerText = `${count}/${total} done`;
        if(progressPercentText) progressPercentText.innerText = `${p}%`;

        roadmapSteps.forEach((step, idx) => {
            const btn = step.querySelector('.step-complete-btn');
            if (completedSteps.includes(idx)) {
                step.classList.add('completed');
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

    // Mobile Navigation
    const toggleSidebar = () => {
        sidebar.classList.toggle('open');
        document.querySelector('.sidebar-overlay').classList.toggle('active');
    };

    const mobileMoreBtn = document.getElementById('mobileMoreBtn');
    if(mobileMoreBtn) mobileMoreBtn.addEventListener('click', toggleSidebar);
    document.querySelector('.sidebar-overlay').addEventListener('click', toggleSidebar);

    // Filter Listeners
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTools();
        });
    });

    if(toolSearch) toolSearch.addEventListener('input', renderTools);
    if(roadmapSearch) roadmapSearch.addEventListener('input', (e) => {
        const t = e.target.value.toLowerCase();
        roadmapSteps.forEach(s => s.style.display = s.innerText.toLowerCase().includes(t) ? 'block' : 'none');
    });

    // Stats
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.id === 'hero') {
                    document.querySelectorAll('.stat-value').forEach(stat => {
                        const target = +stat.getAttribute('data-target');
                        let count = 0;
                        const update = () => {
                            if (count < target) { count += target/40; stat.innerText = Math.ceil(count); setTimeout(update, 25); }
                            else stat.innerText = target;
                        };
                        update();
                    });
                }
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Boot
    updateProgress();
    renderTools();
});
