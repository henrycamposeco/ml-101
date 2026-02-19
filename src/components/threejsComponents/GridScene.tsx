
import * as THREE from 'three';
import { BaseRotatingScene } from './BaseRotatingScene';

export function GridScene({ color = '#4B286D' }: { color?: string }) {
    return <BaseRotatingScene color={color} speed={1} createMesh={(color) => {
        const grid = new THREE.GridHelper(10, 20, color, color);
        grid.rotation.x = Math.PI / 4;
        return grid;
    }} />;
}
