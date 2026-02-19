
import * as THREE from 'three';
import { BaseRotatingScene } from './BaseRotatingScene';

export function CubeScene({ color = '#4B286D' }: { color?: string }) {
    return <BaseRotatingScene color={color} speed={1} createMesh={(color) => {
        const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
        const material = new THREE.MeshPhysicalMaterial({
            color: color,
            metalness: 0.2,
            roughness: 0.1,
            transmission: 0.6,
            thickness: 1.0,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        return new THREE.Mesh(geometry, material);
    }} />;
}
