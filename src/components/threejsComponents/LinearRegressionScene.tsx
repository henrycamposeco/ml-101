
import { useEffect, useRef, useState, useMemo } from 'preact/hooks';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Props {
    color?: string;
    speed?: number;
}

export function LinearRegressionScene({ color = '#4B286D' }: Props) {
    const mountRef = useRef<HTMLDivElement>(null);

    // State
    const [slope, setSlope] = useState(1);
    const [intercept, setIntercept] = useState(0);
    const [showLine, setShowLine] = useState(true);
    const [showErrors, setShowErrors] = useState(false);
    const [showPoints, setShowPoints] = useState(true);
    const [showOverfitting, setShowOverfitting] = useState(false);
    const [mse, setMse] = useState(0);

    // Refs for Three.js objects to avoid re-creating scene
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

    const regressionLineRef = useRef<THREE.Mesh | null>(null);
    const errorLinesRef = useRef<THREE.LineSegments | null>(null);
    const overfitLineRef = useRef<THREE.Mesh | null>(null);
    const pointsMeshRef = useRef<THREE.Points | null>(null);
    const animationIdRef = useRef<number>(0);

    // Generate data once
    const dataPoints = useMemo(() => {
        const points: { x: number; y: number }[] = [];
        for (let i = -5; i <= 5; i += 1) {
            const noise = (Math.random() - 0.5) * 3;
            points.push({ x: i, y: i + noise });
        }
        return points;
    }, []);

    // 1. Initialize Scene (Run once)
    useEffect(() => {
        if (!mountRef.current) return;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 15);
        // Shift camera left so the graph appears to the right
        camera.position.x = -3;
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enableZoom = false;
        controlsRef.current = controls;

        // Axes & Grid
        const axesHelper = new THREE.AxesHelper(6);
        scene.add(axesHelper);
        const grid = new THREE.GridHelper(12, 12, 0x888888, 0xefefef);
        grid.rotation.x = Math.PI / 2;
        scene.add(grid);

        // Points (Geometry constant, visibility toggles)
        const pointsGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(dataPoints.length * 3);
        dataPoints.forEach((p, i) => {
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = 0;
        });
        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pointsMaterial = new THREE.PointsMaterial({
            color: color,
            size: 0.4,
            transparent: true,
            opacity: 1
        });
        const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
        scene.add(pointsMesh);
        pointsMeshRef.current = pointsMesh;

        // Regression Line (Mesh for thickness)
        // Cylinder aligned to Y axis by default. We will rotate it.
        // Radius = 0.08 units
        const lineGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
        const lineMaterial = new THREE.MeshBasicMaterial({ color: '#ff4757' });
        const regressionLine = new THREE.Mesh(lineGeometry, lineMaterial);
        scene.add(regressionLine);
        regressionLineRef.current = regressionLine;

        // Error Lines (Geometry updates)
        const errorLinesGeometry = new THREE.BufferGeometry();
        const errorPositions = new Float32Array(dataPoints.length * 2 * 3);
        errorLinesGeometry.setAttribute('position', new THREE.BufferAttribute(errorPositions, 3));
        const errorMaterial = new THREE.LineDashedMaterial({
            color: '#ff0000',
            dashSize: 0.2,
            gapSize: 0.1,
            transparent: true,
            opacity: 0.8
        });
        const errorLines = new THREE.LineSegments(errorLinesGeometry, errorMaterial);
        scene.add(errorLines);
        errorLinesRef.current = errorLines;

        // Overfitting Curve (TubeGeometry for thickness)
        const sortedPoints = [...dataPoints].sort((a, b) => a.x - b.x);
        const curveVectors = sortedPoints.map(p => new THREE.Vector3(p.x, p.y, 0));
        const curve = new THREE.CatmullRomCurve3(curveVectors, false, 'catmullrom', 0.5);
        // Tube: path, segments, radius, radialSegments, closed
        const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.05, 8, false);
        const tubeMaterial = new THREE.MeshBasicMaterial({ color: '#ffa500' });
        const overfitLine = new THREE.Mesh(tubeGeometry, tubeMaterial);
        overfitLine.visible = false;
        scene.add(overfitLine);
        overfitLineRef.current = overfitLine;

        // Animation Loop
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Resize
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
            pointsGeometry.dispose();
            pointsMaterial.dispose();
            lineGeometry.dispose();
            lineMaterial.dispose();
            errorLinesGeometry.dispose();
            errorMaterial.dispose();
        };
    }, []); // Run only ONCE


    // 2. Update Scene Objects when state changes
    useEffect(() => {
        if (!regressionLineRef.current || !errorLinesRef.current || !pointsMeshRef.current || !overfitLineRef.current) return;

        // Constants
        const lineXStart = -6;
        const lineXEnd = 6;

        // Update Regression Line (Mesh Transform)
        const yStart = slope * lineXStart + intercept;
        const yEnd = slope * lineXEnd + intercept;

        const startVec = new THREE.Vector3(lineXStart, yStart, 0);
        const endVec = new THREE.Vector3(lineXEnd, yEnd, 0);
        const direction = new THREE.Vector3().subVectors(endVec, startVec);
        const length = direction.length();
        const center = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

        // Update mesh
        regressionLineRef.current.position.copy(center);
        regressionLineRef.current.scale.set(1, length, 1); // Scale Y to match length
        // Rotate Z. Angle = atan2(dy, dx) - PI/2 because cylinder is Y-up
        const angle = Math.atan2(direction.y, direction.x);
        regressionLineRef.current.rotation.set(0, 0, angle - Math.PI / 2);

        regressionLineRef.current.visible = showLine;

        // Update Error Lines Geometry & MSE
        const errPos = errorLinesRef.current.geometry.attributes.position.array as Float32Array;
        let totalError = 0;

        dataPoints.forEach((p, i) => {
            const predictedY = slope * p.x + intercept;

            // Start (Data)
            errPos[i * 6] = p.x;
            errPos[i * 6 + 1] = p.y;
            errPos[i * 6 + 2] = 0;

            // End (Line)
            errPos[i * 6 + 3] = p.x;
            errPos[i * 6 + 4] = predictedY;
            errPos[i * 6 + 5] = 0;

            const error = p.y - predictedY;
            totalError += error * error;
        });

        errorLinesRef.current.geometry.attributes.position.needsUpdate = true;
        errorLinesRef.current.computeLineDistances(); // Update dashes
        errorLinesRef.current.visible = showErrors;

        // Update Points Visibility
        pointsMeshRef.current.visible = showPoints;

        // Update Overfitting Visibility
        overfitLineRef.current.visible = showOverfitting;

        // Update Colors based on props (if they change)
        if (pointsMeshRef.current.material instanceof THREE.PointsMaterial) {
            pointsMeshRef.current.material.color.set(color);
        }

        setMse(totalError / dataPoints.length);

    }, [slope, intercept, showLine, showErrors, showPoints, showOverfitting, dataPoints, color]);


    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

            {/* Controls Overlay */}
            <div className="glass-card" style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                padding: '10px',
                maxWidth: '250px',
                fontSize: '0.75rem',
                zIndex: 5,
                background: 'rgba(255, 255, 255, 0.9)', // Slightly more opaque for controls
            }}>
                <h4 style={{ marginBottom: '10px', color: '#4B286D' }}>Linear Regression Controls</h4>

                {/* Metric */}
                <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                    MSE (Error):
                    <span style={{ color: '#ff4757', marginLeft: '5px' }}>{mse.toFixed(2)}</span>
                </div>

                {/* Sliders */}
                <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label>Slope (weight)</label>
                        <span>{slope.toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min="-2" max="2" step="0.1"
                        value={slope}
                        onInput={(e) => setSlope(parseFloat((e.currentTarget as HTMLInputElement).value))}
                        style={{ width: '100%', accentColor: '#4B286D' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label>Intercept (bias)</label>
                        <span>{intercept.toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min="-5" max="5" step="0.1"
                        value={intercept}
                        onInput={(e) => setIntercept(parseFloat((e.currentTarget as HTMLInputElement).value))}
                        style={{ width: '100%', accentColor: '#4B286D' }}
                    />
                </div>

                {/* Toggles */}
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="checkbox"
                            checked={showLine}
                            onChange={(e) => setShowLine((e.currentTarget as HTMLInputElement).checked)}
                            style={{ accentColor: '#4B286D' }}
                        /> Line
                    </label>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="checkbox"
                            checked={showErrors}
                            onChange={(e) => setShowErrors((e.currentTarget as HTMLInputElement).checked)}
                            style={{ accentColor: '#4B286D' }}
                        /> Errors
                    </label>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="checkbox"
                            checked={showPoints}
                            onChange={(e) => setShowPoints((e.currentTarget as HTMLInputElement).checked)}
                            style={{ accentColor: '#4B286D' }}
                        /> Points
                    </label>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="checkbox"
                            checked={showOverfitting}
                            onChange={(e) => setShowOverfitting((e.currentTarget as HTMLInputElement).checked)}
                            style={{ accentColor: '#ffa500' }}
                        /> Overfit
                    </label>
                </div>
            </div>
        </div>
    );
}
