import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Attach functions to the global scope
window.deletePost = deletePost;
window.editPost = editPost;
window.toggleLike = toggleLike;
window.addComment = addComment;
window.loadComments = loadComments;
window.editComment = editComment;
window.deleteComment = deleteComment;
window.toggleCommentsSection = toggleCommentsSection;
window.toggleSeeMore = toggleSeeMore;

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


//if guest mode
const guestMode  = localStorage.getItem('guestMode');



if(guestMode == 'true'){
    console.log("loggedin as guest");
    const postForm = document.getElementById('postForm');
    const welcome = document.getElementById('welcome');
    postForm.style.display='none';
    welcome.innerHTML="You are logged in as a Guest!";
    welcome.style.fontSize="40px";

    const csb = document.querySelector('csb');
    
   
}else{
    console.log("arbor my ni");
}



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
addPostButton.style.backgroundColor="black";
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
            <h3 style="display: flex; justify-content: space-between;">
                ${post.title}
                <div style="display: flex; align-items: center;">
                    <span class="heart ${post.likes && post.likes.includes(auth.currentUser.uid) ? 'liked' : ''}" onclick="toggleLike('${postId}')">&#9829;</span>
                    <span class="like-counter">${post.likes ? post.likes.length : 0}</span>
                    <span class="comment-section">
                        <span class="comment-icon" onclick="toggleSeeMore('${postId}')">&#128172;</span> <!-- Comment icon -->
                        <span class="comment-count" id="comment-count-${postId}">0</span> <!-- Comment count -->
                    </span>
                </div>
            </h3>
            <p>${post.content}</p>
            <small>Posted by: ${post.author}</small>
            <div>
                ${post.userId === auth.currentUser.uid ? `
                    <button class="edit-btn" onclick="editPost('${postId}', '${post.title}', '${post.content}')">Edit</button>
                    <button class="delete-btn" onclick="deletePost('${postId}')">Delete</button>` : ''}
            </div>
            <hr id="hrline">
            <div id="alertHere-${postId}"> <p id="alertHere2-${postId}"></p> </div>
            <div class="comments-section" id="comments-${postId}">
                <h4>
                    <span class="comment-toggle" onclick="toggleSeeMore('${postId}')">See Comments</span>
                </h4>
                <div class="comments-container" id="comments-container-${postId}">
                    <!-- Comments will be dynamically loaded here -->
                </div>
                <form class="comment-form" onsubmit="addComment(event, '${postId}')">
                    <div id="cSection"> 
                        ${localStorage.getItem('guestMode') === 'true' ? '' : `
                        <textarea class="comment-textarea" placeholder="Add a comment" required></textarea>
                        <button id="csb" type="submit" class="comment-submit-btn">Comment</button>
                        `}
                    </div>
                </form>
            </div>
        `;

        postsContainer.appendChild(postElement);
        loadComments(postId); // Load comments for the post
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

// Function to toggle like on a post
async function toggleLike(postId) {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    const checker = localStorage.getItem('guestMode');
    if (checker == 'true') {
        alert("You are in Guest Mode!");
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

// Function to show messages
function showMessage(message, elementId) {
    const element = document.getElementById(elementId);
    element.innerText = message;
}

// Function to add a comment
async function addComment(event, postId) {
    event.preventDefault();
    const commentText = event.target.querySelector('textarea').value;
    const userId = auth.currentUser.uid; // Assuming the user is authenticated

    if (commentText.trim() === '') {
        alert('Please add a comment');
        return;
    }

    // Fetch the commenter's name
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    let commenterName = "";
    if (docSnap.exists()) {
        const userData = docSnap.data();
        commenterName = userData.firstName;
    } else {
        console.error("User document not found");
        return;
    }

    const commentData = {
        text: commentText,
        userId: userId,
        commenter: commenterName,
        timestamp: serverTimestamp()
    };

    const commentsRef = collection(db, "posts", postId, "comments");
    addDoc(commentsRef, commentData)
        .then((docRef) => {
            console.log("Comment added with ID:", docRef.id);
            loadComments(postId); // Reload comments after adding a new one
            event.target.querySelector('textarea').value = '';
        })
        .catch((error) => {
            console.error("Error adding comment:", error);
        });
}

// Function to load comments for a post
// Function to load comments for a post
// Function to load comments for a post
async function loadComments(postId) {
    const commentsRef = collection(db, "posts", postId, "comments");
    const q = query(commentsRef, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    const commentsContainer = document.getElementById(`comments-container-${postId}`);
    commentsContainer.innerHTML = "";

    let commentCount = 0; // Initialize comment count

    querySnapshot.forEach((doc) => {
        const comment = doc.data();
        const commentId = doc.id;
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <p class="comment-text" id="commentText-${commentId}">${comment.text}</p>
            <small>Commented by: ${comment.commenter}</small>
            <div>
                ${comment.userId === auth.currentUser.uid ? `
                    <button id="comEdit" onclick="editComment('${postId}', '${commentId}', '${comment.text}')">Edit</button>
                    <button id="comDelete" onclick="deleteComment('${postId}', '${commentId}')" style="background-color: #FF6D5B;">Delete</button>` : ''}
            </div>
        `;

        // Apply font family and styles to comment text
        const commentTextElement = commentElement.querySelector('.comment-text');
        commentTextElement.style.fontFamily = '"Mukta", sans-serif';
        commentTextElement.style.fontWeight = '100';
        commentTextElement.style.fontStyle = 'normal';
        commentTextElement.style.fontSize= '20px';
        commentTextElement.style.color= 'rgb(53, 53, 53)';

        commentsContainer.appendChild(commentElement);
        commentCount++; // Increment comment count
    });

    // Display a message if there are zero comments
    if (commentCount === 0) {
        const noCommentsMessage = document.createElement('div');
        noCommentsMessage.textContent = "Be the first to comment!";
        noCommentsMessage.style.fontFamily = '"Mukta", sans-serif';
        noCommentsMessage.style.fontWeight = '100';
        noCommentsMessage.style.fontStyle = 'normal';
        noCommentsMessage.style.fontSize = '18px';
        noCommentsMessage.style.color = '#9c929290';
        commentsContainer.appendChild(noCommentsMessage);
    }
}




// Function to edit a comment
// Function to edit a comment
async function editComment(postId, commentId, currentText) {
    try {
        const newCommentText = prompt("Edit your comment:", currentText);
        if (newCommentText === null || newCommentText.trim() === "") {
            return; // If cancelled or empty input, do nothing
        }

        await updateDoc(doc(db, "posts", postId, "comments", commentId), {
            text: newCommentText
        });

        // Update the comment text in the DOM
        const commentTextElement = document.getElementById(`commentText-${commentId}`);
        if (commentTextElement) {
            commentTextElement.textContent = newCommentText;
        }

        // Show an alert message specific to this post's comments section
        const alertHere2 = document.getElementById(`alertHere2-${postId}`);
        if (alertHere2) {
            alertHere2.innerHTML = "Comment Edited successfully";
            alertHere2.style.color = "blue";

            // Clear the message after 3 seconds
            setTimeout(() => {
                alertHere2.innerHTML = ""; // Clear the message
            }, 3000); // 3000 milliseconds = 3 seconds
        }
    } catch (error) {
        console.error("Error editing comment: ", error);
    }
}



// Function to delete a comment
// Function to delete a comment
async function deleteComment(postId, commentId) {
    try {
        await deleteDoc(doc(db, "posts", postId, "comments", commentId));
        console.log("Comment successfully deleted!");

        // Remove the comment element from the DOM
        const commentElement = document.getElementById(`commentText-${commentId}`);
        if (commentElement) {
            commentElement.parentElement.remove();
        }

        // Show an alert message specific to this post's comments section
        const alertHere2 = document.getElementById(`alertHere2-${postId}`);
        if (alertHere2) {
            alertHere2.innerHTML = "Comment Deleted successfully";
            alertHere2.style.color = "red";

            // Clear the message after 3 seconds
            setTimeout(() => {
                alertHere2.innerHTML = ""; // Clear the message
            }, 3000); // 3000 milliseconds = 3 seconds
        }
    } catch (error) {
        console.error("Error removing comment: ", error);
    }
}



// Function to toggle the visibility of the comments section
function toggleCommentsSection(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    commentsSection.classList.toggle('hidden');
}

// Function to toggle the visibility of comments in 'See More'
// Function to toggle the visibility of comments in 'See More'
function toggleSeeMore(postId) {
    const commentsContainer = document.getElementById(`comments-container-${postId}`);
    const showMoreButton = commentsContainer.querySelector('.show-more-btn');

    if (commentsContainer.classList.contains('collapsed')) {
        // Expand to show all comments
        commentsContainer.classList.remove('collapsed');
        showMoreButton.innerText = 'Show Less';
    } else {
        // Collapse to show only 3 comments
        commentsContainer.classList.add('collapsed');
        showMoreButton.innerText = 'Show More';
    }
}



const csb = document.querySelector('csb');  