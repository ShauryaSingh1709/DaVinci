// Dynamic Island Scroll Behavior with Debounce
const dynamicIsland = document.getElementById("dynamic-island");
const section = document.querySelector("section");

let ticking = false;

function handleScroll() {
    const scrollPosition = window.scrollY;

    if (scrollPosition > 50) {
        dynamicIsland.classList.add("shrunk");
        section?.classList.add("padded");
    } else {
        dynamicIsland.classList.remove("shrunk");
        section?.classList.remove("padded");
    }

    ticking = false;
}

window.addEventListener("scroll", () => {
    if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
    }
}, { passive: true });

// ==========================
// Three.js Scene Setup
// ==========================
import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/UnrealBloomPass.js";

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const group = new THREE.Group();
scene.add(group);

// Torus
const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.04, 4, 20),
    new THREE.MeshStandardMaterial({
        color: 0x2555FD,
        emissive: 0x2555FD,
        emissiveIntensity: 5,
        wireframe: true
    })
);
torus.position.set(0, 1.8, 0);
group.add(torus);

// Torus Light
const torusLight = new THREE.PointLight(0xffffff, 0.01, 0.25, 0.0004);
torusLight.position.set(0, 1.8, -2);
scene.add(torusLight);

// Spot Light
const spotLight = new THREE.SpotLight(0xffffff, 17, 100, Math.PI / 4, 1);
spotLight.position.set(0, 3, 0.5);
spotLight.castShadow = true;
scene.add(spotLight);

// Rim Light
const rimLight = new THREE.PointLight(0xffffff, 20, 1, 1.5);
rimLight.position.set(1, 1, 1);
scene.add(rimLight);

// GLTF Loader
const gltfLoader = new GLTFLoader();
function loadModel(path, position, rotation = { x: 0, y: 0, z: 0 }) {
    gltfLoader.load(path, (gltf) => {
        const mesh = gltf.scene;
        mesh.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        mesh.position.set(position.x, position.y, position.z);
        mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        group.add(mesh);

        const loaderEl = document.getElementById('preloader');
        if (loaderEl) {
            gsap.to(loaderEl, {
                scale: 1.5,
                opacity: 0,
                duration: 0.5,
                ease: "linear",
                onComplete: () => loaderEl.remove()
            });
        }
    }, undefined, (error) => console.error('Error loading model', error));
}

// Example model
loadModel('https://raw.githubusercontent.com/Sabur-Ahemad/roman-godess-3d/main/flora/scene.gltf', { x: 0, y: 10.8, z: -15 });

// Camera
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 2, 2);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height);

// Composer
const composer = new EffectComposer(renderer);
composer.setSize(sizes.width, sizes.height);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 1, 1, 0);
composer.addPass(bloomPass);

// Resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    composer.setSize(sizes.width, sizes.height);
});

// Animation
let time = 0;
const animationParams = { flickerSpeed: 0.02, flickerIntensity: 10, autoRotation: true, rotationSpeed: 1 };
const tick = () => {
    time += animationParams.flickerSpeed;
    torusLight.intensity = 0.01 + Math.sin(time) * animationParams.flickerIntensity;

    if (animationParams.autoRotation) {
        torus.rotation.z += 0.01 * animationParams.rotationSpeed;
    }

    composer.render();
    requestAnimationFrame(tick);
};
tick();

// Scroll-based GSAP Animations
if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(group.rotation, {
        y: "+=6.28",
        scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 }
    });

    gsap.to(camera.position, {
        y: 1, z: 1.7,
        scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 }
    });
}

// Images Fade-in
const images = document.querySelectorAll('.images-container .img-main');
images.forEach((img) => {
    gsap.to(img, {
        y: 0, opacity: 1,
        scrollTrigger: { trigger: img, start: "top bottom", end: "bottom bottom", scrub: 1 }
    });
});

// Banner fade-in
window.onload = () => {
    gsap.from(".banner-section", { opacity: 0, y: 50, duration: 1.5, ease: "power2.out" });
    gsap.from(".images-container .img", { opacity: 0, scale: 0.8, stagger: 0.2, duration: 1.2, ease: "power2.out" });
};

// Loading text animation
function customSplitText(selector) {
    const element = document.querySelector(selector);
    if (!element) return { chars: [] };
    const text = element.textContent;
    const chars = [];
    element.innerHTML = '';
    text.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        element.appendChild(span);
        chars.push(span);
    });
    return { chars };
}
const split = customSplitText("#loading-text");
if (split.chars.length > 0) {
    gsap.to(split.chars, { y: -10, opacity: 0, duration: 0.6, yoyo: true, repeat: -1, stagger: 0.05, ease: "sine.inOut" });
}

// Web SVG Click
window.handleWebClick = (event) => {
    event.preventDefault();
    const icon = event.target;
    icon.style.transform = 'scale(1.2) rotate(180deg)';
    icon.style.transition = 'transform 0.3s ease';
    setTimeout(() => icon.style.transform = 'scale(1)', 300);
    setTimeout(() => window.open('https://unstop.com/hackathons/escape-da-vinci-chandigarh-university-cu-ajitgarh-punjab-1567073', '_blank'), 350);
};
