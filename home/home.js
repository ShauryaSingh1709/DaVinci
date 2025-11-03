// Dynamic Island Scroll Behavior with Debounce
const dynamicIsland = document.getElementById("dynamic-island");
const section = document.querySelector("section");

let lastScrollPosition = 0;
let ticking = false;

function handleScroll() {
    const scrollPosition = window.scrollY;
    console.log('Scroll position:', scrollPosition); // Debug log
    
    if (scrollPosition > 50) {
        dynamicIsland.classList.add("shrunk");
        if (section) section.classList.add("padded");
    } else {
        dynamicIsland.classList.remove("shrunk");
        if (section) section.classList.remove("padded");
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
}, { passive: true });


// 3D Scene with Three.js and GSAP Animations

import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/UnrealBloomPass.js";

// Create a scene
const scene = new THREE.Scene();
const canvas = document.querySelector('canvas.webgl');

// Group for torus and model
const group = new THREE.Group();
scene.add(group);

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
);
floor.rotation.x = -Math.PI * 0.5;
// scene.add(floor);

// Torus with emissive material
const geometry = new THREE.TorusGeometry(0.2, 0.04, 4, 20);
const material = new THREE.MeshStandardMaterial({
    color: 0x2555FD,
    emissive: 0x2555FD,  // âœ… Torus now emits light
    emissiveIntensity: 5,  // âœ… Increased glow
    wireframe: true
});
const torus = new THREE.Mesh(geometry, material);
torus.position.set(0, 1.8, 0);
group.add(torus);

const BLOOM_LAYER = 1;
torus.layers.enable(BLOOM_LAYER);  // Only torus glows



// âœ… Move the PointLight inside the Torus
const torusLight = new THREE.PointLight(0xffffff, 0.01, 0.25, 0.0004); // (color, intensity, distance, decay)
torusLight.position.set(0, 1.8, -2); // âœ… Inside the torus
scene.add(torusLight);

// âœ… Light Helper
const torusLightHelper = new THREE.PointLightHelper(torusLight);
// scene.add(torusLightHelper);

const spotLight = new THREE.SpotLight(0xffffff, 17, 100, 10, 10);
spotLight.position.set(0, 3, 0.5);
spotLight.castShadow = true;
scene.add(spotLight);


const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(spotLightHelper);


// Soft fill light from the left
const fillLight = new THREE.PointLight(0x5599FF, 30, 5, 2);
fillLight.position.set(-2, 2, 2);
// scene.add(fillLight);

// Rim light from the back for depth
const rimLight = new THREE.PointLight(0xffffff, 20, 1, 1.5);
rimLight.position.set(1, 1, 1);
scene.add(rimLight);

const fillLightHelper = new THREE.PointLightHelper(fillLight);
const rimLightHelper = new THREE.PointLightHelper(rimLight);
// scene.add( fillLightHelper);
// scene.add( rimLightHelper);

// GLTF Loader
const gltfLoader = new GLTFLoader();
const loadModel = (path, position, rotation = { x: 0, y: 0, z: 0 }) => {
    gltfLoader.load(path, (gltf) => {
        const mesh = gltf.scene;
        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        mesh.position.set(position.x, position.y, position.z);
        mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        group.add(mesh);  // âœ… Add model to the group
        console.log(gltf.scene);
        // âœ… Hide loader when model is ready
        const loaderEl = document.getElementById('preloader');
        if (loaderEl) {
            gsap.to(loaderEl, {
                scale: 1.5,
                opacity: 0,
                // y:"-100%",
                duration: 0.5,
                ease: "linear",
                onComplete: () => loaderEl.remove()
            });
        }
    });
    (xhr) => {
        // Optional: Progress feedback (in case you want percentage)
        const percent = (xhr.loaded / xhr.total) * 100;
        console.log(`Loading model: ${percent.toFixed(0)}%`);
    },
        (error) => {
            console.error('Error loading model', error);
        }
};

// Load multiple models
loadModel('https://raw.githubusercontent.com/Sabur-Ahemad/roman-godess-3d/main/flora/scene.gltf', { x: 0, y: 10.8, z: -15 });

// Sizes
const sizes = { width: window.innerWidth, height: window.innerHeight };

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.set(0, 2, 2);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height);

// Scroll-based rotation for the group
if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(group.rotation, {
        y: "+=6.28", // âœ… Rotate in the same direction as the wheel event
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1, // Smooth scrolling effect
        }
    });

    gsap.to(camera.position, {
        y: 1, // âœ… Moves downward instead of upward
        z: 1.7, // âœ… Moves backward instead of forward
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
        }
    });
}

const composer = new EffectComposer(renderer);
composer.setSize(sizes.width, sizes.height);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    1,   // strength â€” glow intensity
    1.0,   // radius â€” spread
    0    // threshold â€” how bright a pixel must be to glow
);
composer.addPass(bloomPass);

// Animation Controls (keeping default values)
const animationParams = {
    flickerSpeed: 0.02,
    flickerIntensity: 10,
    autoRotation: true,
    rotationSpeed: 1
};



window.addEventListener('resize', () => {
    // âœ… Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // âœ… Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // âœ… Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // âœ… Update composer
    composer.setSize(sizes.width, sizes.height);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
let time = 0;
const tick = () => {
    time += animationParams.flickerSpeed;

    // Flickering light effect using GUI parameters
    torusLight.intensity = torusLight.intensity + Math.sin(time) * animationParams.flickerIntensity;

    // Auto rotation using GUI parameters
    if (animationParams.autoRotation) {
        torus.rotation.z += 0.01 * animationParams.rotationSpeed;
        // torus.rotation.y += 0.01 * animationParams.rotationSpeed;
    }

    renderer.render(scene, camera);
    composer.render();
    window.requestAnimationFrame(tick);
};
tick();

// gsap.to("img", {
//     y: -50, // Move up by 50px
//     duration: 1,
//     ease: "power2.out",
//     scrollTrigger: {
//         trigger: '.banner-section h1',
//         start: "top 10%", // Animation starts when top of element reaches 80% viewport height
//         end: "bottom 10%", // Animation ends when top reaches 50% viewport height
//         scrub: 1, // Smooth animation linked to scroll
//         markers: true,
//     }
// });


const images = document.querySelectorAll('.images-container .img-main ');

images.forEach((img, index) => {
    // Apply fade-in and slide-up effect
    // gsap.from(img, {
    //     opacity: 0,
    //     y: 100, // Moves up while fading in
    //     duration: 1.2,
    //     ease: "power2.out",
    //     scrollTrigger: {
    //         trigger: img,
    //         start: "top 85%", // Starts when the image reaches 85% of viewport
    //         end: "top 50%",
    //         scrub: 1, // Smooth scrolling effect
    //         // markers: true
    //     }
    // });

    // Apply Parallax Effect
    gsap.to(img, {
        // y: index % 2 === 0 ? "-=50" : "+=50", // Moves alternately up/down
        y: 0,
        opacity: 1,
        ease: "none",
        opacity: 1,
        scrollTrigger: {
            trigger: img,
            start: "top bottom", // Starts when the image enters the viewport
            end: "bottom bottom", // Ends when it leaves viewport
            scrub: 1, // Smooth parallax effect
            // markers:true
        }
    });
});


window.onload = function () {
    gsap.from(".banner-section", {
        opacity: 0,
        y: 50, // Move up while appearing
        duration: 1.5,
        ease: "power2.out"
    });

    gsap.from(".images-container .img", {
        opacity: 0,
        scale: 0.8, // Slight zoom-in effect
        stagger: 0.2, // Delays between each image animation
        duration: 1.2,
        ease: "power2.out"
    });
};

// gsap.to("#loading-text", {
//   duration: 2,
//   scrambleText: {
//     text: "loading",
//     chars: "upperCase",
//     revealDelay: 0.5,
//     speed: 0.1
//   },
//   ease: "power1.inOut",
//   repeat: -1,
//   yoyo: true
// });
// Custom SplitText function for loading text animation
function customSplitText(selector) {
    const element = document.querySelector(selector);
    if (!element) return { chars: [] };
    
    const text = element.textContent;
    const chars = [];
    element.innerHTML = '';
    
    text.split('').forEach(char => {
        if (char === ' ') {
            const spaceSpan = document.createElement('span');
            spaceSpan.innerHTML = '&nbsp;';
            spaceSpan.style.display = 'inline-block';
            element.appendChild(spaceSpan);
            chars.push(spaceSpan);
        } else {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.style.display = 'inline-block';
            element.appendChild(charSpan);
            chars.push(charSpan);
        }
    });
    
    return { chars };
}

const split = customSplitText("#loading-text");
if (split.chars.length > 0) {
    gsap.to(split.chars, {
        y: -10,
        opacity: 0,
        duration: 0.6,
        yoyo: true,
        repeat: -1,
        stagger: 0.05,
        ease: "sine.inOut"
    });
}

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