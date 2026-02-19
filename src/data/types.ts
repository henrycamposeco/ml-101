export interface Slide {
    id: string;
    title: string;
    content: string; // HTML string for flexibility
    media?: string; // Optional image URL
    config?: {
        animationType: 'cube' | 'sphere' | 'torus' | 'particles' | 'grid' | 'linear-regression' | 'neural-network' | 'gradient-descent' | 'bridge' | 'ai-landscape' | 'programming-paradigm' | 'equation'; // Types for our ThreeJS component
        color?: string;
        speed?: number;
    }
}

export interface Topic {
    id: string;
    title: string;
    description: string;
    slides: Slide[];
}
