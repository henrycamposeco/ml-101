
import { useEffect, useRef } from 'preact/hooks';
import * as THREE from 'three';

export function BridgeScene({ color = '#66CC00', speed = 1 }: { color?: string, speed?: number }) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();

        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 2, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // Bridge
        const bridgeGeometry = new THREE.BoxGeometry(20, 1, 4);
        const bridgeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
            roughness: 0.2,
            metalness: 1
        });
        const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
        scene.add(bridge);

        // Grid helper for tech feel
        const gridHelper = new THREE.GridHelper(50, 50, 0xfefefe, 0xfefefe);
        gridHelper.position.y = -2;
        scene.add(gridHelper);

        // Particles System
        const particleCount = 100;
        const particles: { mesh: THREE.Sprite | THREE.Mesh, type: 'byte' | 'neuron', speed: number, offset: number }[] = [];

        // Textures for 0 and 1
        const createTextTexture = (text: string) => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const context = canvas.getContext('2d');
            if (context) {
                context.fillStyle = 'transparent'; // Transparent background
                context.fillRect(0, 0, 64, 64);
                context.font = 'bold 48px monospace';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillStyle = '#287e00ff'; // Matrix green
                context.fillText(text, 32, 32);
            }
            const texture = new THREE.CanvasTexture(canvas);
            return texture;
        };

        const texture0 = createTextTexture('0');
        const texture1 = createTextTexture('1');
        const neuronGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const neuronMaterial = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.5 });

        // Initial particle creation
        for (let i = 0; i < particleCount; i++) {
            const isZero = Math.random() > 0.5;
            const material = new THREE.SpriteMaterial({
                map: isZero ? texture0 : texture1,
                transparent: true,
                opacity: 0.8
            });
            const sprite = new THREE.Sprite(material);

            // Start at the beginning of the bridge
            const xStart = -10 + Math.random() * 5;
            sprite.position.set(xStart, 1.5, (Math.random() - 0.5) * 3);
            sprite.scale.set(0.8, 0.8, 0.8);

            scene.add(sprite);
            particles.push({
                mesh: sprite,
                type: 'byte',
                speed: 0.05 + Math.random() * 0.05,
                offset: Math.random() * 100 // Random offset for sine wave motion if needed
            });
        }

        // Neuron Group
        const neuronGroup = new THREE.Group();
        scene.add(neuronGroup);

        // Connections
        const lineMaterial = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
        const maxConnections = 100; // Limit lines for performance
        const linesGeometry = new THREE.BufferGeometry();
        // Initialize with max points, we'll update drawRange
        const positions = new Float32Array(maxConnections * 2 * 3);
        linesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const connectionLines = new THREE.LineSegments(linesGeometry, lineMaterial);
        connectionLines.frustumCulled = false; // Simplified culling
        scene.add(connectionLines);


        // Animation Loop
        let animationId: number;

        const animate = () => {
            animationId = requestAnimationFrame(animate);

            // Rotate scene slowly
            scene.rotation.y += 0.002 * speed;

            // Bridge subtle float
            bridge.position.y = Math.sin(Date.now() * 0.001) * 0.1;

            let neuronPositions: THREE.Vector3[] = [];

            particles.forEach((p) => {
                // Move forward
                p.mesh.position.x += p.speed * speed;

                // Check transformation point (middle of bridge, x=0)
                if (p.type === 'byte' && p.mesh.position.x > 0) {
                    // Transform to neuron
                    scene.remove(p.mesh);

                    const neuronMesh = new THREE.Mesh(neuronGeometry, neuronMaterial);
                    neuronMesh.position.copy(p.mesh.position);
                    scene.add(neuronMesh);

                    p.mesh = neuronMesh;
                    p.type = 'neuron';
                }

                // Neuron behavior
                if (p.type === 'neuron') {
                    // Rise up and spread out
                    p.mesh.position.y += 0.02 * speed;
                    p.mesh.position.z += (Math.random() - 0.5) * 0.05;
                    p.mesh.position.x += 0.01 * speed; // Keep moving forward slowly

                    // Collect position for lines
                    neuronPositions.push(p.mesh.position.clone());
                }

                // Reset logic
                if (p.mesh.position.x > 12 || p.mesh.position.y > 8) {
                    // Reset to start as byte
                    if (p.type === 'neuron') {
                        scene.remove(p.mesh);
                        // Recreate sprite
                        const isZero = Math.random() > 0.5;
                        const material = new THREE.SpriteMaterial({
                            map: isZero ? texture0 : texture1,
                            transparent: true,
                            opacity: 0.8
                        });
                        const sprite = new THREE.Sprite(material);
                        p.mesh = sprite;
                        scene.add(p.mesh);
                    }

                    p.type = 'byte';
                    p.mesh.position.set(-10, 1.5, (Math.random() - 0.5) * 3);

                    // Ensure it is a sprite again if not already (safeguard)
                    if (p.mesh instanceof THREE.Mesh) {
                        // Should have been handled above, but just in case
                    } else {
                        (p.mesh as THREE.Sprite).scale.set(0.8, 0.8, 0.8);
                    }
                }
            });

            // Update connections
            let lineIndex = 0;
            // Connect nearby neurons
            for (let i = 0; i < neuronPositions.length; i++) {
                for (let j = i + 1; j < neuronPositions.length; j++) {
                    const dist = neuronPositions[i].distanceTo(neuronPositions[j]);
                    if (dist < 3 && lineIndex < maxConnections) {
                        positions[lineIndex * 6] = neuronPositions[i].x;
                        positions[lineIndex * 6 + 1] = neuronPositions[i].y;
                        positions[lineIndex * 6 + 2] = neuronPositions[i].z;
                        positions[lineIndex * 6 + 3] = neuronPositions[j].x;
                        positions[lineIndex * 6 + 4] = neuronPositions[j].y;
                        positions[lineIndex * 6 + 5] = neuronPositions[j].z;
                        lineIndex++;
                    }
                }
            }
            connectionLines.geometry.setDrawRange(0, lineIndex * 2);
            connectionLines.geometry.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        };
        animate();

        // Resize
        const handleResize = () => {
            if (!mountRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            // Dispose geometries and materials if needed
        };
    }, [color, speed]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '300px' }} />;
}
