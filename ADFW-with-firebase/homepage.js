import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Attach functions to the global scope
window.deletePost = deletePost;
window.editPost = editPost;
window.toggleLike = toggleLike;

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAl4008ho9AdXVZhUL5tqcBG4ITjD-5w-0",
    authDomain: "auth-26dbb.firebaseapp.com",
    projectId: "auth-26dbb",
    storageBucket: "auth-26dbb.appspot.com",
    messagingSenderId: "670174818016",
    appId: "1:670174818016:web:0514a5f452d134ff946a85",
    measurementId: "G-S3KN0C48P1"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Monitor authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const loggedInUserId = user.uid;
        localStorage.setItem('loggedInUserId', loggedInUserId);
        const docRef = doc(db, "users", loggedInUserId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            document.getElementById('loggedUserFName').innerText = userData.firstName;
            document.getElementById('loggedUserEmail').innerText = userData.email;
        } else {
            console.log("No document found matching ID");
        }
    } else {
        console.log("User ID not found in local storage");
    }
});

// Handle logout
const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('guestMode');
    signOut(auth)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
});

// Add a new post
const addPostButton = document.getElementById('addPostButton');
addPostButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const postTitle = document.getElementById('postTitle').value;
    const postContent = document.getElementById('postContent').value;
    const userId = auth.currentUser.uid; // Assuming the user is authenticated

    if (postTitle.trim() === '' || postContent.trim() === '') {
        alert('Please add content');
        return;
    }

    // Fetch the author's name
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    let authorName = "";
    if (docSnap.exists()) {
        const userData = docSnap.data();
        authorName = userData.firstName;
    } else {
        console.error("User document not found");
        return;
    }

    const postData = {
        title: postTitle,
        content: postContent,
        userId: userId,
        author: authorName,
        likes: [], // Initialize likes array
        timestamp: serverTimestamp()
    };

    const postsRef = collection(db, "posts");
    addDoc(postsRef, postData)
        .then((docRef) => {
            console.log("Post added with ID:", docRef.id);
            showMessage('Post created successfully', 'postMessage');
            loadPosts(); // Reload posts after adding a new one

            document.getElementById('postTitle').value = '';
            document.getElementById('postContent').value = '';
        })
        .catch((error) => {
            console.error("Error adding post:", error);
            showMessage('Unable to create post', 'postMessage');
        });
});


const postsContainer = document.getElementById('postsContainer');

async function loadPosts() {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    postsContainer.innerHTML = ""; 
    querySnapshot.forEach((doc) => {
        const post = doc.data();
        const postId = doc.id;
        console.log("Post data:", post); 

        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <small>Posted by: ${post.author}</small>
            <div>
                <span class="heart ${post.likes && post.likes.includes(auth.currentUser.uid) ? 'liked' : ''}" onclick="toggleLike('${postId}')">&#9829;</span>
                <span class="like-counter">${post.likes ? post.likes.length : 0}</span>
            </div>
            ${post.userId === auth.currentUser.uid ? `
            <button onclick="editPost('${postId}', '${post.title}', '${post.content}')">Edit</button>
            <button onclick="deletePost('${postId}')">Delete</button>` : ''}
        `;
        postsContainer.appendChild(postElement);
    });
}

// Load posts on page load
document.addEventListener('DOMContentLoaded', loadPosts);

// Function to delete a post
async function deletePost(postId) {
    console.log("Deleting post with ID:", postId); // Add this line
    try {
        await deleteDoc(doc(db, "posts", postId));
        console.log("Post successfully deleted!");
        showMessage('Post deleted successfully', 'postMessage');
        loadPosts(); // Reload posts after deletion
    } catch (error) {
        console.error("Error removing post: ", error);
        showMessage('Unable to delete post', 'postMessage');
    }
}


// Function to edit a post
async function editPost(postId, currentTitle, currentContent) {
    const newTitle = prompt('Enter new title:', currentTitle);
    const newContent = prompt('Enter new content:', currentContent);

    if (newTitle && newContent) {
        try {
            await updateDoc(doc(db, "posts", postId), {
                title: newTitle,
                content: newContent,
                timestamp: serverTimestamp()
            });
            console.log("Post successfully updated!");
            showMessage('Post updated successfully', 'postMessage');
            loadPosts(); // Reload posts after update
        } catch (error) {
            console.error("Error updating post: ", error);
            showMessage('Unable to update post', 'postMessage');
        }
    }
}

async function toggleLike(postId) {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    const checker = localStorage.getItem('guestMode');
        if(checker == 'true'){
            alert("you are in Guest Mode!")
            return;
        }



    if (postSnap.exists()) {
        const postData = postSnap.data();
        const userId = auth.currentUser.uid;
        let likes = postData.likes || [];

        console.log("Current likes:", likes);

        if (likes.includes(userId)) {
            // Unlike the post
            likes = likes.filter(uid => uid !== userId);
        } else {
            // Like the post
            likes.push(userId);
        }

        console.log("Updated likes:", likes);

        try {
            await updateDoc(postRef, { likes: likes });
            console.log("Post likes updated!");
            loadPosts(); // Reload posts to reflect the like/unlike change
        } catch (error) {
            console.error("Error updating likes: ", error);
        }
    } else {
        console.error("Post document not found");
    }
}

function showMessage(message, elementId) {
    const element = document.getElementById(elementId);
    element.innerText = message;
}

const authButton = document.getElementById('logout');

const checker = localStorage.getItem('guestMode');
if (checker === 'true') {
    authButton.innerText = 'Login';
    authButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    document.getElementById('postForm').style.display = 'none';
    document.getElementById('welcome').innerText = 'Welcome! You are logged in as a Guest';
} else {
    authButton.innerText = 'Logout';
    authButton.addEventListener('click', () => {
        localStorage.removeItem('loggedInUserId');
        localStorage.removeItem('guestMode');
        signOut(auth)
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error('Error signing out:', error);
            });
    });
}

