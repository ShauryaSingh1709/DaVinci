// Wait for GSAP plugins to load
document.addEventListener('DOMContentLoaded', function() {
    // Custom SplitText implementation
    function customSplitText(selector) {
        const elements = document.querySelectorAll(selector);
        const result = { chars: [] };
        
        elements.forEach(element => {
            const text = element.textContent;
            element.innerHTML = '';
            
            text.split('').forEach(char => {
                if (char === ' ') {
                    const spaceSpan = document.createElement('span');
                    spaceSpan.className = 'char';
                    spaceSpan.innerHTML = '&nbsp;';
                    spaceSpan.dataset.content = ' ';
                    element.appendChild(spaceSpan);
                    result.chars.push(spaceSpan);
                } else {
                    const charSpan = document.createElement('span');
                    charSpan.className = 'char';
                    charSpan.textContent = char;
                    charSpan.dataset.content = char;
                    element.appendChild(charSpan);
                    result.chars.push(charSpan);
                }
            });
        });
        
        return result;
    }
    
    // Initialize custom SplitText for the paragraph in text-block
    const st = customSplitText(".text-block p");

    // Get the text block container
    const textBlock = document.querySelector(".text-block");

    // Performance optimization: throttle pointer events
    let isThrottled = false;
    const throttleDelay = 16; // ~60fps

    // Add pointer move event listener for hover effect
    if (textBlock && st.chars.length > 0) {
        textBlock.onpointermove = (e) => {
            if (isThrottled) return;
            isThrottled = true;
            
            requestAnimationFrame(() => {
                st.chars.forEach((char) => {
                    const rect = char.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const dx = e.clientX - cx;
                    const dy = e.clientY - cy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 100) {
                        // Smooth glow/scale effect with optimized settings
                        gsap.to(char, {
                            overwrite: "auto",
                            duration: 0.2,
                            scale: 1.05,
                            color: "#ff4444",
                            textShadow: "0 0 8px #ff4444",
                            ease: 'power1.out'
                        });
                    } else {
                        // Reset to normal with faster transition
                        gsap.to(char, {
                            overwrite: "auto",
                            duration: 0.3,
                            scale: 1,
                            color: "#ffffff",
                            textShadow: "none",
                            ease: 'power1.out'
                        });
                    }
                });
                
                setTimeout(() => {
                    isThrottled = false;
                }, throttleDelay);
            });
        };
        
        // Reset all chars when mouse leaves with batch processing
        textBlock.onpointerleave = () => {
            gsap.to(st.chars, {
                duration: 0.4,
                scale: 1,
                color: "#ffffff",
                textShadow: "none",
                ease: 'power1.out',
                stagger: 0.01
            });
        };
    }

    // Timeline animations
    gsap.registerPlugin(ScrollTrigger);

    // Animate timeline items as they come into view
    gsap.from(".timeline-item", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".timeline-section",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        }
    });

    // Animate individual timeline articles
    gsap.from("article", {
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".timeline-section",
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        }
    });

    // Animate dots and lines
    gsap.from(".dot", {
        scale: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "back.out(1.7)",
        scrollTrigger: {
            trigger: ".timeline-section",
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        }
    });

    gsap.from(".line", {
        scaleY: 0,
        transformOrigin: "top",
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".timeline-section",
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        }
    });

    // Animate text-block on scroll
    gsap.from(".text-block", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".text-block",
            start: "top 80%",
            toggleActions: "play none none reverse"
        }
    });

    console.log('About page animations loaded');
});

// Countdown Clock Implementation
const DEFAULT_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz';
const easeOutCubic = (t) => {
    return 1 - (1 - t) ** 4;
};

class FlipSlot {
    constructor(options = {}) {
        const {
            characters = DEFAULT_CHARACTERS,
            color = '#fff',
            pad = 0,
        } = options;
        this.characters = Array.from(`${characters}`);
        this.color = color;
        this.pad = pad;
        this.index = 0;
        this.currentValue = this.characters[this.index];
        this.nextValue = this.characters[this.index + 1];
        this.element = this.create();
    }
    
    create() {
        const { currentValue, nextValue } = this;
        const element = Object.assign(document.createElement('div'), {
            className: 'flip',
            style: `--color: ${this.color}`,
            innerHTML: `
                <div>${nextValue}</div>
                <div>${nextValue}</div>
                <div>${currentValue}</div>
                <div>${currentValue}</div>
            `,
        });
        return element;
    }
    
    setValue(value) {
        this.index = this.characters.indexOf(value) || 0;
        this.currentValue = this.characters[this.index];
        this.nextValue = this.characters[this.index + 1] || this.characters[0];
        this.element.innerHTML = `
            <div>${this.nextValue}</div>
            <div>${this.nextValue}</div>
            <div>${this.currentValue}</div>
            <div>${this.currentValue}</div>
        `;
    }
    
    async flip() {
        const { characters: chars, element, currentValue, index } = this;
        const shift = 1;
        const travel = shift + index;
        
        const [unfoldTop, unfoldBottom, foldTop, foldBottom] = Array.from(
            element.querySelectorAll('div')
        );
        
        let run = 0;
        const duration = 400;
        
        while (this.index < travel) {
            this.currentValue = chars[this.index % chars.length];
            this.nextValue = chars[(this.index + 1) % chars.length];
            unfoldTop.innerText = unfoldBottom.innerText = this.nextValue;
            foldTop.innerText = foldBottom.innerText = this.currentValue;
            
            await Promise.allSettled([
                // Unfold top brightens as it becomes visible
                unfoldTop.animate(
                    {
                        filter: ['brightness(0.3)', 'brightness(1)'],
                        transform: ['scaleY(1)', 'scaleY(1)']
                    },
                    {
                        duration: duration * 0.6,
                        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        fill: 'both',
                        delay: duration * 0.4
                    }
                ).finished,
                
                // Unfold bottom rotates from back to front
                unfoldBottom.animate(
                    {
                        transform: ['rotateX(-180deg)', 'rotateX(0deg)'],
                        filter: ['brightness(0.7)', 'brightness(1)']
                    },
                    {
                        duration: duration * 0.7,
                        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                        fill: 'both',
                        delay: duration * 0.3
                    }
                ).finished,
                
                // Fold top rotates away
                foldTop.animate(
                    {
                        transform: ['rotateX(0deg)', 'rotateX(-90deg)'],
                        filter: ['brightness(1)', 'brightness(0.3)']
                    },
                    {
                        duration: duration * 0.5,
                        easing: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
                        fill: 'both',
                    }
                ).finished,
                
                // Fold bottom dims as it becomes hidden
                foldBottom.animate(
                    {
                        filter: ['brightness(1)', 'brightness(0.3)'],
                        transform: ['scaleY(1)', 'scaleY(0.98)']
                    },
                    {
                        duration: duration * 0.4,
                        easing: 'ease-out',
                        fill: 'both',
                    }
                ).finished,
            ]);
            
            this.index++;
            run++;
            this.currentValue = chars[this.index % chars.length];
            this.nextValue = chars[(this.index + 1) % chars.length];
        }
    }
}

// Initialize countdown
function initCountdown() {
    const board = document.querySelector('.board');
    if (!board) return;
    
    // Target date: January 21, 2026, 10:00 AM
    const targetDate = new Date('2026-01-21T10:00:00');
    
    function getTimeDifference() {
        const now = new Date();
        const diff = Math.max(0, targetDate.getTime() - now.getTime());
        
        if (diff === 0) {
            return ['0', '0', '0', '0', '0', '0', '0', '0', '0'];
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const pad = (num) => String(num).padStart(2, '0');
        let result = `${String(days).padStart(3, '0')}${pad(hours)}${pad(minutes)}${pad(seconds)}`;
        
        return result.split('');
    }
    
    // Create flip slots
    const slots = {
        hundredday: new FlipSlot({ characters: '9876543210' }),
        tenday: new FlipSlot({ characters: '9876543210' }),
        day: new FlipSlot({ characters: '9876543210' }),
        tenhour: new FlipSlot({ characters: '210' }),
        hour: new FlipSlot({ characters: '9876543210' }),
        tenminute: new FlipSlot({ characters: '543210' }),
        minute: new FlipSlot({ characters: '9876543210' }),
        tensecond: new FlipSlot({ characters: '543210' }),
        second: new FlipSlot({ characters: '9876543210' }),
    };
    
    // Add slots to board
    Object.keys(slots).forEach((slot, index) => {
        slots[slot].element.dataset.key = slot;
        board.appendChild(slots[slot].element);
        
        if (slot === 'day' || slot === 'hour' || slot === 'minute') {
            const sep = Object.assign(document.createElement('span'), {
                innerText: '',
            });
            sep.dataset.key = slot;
            board.appendChild(sep);
        }
    });
    
    function setDigits(timeArray) {
        Object.keys(slots).forEach((slot, index) => {
            slots[slot].setValue(timeArray[index]);
        });
        
        // Hide leading zeros for days and hours
        let hide = '';
        const [hundredday, tenday, day, tenhour, hour] = timeArray;
        
        if (hundredday === '0' && tenday === '0' && day === '0') {
            hide += 'day ';
        }
        if (hundredday === '0' && tenday === '0' && day === '0' && tenhour === '0' && hour === '0') {
            hide += 'hour ';
        }
        
        board.dataset.hide = hide;
    }
    
    function isFinished() {
        return Object.values(slots).every((slot) => slot.currentValue === '0');
    }
    
    let interval;
    
    function startTimer() {
        setDigits(getTimeDifference());
        
        if (interval) clearInterval(interval);
        
        interval = setInterval(async () => {
            if (isFinished()) {
                clearInterval(interval);
                console.log('Countdown finished!');
                return;
            }
            
            const flips = new Array(Object.keys(slots).length);
            flips[Object.keys(slots).length - 1] = slots.second.flip();
            
            for (let i = Object.keys(slots).length - 1; i >= 0; i--) {
                const slot = slots[Object.keys(slots)[i]];
                if (
                    (slot.index + 1) % slot.characters.length === 0 &&
                    i > 0 &&
                    flips[i] !== undefined
                ) {
                    flips[i - 1] = slots[Object.keys(slots)[i - 1]].flip();
                }
            }
            
            await Promise.allSettled(flips);
        }, 1000);
    }
    
    // Initialize with current time difference
    setDigits(getTimeDifference());
    startTimer();
}

// Initialize countdown when page loads
document.addEventListener('DOMContentLoaded', initCountdown);

// Starfield Background
const canvas = document.getElementById('starfield');

if (canvas) {
    const ctx = canvas.getContext('2d');
    let stars = [];

    function initStarfield() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        stars = [];
        
        // Different star shapes
        const shapes = ['rect', 'cross', 'square'];
        
        for (let i = 0; i < 150; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.1 + 0.05,
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                opacity: Math.random() * 0.5 + 0.5,
                flicker: Math.random() > 0.7 // Some stars will flicker
            });
        }
    }

    function drawStarfield() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        stars.forEach(star => {
            // Set star color with opacity (red tint)
            ctx.fillStyle = `rgba(255, 68, 68, ${star.flicker ? Math.abs(Math.sin(Date.now() * 0.002)) : star.opacity})`;
            
            // Draw different star shapes
            if (star.shape === 'rect') {
                ctx.fillRect(star.x, star.y, star.size, star.size);
            } else if (star.shape === 'cross') {
                ctx.beginPath();
                ctx.moveTo(star.x - star.size, star.y);
                ctx.lineTo(star.x + star.size, star.y);
                ctx.moveTo(star.x, star.y - star.size);
                ctx.lineTo(star.x, star.y + star.size);
                ctx.strokeStyle = ctx.fillStyle;
                ctx.stroke();
            } else if (star.shape === 'square') {
                ctx.fillRect(star.x - star.size / 2, star.y - star.size / 2, star.size, star.size);
            }
            
            // Move star to the left
            star.x -= star.speed;
            
            // Reset star to right side when it goes off screen
            if (star.x < 0) star.x = canvas.width;
        });
        
        requestAnimationFrame(drawStarfield);
    }

    // Initialize and start animation
    initStarfield();
    drawStarfield();

    // Handle window resize
    window.addEventListener('resize', () => {
        initStarfield();
    });
}

// Dynamic Island Scroll Behavior
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