
import { useEffect, useRef } from 'preact/hooks';
import * as THREE from 'three';

export interface BaseSceneProps {
    color: string;
    speed: number;
    createMesh: (color: THREE.Color) => THREE.Object3D;
}

export function BaseRotatingScene({ color, speed, createMesh }: BaseSceneProps) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 5;

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

        const pointLight2 = new THREE.PointLight(color, 2, 50);
        pointLight2.position.set(-5, -5, 5);
        scene.add(pointLight2);

        // Create Mesh using provided function
        const geometryColor = new THREE.Color(color);
        const mesh = createMesh(geometryColor);
        scene.add(mesh);

        // Animation Loop
        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            if (mesh) {
                mesh.rotation.x += 0.005 * speed;
                mesh.rotation.y += 0.01 * speed;
            }

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
            if (mesh instanceof THREE.Mesh) {
                mesh.geometry.dispose();
                // mesh.material.dispose();
            }
            renderer.dispose();
        };
    }, [color, speed]); // Run when props change

    return <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '300px' }} />;
}
