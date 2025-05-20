// index.html: Redirect dengan nama tamu sebagai parameter
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('guestForm');
    const nameInput = document.getElementById('guestName');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const guestName = encodeURIComponent(nameInput.value.trim());
        if (guestName) {
            window.location.href = `invitation.html?name=${guestName}`;
        }
    });
});

    document.addEventListener('DOMContentLoaded', () => {
    // 1. Baca nama dari URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const encodedName = urlParams.get('name');
    const decodedName = encodedName ? decodeURIComponent(encodedName) : 'Guest';
    
    // 2. Tampilkan nama di halaman
    document.getElementById('guestName').textContent = decodedName;
    document.getElementById('guestNameInput').value = decodedName;

    // 3. Handle form RSVP
    const rsvpForm = document.getElementById('rsvpForm');
    const confirmation = document.getElementById('confirmation');

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!rsvpForm.checkValidity()) {
            rsvpForm.reportValidity();
            return;
        }

        // 4. Kirim data ke Google Sheets
        const formData = new FormData(rsvpForm);
        sendDataToGoogleSheet(formData);

        // 5. Tampilkan konfirmasi
        rsvpForm.classList.add('hidden');
        confirmation.classList.remove('hidden');
    });

    function sendDataToGoogleSheet(formData) {
        // Ganti dengan URL Google Apps Script Anda
        const scriptURL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec ';
        
        fetch(scriptURL, {
            method: 'POST',
            body: formData
        })
        .then(response => console.log('Success!', response))
        .catch(error => console.error('Error!', error.message));
    }
});