
import { useEffect, useRef } from 'preact/hooks';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Props {
    color?: string;
    speed?: number;
}

export function EquationScene({ color = '#4B286D' }: Props) {
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
        camera.position.set(0, 0, 20);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enableRotate = true;
        controls.enableZoom = false;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        // --- HELPER to create text sprites ---
        // --- HELPER to create text sprites ---
        const createText = (text: string, colorHex: string, size: number = 1, fontSize: number = 200, canvasWidth: number = 512) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // High res canvas
                canvas.width = canvasWidth;
                canvas.height = 512;
                ctx.fillStyle = 'rgba(0,0,0,0)';
                ctx.fillRect(0, 0, canvasWidth, 512);

                ctx.font = `Bold ${fontSize}px Arial`; // Variable font size
                ctx.fillStyle = colorHex;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, canvasWidth / 2, 256);
            }
            const tex = new THREE.CanvasTexture(canvas);
            const mat = new THREE.SpriteMaterial({ map: tex });
            const sprite = new THREE.Sprite(mat);
            // Adjust aspect ratio based on canvas width
            const aspect = canvasWidth / 512;
            sprite.scale.set(size * aspect, size, 1);
            return sprite;
        };

        // Equation: y = wx + b
        // Colors:
        // y: #260b52ff (Teal - Output)
        // =: #888888
        // w: #FF6B6B (Red - Weight)
        // x: #888888 (Input)
        // +: #888888
        // b: #FFD700 (Gold - Bias)

        const group = new THREE.Group();
        scene.add(group);

        // Equalizer sizing
        const sizeEq = 4;
        const fontEq = 250;

        const sY = createText("y", "#260b52ff", sizeEq, fontEq);
        sY.position.x = -6;
        group.add(sY);

        const sEq = createText("=", "#555", sizeEq, fontEq);
        sEq.position.x = -3;
        group.add(sEq);

        const sW = createText("w", "#971748ff", sizeEq + 1, 300); // Emphasize w
        sW.position.x = 0;
        group.add(sW);

        const sX = createText("x", "#555", sizeEq, fontEq);
        sX.position.x = 3;
        group.add(sX);

        const sPlus = createText("+", "#555", sizeEq, fontEq);
        sPlus.position.x = 5.5;
        group.add(sPlus);

        const sB = createText("b", "#fc8f00ff", sizeEq + 1, 300); // Emphasize b
        sB.position.x = 8;
        group.add(sB);

        // Labels underneath (smaller font)
        const sizeLbl = 2.5;
        const fontLbl = 80; // Smaller internal font resolution

        const lY = createText("Output", "#260b52ff", sizeLbl, fontLbl, 1024); // Wider canvas for text
        lY.position.set(-6, -2.5, 0);
        group.add(lY);

        const lx = createText("Input", "#555", sizeLbl, fontLbl, 1024); // Wider canvas for text
        lx.position.set(3, -2.5, 0);
        group.add(lx);

        const lW = createText("Weight", "#971748ff", sizeLbl, fontLbl, 1024);
        lW.position.set(0, -3.0, 0); // Slightly lower
        group.add(lW);

        const lB = createText("Bias", "#fc8f00ff", sizeLbl, fontLbl, 1024);
        lB.position.set(8, -3.0, 0);
        group.add(lB);

        // Floating animation
        const animate = (time: number) => {
            animationIdRef.current = requestAnimationFrame(animate);
            controls.update();

            // Bobbing parts
            const t = time * 0.002;
            sW.position.y = Math.sin(t) * 0.5;
            lW.position.y = -3.5 + Math.sin(t) * 0.5;

            sB.position.y = Math.sin(t + 1) * 0.5;
            lB.position.y = -3.5 + Math.sin(t + 1) * 0.5;

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
    }, []);

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}
