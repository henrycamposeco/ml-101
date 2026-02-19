
import { useEffect, useRef } from 'preact/hooks';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Props {
    color?: string;
    speed?: number;
}

export function ProgrammingParadigmScene({ color = '#4B286D', speed = 1 }: Props) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationIdRef = useRef<number>(0);

    useEffect(() => {
        if (!mountRef.current) return;

        // Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        sceneRef.current = scene;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 30);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enableRotate = false; // Keep it 2D-ish for clarity
        controls.enableZoom = false;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        // --- SCENE ELEMENTS ---

        // Helper to create text
        const createLabel = (text: string, x: number, y: number, colorHex: string) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = 512;
                canvas.height = 128;
                ctx.fillStyle = 'rgba(0,0,0,0)';
                ctx.fillRect(0, 0, 512, 128);
                ctx.font = 'Bold 40px Arial';
                ctx.fillStyle = colorHex;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, 256, 64);
            }
            const tex = new THREE.CanvasTexture(canvas);
            const mat = new THREE.SpriteMaterial({ map: tex });
            const sprite = new THREE.Sprite(mat);
            sprite.scale.set(6, 1.5, 1);
            sprite.position.set(x, y, 0);
            scene.add(sprite);
            return sprite;
        };

        createLabel("Traditional", -8, 8, "#888888");
        createLabel("Machine Learning", 8, 8, "#66CC00");

        // --- SHARED GEOMETRY ---
        const ballGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const gateGeo = new THREE.BoxGeometry(3, 0.5, 0.5);

        // --- SYSTEMS ---

        class ParadigmSystem {
            offsetX: number;
            color: string;
            isML: boolean;

            balls: { mesh: THREE.Mesh, vel: THREE.Vector3, active: boolean }[] = [];
            gates: { mesh: THREE.Mesh, angle: number, targetAngle: number, randomAngle?: number | null }[] = [];
            targetBox: THREE.Mesh;

            constructor(offsetX: number, color: string, isML: boolean) {
                this.offsetX = offsetX;
                this.color = color;
                this.isML = isML;

                // Create Target Box (Bin)
                const boxGeo = new THREE.BoxGeometry(4, 1, 1);
                const boxMat = new THREE.MeshStandardMaterial({ color: color });
                this.targetBox = new THREE.Mesh(boxGeo, boxMat);
                this.targetBox.position.set(offsetX, -8, 0);
                scene.add(this.targetBox);

                // Create Gates/Rules
                // 3 levels of gates
                for (let i = 0; i < 3; i++) {
                    const gateMat = new THREE.MeshStandardMaterial({ color: '#cccccc' });
                    const gate = new THREE.Mesh(gateGeo, gateMat);
                    gate.position.set(offsetX + (Math.random() - 0.5) * 2, 4 - i * 4, 0); // Staggered Y

                    // Initial Angles
                    // Trad: Fixed to funnel to center
                    // ML: Random initially
                    let angle = 0;
                    if (!isML) {
                        // Funnel logic: if gate is left of center, tilt right (negative Z rotation)
                        // if gate is right, tilt left.
                        // Actually let's just zig zag.
                        angle = (i % 2 === 0) ? Math.PI / 6 : -Math.PI / 6;
                    } else {
                        angle = (Math.random() - 0.5) * Math.PI; // Random chaos
                    }

                    gate.rotation.z = angle;
                    scene.add(gate);

                    this.gates.push({
                        mesh: gate,
                        angle: angle,
                        targetAngle: (i % 2 === 0) ? Math.PI / 6 : -Math.PI / 6 // Optimal angle
                    });
                }
            }

            spawnBall() {
                const mat = new THREE.MeshStandardMaterial({ color: this.color });
                const ball = new THREE.Mesh(ballGeo, mat);
                // Spawn at top, somewhat random X
                ball.position.set(this.offsetX + (Math.random() - 0.5) * 2, 9, 0);
                scene.add(ball);

                this.balls.push({
                    mesh: ball,
                    vel: new THREE.Vector3(0, 0, 0),
                    active: true
                });
            }

            update(delta: number, time: number) {
                // Spawn Logic
                if (Math.random() < 0.05 * speed) this.spawnBall();

                // Gate Logic (ML Training)
                if (this.isML) {
                    // Oscillate between chaos and order to show "learning"
                    // Cycle every 8 seconds
                    const cycle = (time % 3000) / 3000;

                    this.gates.forEach(g => {
                        // First half: Random/Chaotic (High Error)
                        // Second half: Converging to Target (Low Error)

                        let currentTarget = g.targetAngle;
                        if (cycle < 0.2) {
                            // Reset to random
                            if (!g.randomAngle) g.randomAngle = (Math.random() - 0.5) * Math.PI;
                            currentTarget = g.randomAngle;
                        } else if (cycle > 0.8) {
                            g.randomAngle = null; // Clear for next cycle
                        }

                        // Lerp towards current target
                        g.mesh.rotation.z += (currentTarget - g.mesh.rotation.z) * delta * 2;
                    });
                } else {
                    // Traditional: Fixed rules
                    // this.gates.forEach(g => {
                    //    g.mesh.rotation.z = g.angle + Math.sin(time * 0.005) * 0.05;
                    // });
                }

                // Ball Physics
                for (let i = this.balls.length - 1; i >= 0; i--) {
                    const b = this.balls[i];
                    if (!b.active) continue;

                    // Gravity
                    b.vel.y -= 0.01 * speed;

                    // Friction/Air resistance
                    b.vel.x *= 0.99;

                    // Move
                    b.mesh.position.add(b.vel.clone().multiplyScalar(speed));

                    // Collision with Gates
                    this.gates.forEach(gate => {
                        // Simple Box collision
                        // Transform ball pos to gate local space
                        const localPos = b.mesh.position.clone().sub(gate.mesh.position);
                        localPos.applyEuler(new THREE.Euler(0, 0, -gate.mesh.rotation.z)); // Rotate inverse

                        // Gate size is 3 x 0.5
                        if (Math.abs(localPos.x) < 1.6 && Math.abs(localPos.y) < 0.4) {
                            // Hit!
                            // Deflect based on gate angle + bounce

                            // Normal vector in world space:
                            // Gate is rotated by Z. Normal is (0, 1, 0) rotated by Z.
                            // Actually normal depends on which side? Assume top hit.

                            const normal = new THREE.Vector3(0, 1, 0).applyEuler(gate.mesh.rotation);

                            // Reflect velocity
                            // v = v - 2 * (v . n) * n
                            const vButton = b.vel.clone();
                            const dot = vButton.dot(normal);

                            if (dot < 0) { // Only bounce if moving into surface
                                const reflect = normal.multiplyScalar(2 * dot);
                                b.vel.sub(reflect);
                                b.vel.multiplyScalar(0.6); // Energy loss

                                // Push out to avoid sticking
                                b.mesh.position.add(normal.multiplyScalar(0.1));
                            }
                        }
                    });

                    // Floor / Bin check
                    if (b.mesh.position.y < -8) {
                        // Check if in bin
                        if (Math.abs(b.mesh.position.x - this.offsetX) < 2) {
                            // Caught
                        }

                        // Kill ball
                        if (b.mesh.position.y < -12) {
                            scene.remove(b.mesh);
                            this.balls.splice(i, 1);
                        }
                    }
                }
            }
        }

        const sysTrad = new ParadigmSystem(-8, '#888888', false);
        const sysML = new ParadigmSystem(8, '#66CC00', true);


        const animate = (time: number) => {
            animationIdRef.current = requestAnimationFrame(animate);
            controls.update();

            sysTrad.update(0.016, time);
            sysML.update(0.016, time);

            renderer.render(scene, camera);
        };
        requestAnimationFrame(animate);

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
