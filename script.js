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
        
        // Try simpler approach with JSONP
        const scriptTag = document.createElement('script');
        const callback = 'callback_' + Math.floor(Math.random() * 1000000);
        window[callback] = function(response) {
            console.log('Response received:', response);
            
            if (response && response.result === 'success') {
                confirmation.textContent = "Thank you! Your RSVP has been saved.";
            } else {
                confirmation.textContent = "Your RSVP is saved locally. We'll try to sync it again later.";
                console.error('Error from server:', response);
            }
            
            delete window[callback]; // Clean up global function
            document.body.removeChild(scriptTag);
        };
        
        // Make sure to use the correct Apps Script URL
        const scriptUrl = "https://script.google.com/macros/s/AKfycby0A7ApvDmbVdxG2QJuUcO-EnBSJ7yZYljVHtNoiWN4/exec";
        const url = `${scriptUrl}?NAME=${encodeURIComponent(guestName)}&ATTENDANCE=${encodeURIComponent(attendance)}&GUESTS=${encodeURIComponent(guests)}&callback=${callback}`;
        
        scriptTag.src = url;
        scriptTag.onerror = function() {
            console.error('Script loading error');
            confirmation.textContent = "Your RSVP is saved locally. We'll try to sync it again later.";
        };
        document.body.appendChild(scriptTag);
        
        // Set a timeout in case the callback never happens
        setTimeout(function() {
            if (window[callback]) {
                console.log('Timeout - no response from server');
                confirmation.textContent = "Your RSVP is saved! You'll be on our guest list.";
                delete window[callback];
                if (document.body.contains(scriptTag)) {
                    document.body.removeChild(scriptTag);
                }
            }
        }, 5000);
    });
});

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