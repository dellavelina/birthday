document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('name') || 'Guest';

    // Tampilkan nama tamu
    document.getElementById('guestName').textContent = guestName;
    document.getElementById('guestNameInput').value = guestName;

    const form = document.getElementById('rsvpForm');
    const confirmation = document.getElementById('confirmation');

    // Cek apakah sudah ada data untuk nama ini
    checkExistingRSVP(guestName);

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);

        fetch('https://script.google.com/macros/s/AKfycbyM2_KvzjHmODVwr7-r8ntvO1m6BLjYjUGfL1jjFY76_8gQBDyVEL13tKVb0fhh-d4Cig/exec ', {
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

    // Fungsi cek apakah sudah ada RSVP
    function checkExistingRSVP(name) {
        fetch('https://script.google.com/macros/s/AKfycbyM2_KvzjHmODVwr7-r8ntvO1m6BLjYjUGfL1jjFY76_8gQBDyVEL13tKVb0fhh-d4Cig/exec?name= ' + encodeURIComponent(name))
            .then(res => res.json())
            .then(data => {
                if (data && data.attendance) {
                    document.querySelector(`[name="attendance"][value="${data.attendance}"]`).checked = true;
                    document.querySelector('[name="guests"]').value = data.guests || 0;
                    confirmation.textContent = "You've already RSVP'd!";
                    confirmation.classList.remove('hidden');
                    form.classList.add('hidden');
                }
            })
            .catch(() => {
                // Tidak ada data sebelumnya
            });
    }
});