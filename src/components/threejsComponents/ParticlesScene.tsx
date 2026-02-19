
import * as THREE from 'three';
import { BaseRotatingScene } from './BaseRotatingScene';

export function ParticlesScene({ color = '#4B286D' }: { color?: string }) {
    return <BaseRotatingScene color={color} speed={1} createMesh={(color) => {
        const geometry = new THREE.BufferGeometry();
        const count = 1000;
        const posArray = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const material = new THREE.PointsMaterial({ size: 0.05, color: color });
        return new THREE.Points(geometry, material);
    }} />;
}
