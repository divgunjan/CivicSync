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

function renderPosts(posts = activePosts) {
    container.innerHTML = posts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            <div class="vote-section">
                <button class="vote-btn upvote" data-post-id="${post.id}" aria-label="Upvote"><i class="fas fa-arrow-up"></i></button>
                <span class="vote-count">${post.upvotes}</span>
                <button class="vote-btn downvote" data-post-id="${post.id}" aria-label="Downvote"><i class="fas fa-arrow-down"></i></button>
            </div>
            <div class="post-content">
                <div class="post-header">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(post.user)}&background=random&color=fff&size=64" alt="${post.user}" class="user-avatar">
                    <div class="post-meta-info">
                        <div class="post-meta-top">
                            u/${post.user} <span class="post-type-badge">${post.type}</span>
                        </div>
                        <div class="post-meta-bottom">
                            in <span class="city-tag">${post.city}</span> • ${post.time}
                        </div>
                    </div>
                </div>
                <div class="post-body">
                    <p>${post.text}</p>
                    ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image" class="post-image" style="max-width: 100%; border-radius: 12px; margin-bottom: 16px; max-height: 400px; object-fit: cover; border: 1px solid var(--border-dark);">` : ''}
                </div>
                <div class="post-actions">
                    <div class="action-btn comment-toggle-btn" data-post-id="${post.id}"><i class="far fa-comment"></i> ${getCommentsForPost(post.id).length} Comments</div>
                </div>
                <div class="comments-section" id="comments-${post.id}" style="display: none;">
                    <div class="comments-list">
                        ${getCommentsForPost(post.id).map(c => `
                            <div class="comment">
                                <strong>u/${c.user}</strong>
                                <p>${c.text}</p>
                            </div>
                        `).join('')}
                    </div>
                    <div class="add-comment">
                        <input type="text" placeholder="Add a comment..." class="comment-input" data-post-id="${post.id}">
                        <button class="btn-post btn-comment" data-post-id="${post.id}">Reply</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    attachHandlers();
}

function attachHandlers() {
    // Vote handlers
    document.querySelectorAll('.vote-btn').forEach(button => {
        button.addEventListener('click', () => {
            const id = Number(button.dataset.postId);
            const delta = button.classList.contains('upvote') ? 1 : -1;
            updateVotes(id, delta);
            renderPosts(activePosts);
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
        uploadLabel.textContent = 'Add Image';
        uploadLabel.style.color = '';
    }
    const uploadIcon = document.querySelector('.btn-upload i');
    if (uploadIcon) uploadIcon.style.color = '';
}

if (postSubmit) {
    postSubmit.addEventListener('click', () => {
        const text = newPostText?.value.trim();
        const city = newPostCity?.value.trim() || 'Unknown City';
        const feeling = newPostFeeling?.value.trim() || 'Community Concern';
        const imageInput = document.getElementById('new-post-image');

        if (!text) return;

        if (imageInput && imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = e.target.result;
                savePostToDB(text, city, feeling, imageUrl);
                completePostSubmission();
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            savePostToDB(text, city, feeling, null);
            completePostSubmission();
        }

        function completePostSubmission() {
            activePosts = [...postDatabase];
            clearPostForm();
            if (searchInput) searchInput.value = '';

            // Reset active state to Home when adding a new post
            if (btnHome) {
                btnHome.classList.add('active');
                if (btnPopular) btnPopular.classList.remove('active');
                if (btnMap) btnMap.classList.remove('active');
                showFeed();
            }

            renderPosts(activePosts);
            if (leafletMap && mapWrapper && mapWrapper.style.display === 'block') {
                showMap();
            }
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
            uploadLabel.textContent = 'Add Image';
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
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(leafletMap);
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
        activePosts = [...postDatabase];
        if (searchInput) searchInput.value = '';
        renderPosts(activePosts);
    });
}

if (btnPopular) {
    btnPopular.addEventListener('click', (e) => {
        e.preventDefault();
        btnPopular.classList.add('active');
        if (btnHome) btnHome.classList.remove('active');
        if (btnMap) btnMap.classList.remove('active');
        showFeed();
        activePosts = [...postDatabase].sort((a, b) => b.upvotes - a.upvotes);
        renderPosts(activePosts);
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

renderPosts();