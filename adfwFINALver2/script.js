const signUpButton=document.getElementById('signUpButton');
const signInButton=document.getElementById('signInButton');
const signInForm=document.getElementById('signIn');
const signUpForm=document.getElementById('signup');

signUpButton.addEventListener('click',function(){
    signInForm.style.display="none";
    signUpForm.style.display="block";
})
signInButton.addEventListener('click', function(){
    signInForm.style.display="block";
    signUpForm.style.display="none";
})

// Function to fetch and display About Us content
function fetchAboutUsContent() {
    const aboutUsContentRef = db.collection('aboutUs').doc('content');

    aboutUsContentRef.get().then((doc) => {
        if (doc.exists) {
            const aboutUsData = doc.data();
            const aboutUsContentElement = document.getElementById('aboutUsContent');

            // Populate content
            aboutUsContentElement.innerHTML = `<p>${aboutUsData.content}</p>`;
        } else {
            console.log('No such document!');
        }
    }).catch((error) => {
        console.error('Error getting document:', error);
    });
}

// Call the function on page load or whenever appropriate
fetchAboutUsContent();