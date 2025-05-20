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
    checkExistingRSVP(guestName);

    // Handle form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);

        // Save data to localStorage
        saveRSVPToLocalStorage(guestName, formData);

        // Send data to Google Sheets
        // Note: This URL should be replaced with your actual Google Script URL
        fetch('https://script.google.com/macros/s/AKfycbzNyeGcwBgB3pp8jdegi8Tbd8mGH1zJUaJNDtKI_LLjFhlxw2XKdIZc5dD6x7_Q0ZSZWw/exec', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('Success:', response);
            form.classList.add('hidden');
            confirmation.textContent = "Thank you! Your RSVP has been saved.";
            confirmation.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error.message);
            confirmation.textContent = "Oops! Something went wrong. Please try again.";
            confirmation.classList.remove('hidden');
        });
    });

    // Function to check previous RSVP
    function checkExistingRSVP(name) {
        const storedRSVP = getRSVPFromLocalStorage(name);
        if (storedRSVP) {
            // Find and select the correct option in the dropdown
            const attendanceSelect = form.querySelector('[name="ATTENDANCE"]');
            for (let i = 0; i < attendanceSelect.options.length; i++) {
                if (attendanceSelect.options[i].value === storedRSVP.attendance) {
                    attendanceSelect.options[i].selected = true;
                    break;
                }
            }
            
            // Set number of guests
            form.querySelector('[name="GUESTS"]').value = storedRSVP.guests || 0;
            
            // Show confirmation and hide form
            confirmation.textContent = "You've already RSVP'd! You can update your response below.";
            confirmation.classList.remove('hidden');
        }
    }

    // Save RSVP to localStorage
    function saveRSVPToLocalStorage(name, formData) {
        const rsvpData = {
            attendance: formData.get('ATTENDANCE'),
            guests: formData.get('GUESTS')
        };
        localStorage.setItem(`rsvp_${name}`, JSON.stringify(rsvpData));
    }

    // Get RSVP from localStorage
    function getRSVPFromLocalStorage(name) {
        const storedData = localStorage.getItem(`rsvp_${name}`);
        return storedData ? JSON.parse(storedData) : null;
    }
});