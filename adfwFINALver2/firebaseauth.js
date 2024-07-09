import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAl4008ho9AdXVZhUL5tqcBG4ITjD-5w-0",
    authDomain: "auth-26dbb.firebaseapp.com",
    projectId: "auth-26dbb",
    storageBucket: "auth-26dbb.appspot.com",
    messagingSenderId: "670174818016",
    appId: "1:670174818016:web:0514a5f452d134ff946a85",
    measurementId: "G-S3KN0C48P1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
        messageDiv.style.opacity = 0;
    }, 5000);
}

const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;


    if(firstName.length <2){
        showMessage('Username unavailable', 'signUpMessage');
        const rUser = document.getElementById('fName');
        
        rUser.style.backgroundColor="rgba(226, 0, 0, 0.183)";

        rUser.addEventListener('click', event => {
            event.target.style.backgroundColor="white";
        })

        return;
    }

        console.log(email.length);
    if (email.length == 0) {
        showMessage('Please enter your email.', 'signUpMessage');
    }else if(!email.includes('@') ){
      
        showMessage('Email must contain "@" symbol.', 'signUpMessage');
        
        const rEmail = document.getElementById('rEmail');
        
        rEmail.style.backgroundColor="rgba(226, 0, 0, 0.183)";

        rEmail.addEventListener('click', event => {
            event.target.style.backgroundColor="white";
        })

    }

    if(password.length < 6){
        showMessage('Password needs to be at least 6 characters.', 'signUpMessage');
        const password = document.getElementById('rPassword');
        
        password.style.backgroundColor="rgba(226, 0, 0, 0.183)";

        password.addEventListener('click', event => {
            event.target.style.backgroundColor="white";
        })

        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userData = {
                email: email,
                firstName: firstName,
            };
            
            const messageDiv = document.querySelector('.messageDiv');
            messageDiv.style.backgroundColor = "green";
            
            showMessage('Account Created Successfully', 'signUpMessage');
            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData)
                .then(() => {
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error("Error writing document: ", error);
                    showMessage('Unable to save user data', 'signUpMessage');
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode === 'auth/email-already-in-use') {
                showMessage('Email Address Already Exists !!!', 'signUpMessage');
            } else {
                // showMessage('Unable to create User', 'signUpMessage');
                console.error("Error creating user: ", error);
            }
        });
});

const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        localStorage.setItem('loggedInUserId', user.uid);
        window.location.href = 'homepage.html';
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === 'auth/invalid-credential') {
            if (errorMessage.includes('password')) {
                showMessage('Incorrect Password', 'signInMessage');
                document.getElementById('password').style.backgroundColor = "rgba(226, 0, 0, 0.183)";
            } else if (errorMessage.includes('email')) {
                showMessage('Incorrect Email', 'signInMessage');
                document.getElementById('email').style.backgroundColor = "rgba(226, 0, 0, 0.183)";
            } else {
                showMessage('Incorrect Email or Password', 'signInMessage');
                document.getElementById('email').style.backgroundColor = "rgba(226, 0, 0, 0.183)";
                document.getElementById('password').style.backgroundColor = "rgba(226, 0, 0, 0.183)";
            }
        } else if (errorCode === 'auth/user-not-found') {
            showMessage('Account does not exist', 'signInMessage');
            document.getElementById('email').style.backgroundColor = "rgba(226, 0, 0, 0.183)";
        } else {
            showMessage('Please enter your email and password.', 'signInMessage');
            console.error("Error signing in: ", error);
            document.getElementById('email').style.backgroundColor = "rgba(226, 0, 0, 0.183)";
            document.getElementById('password').style.backgroundColor = "rgba(226, 0, 0, 0.183)";
        }
    }
});

const guestLogin = document.getElementById('guestLogin');
guestLogin.addEventListener('click', (event) => {
    localStorage.setItem("guestMode", "true");
    event.preventDefault();
    signInAnonymously(auth)
        .then((userCredential) => {
            showMessage('Guest login successful', 'signInMessage');
            const user = userCredential.user;
            localStorage.setItem('loggedInUserId', user.uid);
            window.location.href = 'homepage.html';
        })
        .catch((error) => {
            console.error("Error with guest login: ", error);
            showMessage('Unable to login as guest', 'signInMessage');
        });
});
