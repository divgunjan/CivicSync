// ── Theme Management ──
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
}

themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    updateMapTheme();
});

function updateMapTheme() {
    if (!leafletMap) return;
    const theme = document.documentElement.getAttribute('data-theme');
    const tileUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    // Remove existing tile layers
    leafletMap.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
            leafletMap.removeLayer(layer);
        }
    });

    L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(leafletMap);
}

const container = document.getElementById('post-container');
const searchInput = document.getElementById('global-search');
const newPostText = document.getElementById('new-post-text');
const newPostCity = document.getElementById('new-post-city');
const newPostFeeling = document.getElementById('new-post-feeling');
const postSubmit = document.getElementById('post-submit');

// New sidebar buttons
const btnHome = document.getElementById('btn-home');
const btnPopular = document.getElementById('btn-popular');
const btnMap = document.getElementById('btn-map');
const feedSection = document.querySelector('.feed');
const feedHeader = document.querySelector('.feed-header');
const createBox = document.querySelector('.create-post-box');
const mapContainer = document.getElementById('map-container');
const mapWrapper = document.getElementById('map-wrapper');
const mapInfoDot = document.getElementById('map-info-dot');
const mapInfoText = document.getElementById('map-info-text');
const popularCommunities = document.querySelector('.popular-communities');

let activePosts = [...postDatabase];
const postComments = {};
let leafletMap = null;
let mapMarkers = [];

const cityCoordinates = {
    "Delhi": [28.7041, 77.1025],
    "Jaipur": [26.9124, 75.7873],
    "Lucknow": [26.8467, 80.9462],
    "Ahmedabad": [23.0225, 72.5714],
    "Kolkata": [22.5726, 88.3639],
    "Mumbai": [19.0760, 72.8777],
    "Pune": [18.5204, 73.8567],
    "Hyderabad": [17.3850, 78.4867],
    "Bengaluru": [12.9716, 77.5946],
    "Chennai": [13.0827, 80.2707],
    "Nagpur": [21.1458, 79.0882],
    "Gurugram": [28.4595, 77.0266],
    "Patna": [25.5941, 85.1376],
    "Indore": [22.7196, 75.8577]
};

const mockComments = [
    { user: 'civic_minded', text: 'I completely agree, this has been an issue for months!' },
    { user: 'local_resident', text: 'Has anyone reported this to the municipal corporation yet?' },
    { user: 'concerned_citizen', text: 'Thanks for bringing this up. We need more visibility on this.' }
];

function getCommentsForPost(id) {
    if (!postComments[id]) {
        postComments[id] = mockComments.map(c => ({ ...c }));
    }
    return postComments[id];
}

async function fetchAndRenderPosts(sortBy = 'recent') {
    console.log("Fetching posts... sort:", sortBy);
    try {
        const sidebarHeader = document.querySelector('.sidebar-live h4');
        if (sidebarHeader) {
            sidebarHeader.innerHTML = '<i class="far fa-clock"></i> RECENT COMMUNITY REPORTS';
        }

        const url = window.CONFIG.getEndpoint(`/report?sort=${sortBy}`);
        const res = await fetch(url);
        const data = await res.json();

        if (data.success && data.reports && data.reports.length > 0) {
            postDatabase = data.reports;
            activePosts = [...postDatabase];
            renderPosts(activePosts);
            renderSidebarReports(activePosts);
        } else {
            console.warn("No reports found from server, using fallback.");
            renderSidebarReports([]); // Will trigger mock fallback
        }
    } catch (err) {
        console.error("Fetch posts failed:", err);
        renderSidebarReports([]); // Show something even on error
    }
}

function renderSidebarReports(reports) {
    const sidebarList = document.getElementById('sidebar-reports-list');
    if (!sidebarList) return;

    // Use reports if available, else mock data for demo
    const dataToRender = (reports && reports.length > 0) ? reports : [
        { _id: 'm1', type: 'Drainage', city: 'Banjara Hills', address: 'Random Address in Banjara Hills', imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=100' },
        { _id: 'm2', type: 'Road', city: 'Banjara Hills', address: 'Main Road Pothole', imageUrl: 'https://images.unsplash.com/photo-1584462970582-4937a7bc9ec3?auto=format&fit=crop&q=80&w=100' },
        { _id: 'm3', type: 'Water Supply', city: 'Kothrud', address: 'Pipe Leakage in Sector 4', imageUrl: 'https://images.unsplash.com/photo-1518331483807-f6adb0e1ad23?auto=format&fit=crop&q=80&w=100' }
    ];

    const latest = dataToRender.slice(0, 10);

    sidebarList.innerHTML = latest.map(r => {
        const type = r.type || 'General';
        const addr = r.address || r.city || 'Unknown Location';

        let imgHtml = '';
        if (r.imageUrl) {
            const isAbsolute = r.imageUrl.startsWith('http');
            const imgSrc = isAbsolute ? r.imageUrl : window.CONFIG.getEndpoint(r.imageUrl.replace(/\\/g, '/'));
            imgHtml = `<img src="${imgSrc}" class="sidebar-report-img">`;
        } else {
            imgHtml = `<div class="sidebar-report-img" style="display:flex;align-items:center;justify-content:center;background:var(--bg-light);color:var(--text-muted);font-size:10px"><i class="fas fa-image"></i></div>`;
        }

        return `
            <div class="sidebar-report-item" onclick="window.location.href='dashboard.html?id=${r._id}'">
                ${imgHtml}
                <div class="sidebar-report-info">
                    <div class="sidebar-report-type">${type}</div>
                    <div class="sidebar-report-addr">${addr}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPosts(posts, currentUserId = 'anonymous') {
    container.innerHTML = posts.map(post => {
        const hasUpvoted = post.upvotedBy && post.upvotedBy.includes(currentUserId);
        const upvoteStyle = hasUpvoted ? 'style="color: var(--primary-green);"' : '';
        const upvoteDisabled = hasUpvoted ? 'disabled' : '';

        return `
            <div class="post-card" data-post-id="${post._id}">
                <div class="vote-section">
                    <button class="vote-btn upvote ${hasUpvoted ? 'voted' : ''}" 
                            data-post-id="${post._id}" 
                            aria-label="Upvote" 
                            ${upvoteStyle} 
                            ${upvoteDisabled}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <span class="vote-count">${post.upvotes}</span>
                    <button class="vote-btn downvote" data-post-id="${post._id}" aria-label="Downvote"><i class="fas fa-arrow-down"></i></button>
                </div>
                <div class="post-content">
                    <div class="post-header">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(post.user || 'Citizen')}&background=random&color=fff&size=64" alt="User" class="user-avatar">
                        <div class="post-meta-info">
                            <div class="post-meta-top">
                                u/${post.user || 'Citizen'} <span class="post-type-badge">${post.type}</span>
                            </div>
                            <div class="post-meta-bottom">
                                in <span class="city-tag">${post.city}</span> • ${new Date(post.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div class="post-body">
                        <p>${post.description || post.text}</p>
                        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image" class="post-image" style="max-width: 100%; border-radius: 12px; margin-bottom: 16px; max-height: 400px; object-fit: cover; border: 1px solid var(--border-light);">` : ''}
                    </div>
                    <div class="post-actions">
                        <div class="action-btn comment-toggle-btn" data-post-id="${post._id}"><i class="far fa-comment"></i> ${getCommentsForPost(post._id).length} Comments</div>
                    </div>
                    <div class="comments-section" id="comments-${post._id}" style="display: none;">
                        <div class="comments-list">
                            ${getCommentsForPost(post._id).map(c => `
                                <div class="comment">
                                    <strong>u/${c.user}</strong>
                                    <p>${c.text}</p>
                                </div>
                            `).join('')}
                        </div>
                        <div class="add-comment">
                            <input type="text" placeholder="Add a comment..." class="comment-input" data-post-id="${post._id}">
                            <button class="btn-post btn-comment" data-post-id="${post._id}">Reply</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    attachHandlers();
}

function attachHandlers() {
    // Vote handlers
    document.querySelectorAll('.vote-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.dataset.postId;
            const isUpvote = button.classList.contains('upvote');

            if (!isUpvote) return; // Currently only handling upvotes for the restriction

            const userId = localStorage.getItem('tsim_user_email') || 'anonymous';

            try {
                const res = await fetch(`http://localhost:5000/report/${id}/upvote`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });

                const data = await res.json();

                if (res.ok) {
                    // Update the vote count in the UI
                    const voteCountSpan = button.parentElement.querySelector('.vote-count');
                    voteCountSpan.textContent = data.report.upvotes;

                    // Mark as upvoted
                    button.classList.add('voted');
                    button.disabled = true;
                    button.style.color = 'var(--primary-green)';
                } else {
                    if (data.message === "Already upvoted") {
                        button.classList.add('voted');
                        button.disabled = true;
                        button.style.color = 'var(--primary-green)';
                    }
                    console.warn(data.message);
                }
            } catch (err) {
                console.error("Upvote failed:", err);
            }
        });
    });

    // Comment toggle handlers
    document.querySelectorAll('.comment-toggle-btn').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.postId;
            const commentsSection = document.getElementById(`comments-${id}`);
            if (commentsSection.style.display === 'none') {
                commentsSection.style.display = 'block';
            } else {
                commentsSection.style.display = 'none';
            }
        });
    });

    // Reply functionality
    document.querySelectorAll('.btn-comment').forEach(button => {
        button.addEventListener('click', () => {
            const id = Number(button.dataset.postId);
            const inputField = document.querySelector(`.comment-input[data-post-id="${id}"]`);
            const text = inputField.value.trim();
            if (text) {
                getCommentsForPost(id).push({ user: 'current_user', text: text });
                renderPosts(activePosts);
                // Re-open comments section after re-render
                document.getElementById(`comments-${id}`).style.display = 'block';
            }
        });
    });
}

function filterPosts(query) {
    if (!query) {
        activePosts = [...postDatabase];
    } else {
        const normalized = query.toLowerCase();
        activePosts = postDatabase.filter(post => {
            return [post.type, post.city, post.text, post.user]
                .some(value => value.toLowerCase().includes(normalized));
        });
    }
    renderPosts(activePosts);
    if (leafletMap && mapWrapper && mapWrapper.style.display === 'block') {
        showMap();
    }
}

function clearPostForm() {
    if (newPostText) newPostText.value = '';
    if (newPostCity) newPostCity.value = '';
    if (newPostFeeling) newPostFeeling.value = '';
    const imageInput = document.getElementById('new-post-image');
    if (imageInput) imageInput.value = '';
    const uploadLabel = document.querySelector('.btn-upload span');
    if (uploadLabel) {
        uploadLabel.textContent = 'Add Photos/Media';
        uploadLabel.style.color = '';
    }
    const uploadIcon = document.querySelector('.btn-upload i');
    if (uploadIcon) uploadIcon.style.color = '';
}

if (postSubmit) {
    postSubmit.addEventListener('click', async () => {
        const text = newPostText?.value.trim();
        const city = newPostCity?.value.trim() || 'Unknown City';
        const feeling = newPostFeeling?.value.trim() || 'Community Concern';
        const imageInput = document.getElementById('new-post-image');

        if (!text) {
            alert("Please enter a description.");
            return;
        }

        postSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
        postSubmit.disabled = true;

        try {
            const formData = new FormData();
            formData.append('user', localStorage.getItem('tsim_user_id') || 'Citizen');
            formData.append('type', feeling || 'Community Rant');
            formData.append('city', city || 'Unknown');
            formData.append('description', text);
            formData.append('lat', '0'); // Placeholder or get current loc
            formData.append('lng', '0');

            if (imageInput && imageInput.files && imageInput.files[0]) {
                formData.append('image', imageInput.files[0]);
            }

            const res = await fetch('http://localhost:5000/report', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                clearPostForm();
                if (searchInput) searchInput.value = '';

                // Reset active state to Home
                if (btnHome) {
                    btnHome.classList.add('active');
                    if (btnPopular) btnPopular.classList.remove('active');
                    if (btnMap) btnMap.classList.remove('active');
                    showFeed();
                }

                await fetchAndRenderPosts();
            } else {
                const err = await res.json();
                alert("Failed to post: " + err.message);
            }
        } catch (err) {
            console.error("Post failed:", err);
            alert("An error occurred while posting.");
        } finally {
            postSubmit.innerHTML = 'Post Issue';
            postSubmit.disabled = false;
        }
    });
}

const imageInput = document.getElementById('new-post-image');
if (imageInput) {
    imageInput.addEventListener('change', (e) => {
        const uploadLabel = document.querySelector('.btn-upload span');
        const uploadIcon = document.querySelector('.btn-upload i');
        if (uploadLabel && e.target.files.length > 0) {
            uploadLabel.textContent = e.target.files[0].name;
            if (uploadIcon) uploadIcon.style.color = 'var(--primary-green)';
            uploadLabel.style.color = 'var(--primary-green)';
        } else if (uploadLabel) {
            uploadLabel.textContent = 'Add Photos/Media';
            if (uploadIcon) uploadIcon.style.color = '';
            uploadLabel.style.color = '';
        }
    });
}

if (searchInput) {
    searchInput.addEventListener('input', event => {
        filterPosts(event.target.value);
        if (btnHome) {
            btnHome.classList.add('active');
            if (btnPopular) btnPopular.classList.remove('active');
        }
    });
}

// Map view toggling and rendering
function showFeed() {
    if (feedSection) feedSection.style.display = 'block';
    if (feedHeader) feedHeader.style.display = 'block';
    if (createBox) createBox.style.display = 'block';
    if (mapWrapper) mapWrapper.style.display = 'none';
    if (popularCommunities) popularCommunities.style.display = 'block';
}

function showMap() {
    if (feedSection) feedSection.style.display = 'none';
    if (feedHeader) feedHeader.style.display = 'none';
    if (createBox) createBox.style.display = 'none';
    if (popularCommunities) popularCommunities.style.display = 'none';
    if (mapWrapper) mapWrapper.style.display = 'block';

    if (!leafletMap) {
        leafletMap = L.map('map-container').setView([22.5937, 78.9629], 5);
        updateMapTheme();
    }

    mapMarkers.forEach(m => leafletMap.removeLayer(m));
    mapMarkers = [];

    const cityTopIssues = {};
    activePosts.forEach(post => {
        if (!cityTopIssues[post.city] || cityTopIssues[post.city].upvotes < post.upvotes) {
            cityTopIssues[post.city] = post;
        }
    });

    Object.values(cityTopIssues).forEach(post => {
        const coords = cityCoordinates[post.city];
        if (coords) {
            const color = post.upvotes > 500 ? '#ef4444' : (post.upvotes > 100 ? '#f59e0b' : '#10b981');
            const ringColor = post.upvotes > 500 ? 'rgba(239, 68, 68, 0.15)' : (post.upvotes > 100 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)');
            const ringBorder = post.upvotes > 500 ? 'rgba(239, 68, 68, 0.3)' : (post.upvotes > 100 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)');

            const iconHtml = `
                <div class="custom-map-marker">
                    <div class="marker-ring" style="background-color: ${ringColor}; border-color: ${ringBorder};"></div>
                    <div class="marker-dot" style="background-color: ${color};"></div>
                    <div class="marker-label">${post.city}</div>
                </div>
            `;
            const customIcon = L.divIcon({
                className: '',
                html: iconHtml,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            const marker = L.marker(coords, { icon: customIcon }).addTo(leafletMap);
            marker.on('click', () => {
                if (mapInfoDot) {
                    mapInfoDot.style.backgroundColor = color;
                    mapInfoDot.style.boxShadow = `0 0 6px ${color}80`;
                }
                if (mapInfoText) {
                    mapInfoText.textContent = `${post.city}: ${post.type} — Score ${post.upvotes}`;
                }
            });
            mapMarkers.push(marker);
        }
    });

    setTimeout(() => {
        if (leafletMap) leafletMap.invalidateSize();
    }, 100);
}

// Popular and Home buttons functionality
if (btnHome) {
    btnHome.addEventListener('click', (e) => {
        e.preventDefault();
        btnHome.classList.add('active');
        if (btnPopular) btnPopular.classList.remove('active');
        if (btnMap) btnMap.classList.remove('active');
        showFeed();
        if (searchInput) searchInput.value = '';
        fetchAndRenderPosts('recent');
    });
}

if (btnPopular) {
    btnPopular.addEventListener('click', (e) => {
        e.preventDefault();
        btnPopular.classList.add('active');
        if (btnHome) btnHome.classList.remove('active');
        if (btnMap) btnMap.classList.remove('active');
        showFeed();
        fetchAndRenderPosts('popular');
    });
}

if (btnMap) {
    btnMap.addEventListener('click', (e) => {
        e.preventDefault();
        btnMap.classList.add('active');
        if (btnHome) btnHome.classList.remove('active');
        if (btnPopular) btnPopular.classList.remove('active');
        showMap();
    });
}

const sidebar = document.getElementById('sidebar');
const sidebarBtn = document.getElementById('sidebar-collapse-btn');

if (sidebar && sidebarBtn) {
    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (isCollapsed) sidebar.classList.add('collapsed');

    sidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
    });
}

fetchAndRenderPosts();
