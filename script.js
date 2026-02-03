// Submit RSVP Function
function submitRSVP() {
    clearErrors();
    const nameEl = document.getElementById('guestName');
    const name = nameEl ? nameEl.value.trim() : '';
    const attendanceValue = document.getElementById('attendanceValue');
    const attendance = attendanceValue ? attendanceValue.value : '';
    const messageEl = document.getElementById('guestMessage');
    const message = messageEl ? messageEl.value.trim() : '';
    const songEl = document.getElementById('songSuggestion');
    const song = songEl ? songEl.value.trim() : '';
    const submitBtn = document.getElementById('submitBtn');

    // Validation (inline)
    let hasError = false;
    if (!name) {
        document.getElementById('nameError').textContent = 'Please enter your name';
        if (nameEl) {
            nameEl.setAttribute('aria-invalid', 'true');
            const nameField = nameEl.closest('.form-field');
            if (nameField) nameField.classList.add('has-error');
        }
        nameEl && nameEl.focus();
        hasError = true;
    }
    if (!attendance) {
        document.getElementById('attendanceError').textContent = 'Please select how you will join us';
        const attendanceGroup = document.querySelector('.button-group');
        if (attendanceGroup) attendanceGroup.classList.add('has-error');
        hasError = true;
    }
    if (hasError) {
        showFormError('Please correct the highlighted fields and resubmit.');
        return;
    }

    // Prevent double submits
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const rsvpData = {
        name: name,
        attendance: attendance === 'person' ? 'In Person' : 'Via Zoom',
        message: message || 'No message',
        song: song || 'No suggestion',
        timestamp: new Date().toISOString()
    };

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwbJkeHjH31p_T3xF6uZRxl2zGluSit8ZxSAFonWkUAt-xVWMgzBAJ9n4dqtdnRAF-FuA/exec';

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvpData)
    })
    .then(() => {
        // Hide form first
        const formContainer = document.getElementById('formContainer');
        if (formContainer) formContainer.style.display = 'none';
        
        // Show thank you
        const thankYou = document.getElementById('thankyouContainer');
        if (thankYou) {
            thankYou.style.display = 'block';
            thankYou.setAttribute('tabindex', '-1');
            thankYou.focus();
        }

        // Update live region
        const formError = document.getElementById('formError');
        if (formError) {
            formError.style.display = 'block';
            formError.textContent = 'RSVP sent successfully — thank you!';
        }

        // Scroll to thank you
        setTimeout(() => {
            if (thankYou) {
                const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                thankYou.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
            }
        }, 200);
    })
    .catch(error => {
        console.error('Error:', error);
        showFormError('There was an error submitting your RSVP. Please try again later.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send RSVP';
    });
}

function clearErrors() {
    const formError = document.getElementById('formError');
    const nameError = document.getElementById('nameError');
    const attendanceError = document.getElementById('attendanceError');
    if (formError) { formError.style.display = 'none'; formError.textContent = ''; }
    if (nameError) nameError.textContent = '';
    if (attendanceError) attendanceError.textContent = '';

    const nameEl = document.getElementById('guestName');
    if (nameEl) nameEl.removeAttribute('aria-invalid');

    document.querySelectorAll('.form-field.has-error').forEach(el => el.classList.remove('has-error'));
}

function showFormError(msg) {
    const formError = document.getElementById('formError');
    if (formError) {
        formError.textContent = msg;
        formError.style.display = 'block';
    } else {
        alert(msg);
    }
}

// Scroll Animation Observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe sections
    const dateSection = document.querySelector('.date-section');
    const rsvpSection = document.querySelector('.rsvp-section');

    if (dateSection) observer.observe(dateSection);
    if (rsvpSection) observer.observe(rsvpSection);
}

// Back-to-top control
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) btn.classList.add('show'); else btn.classList.remove('show');
    });
    btn.addEventListener('click', function() {
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        btn.blur();
    });
}

// Initialize Attendance Button Group
function initAttendanceButtons() {
    const buttons = document.querySelectorAll('.attendance-btn');
    const hiddenInput = document.getElementById('attendanceValue');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove selected class from all buttons
            buttons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            this.classList.add('selected');
            
            // Update hidden input value with the button's data-value
            if (hiddenInput) {
                hiddenInput.value = this.getAttribute('data-value');
            }
        });
    });
}

// Initialize Lightbox
function initLightbox() {
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
    
    if (!lightboxModal || !lightboxImage) return;
    
    // Open lightbox
    lightboxTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            const imageSrc = this.getAttribute('data-image');
            if (imageSrc) {
                lightboxImage.src = imageSrc;
                lightboxModal.classList.add('active');
                lightboxModal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                lightboxClose.focus();
            }
        });
        
        // Keyboard support (Enter/Space to open)
        trigger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Close lightbox
    function closeLightbox() {
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    
    lightboxClose.addEventListener('click', closeLightbox);
    
    // Close on overlay click
    const lightboxOverlay = document.querySelector('.lightbox-overlay');
    if (lightboxOverlay) {
        lightboxOverlay.addEventListener('click', closeLightbox);
    }
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });
}

// Initialize Countdown Timer
function initCountdownTimer() {
    const countdownDays = document.getElementById('countdownDays');
    if (!countdownDays) return;
    
    function updateCountdown() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weddingDate = new Date(2026, 4, 2); // May 2, 2026 (month is 0-indexed, so 4 = May)
        weddingDate.setHours(0, 0, 0, 0);
        
        const timeDiff = weddingDate - today;
        const daysRemaining = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
        
        countdownDays.textContent = daysRemaining;
    }
    
    updateCountdown();
    
    // Update countdown every minute to stay accurate
    setInterval(updateCountdown, 60000);
}

// Initialize Save to Calendar
function initCalendarButton() {
    const calendarBtn = document.getElementById('saveCalendarBtn');
    if (!calendarBtn) return;
    
    calendarBtn.addEventListener('click', function() {
        // Event details
        const eventTitle = 'Samantha & Jayvee Wedding';
        const eventDate = '20260502'; // YYYYMMDD format
        // Manila time is UTC+8, so we need to convert to UTC
        // 3:00 PM Manila (15:00) = 7:00 AM UTC (07:00)
        // 11:00 PM Manila (23:00) = 3:00 PM UTC (15:00)
        const startTime = '070000'; // HHMMSS format (3:00 PM Manila = 7:00 AM UTC)
        const endTime = '150000'; // HHMMSS format (11:00 PM Manila = 3:00 PM UTC)
        const description = 'We joyfully invite you to celebrate this meaningful day with us!';
        const location = 'Venue details coming soon';
        
        // Google Calendar URL format (Z indicates UTC timezone)
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${eventDate}T${startTime}Z/${eventDate}T${endTime}Z&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
        
        
        window.open(calendarUrl, '_blank');
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Ensure thank you is hidden on page load
    const thankYou = document.getElementById('thankyouContainer');
    if (thankYou) thankYou.style.display = 'none';

    // Initialize functions
    initScrollAnimations();
    initBackToTop();
    initAttendanceButtons();
    initLightbox();
    initCountdownTimer();
    initCalendarButton();

    // Submit handler (avoid inline onclick)
    const form = document.getElementById('formContainer');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            submitRSVP();
        });
    }

    // Keyboard support
    const nameInput = document.getElementById('guestName');
    if (nameInput) {
        nameInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstButton = document.querySelector('.attendance-btn');
                if (firstButton) firstButton.focus();
            }
        });
    }
    
    // Smooth scrolling is handled in CSS and disabled for reduced motion.
});