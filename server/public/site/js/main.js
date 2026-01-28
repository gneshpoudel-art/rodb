// API Base URL
const API_BASE = '/api';

// State
let currentPage = 0;
const pageSize = 12;
const mainPageSize = 200; // load many articles for central feed (shows all released news)
let lastFetchCount = 0; // number of articles returned by last fetch
let totalLoaded = 0; // total articles loaded into feed

// Image optimization helper
function optimizeImageUrl(url, width = 1200, quality = 'high') {
    if (!url) return '';
    // Add quality parameters if it's an external image service
    if (url.includes('images.unsplash.com') || url.includes('picsum.photos')) {
        return url + (url.includes('?') ? '&' : '?') + `w=${width}&q=95&fit=crop`;
    }
    // For local uploads, ensure HD quality
    return url;
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadDate();
    loadNavigation();
    loadNewsTicker();
    loadAds();
    loadCategoriesForMenu();
    loadInfoSettings();
    setupModals();
    initMobileMenuListeners(); // Initialize mobile menu listeners

    // Content Loading
    if (window.innerWidth <= 768) {
        // Mobile: Show mobile layout and hide grid layout
        const mobileLayout = document.querySelector('.mobile-layout');
        const gridLayout = document.querySelector('.news-grid-layout');
        if (mobileLayout) mobileLayout.style.display = 'block';
        if (gridLayout) gridLayout.style.display = 'none';
        loadMobileLayout(); // Mobile layout
    } else {
        // Desktop: Show grid layout and hide mobile layout
        const mobileLayout = document.querySelector('.mobile-layout');
        const gridLayout = document.querySelector('.news-grid-layout');
        if (mobileLayout) mobileLayout.style.display = 'none';
        if (gridLayout) gridLayout.style.display = 'grid';
        loadFeedArticles(); // Middle (Desktop)
        loadFeaturedHeadlines(); // Right news feed
        loadHotNews(); // Right
        loadTrending(); // Right Widget
    }
});

function renderFeedMeta(article) {
    return `
        <span class="meta-date">${timeAgo(article.published_at, article.created_at)}</span>
        ${article.author ? `<span class="meta-author"> • ${article.author}</span>` : ''}
    `;
}

function toggleMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu.style.display === 'block') {
        mobileMenu.style.display = 'none';
    } else {
        mobileMenu.style.display = 'block';
    }
}

function closeMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.style.display = 'none';
}

// Close menu when clicking on links
function initMobileMenuListeners() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (!mobileMenu) return;
    
    // Close menu when clicking on any link inside
    const links = mobileMenu.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const menuToggleBtn = document.getElementById('menuToggleBtn');
        if (mobileMenu.style.display === 'block' && 
            !mobileMenu.contains(e.target) && 
            !menuToggleBtn.contains(e.target)) {
            closeMenu();
        }
    });
}

// Utility: Relative time formatter
// Utility: Relative time formatter
function timeAgo(dateString, createdDateString) {
    // If dateString (published_at) is missing or from 1970 (Unix epoch start), try created_at
    let date = new Date(dateString);
    const now = new Date();

    // Check if date is invalid or evidently default Unix epoch (often 1970-01-01 when null/0)
    // 1970 check: if year is 1970, it's likely a default value for null
    if (!dateString || isNaN(date.getTime()) || date.getFullYear() === 1970) {
        if (createdDateString) {
            date = new Date(createdDateString);
        } else {
            return '';
        }
    }

    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}

// Enhanced header/footer scroll logic
function initHeaderScroll() {
    let lastScrollY = window.scrollY;
    const topBar = document.querySelector('.top-bar');
    const mainHeader = document.querySelector('.main-header');

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Hide immediately on scroll down (if scrolled more than 10px to avoid jitter)
        if (currentScrollY > lastScrollY && currentScrollY > 10) {
            topBar.classList.add('hidden');
            mainHeader.classList.add('hidden');
        } else {
            // Show on scroll up
            topBar.classList.remove('hidden');
            mainHeader.classList.remove('hidden');
        }
        lastScrollY = currentScrollY;
    });
}
// Initialize scroll logic
initHeaderScroll();

// Theme
function initTheme() {
    const toggle = document.getElementById('themeToggle');
    const mobileToggle = document.getElementById('mobileThemeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const updateToggleText = () => {
        const text = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
        if (toggle) toggle.textContent = text;
        if (mobileToggle) {
            mobileToggle.innerHTML = `
                <svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${savedTheme === 'dark' 
                        ? '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'
                        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'
                    }
                </svg>
                <span>${text}</span>
            `;
        }
    };
    updateToggleText();

    const handleThemeChange = () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleText();
    };

    toggle?.addEventListener('click', handleThemeChange);
    mobileToggle?.addEventListener('click', handleThemeChange);
}

// Date
function loadDate() {
    // Use Bikram Sambat calendar for Nepal
    if (typeof BikramSambat !== 'undefined') {
        const bsDate = BikramSambat.today('long');
        const tickerDateElement = document.getElementById('tickerDate');
        if (tickerDateElement) {
            tickerDateElement.textContent = bsDate;
        }
    } else {
        // Fallback to Gregorian if BikramSambat not available
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateText = new Date().toLocaleDateString('ne-NP', dateOptions);
        const tickerDateElement = document.getElementById('tickerDate');
        if (tickerDateElement) {
            tickerDateElement.textContent = dateText;
        }
    }
}

// Navigation
async function loadNavigation() {
    try {
        const response = await fetch(`${API_BASE}/navigation`);
        const data = await response.json();

        const topNavList = document.getElementById('topNavList');
        const mobileNav = document.getElementById('mobileNavList');

        const createLink = (item) => `<li><a href="${item.url}">${item.label}</a></li>`;

        const html = data.items.map(createLink).join('');
        const homeLink = `<li><a href="/">Home</a></li>`;

        // Base links
        let fullNavHtml = homeLink + html;

        // Categories in top nav
        try {
            const catResponse = await fetch(`${API_BASE}/categories?limit=5`);
            const catData = await catResponse.json();
            if (catData.categories && catData.categories.length > 0) {
                const catHtml = catData.categories.map(cat =>
                    `<li><a href="/category/${cat.slug}">${cat.name}</a></li>`
                ).join('');
                fullNavHtml += catHtml;
            }
        } catch (e) { console.error('Categories in nav error', e); }

        // Add About and Contact
        fullNavHtml += `
            <li><a href="#" onclick="openModal('aboutModal'); return false;">About</a></li>
            <li><a href="#" onclick="openModal('contactModal'); return false;">Contact</a></li>
        `;

        topNavList.innerHTML = fullNavHtml;
        mobileNav.innerHTML = fullNavHtml;

    } catch (e) {
        console.error('Nav error', e);
    }
}

// Load Categories for Mobile Menu and new Nav logic
async function loadCategoriesForMenu() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const data = await response.json();
        // Only for mobile menu if needed, or if we decide to put categories differently
        const mobileCatList = document.getElementById('mobileCatList');
        // Left category list is GONE in new design, so we don't need to populate #categoryList

        if (data.categories && data.categories.length > 0) {
            const html = data.categories.map(cat =>
                `<li style="margin-bottom: 8px;"><a href="/category/${cat.slug}" style="text-decoration: none; color: var(--primary); font-weight: 500;">${cat.name}</a></li>`
            ).join('');

            if (mobileCatList) mobileCatList.innerHTML = html;
        }
    } catch (e) {
        console.error('Categories error:', e);
    }
}

// Modal Logic
function setupModals() {
    const aboutModal = document.getElementById('aboutModal');
    const contactModal = document.getElementById('contactModal');
    const closeBtns = document.querySelectorAll('.close-modal');

    closeBtns.forEach(btn => {
        btn.onclick = function () {
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).style.display = "none";
        }
    });

    window.onclick = function (event) {
        if (event.target == aboutModal) {
            aboutModal.style.display = "none";
        }
        if (event.target == contactModal) {
            contactModal.style.display = "none";
        }
    }
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

// Load About and Contact Info
async function loadInfoSettings() {
    try {
        const response = await fetch(`${API_BASE}/settings/public`);
        const data = await response.json();

        const aboutText = data.settings?.find(s => s.key === 'about_content')?.value || data.settings?.find(s => s.key === 'about_info')?.value || 'Routine of Dhulikhel Banda';
        const contactText = data.settings?.find(s => s.key === 'contact_content')?.value || data.settings?.find(s => s.key === 'contact_info')?.value || 'rodb.dhulikhel@gmail.com';

        const mobileAbout = document.getElementById('mobileAbout');
        const mobileContact = document.getElementById('mobileContact');

        if (mobileAbout) mobileAbout.textContent = aboutText;
        if (mobileContact) mobileContact.textContent = contactText;

        // Populate Modals
        const aboutModalContent = document.getElementById('aboutModalContent');
        const contactModalContent = document.getElementById('contactModalContent');
        if (aboutModalContent) aboutModalContent.innerHTML = `<p>${aboutText}</p>`;
        if (contactModalContent) contactModalContent.innerHTML = `<p>${contactText}</p>`;
    } catch (e) {
        console.error('Settings error:', e);
    }
}

// Ticker
async function loadNewsTicker() {
    try {
        const response = await fetch(`${API_BASE}/settings/public`);
        const data = await response.json();

        const tickerEnabledSetting = data.settings?.find(s => s.key === 'ticker_enabled');
        const tickerEnabled = tickerEnabledSetting?.value === 'true' || tickerEnabledSetting?.value === true;

        console.log('Ticker enabled:', tickerEnabled, 'Raw value:', tickerEnabledSetting?.value);

        if (!tickerEnabled) {
            // Force show for now if debug needed, but respecting setting
            document.getElementById('newsTicker').style.display = 'none';
            return;
        }

        // Show ticker
        document.getElementById('newsTicker').style.display = 'block';

        const tickerText = data.settings?.find(s => s.key === 'ticker_text')?.value;
        let items = [];
        if (tickerText && tickerText.trim()) {
            items = tickerText.split('|').map(item => item.trim()).filter(item => item);
        } else {
            // Fallback to latest articles
            const artRes = await fetch(`${API_BASE}/articles?limit=5&status=published`);
            const artData = await artRes.json();
            items = artData.articles.map(a => a.headline);
        }

        if (items.length > 0) {
            // Duplicate items for continuous loop effect
            const html = items.map(item => `<span class="ticker-item">${item}</span>`).join('');
            const tickerItemsContainer = document.getElementById('tickerItems');
            // Add items twice for seamless loop
            tickerItemsContainer.innerHTML = html + html;

            // Add visible class to show ticker
            document.getElementById('newsTicker').classList.add('visible');
        }

    } catch (e) {
        console.error('Ticker error:', e);
    }
}

// Ads
async function loadAds() {
    try {
        const response = await fetch(`${API_BASE}/ads`);
        const data = await response.json();

        if (!data.ads || data.ads.length === 0) {
            console.log('No ads available');
            return;
        }

        // Group ads by placement
        const adsByPlacement = {
            'header': [],
            'content_top': [],
            'content_bottom': []
        };

        data.ads.forEach(ad => {
            if (adsByPlacement[ad.placement]) {
                adsByPlacement[ad.placement].push(ad);
            }
        });

        // Function to get random ad from array
        const getRandomAd = (ads) => {
            if (!ads || ads.length === 0) return null;
            return ads[Math.floor(Math.random() * ads.length)];
        };

        // Function to track impression
        const trackImpression = async (adId) => {
            try {
                await fetch(`${API_BASE}/ads/${adId}/impression`, { method: 'POST' });
            } catch (e) {
                console.error('Failed to track impression:', e);
            }
        };

        // Display random ad for header
        const headerAd = getRandomAd(adsByPlacement.header);
        if (headerAd) {
            document.getElementById('ad_header').innerHTML = `
                <a href="${headerAd.link_url}" target="_blank" style="display: block;" onclick="fetch('${API_BASE}/ads/${headerAd.id}/click', {method: 'POST'})">
                    <img src="${headerAd.image_url}" style="width: 100%; height: auto; max-height: 90px; object-fit: contain;" alt="${headerAd.name}">
                </a>
            `;
            trackImpression(headerAd.id);
        }

        // Display random ad for left sidebar (content_top)
        const leftAd = getRandomAd(adsByPlacement.content_top);
        if (leftAd) {
            document.getElementById('ad_left').innerHTML = `
                <a href="${leftAd.link_url}" target="_blank" style="display: block;" onclick="fetch('${API_BASE}/ads/${leftAd.id}/click', {method: 'POST'})">
                    <img src="${leftAd.image_url}" style="width: 100%; height: auto; max-width: 100%; object-fit: contain; border-radius: 6px;" alt="${leftAd.name}">
                </a>
            `;
            trackImpression(leftAd.id);
        }

        // Display random ad for right sidebar (content_bottom)
        const rightAd = getRandomAd(adsByPlacement.content_bottom);
        if (rightAd) {
            document.getElementById('ad_right').innerHTML = `
                <a href="${rightAd.link_url}" target="_blank" style="display: block;" onclick="fetch('${API_BASE}/ads/${rightAd.id}/click', {method: 'POST'})">
                    <img src="${rightAd.image_url}" style="width: 100%; height: auto; max-width: 100%; object-fit: contain; border-radius: 6px;" alt="${rightAd.name}">
                </a>
            `;
            trackImpression(rightAd.id);
        }

    } catch (e) {
        console.error('Ads error', e);
    }
}

// Load Middle Feed (Social Style with Image Overlay)
async function loadFeedArticles() {
    try {
        // Load full set of released/published articles into center feed
        // Fetch center feed: request articles sorted by published_at descending
        const response = await fetch(`${API_BASE}/articles?limit=${mainPageSize}&offset=${currentPage * mainPageSize}&status=published`);
        const data = await response.json();
        const container = document.getElementById('styles-social-feed');

        if (!container) {
            console.error('Middle feed container #styles-social-feed not found in DOM');
            return;
        }

        if (!data || !data.articles || data.articles.length === 0) {
            // record fetch count
            lastFetchCount = 0;
            if (currentPage === 0) {
                container.innerHTML = '<p style="padding:20px; text-align:center; color:var(--text-muted);">No articles available right now.</p>';
            }
            return;
        }

        // track counts for Load More behavior
        lastFetchCount = data.articles.length;
        totalLoaded += data.articles.length;

        // Render logic with mobile interleaving
        let html = '';
        const isMobile = window.innerWidth <= 768;

        if (isMobile && currentPage === 0) {
            // First 2 articles
            const firstBatch = data.articles.slice(0, 2);
            const restBatch = data.articles.slice(2);

            html += renderArticlesHtml(firstBatch);

            // Inject placeholder for Trending News (will be populated by loadTrending)
            html += `<div id="mobile-trending-placeholder" class="mobile-trending-container" style="margin: 20px 0; padding: 15px; background: var(--bg-card); border-top: 2px solid var(--primary); border-bottom: 2px solid var(--primary);">
                        <h3 style="margin-top: 0; margin-bottom: 15px; color: var(--primary);">Trending Now</h3>
                        <div id="mobileTrendingList"></div>
                     </div>`;

            // Inject Mobile Ad Placeholder
            html += `<div id="mobile-ad-placeholder" style="margin: 20px 0; text-align: center; min-height: 250px; background: var(--bg-body); display: flex; align-items: center; justify-content: center;">
                        <span style="color: var(--text-muted); font-size: 0.8em;">Advertisement</span>
                     </div>`;

            // Rest of the articles
            html += renderArticlesHtml(restBatch);

            // Trigger loading content
            setTimeout(() => {
                loadTrendingForMobile();
                loadMobileFeedAd();
            }, 100);

        } else {
            // Desktop or subsequent pages: render all normally
            html = renderArticlesHtml(data.articles);
        }

        if (currentPage === 0) container.innerHTML = html;
        else container.insertAdjacentHTML('beforeend', html);

    } catch (e) {
        console.error('Error loading feed:', e);
        const container = document.getElementById('styles-social-feed');
        if (container) container.innerHTML = '<div class="feed-error" style="padding:20px; text-align:center; color:var(--text-danger,#b00020);">Failed to load articles. Please try again later.</div>';
    }
}

// Helper to render articles HTML
function renderArticlesHtml(articles) {
    return articles.map(article => {
        // Check if it's a data URL (base64)
        const isDataUrl = article.featured_image_url && article.featured_image_url.startsWith('data:');
        const imageUrl = isDataUrl ? article.featured_image_url : optimizeImageUrl(article.featured_image_url, 1200);
        
        // Safe summary extraction
        let summaryText = '';
        if (article.summary) {
            summaryText = article.summary;
        } else if (typeof article.body === 'string') {
            summaryText = article.body.substring(0, 120).replace(/<[^>]*>/g, '') + '...';
        }
        
        return `
        <a href="/article.html?slug=${article.slug}" class="feed-card" style="text-decoration: none; color: inherit;">
            ${article.featured_image_url ?
            `<div class="feed-card-image-container">
                <img src="${imageUrl}" 
                     ${!isDataUrl ? `srcset="${optimizeImageUrl(article.featured_image_url, 600)} 600w, ${optimizeImageUrl(article.featured_image_url, 1200)} 1200w"` : ''}
                     alt="${article.headline}" 
                     loading="lazy"
                     style="width: 100%; height: 100%; object-fit: contain;">
                <div class="feed-card-overlay">
                    <h2 style="margin: 0; color: white;">
                        ${article.headline}
                    </h2>
                    <div class="feed-summary" style="color: rgba(255,255,255,0.95);">
                        ${summaryText}
                    </div>
                </div>
            </div>` :
            '<div style="height: 300px; background: var(--bg-body); display: flex; align-items: center; justify-content: center;"><p>No Image</p></div>'}
            
            <div class="feed-content">
                <h3 class="feed-title">${article.headline}</h3>
                <div class="feed-meta">
                    ${timeAgo(article.published_at, article.created_at)}
                </div>
            </div>
        </a>`;
    }).join('');
}

// Special function to load trending into mobile placeholder
async function loadTrendingForMobile() {
    const mobileContainer = document.getElementById('mobileTrendingList');
    if (!mobileContainer) return;

    try {
        // First try to load from admin settings (same as desktop)
        const settingsResponse = await fetch(`${API_BASE}/settings/public`);
        const settingsData = await settingsResponse.json();
        const trendingSetting = settingsData.settings?.find(s => s.key === 'trending_articles');

        if (trendingSetting && trendingSetting.value) {
            // Load specific articles from IDs - show all configured trending articles
            const articleIds = trendingSetting.value.split('\n').map(id => id.trim()).filter(Boolean);
            if (articleIds.length > 0) {
                const articles = [];
                const seenIds = new Set();
                for (const id of articleIds) {
                    if (seenIds.has(id)) continue;
                    try {
                        const response = await fetch(`${API_BASE}/articles/${id}`);
                        const data = await response.json();
                        if (data.article && data.article.status === 'published') {
                            articles.push(data.article);
                            seenIds.add(id);
                        }
                    } catch (e) {
                        console.error('Error loading article for mobile trending:', id, e);
                    }
                }

                if (articles.length > 0) {
                    const html = articles.map((article, idx) => `
                        <div class="trending-item" style="border-bottom: 1px solid var(--border); padding: 10px 0; display: flex; gap: 10px; align-items: flex-start;">
                            <div style="font-weight: bold; color: var(--primary); font-size: 1.1em; min-width: 20px;">▸</div>
                            <div class="trending-item-content">
                                <a href="/article.html?slug=${article.slug}" style="text-decoration: none; color: inherit;">
                                    <div class="trending-item-title" style="font-weight: 500;">${article.headline}</div>
                                </a>
                            </div>
                        </div>
                    `).join('');
                    mobileContainer.innerHTML = html;
                    return;
                }
            }
        }

        // Fallback to top 4 articles if no trending setting
        const response = await fetch(`${API_BASE}/articles?limit=4&status=published`);
        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            const html = data.articles.map((article, idx) => `
                <div class="trending-item" style="border-bottom: 1px solid var(--border); padding: 10px 0; display: flex; gap: 10px; align-items: flex-start;">
                    <div style="font-weight: bold; color: var(--primary); font-size: 1.1em; min-width: 20px;">▸</div>
                    <div class="trending-item-content">
                        <a href="/article.html?slug=${article.slug}" style="text-decoration: none; color: inherit;">
                            <div class="trending-item-title" style="font-weight: 500;">${article.headline}</div>
                        </a>
                    </div>
                </div>
            `).join('');
            mobileContainer.innerHTML = html;
        }
    } catch (e) {
        console.error('Mobile trending error', e);
    }
}

// Load random ad for mobile feed
async function loadMobileFeedAd() {
    try {
        const response = await fetch(`${API_BASE}/ads`);
        const data = await response.json();
        if (data.ads && data.ads.length > 0) {
            // Get random ad
            const ad = data.ads[Math.floor(Math.random() * data.ads.length)];
            const container = document.getElementById('mobile-ad-placeholder');
            if (container) {
                container.innerHTML = `
                    <a href="${ad.link_url}" target="_blank" style="display: block; width: 100%;" onclick="fetch('${API_BASE}/ads/${ad.id}/click', {method: 'POST'})">
                        <img src="${ad.image_url}" style="width: 100%; height: auto; max-width: 100%; object-fit: contain; border-radius: 6px;" alt="${ad.name}">
                    </a>
                `;
                // Track impression
                fetch(`${API_BASE}/ads/${ad.id}/impression`, { method: 'POST' });
            }
        }
    } catch (e) {
        console.error('Ad load error', e);
    }
}

document.getElementById('loadMore')?.addEventListener('click', async () => {
    const btn = document.getElementById('loadMore');
    if (btn) {
        btn.disabled = true;
        btn.classList.remove('visible');
    }
    currentPage++;
    await loadFeedArticles();
    if (btn) {
        btn.disabled = false;
    }
    // Update scroll-related visibility
    window.dispatchEvent(new Event('scroll'));
});

// Load Left Headlines (Featured) - News Feed with Left Image, Right Content
async function loadFeaturedHeadlines() {
    try {
        const response = await fetch(`${API_BASE}/articles?featured=false&limit=12&status=published`);
        const data = await response.json();
        // Now populate the left-side feed container (previously right)
        const container = document.getElementById('leftNewsFeed'); // Changed ID

        if (!container) return;

        container.innerHTML = data.articles.map(article => {
            // Safe summary extraction
            let summary = '';
            if (article.summary) {
                summary = article.summary;
            } else if (typeof article.body === 'string') {
                summary = article.body.substring(0, 100).replace(/<[^>]*>/g, '') + '...';
            }
            // Bold summary as requested
            const displaySummary = summary.length > 80 ? summary.substring(0, 80) + '...' : summary;
            const isDataUrl = article.featured_image_url && article.featured_image_url.startsWith('data:');
            const imageUrl = isDataUrl ? article.featured_image_url : optimizeImageUrl(article.featured_image_url, 200);

            return `
                <div class="news-feed-item" onclick="window.location.href='/article.html?slug=${article.slug}'">
                    ${article.featured_image_url ?
                    `<img src="${imageUrl}" 
                         alt="${article.headline}" 
                         class="news-feed-item-image" 
                         loading="lazy">` :
                    `<div style="width: 80px; height: 60px; background: var(--bg-body); border-radius:4px; flex-shrink:0;"></div>`}
                    <div class="news-feed-item-content">
                        <!-- Summary is bold and visible, acting as main text -->
                        <p class="news-feed-item-title">${displaySummary}</p>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) { console.error(e); }
}

// Load Right Hot News (from admin settings or breaking news)
async function loadHotNews() {
    try {
        // First try to load from admin settings
        const settingsResponse = await fetch(`${API_BASE}/settings/public`);
        const settingsData = await settingsResponse.json();
        const hotNewsSetting = settingsData.settings?.find(s => s.key === 'hot_news');

        const container = document.getElementById('hotNewsList');

        if (hotNewsSetting && hotNewsSetting.value) {
            // Load from admin setting
            const items = hotNewsSetting.value.split('\n').filter(item => item.trim());
            container.innerHTML = items.map(item => `
                <li style="list-style: none; margin: 0; padding: 0;">
                    <div style="padding: 10px; background: var(--bg-body); border-left: 4px solid var(--primary); border-radius: 3px;">
                        <strong style="color: var(--primary); font-size: 1.05em; display: block; line-height: 1.3;">
                            ${item}
                        </strong>
                    </div>
                </li>
            `).join('');
        } else {
            // Fallback to breaking news articles
            const response = await fetch(`${API_BASE}/articles?breaking=true&limit=8&status=published`);
            const data = await response.json();

            container.innerHTML = data.articles.map(article => `
                <li style="list-style: none; margin: 0; padding: 0;">
                    <a href="/article.html?slug=${article.slug}" style="text-decoration: none; display: block;">
                        <div style="padding: 10px; background: var(--bg-body); border-left: 4px solid var(--primary); border-radius: 3px; transition: all 0.3s ease; cursor: pointer;">
                            <strong style="color: var(--primary); font-size: 1.05em; display: block; line-height: 1.3; margin-bottom: 3px;">
                                ${article.headline}
                            </strong>
                            <small style="color: var(--text-muted); display: block; font-size: 0.75em;">
                                ${timeAgo(article.published_at, article.created_at)}
                            </small>
                        </div>
                    </a>
                </li>
            `).join('');
        }
    } catch (e) { console.error(e); }
}

// Trending - Load from admin settings or top viewed articles
async function loadTrending() {
    try {
        // First try to load from admin settings
        const settingsResponse = await fetch(`${API_BASE}/settings/public`);
        const settingsData = await settingsResponse.json();
        const trendingSetting = settingsData.settings?.find(s => s.key === 'trending_articles');

        const container = document.getElementById('trendingList');

        if (trendingSetting && trendingSetting.value) {
            // Load specific articles from IDs
            const articleIds = trendingSetting.value.split('\n').map(id => id.trim()).filter(Boolean);
            if (articleIds.length > 0) {
                const articles = [];
                const seenIds = new Set();
                const invalidIds = [];
                for (const id of articleIds) {
                    if (seenIds.has(id)) continue; // Skip duplicate IDs
                    try {
                        const response = await fetch(`${API_BASE}/articles/${id}`);
                        const data = await response.json();
                        if (data.article && data.article.status === 'published') {
                            articles.push(data.article);
                            seenIds.add(id);
                        } else {
                            invalidIds.push(id);
                        }
                    } catch (e) {
                        console.error('Error loading article:', id, e);
                        invalidIds.push(id);
                    }
                }

                if (articles.length > 0) {
                    container.innerHTML = '<div class="trending-items">' + articles.map((article, idx) => `
                        <div class="trending-item">
                            <div class="trending-item-content">
                                <a href="/article.html?slug=${article.slug}" style="text-decoration: none; color: inherit;">
                                    <div class="trending-item-title">${article.headline}</div>
                                    <div style="font-size: 0.85em; color: var(--text-muted); margin-top: 5px; line-height: 1.4;">
                                        ${article.summary || article.body.substring(0, 100).replace(/<[^>]*>/g, '') + '...'}
                                    </div>
                                </a>
                            </div>
                        </div>
                    `).join('') + '</div>';
                } else {
                    container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No trending articles found.</p>';
                }

                if (invalidIds.length > 0) {
                    showTrendingWarning(`Warning: Invalid article ID(s): ${invalidIds.join(', ')}`);
                }
                return;
            }
        }
// Show warning notification for trending section
function showTrendingWarning(message) {
    let warn = document.getElementById('trending-warning');
    if (!warn) {
        warn = document.createElement('div');
        warn.id = 'trending-warning';
        warn.style.position = 'fixed';
        warn.style.top = '20px';
        warn.style.right = '20px';
        warn.style.background = 'rgba(255, 0, 0, 0.9)';
        warn.style.color = 'white';
        warn.style.padding = '12px 20px';
        warn.style.borderRadius = '6px';
        warn.style.zIndex = 9999;
        warn.style.fontSize = '1em';
        warn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        document.body.appendChild(warn);
    }
    warn.textContent = message;
    warn.style.display = 'block';
    setTimeout(() => { warn.style.display = 'none'; }, 5000);
}

        // Fallback to most viewed articles
        const response = await fetch(`${API_BASE}/articles?limit=6&status=published`);
        const data = await response.json();

        // Sort by view count if available
        const sorted = data.articles.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));

        const trendingHtml = sorted.slice(0, 10).map((article, idx) => {
            let summaryText = '';
            if (article.summary) {
                summaryText = article.summary;
            } else if (typeof article.body === 'string') {
                summaryText = article.body.substring(0, 100).replace(/<[^>]*>/g, '') + '...';
            }
            return `
            <div class="trending-item">
                <div class="trending-item-content">
                    <a href="/article.html?slug=${article.slug}" style="text-decoration: none; color: inherit;">
                        <div class="trending-item-title">${article.headline}</div>
                        <div style="font-size: 0.85em; color: var(--text-muted); margin-top: 5px; line-height: 1.4;">
                            ${summaryText}
                        </div>
                    </a>
                </div>
            </div>
        `;
        }).join('');
        container.innerHTML = '<div class="trending-items">' + trendingHtml + '</div>';
    } catch (e) {
        console.error('Trending error:', e);
        document.getElementById('trendingList').innerHTML = '<p style="text-align: center; color: var(--text-muted);">Top stories trending now...</p>';
    }
}

// Mobile Layout Functions
async function loadMobileLayout() {
    if (window.innerWidth > 768) return; // Only for mobile
    
    try {
        // Load more articles for all sections
        const response = await fetch(`${API_BASE}/articles?limit=200&status=published`);
        const data = await response.json();
        
        if (!data.articles || data.articles.length === 0) return;
        
        const articles = data.articles;
        
        // Load top 2 articles
        loadMobileTopArticles(articles.slice(0, 2));
        
        // Load trending with summaries (only 4 trending, not all 10)
        loadMobileTrendingCards(articles.slice(0, 4));
        
        // Load ALL remaining articles as news feed (starting from index 2)
        loadMobileNewsFeedCards(articles.slice(2));
        
    } catch (e) {
        console.error('Error loading mobile layout:', e);
    }
}

function loadMobileTopArticles(articles) {
    const container = document.getElementById('mobileTopArticles');
    if (!container) return;
    
    const html = articles.map(article => {
        const isDataUrl = article.featured_image_url && article.featured_image_url.startsWith('data:');
        const imageUrl = isDataUrl ? article.featured_image_url : optimizeImageUrl(article.featured_image_url, 600);
        
        return `
        <a href="/article.html?slug=${article.slug}" class="mobile-top-article" style="text-decoration: none; color: inherit;">
            ${article.featured_image_url ? 
                `<img src="${imageUrl}" alt="${article.headline}" class="mobile-top-article-image">` :
                `<div class="mobile-top-article-image" style="background: var(--bg-body); display: flex; align-items: center; justify-content: center;">No Image</div>`
            }
            <div class="mobile-top-article-content">
                <h3 class="mobile-top-article-title">${article.headline}</h3>
                <div class="mobile-top-article-meta">${timeAgo(article.published_at, article.created_at)}</div>
            </div>
        </a>
    `}).join('');
    
    container.innerHTML = html;
}

function loadMobileTrendingCards(articles) {
    const container = document.getElementById('mobileTrendingCards');
    if (!container) return;
    
    const html = articles.map((article) => {
        let summaryText = '';
        if (article.summary) {
            summaryText = article.summary;
        } else if (typeof article.body === 'string') {
            summaryText = article.body.substring(0, 100).replace(/<[^>]*>/g, '');
        }
        return `
            <a href="/article.html?slug=${article.slug}" class="trending-card" style="text-decoration: none; color: inherit;">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                    <div style="flex: 1;">
                        <h4 class="trending-card-title">${article.headline}</h4>
                        <p class="trending-card-summary">${summaryText}</p>
                    </div>
                </div>
            </a>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function loadMobileNewsFeedCards(articles) {
    const container = document.getElementById('mobileNewsFeed');
    if (!container) return;
    
    const html = articles.map(article => {
        const isDataUrl = article.featured_image_url && article.featured_image_url.startsWith('data:');
        const imageUrl = isDataUrl ? article.featured_image_url : optimizeImageUrl(article.featured_image_url, 300);
        
        return `
        <a href="/article.html?slug=${article.slug}" class="mobile-feed-card" style="text-decoration: none; color: inherit;">
            ${article.featured_image_url ? 
                `<img src="${imageUrl}" alt="${article.headline}" class="mobile-feed-card-image">` :
                `<div class="mobile-feed-card-image" style="background: var(--bg-body); display: flex; align-items: center; justify-content: center; font-size: 0.8em; color: var(--text-muted);">No Image</div>`
            }
            <div class="mobile-feed-card-content">
                <h4 class="mobile-feed-card-title">${article.headline}</h4>
                <p class="mobile-feed-card-summary">${article.summary || article.body.substring(0, 80).replace(/<[^>]*>/g, '')}</p>
            </div>
        </a>
    `}).join('');
    
    container.innerHTML = html;
}

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');


    const performSearch = async (query) => {
        const container = document.getElementById('styles-social-feed');
        if (!query.trim()) {
            loadFeedArticles();
            return;
        }
        try {
            // Search for articles matching the query
            const response = await fetch(`${API_BASE}/articles?search=${encodeURIComponent(query)}&status=published&limit=1`);
            const data = await response.json();
            let foundArticles = data.articles || [];

            // Always fetch more articles to suggest
            const suggestRes = await fetch(`${API_BASE}/articles?status=published&limit=10`);
            const suggestData = await suggestRes.json();
            let suggestions = suggestData.articles || [];

            // Remove any duplicate (already found) articles from suggestions
            if (foundArticles.length > 0) {
                const foundIds = new Set(foundArticles.map(a => a.id));
                suggestions = suggestions.filter(a => !foundIds.has(a.id));
            }

            let html = '';
            if (foundArticles.length === 0) {
                html += '<p style="padding: 20px; text-align: center; color: var(--text-muted);">No articles found matching your search.</p>';
                if (suggestions.length > 0) {
                    html += '<div style="padding: 10px 0 0 0; text-align: center; color: var(--text-primary);">Other articles you may like:</div>';
                    html += suggestions.map(article => `
                        <a href="/article.html?slug=${article.slug}" class="feed-card" style="text-decoration: none; color: inherit;">
                            ${article.featured_image_url ?
                            `<div class="feed-card-image-container">
                                <img src="${optimizeImageUrl(article.featured_image_url, 1200)}" 
                                     alt="${article.headline}" 
                                     loading="lazy"
                                     style="width: 100%; height: 100%; object-fit: contain;">
                                <div class="feed-card-overlay">
                                    <h2 style="margin: 0; color: white;">
                                        ${article.headline}
                                    </h2>
                                </div>
                            </div>` :
                            '<div style="height: 300px; background: var(--bg-body); display: flex; align-items: center; justify-content: center;"><p>No Image</p></div>'}
                            <div class="feed-content">
                                <div class="feed-meta">
                                    ${timeAgo(article.published_at, article.created_at)}
                                </div>
                            </div>
                        </a>
                    `).join('');
                }
            } else {
                // Show searched article first, then suggestions
                html += foundArticles.map(article => `
                    <a href="/article.html?slug=${article.slug}" class="feed-card" style="text-decoration: none; color: inherit;">
                        ${article.featured_image_url ?
                        `<div class="feed-card-image-container">
                            <img src="${optimizeImageUrl(article.featured_image_url, 1200)}" 
                                 alt="${article.headline}" 
                                 loading="lazy"
                                 style="width: 100%; height: 100%; object-fit: contain;">
                            <div class="feed-card-overlay">
                                <h2 style="margin: 0; color: white;">
                                    ${article.headline}
                                </h2>
                            </div>
                        </div>` :
                        '<div style="height: 300px; background: var(--bg-body); display: flex; align-items: center; justify-content: center;"><p>No Image</p></div>'}
                        <div class="feed-content">
                            <div class="feed-meta">
                                ${timeAgo(article.published_at, article.created_at)}
                            </div>
                        </div>
                    </a>
                `).join('');
                if (suggestions.length > 0) {
                    html += '<div style="padding: 10px 0 0 0; text-align: center; color: var(--text-primary);">Other articles you may like:</div>';
                    html += suggestions.map(article => `
                        <a href="/article.html?slug=${article.slug}" class="feed-card" style="text-decoration: none; color: inherit;">
                            ${article.featured_image_url ?
                            `<div class="feed-card-image-container">
                                <img src="${optimizeImageUrl(article.featured_image_url, 1200)}" 
                                     alt="${article.headline}" 
                                     loading="lazy"
                                     style="width: 100%; height: 100%; object-fit: contain;">
                                <div class="feed-card-overlay">
                                    <h2 style="margin: 0; color: white;">
                                        ${article.headline}
                                    </h2>
                                </div>
                            </div>` :
                            '<div style="height: 300px; background: var(--bg-body); display: flex; align-items: center; justify-content: center;"><p>No Image</p></div>'}
                            <div class="feed-content">
                                <div class="feed-meta">
                                    ${timeAgo(article.published_at, article.created_at)}
                                </div>
                            </div>
                        </a>
                    `).join('');
                }
            }
            container.innerHTML = html;
        } catch (e) {
            console.error('Search error:', e);
        }
    };

    // Search on button click (desktop)
    searchBtn?.addEventListener('click', () => {
        performSearch(searchInput.value);
    });

    // Search on Enter key (desktop)
    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });

    // Search on button click (mobile)
    mobileSearchBtn?.addEventListener('click', () => {
        performSearch(mobileSearchInput.value);
    });

    // Search on Enter key (mobile)
    mobileSearchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(mobileSearchInput.value);
        }
    });
});