
import { useEffect, useRef } from 'preact/hooks';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Props {
    color?: string;
    speed?: number;
}

export function GradientDescentScene({ color = '#4B286D', speed = 1 }: Props) {
    const mountRef = useRef<HTMLDivElement>(null);

    // Scene Refs
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const ballRef = useRef<THREE.Mesh | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const animationIdRef = useRef<number>(0);

    // State for animation
    const timeRef = useRef(0);

    useEffect(() => {
        if (!mountRef.current) return;

        // 1. Setup Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        sceneRef.current = scene;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(9, 9, 2);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controlsRef.current = controls;

        // 2. Create Objects

        // --- GRID / PLANE (w-b plane) ---
        const grid = new THREE.GridHelper(10, 10, 0x888888, 0xeeeeee);
        scene.add(grid);

        // --- AXES ---
        // Y is Error (Cost), X is w, Z is b
        const axesHelper = new THREE.AxesHelper(5);
        // Custom colors for axes if needed, but default RGB=XYZ is fine.
        scene.add(axesHelper);

        // Create Labels (Sprites) - Helper function
        const createLabel = (text: string, position: THREE.Vector3, color: string = '#000000') => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 128; // Rectangular aspect ratio for better text fitting
            if (context) {
                context.font = 'Bold 60px Arial';
                context.fillStyle = color;
                context.textAlign = 'center';
                context.textBaseline = 'middle'; // Center text vertically
                context.fillText(text, 128, 64);
            }
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.copy(position);
            sprite.scale.set(2, 1, 1);
            return sprite;
        };

        scene.add(createLabel('Error', new THREE.Vector3(0, 5.5, 0), '#ff0000'));
        scene.add(createLabel('w', new THREE.Vector3(5.5, 0, 0), '#4B286D'));
        scene.add(createLabel('b', new THREE.Vector3(0, 0, 5.5), '#66CC00'));


        // --- BOWL (Paraboloid) ---
        // Shape: y = 0.1 * (x^2 + z^2)
        const geometry = new THREE.PlaneGeometry(10, 10, 32, 32);
        const posAttribute = geometry.attributes.position;
        for (let i = 0; i < posAttribute.count; i++) {
            const x = posAttribute.getX(i);
            const z = posAttribute.getY(i); // Plane is initially X-Y, we rotate it later? No, Plane is X-Y.
            // Let's keep it X-Y and rotate -90 deg X to make it X-Z.
            // Vertex displacement: z (local) becomes height (y world).
            // Actually, easier to manually set positions or rotate mesh carefully.
            // Let's assume standard Plane X-Y, and we map Y (height) to Z displacement?
            // Wait, for PlaneGeometry:
            // vertices are (x, y, 0).
            // We want (x, height, z).
            // Let's modify z based on x and y.
            // z = 0.15 * (x^2 + y^2)
            const h = 0.15 * (x * x + z * z);
            posAttribute.setZ(i, h);
        }
        geometry.computeVertexNormals();

        // Rotate so it opens UPWARDS (Local Z is height, so -90 deg X rotation puts Z up? YES.)
        const bowlMaterial = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const bowl = new THREE.Mesh(geometry, bowlMaterial);
        bowl.rotation.x = -Math.PI / 2; // Position flat
        scene.add(bowl);


        // --- BALL (Gradient Descent Agent) ---
        const ballGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const ballMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Start Red
        const ball = new THREE.Mesh(ballGeo, ballMat);
        scene.add(ball);
        ballRef.current = ball;

        // --- BEST FIT AREA ---
        // A small green circle at the bottom (0,0,0)
        const bestFitGeo = new THREE.CircleGeometry(0.5, 32);
        const bestFitMat = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const bestFit = new THREE.Mesh(bestFitGeo, bestFitMat);
        bestFit.rotation.x = -Math.PI / 2;
        bestFit.position.y = 0.01; // Just above grid
        scene.add(bestFit);


        // 3. Animation Loop
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            controls.update();

            // Animate Ball
            // Parametric spiral path inward
            // Radius r shrinks over time. Angle theta increases.
            // y = 0.15 * r^2

            timeRef.current += 0.01 * speed;
            if (timeRef.current > 4) timeRef.current = 0; // Loop every ~4s (depends on speed)

            // r goes from 4 to 0
            // Let's make it loop seamlessly?
            // r = 4 * (1 - t/T)
            // t goes 0 -> 1
            const duration = 300; // frames roughly
            const t = (Date.now() % (duration * 20)) / (duration * 20); // 0 to 1 loop
            // Actually let's use a nice easing
            // Spiral
            const maxRadius = 4.5;
            const r = maxRadius * (1 - t);
            const theta = t * 10 * Math.PI; // 5 full rotations

            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            const y = 0.15 * (x * x + z * z);

            if (ballRef.current) {
                ballRef.current.position.set(x, y + 0.3, z); // +0.3 radius offset

                // Color Logic
                const dist = Math.sqrt(x * x + z * z);
                if (dist < 0.6) {
                    (ballRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00); // Green
                } else {
                    (ballRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xff0000); // Red
                }
            }

            renderer.render(scene, camera);
        };
        animate();

        // 4. Cleanup
        const handleResize = () => {
            if (!mountRef.current || !camera || !renderer) return;
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
            geometry.dispose();
            bowlMaterial.dispose();
            ballGeo.dispose();
            ballMat.dispose();
        };
    }, [color, speed]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

            {/* Caption Overlay */}
            <div className="glass-card" style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '15px',
                maxWidth: '250px',
                fontSize: '0.8rem',
                zIndex: 5,
                background: 'rgba(255, 255, 255, 0.9)'
            }}>
                <h4 style={{ marginBottom: '5px', color: '#4B286D' }}>Cost Function (J)</h4>
                <p style={{ marginBottom: '10px' }}>Minimizing Error by adjusting weights (w) and bias (b).</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                    <div style={{ width: '10px', height: '10px', background: 'red', borderRadius: '50%' }}></div>
                    <span>High Cost</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', background: 'green', borderRadius: '50%' }}></div>
                    <span>Optimal (Best Fit)</span>
                </div>
            </div>
        </div>
    );
}
