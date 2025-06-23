// Store data in localStorage
const STORAGE_KEYS = {
    USERS: 'social_users',
    POSTS: 'social_posts',
    CURRENT_USER: 'social_current_user'
};

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Initialize data
let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [ADMIN_CREDENTIALS];
let posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || [];
let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
let currentEditId = null;

// Save data functions
function saveUsers() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function savePosts() {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

function saveCurrentUser(user) {
    currentUser = user;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

// Authentication functions
function showSignup() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('signupSection').style.display = 'flex';
}

function showLogin() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('signupSection').style.display = 'none';
}

function signup() {
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value.trim();
    const email = document.getElementById('email').value.trim();
    const errorElement = document.getElementById('signupError');

    if (!username || !password || !email) {
        errorElement.textContent = 'All fields are required';
        return;
    }

    if (users.some(user => user.username === username)) {
        errorElement.textContent = 'Username already exists';
        return;
    }

    const newUser = {
        username,
        password,
        email,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers();
    saveCurrentUser(newUser);
    document.getElementById('signupError').textContent = '';
    showMainApp();
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        errorElement.textContent = 'Invalid username or password';
        return;
    }

    saveCurrentUser(user);
    errorElement.textContent = '';

    if (username === ADMIN_CREDENTIALS.username) {
        showAdminDashboard();
    } else {
        showMainApp();
    }
}

function logout() {
    saveCurrentUser(null);
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    hideAllSections();
    showLogin();
}

// UI functions
function hideAllSections() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('signupSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showMainApp() {
    hideAllSections();
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('userWelcome').textContent = `Welcome, ${currentUser.username}`;
    renderPosts();
}

function showAdminDashboard() {
    hideAllSections();
    document.getElementById('adminDashboard').style.display = 'block';
    updateAdminStats();
    renderAdminTables();
}

// Post functions
// Add image preview logic
const postImageInput = document.getElementById('postImage');
const imagePreview = document.getElementById('imagePreview');
if (postImageInput) {
    postImageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
        }
    });
}

function createPost() {
    const content = document.getElementById('postContent').value.trim();
    let imageData = '';
    const imageInput = document.getElementById('postImage');
    if (imageInput && imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result;
            finishCreatePost(content, imageData);
        };
        reader.readAsDataURL(file);
        return; // Wait for FileReader
    } else {
        finishCreatePost(content, imageData);
    }
}

function finishCreatePost(content, imageData) {
    if (!content && !imageData) {
        alert('Please enter some content or select an image');
        return;
    }
    const post = {
        id: Date.now(),
        content,
        author: currentUser.username,
        createdAt: new Date().toISOString(),
        likes: 0,
        image: imageData
    };
    posts.unshift(post);
    savePosts();
    document.getElementById('postContent').value = '';
    if (document.getElementById('postImage')) {
        document.getElementById('postImage').value = '';
    }
    if (imagePreview) {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
    }
    if (currentUser.username === ADMIN_CREDENTIALS.username) {
        renderAdminTables();
        updateAdminStats();
    } else {
        renderPosts();
    }
}

function likePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    if (!post.likedBy) post.likedBy = [];
    if (!post.likedBy.includes(currentUser.username)) {
        post.likes = (post.likes || 0) + 1;
        post.likedBy.push(currentUser.username);
        savePosts();
        renderPosts();
    }
}

function toggleCommentBox(postId) {
    const box = document.getElementById(`comment-box-${postId}`);
    if (box) {
        box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }
}

function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const commentText = input.value.trim();
    if (!commentText) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    if (!post.comments) post.comments = [];
    post.comments.push({
        author: currentUser.username,
        text: commentText,
        createdAt: new Date().toISOString()
    });
    savePosts();
    input.value = '';
    renderPosts();
    toggleCommentBox(postId);
}

function renderPosts() {
    const postsFeed = document.getElementById('postsFeed');
    postsFeed.innerHTML = '';
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-item';
        postElement.innerHTML = `
            <div class="post-header">
                <span class="post-author">${escapeHtml(post.author)}</span>
                <span class="post-time">${formatDate(post.createdAt)}</span>
            </div>
            <div class="post-content">${escapeHtml(post.content)}</div>
            ${post.image ? `<img src="${post.image}" alt="Post Image" style="max-width:100%;margin-bottom:1rem;" />` : ''}
            <div class="post-interactions">
                <button class="like-btn" onclick="likePost(${post.id})"><i class="fas fa-thumbs-up"></i> Like (<span id="like-count-${post.id}">${post.likes || 0}</span>)</button>
                <button class="comment-btn" onclick="toggleCommentBox(${post.id})"><i class="fas fa-comment"></i> Comment</button>
                <div id="comment-box-${post.id}" class="comment-box" style="display:none; margin-top:0.5rem;">
                    <input type="text" id="comment-input-${post.id}" placeholder="Write a comment..." style="width:70%;">
                    <button onclick="addComment(${post.id})">Post</button>
                </div>
                <div id="comments-list-${post.id}" class="comments-list" style="margin-top:0.5rem;">
                    ${(post.comments || []).map(comment => `
                        <div class='comment-item'><strong>${escapeHtml(comment.author)}</strong>: ${escapeHtml(comment.text)} <small style='color:#888;'>${formatDate(comment.createdAt)}</small></div>
                    `).join('')}
                </div>
            </div>
            ${currentUser.username === post.author || currentUser.username === ADMIN_CREDENTIALS.username ? `
                <div class="post-actions">
                    <button onclick="openEditModal(${post.id})" class="secondary-btn">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deletePost(${post.id})" class="secondary-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            ` : ''}
        `;
        postsFeed.appendChild(postElement);
    });
}

function openEditModal(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    
    currentEditId = id;
    const modal = document.getElementById('editModal');
    const contentInput = document.getElementById('editPostContent');
    
    contentInput.value = post.content;
    modal.style.display = 'block';
}

function updatePost() {
    const content = document.getElementById('editPostContent').value.trim();
    
    if (!content) {
        alert('Please enter some content');
        return;
    }
    
    const postIndex = posts.findIndex(p => p.id === currentEditId);
    if (postIndex === -1) return;
    
    posts[postIndex] = {
        ...posts[postIndex],
        content,
        updatedAt: new Date().toISOString()
    };
    
    savePosts();
    closeModal();
    
    if (currentUser.username === ADMIN_CREDENTIALS.username) {
        renderAdminTables();
    } else {
        renderPosts();
    }
}

function deletePost(id) {
    if (confirm('Are you sure you want to delete this post?')) {
        posts = posts.filter(post => post.id !== id);
        savePosts();
        
        if (currentUser.username === ADMIN_CREDENTIALS.username) {
            renderAdminTables();
            updateAdminStats();
        } else {
            renderPosts();
        }
    }
}

// Admin functions
function updateAdminStats() {
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalPosts').textContent = posts.length;
    
    const today = new Date().toDateString();
    const todayPosts = posts.filter(post => 
        new Date(post.createdAt).toDateString() === today
    ).length;
    
    document.getElementById('todayPosts').textContent = todayPosts;
}

function renderAdminTables() {
    // Render users table
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = users.map(user => `
        <div class="table-row">
            <div class="user-info">
                <strong>${escapeHtml(user.username)}</strong>
                <small>${user.email}</small>
                <small>Password: ${escapeHtml(user.password)}</small>
                <small>Joined: ${formatDate(user.createdAt)}</small>
            </div>
            ${user.username !== ADMIN_CREDENTIALS.username ? `
                <button onclick="deleteUser('${user.username}')" class="secondary-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            ` : ''}
        </div>
    `).join('');
    
    // Render posts table
    const postsList = document.getElementById('adminPostsList');
    postsList.innerHTML = posts.map(post => `
        <div class="table-row">
            <div class="post-info">
                <strong>${escapeHtml(post.author)}</strong>
                <p>${escapeHtml(post.content.substring(0, 100))}${post.content.length > 100 ? '...' : ''}</p>
                <small>${formatDate(post.createdAt)}</small>
            </div>
            <div class="post-actions">
                <button onclick="openEditModal(${post.id})" class="secondary-btn">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deletePost(${post.id})" class="secondary-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function deleteUser(username) {
    if (confirm(`Are you sure you want to delete user "${username}" and all their posts?`)) {
        users = users.filter(user => user.username !== username);
        posts = posts.filter(post => post.author !== username);
        saveUsers();
        savePosts();
        renderAdminTables();
        updateAdminStats();
    }
}

// Utility functions
function closeModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
    currentEditId = null;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Event listeners
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeModal();
    }
};

// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        if (currentUser.username === ADMIN_CREDENTIALS.username) {
            showAdminDashboard();
        } else {
            showMainApp();
        }
    } else {
        showLogin();
    }
}); 