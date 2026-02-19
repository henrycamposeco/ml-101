
import * as THREE from 'three';
import { BaseRotatingScene } from './BaseRotatingScene';

export function SphereScene({ color = '#4B286D' }: { color?: string }) {
    return <BaseRotatingScene color={color} speed={1} createMesh={(color) => {
        const geometry = new THREE.SphereGeometry(2, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: 0.6 });
        return new THREE.Mesh(geometry, material);
    }} />;
}
