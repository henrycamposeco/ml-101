
import { useEffect, useRef } from 'preact/hooks';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Props {
    color?: string;
    speed?: number;
}

export function AiLandscapeScene({ color = '#4B286D', speed = 1 }: Props) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationIdRef = useRef<number>(0);

    useEffect(() => {
        if (!mountRef.current) return;

        // 1. Setup Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        sceneRef.current = scene;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 5, 15);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        // --- DOLL CREATION HELPER ---
        const createDoll = (size: number, colorHex: string, text: string) => {
            const group = new THREE.Group();

            // Materials
            const material = new THREE.MeshStandardMaterial({
                color: colorHex,
                roughness: 0.3,
                metalness: 0.1
            });

            // Dimensions
            const radius = size * 0.5;
            const height = size * 1.2;
            const cylinderHeight = height - (2 * radius); // middle part

            // --- BOTTOM HALF ---
            const bottomGroup = new THREE.Group();

            // Bottom Hemisphere
            const bottomSphereGeo = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
            const bottomSphere = new THREE.Mesh(bottomSphereGeo, material);
            bottomSphere.position.y = -cylinderHeight / 2;

            // Bottom Cylinder (Hollow-ish look simulated by separate top/bottom)
            const bottomCylGeo = new THREE.CylinderGeometry(radius, radius, cylinderHeight / 2, 32);
            const bottomCyl = new THREE.Mesh(bottomCylGeo, material);
            bottomCyl.position.y = -cylinderHeight / 4;

            bottomGroup.add(bottomSphere);
            bottomGroup.add(bottomCyl);

            // --- TOP HALF ---
            const topGroup = new THREE.Group();

            // Top Hemisphere
            const topSphereGeo = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const topSphere = new THREE.Mesh(topSphereGeo, material);
            topSphere.position.y = cylinderHeight / 2;

            // Top Cylinder
            const topCylGeo = new THREE.CylinderGeometry(radius, radius, cylinderHeight / 2, 32);
            const topCyl = new THREE.Mesh(topCylGeo, material);
            topCyl.position.y = cylinderHeight / 4;

            topGroup.add(topSphere);
            topGroup.add(topCyl);

            group.add(bottomGroup);
            group.add(topGroup);

            // --- LABEL ---
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = 512;
                canvas.height = 128;
                context.fillStyle = 'rgba(0,0,0,0)'; // Transparent bg
                context.fillRect(0, 0, 512, 128);
                context.font = 'Bold 48px Arial';
                context.fillStyle = '#4B286D';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(text, 256, 90);
            }
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(4, 1, 1);
            sprite.position.y = height + 0.5; // Above the doll
            group.add(sprite);

            // Store sprite ref
            return { group, topGroup, bottomGroup, size, height, sprite };
        };

        // --- SETUP DOLLS ---
        // Data: [Size, Color, Label]
        const dollData = [
            { size: 3.0, color: '#4B286D', label: 'Artificial Intelligence' }, // Purple
            { size: 2.4, color: '#66CC00', label: 'Machine Learning' },      // Green
            { size: 1.8, color: '#FFD700', label: 'Deep Learning' },         // Gold
            { size: 1.3, color: '#FF6B6B', label: 'Neural Networks' },       // Red
            { size: 0.9, color: '#4ECDC4', label: 'Generative AI (GPT)' }    // Teal
        ];

        const dolls: any[] = [];

        dollData.forEach((d, i) => {
            const dollObj = createDoll(d.size, d.color, d.label);
            scene.add(dollObj.group);

            // Initial state: All centered at origin (nested)
            dollObj.group.position.set(0, -d.size / 2, 0); // Sit on "floor" approx (origin y=0 is center, so move down)
            dollObj.group.position.y = (d.size * 1.2) / 2 - 1.5; // Offset down a bit for camera view

            // Visibility: Only first doll starts visible
            dollObj.sprite.visible = (i === 0);

            // Add to list
            dolls.push(dollObj);
        });

        // Floor (optional)
        const floorGeo = new THREE.PlaneGeometry(30, 10);
        const floorMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1.5;
        scene.add(floor);


        // --- ANIMATION STATE ---
        let phase = 'initial-wait'; // 'initial-wait', 'unpack', 'wait', 'pack'
        let currentLevel = 0; // Which doll is currently moving out
        let progress = 0; // 0 to 1 for current movement
        const maxLevel = dollData.length - 1;
        let waitTime = 0;

        // Calculate final X positions
        const spacing = 3;
        const totalWidth = spacing * maxLevel;
        const startX = -totalWidth / 2;

        // Force initial positions
        dolls.forEach(d => {
            d.group.position.x = startX;
        });

        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            controls.update();

            // Animation Logic
            // speed factor
            const delta = 0.01 * speed;

            if (phase === 'initial-wait') {
                waitTime += delta;
                // Gentle bobbing
                dolls[0].group.position.y = (dolls[0].size * 1.2) / 2 - 1.5 + Math.sin(Date.now() * 0.002) * 0.05;

                if (waitTime > 2) { // 2 seconds (approx, depending on speed)
                    phase = 'unpack';
                    waitTime = 0;
                }
            }
            else if (phase === 'unpack') {
                if (currentLevel < maxLevel) {
                    // Animate Doll[currentLevel] OPENING and Doll[currentLevel+1] JUMPING OUT
                    progress += delta;

                    const parent = dolls[currentLevel];
                    const child = dolls[currentLevel + 1];

                    if (progress < 0.3) {
                        // Phase A: Lift Top
                        const p = progress / 0.3; // 0-1
                        // Max lift
                        parent.topGroup.position.y = THREE.MathUtils.lerp(0, parent.size * 0.5, p);
                        parent.topGroup.rotation.z = THREE.MathUtils.lerp(0, Math.PI / 8, p);
                    }
                    else if (progress < 0.8) {
                        // Phase B: Child Jumps Out
                        const p = (progress - 0.3) / 0.5; // 0-1

                        // Parabolic arc for jump
                        // Start X = parent.x
                        // End X = parent.x + spacing
                        const startXPos = parent.group.position.x;
                        const endXPos = startXPos + spacing;

                        const currentX = THREE.MathUtils.lerp(startXPos, endXPos, p);
                        // Jump height (sine wave)
                        const jumpH = Math.sin(p * Math.PI) * 2.0;

                        // Child Y base
                        const BaseY = (child.size * 1.2) / 2 - 1.5;

                        child.group.position.x = currentX;
                        child.group.position.y = BaseY + jumpH;

                        // Rotate child for fun while jumping
                        child.group.rotation.z = -Math.sin(p * Math.PI) * 0.2;
                    }
                    else if (progress < 1.0) {
                        // Phase C: Landed

                        // Show label when landed
                        child.sprite.visible = true;

                        // Stabilize child
                        const startXPos = parent.group.position.x;
                        const endXPos = startXPos + spacing;
                        const BaseY = (child.size * 1.2) / 2 - 1.5;
                        child.group.position.x = endXPos;
                        child.group.position.y = BaseY;
                        child.group.rotation.z = 0;
                    }
                    else {
                        // Next level
                        currentLevel++;
                        progress = 0;
                    }
                } else {
                    // All unpacked
                    phase = 'wait';
                    waitTime = 0;
                }
            }
            else if (phase === 'wait') {
                waitTime += delta;
                // Bobbing animation for all dolls
                dolls.forEach((d, i) => {
                    const BaseY = (d.size * 1.2) / 2 - 1.5;
                    d.group.position.y = BaseY + Math.sin(Date.now() * 0.002 + i) * 0.05;
                });

                if (waitTime > 3) { // Wait ~3 seconds (relative to speed)
                    phase = 'pack';
                    currentLevel = maxLevel - 1; // Start packing from second to last (it swallows last)
                    progress = 0;
                }
            }
            else if (phase === 'pack') {
                if (currentLevel >= 0) {
                    // Reverse of unpack
                    progress += delta;

                    const parent = dolls[currentLevel];
                    const child = dolls[currentLevel + 1];

                    // 1. Child Jumps IN (Reverse of Phase B)
                    // 2. Parent Closes (Reverse of Phase A)

                    if (progress < 0.5) {
                        // Child Jumps Back
                        const p = progress / 0.5;

                        // Hide label when starting to jump back
                        child.sprite.visible = false;

                        const startXPos = parent.group.position.x + spacing; // current child pos
                        const endXPos = parent.group.position.x; // target (parent)

                        const currentX = THREE.MathUtils.lerp(startXPos, endXPos, p);
                        const jumpH = Math.sin(p * Math.PI) * 2.0;


                        // Move child AND all nested children
                        for (let k = currentLevel + 1; k < dolls.length; k++) {
                            const d = dolls[k];
                            const dBaseY = (d.size * 1.2) / 2 - 1.5;
                            d.group.position.x = currentX;
                            d.group.position.y = dBaseY + jumpH;
                        }
                    }
                    else if (progress < 0.8) {
                        // Ensure child is hidden/inside


                        // Snap all nested children to parent position
                        for (let k = currentLevel + 1; k < dolls.length; k++) {
                            const d = dolls[k];
                            const dBaseY = (d.size * 1.2) / 2 - 1.5;
                            d.group.position.x = parent.group.position.x;
                            d.group.position.y = dBaseY;
                        }

                        // Close Top
                        const p = (progress - 0.5) / 0.3;
                        // going from Open to Closed
                        // Open was: y = size*0.8, rot = PI/8
                        // Closed is: y = 0, rot = 0
                        parent.topGroup.position.y = THREE.MathUtils.lerp(parent.size * 0.8, 0, p);
                        parent.topGroup.rotation.z = THREE.MathUtils.lerp(Math.PI / 8, 0, p);
                    }
                    else {
                        // Done with this level
                        currentLevel--;
                        progress = 0;
                    }

                } else {
                    // All packed
                    phase = 'initial-wait'; // Loop forever but go to initial wait
                    waitTime = 0; // Reset wait time
                    currentLevel = 0;
                    progress = 0;
                }
            }

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationIdRef.current);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [color, speed]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}
