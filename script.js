document.addEventListener("DOMContentLoaded", function () {
    // Baca nama dari parameter URL
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('name') || 'Guest';

    // Tampilkan nama di halaman
    document.getElementById('guestName').textContent = guestName;
    document.getElementById('guestNameInput').value = guestName;

    // Element form dan konfirmasi
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

        fetch('https://script.google.com/macros/s/AKfycbw2oEhxVW4aPH78CVlWpiZ6q3Qi6pWtbABEIC3hRNuqk2GZ3aXADOF6qnR5GiM6NGEsBA/exec ', {
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
        fetch('https://script.google.com/macros/s/AKfycbw2oEhxVW4aPH78CVlWpiZ6q3Qi6pWtbABEIC3hRNuqk2GZ3aXADOF6qnR5GiM6NGEsBA/exec?name= ' + encodeURIComponent(name))
            .then(res => res.json())
            .then(data => {
                if (data && data.attendance) {
                    document.querySelector(`[name="attendance"][value="${data.attendance}"]`).selected = true;
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