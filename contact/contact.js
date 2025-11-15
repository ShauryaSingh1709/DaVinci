// Dynamic Island Scroll Behavior with Debounce
const dynamicIsland = document.getElementById("dynamic-island");
const section = document.querySelector(".section");

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


// ✅ FIXED: WORKING FORM SUBMISSION (Web3Forms)
document.getElementById('contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = e.target;
    const submitButton = form.querySelector("button[type='submit']");
    const originalText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
        const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { "Accept": "application/json" }
        });

        if (response.ok) {
            form.innerHTML = `
                <div class="confirmation" style="text-align:center;padding:20px;">
                    <h3 style="color:#ff4444;font-family:'Special Elite', monospace;font-size:1.6rem;">
                        🚀 Message Sent!
                    </h3>
                    <p>Your inquiry has been successfully submitted.</p>
                    <p>We’ll get back to you soon!</p>
                </div>
            `;
        } else {
            throw new Error("Server responded with an error");
        }

    } catch (error) {
        submitButton.textContent = "Error — Try Again";
        console.error(error);

        setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 3000);
    }
});


// Sponsor marquee interaction
document.querySelectorAll('.sponsor-item').forEach(item => {
    item.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => (this.style.transform = ''), 150);
    });
});

// Pause marquee on hover
document.querySelectorAll('.marquee').forEach(marquee => {
    marquee.addEventListener('mouseenter', () => marquee.style.animationPlayState = "paused");
    marquee.addEventListener('mouseleave', () => marquee.style.animationPlayState = "running");
});


// Handle Web Icon Click
function handleWebClick(event) {
    event.preventDefault();

    const webIcon = event.target;
    webIcon.style.transform = "scale(1.2) rotate(180deg)";
    webIcon.style.transition = "transform 0.3s ease";

    setTimeout(() => {
        webIcon.style.transform = "scale(1)";
    }, 300);

    setTimeout(() => {
        window.open(
            "https://unstop.com/hackathons/escape-da-vinci-chandigarh-university-cu-ajitgarh-punjab-1567073",
            "_blank"
        );
    }, 350);
}

window.handleWebClick = handleWebClick;
