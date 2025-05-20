document.addEventListener('DOMContentLoaded', () => {
    // Ambil nama dari parameter URL
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('name') || 'Guest';

    // Tampilkan nama di halaman
    document.getElementById('guestName').textContent = guestName;
    document.getElementById('guestNameInput').value = guestName;

    // Handle RSVP Form
    const rsvpForm = document.getElementById('rsvpForm');
    const confirmation = document.getElementById('confirmation');

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!rsvpForm.checkValidity()) {
            rsvpForm.reportValidity();
            return;
        }

        // Kirim data ke Google Sheets
        const formData = new FormData(rsvpForm);
        sendDataToGoogleSheet(formData);

        // Tampilkan konfirmasi
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