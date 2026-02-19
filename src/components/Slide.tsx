
import type { Slide as SlideType } from '../data/types';
import { ThreeScene } from './ThreeScene';
import { useEffect, useState } from 'preact/hooks';

interface SlideProps {
    slide: SlideType;
}

export function Slide({ slide }: SlideProps) {
    // Add simple entrance animation key
    const [key, setKey] = useState(0);

    useEffect(() => {
        setKey(prev => prev + 1); // Trigger re-render/animation on slide change
    }, [slide.id]);

    return (
        <div className="grid-layout fade-in" key={key}>
            <div style={{
                padding: 'var(--space-xl)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                <div className="glass-card" style={{ height: 'fit-content' }}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        marginBottom: 'var(--space-md)',
                        color: slide.config?.color || 'var(--color-primary)'
                    }}>
                        {slide.title}
                    </h2>

                    <div
                        dangerouslySetInnerHTML={{ __html: slide.content }}
                        style={{
                            fontSize: '1.1rem',
                            color: 'var(--color-text-secondary)',
                            lineHeight: '1.8'
                        }}
                    />

                    {slide.media && (
                        <img
                            src={slide.media}
                            alt={slide.title}
                            style={{
                                marginTop: 'var(--space-md)',
                                width: '100%',
                                borderRadius: 'var(--radius-sm)',
                                objectFit: 'cover'
                            }}
                        />
                    )}
                </div>
            </div>

            <div style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 'var(--radius-lg)',
                margin: 'var(--space-md)'
            }}>
                {/* Background decorative element */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60%',
                    height: '60%',
                    background: slide.config?.color || 'var(--color-primary)',
                    filter: 'blur(100px)',
                    opacity: 0.3,
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
                    {slide.config ? (
                        <ThreeScene
                            type={slide.config.animationType as any}
                            color={slide.config.color}
                            speed={slide.config.speed}
                        />
                    ) : (
                        <ThreeScene type="cube" />
                    )}
                </div>

                {/* Watermark Logo */}
                <img
                    src="/logo.webp"
                    alt="Logo"
                    style={{
                        position: 'absolute',
                        bottom: '30px',
                        right: '30px',
                        width: '80px',
                        opacity: 0.15,
                        zIndex: 0,
                        filter: 'grayscale(100%)',
                        pointerEvents: 'none'
                    }}
                />
            </div>
        </div>
    );
}
