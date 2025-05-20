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
        // Create an object with the data in the format expected by the Google Script
        const sheetData = {
            NAME: guestName,
            ATTENDANCE: formData.get('ATTENDANCE'),
            GUESTS: formData.get('GUESTS'),
            SHEET_ID: '1lPI4zmazM-GNmo73kD687nGh3zXXK5isvzuUF9nW5vU',
            SHEET_NAME: 'Sheet1'  // Change this if your sheet has a different name
        };
        
        console.log('Sending data to Google Sheets:', sheetData);
        
        // Convert the data to URL parameters for the GET request
        const params = new URLSearchParams();
        for (const key in sheetData) {
            params.append(key, sheetData[key]);
        }
        
        const scriptUrl = `https://script.google.com/macros/s/AKfycby0A7ApvDmbVdxG2QJuUcO-EnBSJ7yZYljVHtNoiWN4/dev?${params.toString()}`;
        console.log('Request URL:', scriptUrl);
        
        // Send the data to Google Sheets via the Google Script URL
        fetch(scriptUrl, {
            method: 'GET',
            mode: 'no-cors'  // This is important for CORS issues with Google Scripts
        })
        .then(response => {
            console.log('Response received:', response);
            form.classList.add('hidden');
            confirmation.textContent = "Thank you! Your RSVP has been saved to our spreadsheet.";
            confirmation.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error.message);
            confirmation.textContent = "Your RSVP is saved locally. We'll try to sync with our spreadsheet later.";
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