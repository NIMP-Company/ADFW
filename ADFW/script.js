// Initialize Firebase (if needed)
// Replace with your Firebase configuration
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};

const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics(app);

document.addEventListener("DOMContentLoaded", function() {
    const username = localStorage.getItem("currentUser");

    if (username) {
        document.getElementById("username").textContent = username;
        document.getElementById("welcomeContainer").style.display = "block";
        document.getElementById("postSection").style.display = "block";
        loadUserProfiles();
        loadPosts();
    }
});

function showRegisterForm() {
    document.getElementById("registerForm").style.display = "block";
    document.getElementById("loginForm").style.display = "none";
}

function showLoginForm() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm").style.display = "none";
}

function loadUserProfiles() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userProfiles = document.getElementById('userProfiles');
    userProfiles.innerHTML = '';

    users.forEach(user => {
        const profileItem = document.createElement('li');
        profileItem.classList.add('profile-item');

        const profileName = document.createElement('h3');
        profileName.textContent = user.username;
        profileItem.appendChild(profileName);

        const profileDescription = document.createElement('p');
        profileDescription.textContent = user.description || 'No description available';
        profileItem.appendChild(profileDescription);

        userProfiles.appendChild(profileItem);
    });
}

function register(event) {
    event.preventDefault();

    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    if (username === '' || password === '') {
        alert('Please fill in all fields!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(user => user.username === username)) {
        alert('Username already exists!');
        return;
    }

    users.push({ username, password, description: '' });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful! You can now log in.');
    document.getElementById('regUsername').value = '';
    document.getElementById('regPassword').value = '';

    window.location.href = 'index.html';
}

function login(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username === '' || password === '') {
        alert('Please fill in all fields!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        localStorage.setItem('currentUser', username);
        document.getElementById("username").textContent = username;
        document.getElementById("welcomeContainer").style.display = "block";
        document.getElementById("postSection").style.display = "block";
        loadUserProfiles();
        loadPosts();
        window.location.href = 'index.html';
    } else {
        console.error('Login failed for username:', username);
        alert('Invalid username or password!');
    }
}

function loginUser(username) {
    localStorage.setItem('currentUser', username);
    showWelcomeMessage(username);
    loadPosts();
    loadUserProfiles();
}

function logout() {
    localStorage.removeItem('currentUser');
    document.getElementById("welcomeContainer").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
    document.getElementById("loginForm").style.display = "block";
}

function showWelcomeMessage(username) {
    document.getElementById("welcomeContainer").style.display = "block";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("username").textContent = username;
}

function updateCharacterCount() {
    const content = document.getElementById('postContent').value;
    const wordCount = content.trim().split(/\s+/).length;
    document.getElementById('characterCount').textContent = `${wordCount}/100 words`;

    if (wordCount > 100) {
        alert('The content exceeds 100 words!');
    }
}

function createPost() {
    const title = document.getElementById('postTitle').value;
    if (!title) {
        alert('Title is required!');
        return;
    }

    let content = document.getElementById('postContent').value;
    if (!content) {
        alert('Content is required!');
        return;
    }

    content = content.trim().split(/\s+/).slice(0, 100).join(' ');

    const username = localStorage.getItem('currentUser');

    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const newPost = { id: generateId(), author: username, title, content };
    posts.unshift(newPost);
    localStorage.setItem('posts', JSON.stringify(posts));

    loadPosts();

    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('characterCount').textContent = '0/100 words';
}

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function loadPosts() {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const postsList = document.getElementById('posts');
    postsList.innerHTML = '';

    posts.forEach(post => {
        const postItem = document.createElement('li');
        postItem.classList.add('post-item');

        const postTitle = document.createElement('h2');
        postTitle.textContent = post.title;
        postItem.appendChild(postTitle);

        const postContent = document.createElement('p');
        postContent.textContent = post.content;
        postItem.appendChild(postContent);

        const authorLink = document.createElement('a');
        authorLink.textContent = `By ${post.author}`;
        authorLink.href = '#';
        postItem.appendChild(authorLink);

        if (post.author === localStorage.getItem('currentUser')) {
            const editLink = document.createElement('a');
            editLink.textContent = 'Edit';
            editLink.href = '#';
            editLink.onclick = function() {
                editPost(post.id, post.title, post.content);
            };
            postItem.appendChild(editLink);
        }

        if (post.author === localStorage.getItem('currentUser')) {
            const deleteLink = document.createElement('a');
            deleteLink.textContent = 'Delete';
            deleteLink.href = '#';
            deleteLink.onclick = function() {
                deletePost(post.id);
            };
            postItem.appendChild(deleteLink);
        }

        postsList.appendChild(postItem);
    });
}

function editPost(postId, currentTitle, currentContent) {
    const newTitle = prompt('Edit the title of your post:', currentTitle);
    if (newTitle === null || newTitle.trim() === '') {
        return;
    }

    let newContent = prompt('Edit your post content (limit 100 words):', currentContent);
    if (newContent === null) {
        return;
    }

    newContent = newContent.trim().split(/\s+/).slice(0, 100).join(' ');

    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updatedPosts = posts.map(post => {
        if (post.id === postId) {
            post.title = newTitle.trim();
            post.content = newContent.trim();
        }
        return post;
    });

    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    loadPosts();
}

function deletePost(postId) {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updatedPosts = posts.filter(post => post.id !== postId);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    loadPosts();
}
