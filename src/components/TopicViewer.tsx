
import { useState, useEffect } from 'preact/hooks';
import { Slide } from './Slide';
import type { Topic } from '../data/types';

interface ViewerProps {
    topic: Topic;
    onBack: () => void;
}

export function TopicViewer({ topic, onBack }: ViewerProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => {
        if (currentSlide < topic.slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if focus is on an input element
            const tag = (e.target as HTMLElement).tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
                // If it's Escape, we might still want to go back?
                // But typically Escape should blur first.
                // Let's allow Escape to fall through ONLY if we decide so, but
                // standard behavior often consumes Escape.
                // For safely, let's ignore ALL navigation keys if focused on input,
                // except maybe Escape if we really want "Global Back".
                // But let's start safe.
                if (e.key !== 'Escape') return;
            }

            if (e.key === 'ArrowRight') {
                if (currentSlide < topic.slides.length - 1) {
                    setCurrentSlide(prev => prev + 1);
                }
            } else if (e.key === 'ArrowLeft') {
                if (currentSlide > 0) {
                    setCurrentSlide(prev => prev - 1);
                }
            } else if (e.key === 'Escape') {
                onBack();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide, topic.slides.length, onBack]);

    const progress = ((currentSlide + 1) / topic.slides.length) * 100;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Nav */}
            <div className="glass" style={{
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 var(--space-lg)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <img src="/logo.webp" alt="Logo" style={{ height: '32px', opacity: 0.9 }} />
                    <button onClick={onBack} style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-xs)',
                        fontWeight: 600
                    }}>
                        ← Back to Topics
                    </button>
                </div>

                <h2 style={{ fontWeight: 600, letterSpacing: '0.5px' }}>{topic.title}</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                        {currentSlide + 1} / {topic.slides.length}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', width: '100%' }}>
                <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'var(--color-primary)',
                    transition: 'width 0.3s ease'
                }} />
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflow: 'hidden', padding: 'var(--space-lg)' }}>
                <Slide slide={topic.slides[currentSlide]} />
            </div>

            {/* Footer / Controls */}
            <div className="glass" style={{
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 var(--space-xl)',
                marginTop: 'auto'
            }}>
                <button
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    style={{
                        padding: 'var(--space-md) var(--space-xl)',
                        borderRadius: 'var(--radius-full)',
                        background: currentSlide === 0 ? 'transparent' : 'var(--color-surface)',
                        color: currentSlide === 0 ? 'rgba(255,255,255,0.2)' : 'var(--color-text-primary)',
                        cursor: currentSlide === 0 ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    Previous
                </button>

                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                    {topic.slides.map((_, idx) => (
                        <div key={idx} style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: idx === currentSlide ? 'var(--color-text-primary)' : '#cccccc',
                            transition: 'background 0.3s'
                        }} />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentSlide === topic.slides.length - 1}
                    style={{
                        padding: 'var(--space-md) var(--space-xl)',
                        borderRadius: 'var(--radius-full)',
                        background: currentSlide === topic.slides.length - 1 ? 'transparent' : 'var(--color-primary)',
                        color: currentSlide === topic.slides.length - 1 ? 'rgba(255,255,255,0.2)' : 'white',
                        fontWeight: 'bold',
                        cursor: currentSlide === topic.slides.length - 1 ? 'default' : 'pointer',
                        transition: 'transform 0.2s, background 0.2s',
                        border: currentSlide === topic.slides.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        boxShadow: currentSlide === topic.slides.length - 1 ? 'none' : 'var(--shadow-glow)'
                    }}
                    onMouseEnter={e => {
                        if (currentSlide !== topic.slides.length - 1) {
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                        }
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                >
                    Next Slide
                </button>
            </div>
        </div>
    );
}
