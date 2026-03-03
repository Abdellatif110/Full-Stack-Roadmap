document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize State
    const roadmapSteps = document.querySelectorAll('.roadmap-step');
    const overallProgressFill = document.getElementById('overallProgressBar');
    const progressCountText = document.getElementById('progressCount');
    const progressPercentText = document.getElementById('progressPercent');
    const scrollTracker = document.getElementById('scrollTracker');
    const themeToggle = document.getElementById('themeToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const backToTop = document.getElementById('backToTop');
    const roadmapSearch = document.getElementById('roadmapSearch');
    const toolSearch = document.getElementById('toolSearch');
    const bookmarksContainer = document.getElementById('bookmarksContainer');
    const filterBtn = document.getElementById('filterBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    let completedSteps = JSON.parse(localStorage.getItem('fullstackProgress')) || [];
    let bookmarkedTools = JSON.parse(localStorage.getItem('bookmarkedTools')) || [];
    let learnedTools = JSON.parse(localStorage.getItem('learnedTools')) || [];

    // --- Tools Data ---
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
                { name: "Less", icon: "fab fa-less", level: "Intermediate", cat: "Frontend", what: "Dynamic stylesheet language.", why: "Alternative to Sass.", lifecycle: "Styling", link: "#" },
                { name: "Bulma", icon: "fas fa-columns", level: "Beginner", cat: "Frontend", what: "Modern CSS framework based on Flexbox.", why: "No JavaScript required.", lifecycle: "Styling", link: "#" },
                { name: "Material-UI", icon: "fas fa-cube", level: "Intermediate", cat: "Frontend", what: "React components for faster development.", why: "Material Design compliance.", lifecycle: "UI Components", link: "#" },
                { name: "Chakra UI", icon: "fas fa-bolt", level: "Intermediate", cat: "Frontend", what: "Accessible UI Components for React.", why: "Developer experience focused.", lifecycle: "UI Components", link: "#" },
                { name: "Styled Components", icon: "fas fa-paint-brush", level: "Intermediate", cat: "Frontend", what: "CSS-in-JS library.", why: "Automatic vendor prefixing and scoping.", lifecycle: "Styling", link: "#" }
            ]
        },
        {
            category: "3️⃣ Local Servers / Dev Environment",
            tools: [
                { name: "XAMPP", icon: "fas fa-server", level: "Beginner", cat: "Backend", what: "Apache + MariaDB + PHP + Perl.", why: "Local PHP environment.", lifecycle: "Local Server", link: "#" },
                { name: "WAMP", icon: "fas fa-server", level: "Beginner", cat: "Backend", what: "Windows Apache MySQL PHP.", why: "Windows local stack.", lifecycle: "Local Server", link: "#" },
                { name: "MAMP", icon: "fas fa-server", level: "Beginner", cat: "Backend", what: "Macintosh Apache MySQL PHP.", why: "MacOS local stack.", lifecycle: "Local Server", link: "#" },
                { name: "Laragon", icon: "fas fa-leaf", level: "Beginner", cat: "Backend", what: "WAMP alternative.", why: "Universal, portable, fast.", lifecycle: "Local Server", link: "#" },
                { name: "Docker", icon: "fab fa-docker", level: "Intermediate", cat: "DevOps", what: "App containerization.", why: "Environment consistency.", lifecycle: "DevOps", link: "#", explanation: "<strong>Containers:</strong> Isolated OS-level virtualization." },
                { name: "NGINX", icon: "fas fa-network-wired", level: "Intermediate", cat: "Cloud", what: "Web server / Reverse Proxy.", why: "Load balancing and performance.", lifecycle: "Cloud/Servers", link: "#" },
                { name: "Apache", icon: "fas fa-feather", level: "Intermediate", cat: "Cloud", what: "Legacy web server.", why: "Flexibility and .htaccess support.", lifecycle: "Cloud/Servers", link: "#" }
            ]
        },
        {
            category: "4️⃣ Bundlers & Build Tools",
            tools: [
                { name: "Vite", icon: "fas fa-bolt", level: "Beginner", cat: "Productivity", what: "Fast frontend tooling.", why: "Near-instant HMR.", lifecycle: "Build Tool", link: "#" },
                { name: "Webpack", icon: "fas fa-box", level: "Advanced", cat: "Productivity", what: "Resource bundler.", why: "Total customization control.", lifecycle: "Build Tool", link: "#", explanation: "<strong>Tree-shaking:</strong> Removing unused code." },
                { name: "Rollup", icon: "fas fa-sync", level: "Intermediate", cat: "Productivity", what: "Module bundler for libraries.", why: "Produces clean, small bundles.", lifecycle: "Build Tool", link: "#" },
                { name: "Parcel", icon: "fas fa-archive", level: "Beginner", cat: "Productivity", what: "Zero-config bundler.", why: "Ease of use.", lifecycle: "Build Tool", link: "#" },
                { name: "ESBuild", icon: "fas fa-tachometer-alt", level: "Advanced", cat: "Productivity", what: "Fast JS bundler.", why: "Extreme speed (written in Go).", lifecycle: "Build Tool", link: "#" }
            ]
        },
        {
            category: "5️⃣ Runtime Environments",
            tools: [
                { name: "Node.js", icon: "fab fa-node-js", level: "Beginner", cat: "Backend", what: "A JavaScript runtime built on V8.", why: "Server-side JS.", lifecycle: "Backend", link: "#", explanation: "<strong>Event Loop:</strong> Non-blocking single-threaded architecture." },
                { name: "Deno", icon: "fas fa-shield-alt", level: "Intermediate", cat: "Backend", what: "Secure JS/TS runtime.", why: "Security and standard library.", lifecycle: "Backend", link: "#" },
                { name: "Bun", icon: "fas fa-hamburger", level: "Advanced", cat: "Backend", what: "Fast all-in-one JS runtime.", why: "Performance and built-in tooling.", lifecycle: "Backend", link: "#" }
            ]
        },
        {
            category: "6️⃣ Package Managers",
            tools: [
                { name: "npm", icon: "fab fa-npm", level: "Beginner", cat: "Productivity", what: "The default Node package manager.", why: "Industry standard.", lifecycle: "Dev Tooling", link: "#" },
                { name: "Yarn", icon: "fab fa-yarn", level: "Beginner", cat: "Productivity", what: "Fast, reliable dependency management.", why: "Parallel installations.", lifecycle: "Dev Tooling", link: "#" },
                { name: "pnpm", icon: "fas fa-p", level: "Intermediate", cat: "Productivity", what: "Disk space efficient npm.", why: "Shared store for all projects.", lifecycle: "Dev Tooling", link: "#" }
            ]
        },
        {
            category: "7️⃣ Cloud Computing / SaaS",
            tools: [
                { name: "AWS", icon: "fab fa-aws", level: "Advanced", cat: "Cloud", what: "Amazon cloud services.", why: "Scale and variety of services.", lifecycle: "Cloud", link: "#", explanation: "<strong>IaaS:</strong> Infrastructure as a Service." },
                { name: "Google Cloud", icon: "fab fa-google", level: "Advanced", cat: "Cloud", what: "GCP services.", why: "Data and AI excellence.", lifecycle: "Cloud", link: "#" },
                { name: "Microsoft Azure", icon: "fab fa-microsoft", level: "Advanced", cat: "Cloud", what: "Microsoft cloud.", why: "Enterprise .NET integration.", lifecycle: "Cloud", link: "#" },
                { name: "Vercel", icon: "fas fa-v", level: "Beginner", cat: "Cloud", what: "Frontend cloud.", why: "Optimized for Next.js.", lifecycle: "Deployment", link: "#" },
                { name: "Netlify", icon: "fas fa-cloud-upload-alt", level: "Beginner", cat: "Cloud", what: "Static site hosting.", why: "Great CLI experience.", lifecycle: "Deployment", link: "#" }
            ]
        },
        {
            category: "8️⃣ Backend as a Service / DB Cloud",
            tools: [
                { name: "Supabase", icon: "fas fa-bolt", level: "Intermediate", cat: "Cloud", what: "Open source Firebase alternative.", why: "PostgreSQL with BaaS features.", lifecycle: "Backend", link: "#" },
                { name: "Firebase", icon: "fas fa-fire", level: "Beginner", cat: "Cloud", what: "Google's BaaS.", why: "Real-time updates and auth.", lifecycle: "Backend", link: "#" },
                { name: "MongoDB Atlas", icon: "fas fa-leaf", level: "Intermediate", cat: "Cloud", what: "Managed NoSQL service.", why: "Document-based scalability.", lifecycle: "Database", link: "#" },
                { name: "PlanetScale", icon: "fas fa-globe", level: "Advanced", cat: "Cloud", what: "Serverless MySQL.", why: "Git-like database workflow.", lifecycle: "Database", link: "#" },
                { name: "Neon", icon: "fas fa-battery-full", level: "Advanced", cat: "Cloud", what: "Serverless PostgreSQL.", why: "Autoscaling and fast storage.", lifecycle: "Database", link: "#" }
            ]
        },
        {
            category: "9️⃣ Deployment Platforms",
            tools: [
                { name: "Railway", icon: "fas fa-train", level: "Beginner", cat: "Cloud", what: "Modern PaaS.", why: "Simple backend hosting.", lifecycle: "Deployment", link: "#" },
                { name: "Render", icon: "fas fa-cubes", level: "Beginner", cat: "Cloud", what: "Unified cloud for apps.", why: "Direct GitHub integration.", lifecycle: "Deployment", link: "#" },
                { name: "Vercel", icon: "fas fa-link", level: "Beginner", cat: "Cloud", what: "Ref internal: Cloud section.", why: "Next.js specialized.", lifecycle: "Deployment", link: "#" },
                { name: "Netlify", icon: "fas fa-link", level: "Beginner", cat: "Cloud", what: "Ref internal: Cloud section.", why: "Static hosting specialized.", lifecycle: "Deployment", link: "#" }
            ]
        },
        {
            category: "🔟 Version Control",
            tools: [
                { name: "Git", icon: "fab fa-git-alt", level: "Beginner", cat: "Productivity", what: "Distributed version control.", why: "Tracking history and collaboration.", lifecycle: "General Tech", link: "#", explanation: "<strong>Branching:</strong> Parallel development streams." },
                { name: "GitHub", icon: "fab fa-github", level: "Beginner", cat: "Productivity", what: "Git repository host.", why: "Social coding and PR work.", lifecycle: "General Tech", link: "#" },
                { name: "GitLab", icon: "fab fa-gitlab", level: "Intermediate", cat: "DevOps", what: "DevOps lifecycle platform.", why: "Powerful built-in CI/CD.", lifecycle: "General Tech", link: "#" },
                { name: "Bitbucket", icon: "fab fa-bitbucket", level: "Intermediate", cat: "Productivity", what: "Atlassian repository host.", why: "Jira/Confluence integration.", lifecycle: "General Tech", link: "#" }
            ]
        },
        {
            category: "1️⃣1️⃣ IDEs / Editors",
            tools: [
                { name: "VS Code", icon: "fas fa-code", level: "Beginner", cat: "Productivity", what: "Visual Studio Code.", why: "Best extension ecosystem.", lifecycle: "Code Editor", link: "#" },
                { name: "WebStorm", icon: "fas fa-pencil-ruler", level: "Advanced", cat: "Productivity", what: "Powerful JS IDE.", why: "Deep code analysis.", lifecycle: "Code Editor", link: "#" },
                { name: "Sublime Text", icon: "fas fa-keyboard", level: "Beginner", cat: "Productivity", what: "Fast, minimal code editor.", why: "Bypasses bloat.", lifecycle: "Code Editor", link: "#" },
                { name: "Neovim", icon: "fas fa-terminal", level: "Advanced", cat: "Productivity", what: "Keyboard-centric editor.", why: "Extreme efficiency.", lifecycle: "Code Editor", link: "#" }
            ]
        },
        {
            category: "1️⃣2️⃣ IDE AI Agents",
            tools: [
                { name: "Cursor", icon: "fas fa-robot", level: "Intermediate", cat: "Productivity", what: "AI-integrated VS Code fork.", why: "Total codebase awareness.", lifecycle: "AI Coding", link: "#" },
                { name: "GitHub Copilot", icon: "fab fa-github", level: "Beginner", cat: "Productivity", what: "Autocompleting AI pairs.", why: "Instant helper.", lifecycle: "AI Coding", link: "#" },
                { name: "Codeium", icon: "fas fa-atom", level: "Beginner", cat: "Productivity", what: "Free Copilot alternative.", why: "Speed and wide support.", lifecycle: "AI Coding", link: "#" }
            ]
        },
        {
            category: "1️⃣3️⃣ Testing (Automation & Manual)",
            tools: [
                { name: "Selenium", icon: "fas fa-robot", level: "Advanced", cat: "QA", what: "Browser automation framework.", why: "Mature cross-language support.", lifecycle: "Automated Testing", link: "#" },
                { name: "Puppeteer", icon: "fas fa-dog", level: "Advanced", cat: "QA", what: "Headless Chrome Node API.", why: "Fast Chrome automation.", lifecycle: "Automated Testing", link: "#" },
                { name: "Playwright", icon: "fas fa-theater-masks", level: "Advanced", cat: "QA", what: "Modern cross-browser automation.", why: "Cross-language and fast.", lifecycle: "Automated Testing", link: "#" },
                { name: "Cypress", icon: "fas fa-check-double", level: "Intermediate", cat: "QA", what: "All-in-one E2E testing framework.", why: "Real-time reloading and time travel.", lifecycle: "Automated Testing", link: "#" },
                { name: "Cucumber", icon: "fas fa-seedling", level: "Intermediate", cat: "QA", what: "Behavior-Driven Development tool.", why: "Readable feature files.", lifecycle: "Manual/Auto Testing", link: "#" },
                { name: "Jest", icon: "fas fa-vial", level: "Beginner", cat: "QA", what: "JS testing framework.", why: "Standard for Unit testing.", lifecycle: "Automated Testing", link: "#" }
            ]
        },
        {
            category: "1️⃣4️⃣ Automation Workflow",
            tools: [
                { name: "Zapier", icon: "fas fa-link", level: "Beginner", cat: "Productivity", what: "No-code automation.", why: "Easiest tool integration.", lifecycle: "Ops", link: "#" },
                { name: "Make", icon: "fas fa-project-diagram", level: "Intermediate", cat: "Productivity", what: "Visual automation platform.", why: "Advanced logical flows.", lifecycle: "Ops", link: "#" },
                { name: "n8n", icon: "fas fa-code-branch", level: "Advanced", cat: "DevOps", what: "Fair-code node-based automation.", why: "Powerful self-hostable workflows.", lifecycle: "Ops", link: "#" },
                { name: "Apache Airflow", icon: "fas fa-wind", level: "Advanced", cat: "DevOps", what: "Data workflow platform.", why: "Managing complex DAGs.", lifecycle: "Data Ops", link: "#" },
                { name: "GitHub Actions", icon: "fab fa-github", level: "Intermediate", cat: "DevOps", what: "CI/CD directly in Github.", why: "Deep Git link.", lifecycle: "DevOps", link: "#" }
            ]
        },
        {
            category: "1️⃣5️⃣ Documentation",
            tools: [
                { name: "Notion", icon: "fas fa-book-open", level: "Beginner", cat: "Productivity", what: "All-in-one documentation workspace.", why: "Team knowledge base.", lifecycle: "Planning", link: "#" },
                { name: "Obsidian", icon: "fas fa-brain", level: "Intermediate", cat: "Productivity", what: "Personal knowledge management.", why: "Local markdown files.", lifecycle: "Planning", link: "#" },
                { name: "Astro", icon: "fas fa-rocket", level: "Intermediate", cat: "Frontend", what: "Content-driven web framework.", why: "Great for building static docs.", lifecycle: "Docs Builder", link: "#" },
                { name: "Docusaurus", icon: "fas fa-file-alt", level: "Intermediate", cat: "Frontend", what: "React-based documentation site generator.", why: "Specialized for documentation.", lifecycle: "Docs Builder", link: "#" }
            ]
        },
        {
            category: "1️⃣6️⃣ Web Analytics",
            tools: [
                { name: "PostHog", icon: "fas fa-chart-line", level: "Intermediate", cat: "Productivity", what: "Open source product analytics.", why: "Full product suite (heatmaps, etc).", lifecycle: "Data Analysis", link: "#" },
                { name: "Google Analytics", icon: "fab fa-google", level: "Beginner", cat: "Productivity", what: "Standard traffic insights.", why: "Must-have industry data.", lifecycle: "Data Analysis", link: "#" },
                { name: "Plausible", icon: "fas fa-user-secret", level: "Intermediate", cat: "Productivity", what: "Privacy-focused analytics.", why: "Lightweight and ethical.", lifecycle: "Data Analysis", link: "#" },
                { name: "Umami", icon: "fas fa-eye", level: "Intermediate", cat: "Productivity", what: "Simple, easy to use analytics.", why: "Self-hostable and fast.", lifecycle: "Data Analysis", link: "#" }
            ]
        },
        {
            category: "1️⃣7️⃣ Performance Analytics",
            tools: [
                { name: "PageSpeed Insights", icon: "fas fa-tachometer-alt", level: "Beginner", cat: "QA", what: "Google Speed Testing.", why: "SEO compliance tool.", lifecycle: "QA/Optimization", link: "#" },
                { name: "WebPageTest", icon: "fas fa-microscope", level: "Advanced", cat: "QA", what: "Deep performance profiling.", why: "Detailed waterflow charts.", lifecycle: "QA/Optimization", link: "#" },
                { name: "GTmetrix", icon: "fas fa-chart-bar", level: "Beginner", cat: "QA", what: "Consolidated site reporting.", why: "User-friendly breakdown.", lifecycle: "QA/Optimization", link: "#" },
                { name: "Calibre", icon: "fas fa-clock", level: "Advanced", cat: "QA", what: "Automated speed monitoring.", why: "Continuous tracking.", lifecycle: "QA/Optimization", link: "#" }
            ]
        },
        {
            category: "1️⃣8️⃣ Project Management",
            tools: [
                { name: "Jira", icon: "fab fa-atlassian", level: "Advanced", cat: "Productivity", what: "Agile issue tracker.", why: "Enterprise workflow standard.", lifecycle: "Planning", link: "#" },
                { name: "Trello", icon: "fab fa-trello", level: "Beginner", cat: "Productivity", what: "Visual Kanban management.", why: "Simplicity.", lifecycle: "Planning", link: "#" },
                { name: "ClickUp", icon: "fas fa-tasks", level: "Intermediate", cat: "Productivity", what: "All-in-one project manager.", why: "Versatility.", lifecycle: "Planning", link: "#" },
                { name: "Asana", icon: "fas fa-clipboard-list", level: "Intermediate", cat: "Productivity", what: "Work management platform.", why: "Team collaboration focus.", lifecycle: "Planning", link: "#" }
            ]
        },
        {
            category: "1️⃣9️⃣ UML / System Design",
            tools: [
                { name: "PlantUML", icon: "fas fa-code-branch", level: "Advanced", cat: "Productivity", what: "UML from text DSL.", why: "Best for version controlling designs.", lifecycle: "Architecture", link: "#" },
                { name: "Draw.io", icon: "fas fa-project-diagram", level: "Intermediate", cat: "Productivity", what: "Standard diagramming tool.", why: "Free and integrated with Google/GitHub.", lifecycle: "Architecture", link: "#" },
                { name: "Miro", icon: "fas fa-map", level: "Beginner", cat: "Productivity", what: "Collaborative whiteboard.", why: "Brainstorming and ideation.", lifecycle: "Architecture", link: "#" },
                { name: "Excalidraw", icon: "fas fa-pencil-alt", level: "Beginner", cat: "Productivity", what: "Hand-drawn style sketches.", why: "Fast and looks great.", lifecycle: "Architecture", link: "#" }
            ]
        }
    ];

    // --- Bookmarks Logic ---
    const renderTools = () => {
        const toolSearchTerm = toolSearch.value.toLowerCase();
        const activeFilter = document.querySelector('.category-filter-btn.active').dataset.filter;

        bookmarksContainer.innerHTML = '';

        toolsData.forEach((catData, catIndex) => {
            const categoryHTML = document.createElement('div');
            categoryHTML.className = 'bookmark-category reveal active collapsed';
            categoryHTML.id = `cat-${catIndex}`;

            const filteredTools = catData.tools.filter(tool => {
                const matchesSearch = tool.name.toLowerCase().includes(toolSearchTerm) ||
                    tool.what.toLowerCase().includes(toolSearchTerm) ||
                    tool.cat.toLowerCase().includes(toolSearchTerm);

                if (activeFilter === 'bookmarked') return matchesSearch && bookmarkedTools.includes(tool.name);
                if (activeFilter === 'learned') return matchesSearch && learnedTools.includes(tool.name);
                return matchesSearch;
            });

            if (filteredTools.length === 0) return;

            categoryHTML.innerHTML = `
                <div class="category-header glass" onclick="this.parentElement.classList.toggle('collapsed')">
                    <div class="category-title">
                        <i class="fas fa-chevron-down"></i>
                        <span>${catData.category}</span>
                    </div>
                    <div class="category-stats">${filteredTools.length} Tools</div>
                </div>
                
                <div class="tools-grid">
                    ${filteredTools.map(tool => `
                        <div class="tool-card glass ${learnedTools.includes(tool.name) ? 'learned' : ''}">
                            <div class="tool-header">
                                <div class="tool-info">
                                    <div class="tool-icon"><i class="${tool.icon}"></i></div>
                                    <div class="tool-name">
                                        <h4>${tool.name}</h4>
                                        <div class="tool-tags">
                                            <span class="tag tag-level">${tool.level}</span>
                                            <span class="tag tag-category">${tool.cat}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="tool-actions">
                                    <button class="action-btn bookmark-btn ${bookmarkedTools.includes(tool.name) ? 'active' : ''}" 
                                            onclick="event.stopPropagation(); toggleBookmark('${tool.name}')" title="Bookmark">
                                        <i class="${bookmarkedTools.includes(tool.name) ? 'fas' : 'far'} fa-star"></i>
                                    </button>
                                    <button class="action-btn learned-btn ${learnedTools.includes(tool.name) ? 'active' : ''}" 
                                            onclick="event.stopPropagation(); toggleLearned('${tool.name}')" title="Mark as Learned">
                                        <i class="fas fa-check-circle"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="tool-body">
                                <p><strong>What:</strong> ${tool.what}</p>
                                <p><strong>Why:</strong> ${tool.why}</p>
                                <p><strong>Where:</strong> ${tool.lifecycle}</p>
                                ${tool.explanation ? `<div class="tool-explanation">${tool.explanation}</div>` : ''}
                            </div>
                            <div class="tool-footer">
                                <a href="${tool.link}" class="tool-link" target="_blank">Official Site <i class="fas fa-external-link-alt"></i></a>
                                <span class="internal-link" onclick="scrollToRoadmap('${tool.cat}')">View in Roadmap</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${catData.comparison && activeFilter === 'all' ? `
                <div class="comparison-table-wrapper glass">
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                ${catData.comparison.headers.map(h => `<th>${h}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${catData.comparison.rows.map(row => `
                                <tr>
                                    ${row.map(cell => `<td>${cell}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
            `;
            bookmarksContainer.appendChild(categoryHTML);
        });

        if (bookmarksContainer.children.length === 0) {
            bookmarksContainer.innerHTML = '<div class="empty-state">No tools found matching your search or filters.</div>';
        }
    };

    window.toggleBookmark = (name) => {
        if (bookmarkedTools.includes(name)) {
            bookmarkedTools = bookmarkedTools.filter(t => t !== name);
        } else {
            bookmarkedTools.push(name);
        }
        localStorage.setItem('bookmarkedTools', JSON.stringify(bookmarkedTools));
        renderTools();
    };

    window.toggleLearned = (name) => {
        if (learnedTools.includes(name)) {
            learnedTools = learnedTools.filter(t => t !== name);
        } else {
            learnedTools.push(name);
        }
        localStorage.setItem('learnedTools', JSON.stringify(learnedTools));
        renderTools();
    };

    window.scrollToRoadmap = (cat) => {
        const mapping = {
            'Frontend': 'step-frontend',
            'Backend': 'step-backend',
            'Cloud': 'step-cloud',
            'DevOps': 'step-cicd',
            'QA': 'step-monitoring',
            'Productivity': 'roadmap' // Generic fall-back to top of roadmap
        };

        const targetId = mapping[cat] || 'roadmap';
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            window.scrollTo({ top: targetElement.offsetTop - 100, behavior: 'smooth' });

            // If it's a step, expand it
            if (targetElement.classList.contains('roadmap-step')) {
                // Close others first
                document.querySelectorAll('.roadmap-step').forEach(s => s.classList.remove('expanded'));
                targetElement.classList.add('expanded');
            }
        }
    };

    // Filter Listeners
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTools();
        });
    });

    toolSearch.addEventListener('input', renderTools);

    // Update Progress Call in existing logic
    const updateProgress = () => {
        const total = roadmapSteps.length;
        const completed = completedSteps.length;
        const percent = Math.round((completed / total) * 100);

        overallProgressFill.style.width = `${percent}%`;
        progressCountText.innerText = `${completed}/${total} completed`;
        progressPercentText.innerText = `${percent}%`;

        // Update step UI based on completion
        roadmapSteps.forEach((step, index) => {
            const btn = step.querySelector('.step-complete-btn');
            if (completedSteps.includes(index)) {
                step.classList.add('completed');
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
            } else {
                step.classList.remove('completed');
                btn.innerHTML = '<i class="far fa-check-circle"></i> Mark as Completed';
            }
        });
    };

    window.toggleProgress = (index) => {
        if (completedSteps.includes(index)) {
            completedSteps = completedSteps.filter(i => i !== index);
        } else {
            completedSteps.push(index);
        }
        localStorage.setItem('fullstackProgress', JSON.stringify(completedSteps));
        updateProgress();
    };

    // 3. Accordion (Expand/Collapse) Logic
    roadmapSteps.forEach((step) => {
        const card = step.querySelector('.roadmap-card');
        card.addEventListener('click', (e) => {
            // Don't toggle if clicking the completion button
            if (e.target.closest('.step-complete-btn')) return;

            const isExpanded = step.classList.contains('expanded');

            // Optional: Close others first if you want only one open
            roadmapSteps.forEach(s => s.classList.remove('expanded'));

            if (!isExpanded) {
                step.classList.add('expanded');
            }
        });
    });

    // 4. Scroll Effects
    // Update scroll progress bar at top
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollTracker.style.width = scrolled + '%';

        // Back to top button visibility
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Active navigation link highlighting
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');

        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 5. Reveal on Scroll (Intersection Observer)
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // If it's the hero, start counting stats
                if (entry.target.id === 'hero') {
                    animateStats();
                }
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // 6. Stats Animation
    const animateStats = () => {
        const stats = document.querySelectorAll('.stat-value');
        stats.forEach(stat => {
            const target = +stat.getAttribute('data-target');
            let count = 0;
            const increment = target / 40; // speed

            const updateCount = () => {
                if (count < target) {
                    count += increment;
                    stat.innerText = Math.ceil(count);
                    setTimeout(updateCount, 25);
                } else {
                    stat.innerText = target;
                }
            };
            updateCount();
        });
    };

    // 7. Theme Toggle
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // 8. Search Functionality
    roadmapSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        roadmapSteps.forEach(step => {
            const title = step.querySelector('h3').innerText.toLowerCase();
            const desc = step.querySelector('p').innerText.toLowerCase();
            const content = step.querySelector('.roadmap-content').innerText.toLowerCase();

            if (title.includes(term) || desc.includes(term) || content.includes(term)) {
                step.style.display = 'block';
            } else {
                step.style.display = 'none';
            }
        });
    });

    // 9. Filtering (Toggle Levels)
    let currentFilter = 'all';
    filterBtn.addEventListener('click', () => {
        const filters = ['all', 'beginner', 'intermediate', 'advanced'];
        let nextIndex = (filters.indexOf(currentFilter) + 1) % filters.length;
        currentFilter = filters[nextIndex];

        roadmapSteps.forEach(step => {
            if (currentFilter === 'all' || step.getAttribute('data-level') === currentFilter) {
                step.style.display = 'block';
            } else {
                step.style.display = 'none';
            }
        });

        // Feedback in UI
        filterBtn.style.color = currentFilter === 'all' ? 'var(--text-main)' : 'var(--accent-primary)';
        filterBtn.title = `Filtering: ${currentFilter}`;
    });

    // 10. Mobile Sidebar Toggle
    const toggleSidebar = () => {
        const isOpen = sidebar.classList.contains('open');
        if (isOpen) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
            mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        } else {
            sidebar.classList.add('open');
            sidebarOverlay.classList.add('active');
            mobileToggle.innerHTML = '<i class="fas fa-times"></i>';
        }
    };

    mobileToggle.addEventListener('click', toggleSidebar);

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }

    // Close sidebar on link click (mobile) and handle reveal
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection && targetSection.classList.contains('reveal')) {
                targetSection.classList.add('active');
            }

            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
                if (sidebarOverlay) sidebarOverlay.classList.remove('active');
                mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });

    // Initial Load and Hash Support
    updateProgress();
    renderTools();

    // Support hash linking on load (important for reveals)
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const target = document.getElementById(hash);
        if (target && target.classList.contains('reveal')) {
            target.classList.add('active');
        }
    }
});
