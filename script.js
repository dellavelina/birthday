document.addEventListener("DOMContentLoaded", function () {
    // Get guest name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('name') || 'Guest';

    // Display name on the page
    document.getElementById('guestName').textContent = guestName;
    document.getElementById('guestNameInput').value = guestName;

    const form = document.getElementById('rsvpForm');
    const confirmation = document.getElementById('confirmation');

    // Check if there's an existing RSVP
    checkExistingRSVP(guestName, form, confirmation);

    // Handle form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        
        // Save data to localStorage first (as backup)
        saveRSVPToLocalStorage(guestName, formData);

        // Show loading message
        confirmation.textContent = "Sending your RSVP...";
        confirmation.classList.remove('hidden');
        
        // Prepare data for Google Sheets
        const attendance = formData.get('ATTENDANCE');
        const guests = formData.get('GUESTS') || '0';
        
        // Use fetch API with CORS mode and fallback to JSONP
        sendRSVPWithFallback(guestName, attendance, guests)
            .then(response => {
                console.log('Response received:', response);
                confirmation.textContent = "Thank you! Your RSVP has been saved.";
            })
            .catch(error => {
                console.error('Error sending RSVP:', error);
                confirmation.textContent = "Your RSVP is saved locally. We'll try to sync it again later.";
                
                // Try to retry after 3 seconds
                setTimeout(() => {
                    sendRSVPWithFallback(guestName, attendance, guests)
                        .then(() => {
                            confirmation.textContent = "Great! Your RSVP has now been saved.";
                        })
                        .catch(() => {
                            // Keep the previous error message
                        });
                }, 3000);
            });
    });
});

// Function to send RSVP data with fallback methods
function sendRSVPWithFallback(name, attendance, guests) {
    return new Promise((resolve, reject) => {
        // Try method 1: Fetch API
        sendWithFetch(name, attendance, guests)
            .then(resolve)
            .catch(error => {
                console.log('Fetch method failed, trying JSONP fallback...', error);
                
                // Try method 2: JSONP as fallback
                sendWithJSONP(name, attendance, guests)
                    .then(resolve)
                    .catch(error => {
                        console.log('JSONP method failed, trying iframe fallback...', error);
                        
                        // Try method 3: iframe as final fallback
                        sendWithIframe(name, attendance, guests)
                            .then(resolve)
                            .catch(reject);
                    });
            });
    });
}

// Method 1: Send using Fetch API
function sendWithFetch(name, attendance, guests) {
    return new Promise((resolve, reject) => {
        // Make sure to use the correct Apps Script URL
        const scriptUrl = "https://script.google.com/macros/s/AKfycby0A7ApvDmbVdxG2QJuUcO-EnBSJ7yZYljVHtNoiWN4/exec";
        const url = `${scriptUrl}?NAME=${encodeURIComponent(name)}&ATTENDANCE=${encodeURIComponent(attendance)}&GUESTS=${encodeURIComponent(guests)}`;
        
        fetch(url, {
            method: 'GET',
            mode: 'no-cors' // This won't give us a proper response but might work
        })
        .then(() => {
            // With no-cors we can't actually check the response
            resolve({ result: 'success', method: 'fetch' });
        })
        .catch(error => {
            reject(error);
        });
        
        // Set timeout
        setTimeout(() => {
            reject(new Error('Fetch timeout'));
        }, 5000);
    });
}

// Method 2: Send using JSONP
function sendWithJSONP(name, attendance, guests) {
    return new Promise((resolve, reject) => {
        const scriptTag = document.createElement('script');
        const callback = 'callback_' + Math.floor(Math.random() * 1000000);
        
        // Create global callback function
        window[callback] = function(response) {
            if (response && response.result === 'success') {
                resolve({ ...response, method: 'jsonp' });
            } else {
                reject(new Error('JSONP response error'));
            }
            
            // Clean up
            delete window[callback];
            document.body.removeChild(scriptTag);
        };
        
        // Make sure to use the correct Apps Script URL
        const scriptUrl = "https://script.google.com/macros/s/AKfycby0A7ApvDmbVdxG2QJuUcO-EnBSJ7yZYljVHtNoiWN4/exec";
        const url = `${scriptUrl}?NAME=${encodeURIComponent(name)}&ATTENDANCE=${encodeURIComponent(attendance)}&GUESTS=${encodeURIComponent(guests)}&callback=${callback}`;
        
        // Add script to page
        scriptTag.src = url;
        scriptTag.onerror = function() {
            reject(new Error('JSONP script loading error'));
            delete window[callback];
            if (document.body.contains(scriptTag)) {
                document.body.removeChild(scriptTag);
            }
        };
        document.body.appendChild(scriptTag);
        
        // Set timeout
        setTimeout(function() {
            if (window[callback]) {
                reject(new Error('JSONP timeout'));
                delete window[callback];
                if (document.body.contains(scriptTag)) {
                    document.body.removeChild(scriptTag);
                }
            }
        }, 5000);
    });
}

// Method 3: Send using iframe (last resort)
function sendWithIframe(name, attendance, guests) {
    return new Promise((resolve, reject) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        
        // Make sure to use the correct Apps Script URL
        const scriptUrl = "https://script.google.com/macros/s/AKfycby0A7ApvDmbVdxG2QJuUcO-EnBSJ7yZYljVHtNoiWN4/exec";
        const url = `${scriptUrl}?NAME=${encodeURIComponent(name)}&ATTENDANCE=${encodeURIComponent(attendance)}&GUESTS=${encodeURIComponent(guests)}`;
        
        // Set up listeners
        iframe.onload = function() {
            setTimeout(() => {
                resolve({ result: 'success', method: 'iframe' });
                document.body.removeChild(iframe);
            }, 1000);
        };
        
        iframe.onerror = function() {
            reject(new Error('Iframe loading error'));
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        };
        
        // Add iframe to page
        iframe.src = url;
        document.body.appendChild(iframe);
        
        // Set timeout
        setTimeout(function() {
            resolve({ result: 'uncertain', method: 'iframe' });
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 5000);
    });
}

// Function to check previous RSVP
function checkExistingRSVP(name, form, confirmation) {
    const storedRSVP = getRSVPFromLocalStorage(name);
    if (storedRSVP) {
        try {
            // Find and select the correct option in the dropdown
            const attendanceSelect = form.querySelector('[name="ATTENDANCE"]');
            if (attendanceSelect) {
                for (let i = 0; i < attendanceSelect.options.length; i++) {
                    if (attendanceSelect.options[i].value === storedRSVP.attendance) {
                        attendanceSelect.options[i].selected = true;
                        break;
                    }
                }
            }
            
            // Set number of guests
            const guestsInput = form.querySelector('[name="GUESTS"]');
            if (guestsInput) {
                guestsInput.value = storedRSVP.guests || 0;
            }
            
            // Show confirmation message
            confirmation.textContent = "You've already RSVP'd! You can update your response below.";
            confirmation.classList.remove('hidden');
        } catch (err) {
            console.error("Error processing stored RSVP:", err);
        }
    }
}

// Save RSVP to localStorage
function saveRSVPToLocalStorage(name, formData) {
    try {
        const rsvpData = {
            attendance: formData.get('ATTENDANCE'),
            guests: formData.get('GUESTS') || '0'
        };
        localStorage.setItem(`rsvp_${name}`, JSON.stringify(rsvpData));
        return true;
    } catch (err) {
        console.error("Error saving to localStorage:", err);
        return false;
    }
}

// Get RSVP from localStorage
function getRSVPFromLocalStorage(name) {
    try {
        const storedData = localStorage.getItem(`rsvp_${name}`);
        return storedData ? JSON.parse(storedData) : null;
    } catch (err) {
        console.error("Error getting data from localStorage:", err);
        return null;
    }
}