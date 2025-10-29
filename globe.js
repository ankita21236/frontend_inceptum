// Global variables for this module
let globeModuleRenderer, globeModuleAnimatorId;

export function initGlobeModule() {
    const globeModuleContainer = document.getElementById('globe-module-canvas');
    if (typeof THREE !== 'undefined' && !globeModuleRenderer && globeModuleContainer) {
        try {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(40, globeModuleContainer.clientWidth / globeModuleContainer.clientHeight, 0.1, 1000); 
            
            globeModuleRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            globeModuleRenderer.setSize(globeModuleContainer.clientWidth, globeModuleContainer.clientHeight);
            globeModuleRenderer.setClearColor(0x000000, 0); // Transparent background
            
            globeModuleContainer.appendChild(globeModuleRenderer.domElement);

            // --- UI/UX IMPROVEMENT: ADD ORBIT CONTROLS ---
            const controls = new THREE.OrbitControls(camera, globeModuleRenderer.domElement);
            controls.enableDamping = true; // Makes rotation smoother
            controls.dampingFactor = 0.05;
            controls.screenSpacePanning = false;
            controls.minDistance = 2.5; // Don't let user zoom in too far
            controls.maxDistance = 6;   // Don't let user zoom out too far
            controls.autoRotate = true; // Keep it spinning
            controls.autoRotateSpeed = 0.5; // Slower default spin
            // ---------------------------------------------

            // Adjusted lights for a realistic surface
            scene.add(new THREE.AmbientLight(0x222222)); // Less ambient
            const dirLight = new THREE.DirectionalLight(0xffffff, 1.2); // Brighter directional
            dirLight.position.set(5, 3, 5);
            scene.add(dirLight);

            const loader = new THREE.TextureLoader();
            
            // --- 1. The "Real" Earth ---
            const globeGeometry = new THREE.SphereGeometry(1.5, 64, 64);
            const globeMaterial = new THREE.MeshPhongMaterial({
                map: loader.load('https://raw.githubusercontent.com/tensorspace-team/tensorspace/master/assets/images/earth.png'),
                specularMap: loader.load('https://raw.githubusercontent.com/tensorspace-team/tensorspace/master/assets/images/specular.png'),
                specular: new THREE.Color(0x111111),
                emissiveMap: loader.load('https://raw.githubusercontent.com/tensorspace-team/tensorspace/master/assets/images/earth_night.jpg'),
                emissive: new THREE.Color(0xffffff),
                emissiveIntensity: 1.0
            });
            
            const globeModuleMesh = new THREE.Mesh(globeGeometry, globeMaterial); // This is the main Earth
            
            // Rotate to center India
            globeModuleMesh.rotation.y = -1.34; // approx 77° E
            globeModuleMesh.rotation.x = -0.35; // approx 20° N

            scene.add(globeModuleMesh);

            // --- 2. The Cloud Layer ---
            const cloudGeometry = new THREE.SphereGeometry(1.51, 64, 64); // Slightly larger
            const cloudMaterial = new THREE.MeshPhongMaterial({
                map: loader.load('https://raw.githubusercontent.com/tensorspace-team/tensorspace/master/assets/images/cloud.png'),
                transparent: true,
                opacity: 0.25,
                blending: THREE.AdditiveBlending
            });
            const globeCloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial); // Assign to global
            scene.add(globeCloudMesh);


            // --- 3. The Atmosphere Glow ---
            const glowGeometry = new THREE.SphereGeometry(1.55, 64, 64); // Slightly larger
            const glowMaterial = new THREE.ShaderMaterial({
                uniforms: { 
                    'c': { type: 'f', value: 0.4 }, // Softer glow
                    'p': { type: 'f', value: 3.0 }, // Less sharp
                },
                vertexShader: `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize( normalMatrix * normal );
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }
                `,
                fragmentShader: `
                    uniform float c;
                    uniform float p;
                    varying vec3 vNormal;
                    void main() {
                        float intensity = pow( c - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), p );
                        // Make atmosphere glow a realistic blue
                        gl_FragColor = vec4( 0.5, 0.8, 1.0, 1.0 ) * intensity * 0.8; 
                    }
                `,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                transparent: true
            });
            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            scene.add(glowMesh);

            camera.position.z = 3.5;

            const animateModule = () => {
                globeModuleAnimatorId = requestAnimationFrame(animateModule);
                
                // --- UI/UX IMPROVEMENT: UPDATE CONTROLS ---
                controls.update(); // This is crucial for smooth controls

                // We can let clouds rotate independently
                globeCloudMesh.rotation.y += 0.0002;
                
                globeModuleRenderer.render(scene, camera);
            };
            animateModule();

            // Handle window resize
            window.addEventListener('resize', () => {
                if(globeModuleRenderer && globeModuleContainer) { 
                    camera.aspect = globeModuleContainer.clientWidth / globeModuleContainer.clientHeight;
                    camera.updateProjectionMatrix();
                    globeModuleRenderer.setSize(globeModuleContainer.clientWidth, globeModuleContainer.clientHeight);
                }
            });
        } catch (e) {
            console.error("Error initializing Globe Module:", e);
            globeModuleContainer.innerHTML = "<p style='color: var(--color-alert);'>Error loading 3D Globe.</p>";
        }
    }
}