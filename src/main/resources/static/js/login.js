const form = document.getElementById('login-form');
const errorBox = document.getElementById('login-error');
const passwordInput = document.getElementById('password');
const toggleButton = document.getElementById('toggle-password');


const homeByRole = {
    therapist: 'index.html',
    patient: 'chat.html',     
    admin: 'admin.html',      
};


// ===== SHOW / HIDE PASSWORD =====
toggleButton.addEventListener('click', () => {
    
    const showing = passwordInput.type === 'password';

    passwordInput.type = showing ? 'text' : 'password';   // swap the input type
    
    toggleButton.setAttribute('aria-pressed', String(showing));
    toggleButton.setAttribute('aria-label', showing ? 'Hide password' : 'Show password');
});


// ===== SUBMITTING THE FORM =====

form.addEventListener('submit', async (event) => {
    event.preventDefault();          

    const username = form.username.value.trim();   
    const password = form.password.value;          

    
    if (!username || !password) {
        showError('Please enter your username and password.');
        return;                        
    }

    hideError();

    try {
        .
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password,
                remember: form.remember.checked,   
            }),
        });

        if (!response.ok) {
            
            showError('Username or password is incorrect.');
            return;
        }

        const data = await response.json();
        
        window.location.href = homeByRole[data.role] || 'index.html';
    } catch (error) {
        
        showError('Could not reach the server. Please try again.');
    }
});


// ===== SMALL HELPER FUNCTIONS =====
function showError(message) {
    errorBox.textContent = message;  
    errorBox.hidden = false;         // reveal the message
}

function hideError() {
    errorBox.hidden = true;
}
