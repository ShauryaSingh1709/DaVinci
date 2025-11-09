// Dynamic Island Scroll Behavior with Debounce
const dynamicIsland = document.getElementById("dynamic-island");
const section = document.querySelector(".section");

let lastScrollPosition = 0;
let ticking = false;

function handleScroll() {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 50) {
        dynamicIsland.classList.add("shrunk");
        section.classList.add("padded");
    } else {
        dynamicIsland.classList.remove("shrunk");
        section.classList.remove("padded");
    }
    lastScrollPosition = scrollPosition;
    ticking = false;
}

window.addEventListener("scroll", () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
        });
        ticking = true;
    }
});



// Form submission 
document.getElementById("contact-form").addEventListener("submit", function(e) {
    e.preventDefault();
    alert("Message submitted! Thank you for your interest in our hackathon!");
    this.reset();
});

document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault(); 
  
  // Get form elements
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;

  // Show loading state
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';

  try {
    // Send data to FormSubmit.co
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      // Success confirmation
      form.innerHTML = `
        <div class="confirmation" style="text-align: center; padding: 20px;">
          <h3 style="color: #ff4444; font-family: 'Special Elite', monospace; font-size: 1.5rem;">ðŸš€ Message Sent!</h3>
          <p>Your hackathon inquiry has been received!</p>
          <p>We'll get back to you within 24 hours.</p>
        </div>
      `;

    } else {
      throw new Error('Form submission failed');
    }
  } catch (error) {
    // Error handling
    submitButton.textContent = 'Error - Try Again';
    setTimeout(() => {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }, 3000);
    
    console.error('Submission error:', error);
  }
});

// Sponsor marquee interaction
document.querySelectorAll('.sponsor-item').forEach(item => {
    item.addEventListener('click', function(e) {
        // Add a subtle click effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});

// Pause marquee on hover
document.querySelectorAll('.marquee').forEach(marquee => {
    marquee.addEventListener('mouseenter', function() {
        this.style.animationPlayState = 'paused';
    });
    
    marquee.addEventListener('mouseleave', function() {
        this.style.animationPlayState = 'running';
    });
});

// Handle Web SVG Click Event
function handleWebClick(event) {
    event.preventDefault(); // Prevent default link behavior
    
    // Add a visual feedback effect
    const webIcon = event.target;
    webIcon.style.transform = 'scale(1.2) rotate(180deg)';
    webIcon.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
        webIcon.style.transform = 'scale(1)';
    }, 300);
    
    // Navigate to Unstop hackathon page
    console.log('ðŸŒ Web icon clicked! Navigating to Unstop hackathon...');
    
    // Open Unstop hackathon page in new tab
    setTimeout(() => {
        window.open('https://unstop.com/hackathons/escape-da-vinci-chandigarh-university-cu-ajitgarh-punjab-1567073', '_blank');
    }, 350);
}

// Make the function globally available
window.handleWebClick = handleWebClick;