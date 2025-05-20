document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('name') || 'Guest';

    // Tampilkan nama di halaman
    document.getElementById('guestName').textContent = guestName;
    document.getElementById('guestNameInput').value = guestName;

    const form = document.getElementById('rsvpForm');
    const confirmation = document.getElementById('confirmation');

    // Cek apakah sudah ada RSVP sebelumnya
    checkExistingRSVP(guestName);

    // Handle submit form
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);

        // Simpan data ke localStorage
        saveRSVPToLocalStorage(guestName, formData);

        // Kirim data ke Google Sheets
        fetch('https://script.google.com/macros/s/AKfycbzNyeGcwBgB3pp8jdegi8Tbd8mGH1zJUaJNDtKI_LLjFhlxw2XKdIZc5dD6x7_Q0ZSZWw/exec ', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
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

    // Fungsi cek RSVP sebelumnya
    function checkExistingRSVP(name) {
        const storedRSVP = getRSVPFromLocalStorage(name);
        if (storedRSVP) {
            document.querySelector(`[name="attendance"][value="${storedRSVP.attendance}"]`).selected = true;
            document.querySelector('[name="guests"]').value = storedRSVP.guests || 0;
            confirmation.textContent = "You've already RSVP'd!";
            confirmation.classList.remove('hidden');
            form.classList.add('hidden');
        }
    }

    // Simpan RSVP ke localStorage
    function saveRSVPToLocalStorage(name, formData) {
        const rsvpData = {
            attendance: formData.get('ATTENDANCE'),
            guests: formData.get('GUESTS')
        };
        localStorage.setItem(`rsvp_${name}`, JSON.stringify(rsvpData));
    }

    // Ambil RSVP dari localStorage
    function getRSVPFromLocalStorage(name) {
        const storedData = localStorage.getItem(`rsvp_${name}`);
        return storedData ? JSON.parse(storedData) : null;
    }
});