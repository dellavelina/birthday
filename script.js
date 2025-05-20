document.addEventListener("DOMContentLoaded", () => {
    // Baca nama dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('name') || 'Guest';

    document.getElementById('guestName').textContent = guestName;
    document.getElementById('guestNameInput').value = guestName;

    // Handle form submit
    const form = document.getElementById('rsvpForm');
    const confirmation = document.getElementById('confirmation');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);

        fetch('https://script.google.com/macros/s/AKfycbyOdDff9mPe_qGnUiMqHkBSLVimAvdvD3HiTwOf4Gti2YUllir5LucFzhuS0USmBxmheQ/exec ', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('Success!', response);
            form.classList.add('hidden');
            confirmation.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error!', error.message);
        });
    });
});