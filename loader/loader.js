// Experimental Loader JavaScript - 3D Cloud Animation using Three.js

import * as THREE from "three";
import * as BufferGeometryUtils from "addons/utils/BufferGeometryUtils.js";

// Initialize background music
function initAudio() {
    const audio = document.getElementById('background-music');
    if (audio) {
        audio.volume = 0.5; // Set volume to 50%
        
        // Try to play audio automatically
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('ðŸŽµ Background music started successfully!');
                })
                .catch(error => {
                    console.log('ðŸŽµ Auto-play blocked by browser. User interaction required.', error);
                    // Add a click listener to start music on first user interaction
                    document.addEventListener('click', () => {
                        audio.play().then(() => {
                            console.log('ðŸŽµ Background music started after user interaction!');
                        }).catch(e => console.log('ðŸŽµ Could not start audio:', e));
                    }, { once: true });
                });
        }
    }
}

// Cloud shader for atmospheric effects
const cloudShader = {
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,
    fragmentShader: `
        uniform sampler2D map;
        uniform vec3 fogColor;
        uniform float fogNear;
        uniform float fogFar;
        varying vec2 vUv;

        void main() {
            float depth = gl_FragCoord.z / gl_FragCoord.w;
            float fogFactor = smoothstep( fogNear, fogFar, depth );

            gl_FragColor = texture2D( map, vUv );
            gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );
            gl_FragColor = mix( gl_FragColor, vec4( fogColor , gl_FragColor.w ), fogFactor );
        }
    `
};

// Get container and setup scene
const container = document.querySelector(".container");
const sizes = {
    width: container.offsetWidth,
    height: container.offsetHeight
};

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    1,
    3000
);
const renderer = new THREE.WebGLRenderer({
    antialias: false,
    gammaOutput: true,
    alpha: true
});

// Mouse interaction variables
const mouse = new THREE.Vector2();
let mesh, geometry, material;
let position;

var mouseX = 0,
    mouseY = 0;
var start_time = Date.now();

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// Texture loader
var tLoader = new THREE.TextureLoader();

// Load cloud texture and initialize the scene
tLoader.load(
    "https://mrdoob.com/lab/javascript/webgl/clouds/cloud10.png",
    (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        init(t);
    },
    // Progress callback
    (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
    },
    // Error callback
    (error) => {
        console.error('Error loading cloud texture:', error);
        // Initialize with fallback even if texture fails
        init(null);
    }
);

function init(t) {
    // Setup camera
    camera.position.z = 6000;

    // Create geometry
    geometry = new THREE.BufferGeometry();

    // Setup texture
    var texture = t || createFallbackTexture();
    if (texture) {
        texture.magFilter = THREE.LinearMipMapLinearFilter;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
    }

    // Setup fog
    var fog = new THREE.Fog(0x8B4513, -100, 3000); // Brown/orange tone
    scene.fog = fog;

    // Create shader material
    material = new THREE.ShaderMaterial({
        uniforms: {
            map: { type: "t", value: texture },
            fogColor: { type: "c", value: fog.color },
            fogNear: { type: "f", value: fog.near },
            fogFar: { type: "f", value: fog.far }
        },
        vertexShader: cloudShader.vertexShader,
        fragmentShader: cloudShader.fragmentShader,
        depthWrite: false,
        depthTest: false,
        transparent: true
    });

    // Create cloud geometry
    const planeGeo = new THREE.PlaneGeometry(64, 64);
    var planeObj = new THREE.Object3D();
    const geometries = [];

    // Generate cloud planes
    for (var i = 0; i < 8000; i++) {
        planeObj.position.x = Math.random() * 1000 - 500;
        planeObj.position.y = -Math.random() * Math.random() * 200 - 15;
        planeObj.position.z = i;
        planeObj.rotation.z = Math.random() * Math.PI;
        planeObj.scale.x = planeObj.scale.y =
            Math.random() * Math.random() * 1.5 + 0.5;
        planeObj.updateMatrix();

        const clonedPlaneGeo = planeGeo.clone();
        clonedPlaneGeo.applyMatrix4(planeObj.matrix);

        geometries.push(clonedPlaneGeo);
    }

    // Merge geometries for performance
    const planeGeos = BufferGeometryUtils.mergeGeometries(geometries);
    const planesMesh = new THREE.Mesh(planeGeos, material);
    planesMesh.renderOrder = 2;

    // Create duplicate mesh for seamless looping
    const planesMeshA = planesMesh.clone();
    planesMeshA.position.z = -8000;
    planesMeshA.renderOrder = 1;

    // Add meshes to scene
    scene.add(planesMesh);
    scene.add(planesMeshA);

    // Setup renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Event listeners
    document.addEventListener("mousemove", onDocumentMouseMove, false);
    window.addEventListener("resize", onWindowResize, false);

    // Start animation
    animate();
    
    console.log("ðŸŒ¥ï¸ Experimental cloud animation initialized!");
    
    // Start the sequence: clouds fade in after a delay
    startSequence();
}

// Create fallback texture if main texture fails to load
function createFallbackTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    
    // Create a simple cloud-like pattern
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// Mouse movement handler
function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.25;
    mouseY = (event.clientY - windowHalfY) * 0.25;
}

// Window resize handler
function onWindowResize(event) {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update position for continuous movement
    position = ((Date.now() - start_time) * 0.03) % 8000;

    // Smooth camera movement based on mouse
    camera.position.x += (mouseX - camera.position.x) * 0.01;
    camera.position.y += (-mouseY - camera.position.y) * 0.01;
    camera.position.z = -position + 8000;

    // Render the scene
    renderer.render(scene, camera);
}

// ========================================
// EXPERIMENTAL SEQUENCE FUNCTIONS
// ========================================

// Start the main sequence
function startSequence() {
    console.log('ðŸŽ¬ Starting Experimental Escape Da Vinci 2k26 sequence...');
    
    // Initialize background music
    initAudio();
    
    // Step 1: Title is already visible (CSS animation)
    console.log('ðŸ“ 3D Title "Escape Da Vinci 2k26" displayed');
    
    // Step 2: Fade in marquee border after 1 second
    setTimeout(() => {
        fadeInMarqueeBorder();
    }, 1000);
    
    // Step 3: Fade in clouds after 2 seconds total
    setTimeout(() => {
        fadeInClouds();
    }, 2000);
    
    // Step 4: Show Enter button after 5 seconds total
    setTimeout(() => {
        showEnterButton();
    }, 5000);
}

// Fade in the marquee border
function fadeInMarqueeBorder() {
    const marqueeBorder = document.querySelector('.marquee-border');
    
    if (marqueeBorder) {
        marqueeBorder.classList.add('show');
        console.log('ðŸŽ  Marquee border appearing around the page...');
    }
}

// Fade in the cloud animation
function fadeInClouds() {
    const container = document.querySelector('.container');
    
    if (container) {
        container.classList.add('show');
        console.log('ðŸŒ¥ï¸ Clouds fading in behind everything...');
    }
}

// Show the Enter button with animation
function showEnterButton() {
    const enterButton = document.getElementById('enterButton');
    if (enterButton) {
        enterButton.classList.add('show');
        console.log('âœ¨ Sparkly Enter button appeared!');
        
        // Add click event listener
        enterButton.addEventListener('click', handleEnterClick);
    }
}

// Handle Enter button click
function handleEnterClick(event) {
    // The page transition system will handle the fade and navigation automatically
    console.log('ðŸš€ Experimental Enter button clicked! Transition system taking over...');
}

// Export the main functions for external use
window.ExperimentalLoaderAPI = {
    startSequence,
    fadeInMarqueeBorder,
    fadeInClouds,
    showEnterButton,
    handleEnterClick
};

// Initialize audio when DOM is ready (fallback)
document.addEventListener('DOMContentLoaded', () => {
    initAudio();
});

// Console messages
console.log('%cðŸ§ª Experimental Escape Da Vinci 2k26 Loader initialized!', 'color: #ff4444; font-size: 16px; font-weight: bold;');
console.log('%cðŸŽ† Experimental Sequence: 3D Title â†’ Marquee Border â†’ Clouds â†’ Enter Button', 'color: white; font-size: 14px;');
console.log('%cðŸŽµ Background music will start automatically (if allowed by browser)', 'color: #ff6b9d; font-size: 12px;');

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