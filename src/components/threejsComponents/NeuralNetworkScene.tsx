
import * as THREE from 'three';
import { BaseRotatingScene } from './BaseRotatingScene';

export function NeuralNetworkScene({ color = '#4B286D' }: { color?: string }) {
    return <BaseRotatingScene color={color} speed={0.1} createMesh={(color) => {
        // Create a Group for the network
        const networkGroup = new THREE.Group();
        const nodeCount = 40;
        const nodePositions: THREE.Vector3[] = [];
        const nodeGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const nodeMat = new THREE.MeshBasicMaterial({ color: color });

        for (let i = 0; i < nodeCount; i++) {
            const node = new THREE.Mesh(nodeGeo, nodeMat);
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 10;
            const z = (Math.random() - 0.5) * 10;
            node.position.set(x, y, z);
            nodePositions.push(node.position);
            networkGroup.add(node);
        }

        // Connections
        const linePositions = [];
        const lineMat = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2
        });

        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (nodePositions[i].distanceTo(nodePositions[j]) < 3.5) {
                    linePositions.push(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z);
                    linePositions.push(nodePositions[j].x, nodePositions[j].y, nodePositions[j].z);
                }
            }
        }

        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        networkGroup.add(lines);

        return networkGroup;
    }} />;
}
