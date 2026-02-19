
import { CubeScene } from './threejsComponents/CubeScene';
import { SphereScene } from './threejsComponents/SphereScene';
import { TorusScene } from './threejsComponents/TorusScene';
import { ParticlesScene } from './threejsComponents/ParticlesScene';
import { GridScene } from './threejsComponents/GridScene';
import { NeuralNetworkScene } from './threejsComponents/NeuralNetworkScene';
import { GradientDescentScene } from './threejsComponents/GradientDescentScene';
import { LinearRegressionScene } from './threejsComponents/LinearRegressionScene';
import { BridgeScene } from './threejsComponents/BridgeScene';
import { AiLandscapeScene } from './threejsComponents/AiLandscapeScene';
import { ProgrammingParadigmScene } from './threejsComponents/ProgrammingParadigmScene';
import { EquationScene } from './threejsComponents/EquationScene';

interface SceneProps {
    type: 'cube' | 'sphere' | 'torus' | 'particles' | 'grid' | 'linear-regression' | 'neural-network' | 'gradient-descent' | 'bridge' | 'ai-landscape' | 'programming-paradigm' | 'equation';
    color?: string;
    speed?: number;
}

export function ThreeScene({ type, color = '#949494ff', speed = 1 }: SceneProps) {
    switch (type) {
        case 'cube':
            return <CubeScene color={color} />;
        case 'sphere':
            return <SphereScene color={color} />;
        case 'torus':
            return <TorusScene color={color} />;
        case 'particles':
            return <ParticlesScene color={color} />;
        case 'grid':
            return <GridScene color={color} />;
        case 'neural-network':
            return <NeuralNetworkScene color={color} />;
        case 'gradient-descent':
            return <GradientDescentScene color={color} speed={speed} />;
        case 'linear-regression':
            return <LinearRegressionScene color={color} speed={speed} />;
        case 'bridge':
            return <BridgeScene color={color} speed={speed} />;
        case 'ai-landscape':
            return <AiLandscapeScene speed={speed} />;
        case 'programming-paradigm':
            return <ProgrammingParadigmScene color={color} speed={speed} />;
        case 'equation':
            return <EquationScene color={color} speed={speed} />;
        default:
            return <CubeScene color={color} />;
    }
}
