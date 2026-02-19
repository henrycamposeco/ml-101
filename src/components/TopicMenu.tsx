
import type { Topic } from '../data/types';
import { ThreeScene } from './ThreeScene';

interface MenuProps {
    topics: Topic[];
    onSelectTopic: (id: string) => void;
}

export function TopicMenu({ topics, onSelectTopic }: MenuProps) {
    return (

        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: 'var(--space-xl)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Animation */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                opacity: 0.3,
                pointerEvents: 'none'
            }}>
                <ThreeScene type="neural-network" color="#4B286D" speed={0.5} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                    src="/logo.webp"
                    alt="Logo"
                    className="fade-in"
                    style={{
                        maxHeight: '100px',
                        marginBottom: 'var(--space-md)',
                        opacity: 0.9
                    }}
                />
                <h1 className="fade-in" style={{
                    fontSize: '4rem',
                    marginBottom: 'var(--space-md)',
                    background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-2px'
                }}>
                    Interactive Learning
                </h1>
                <p className="fade-in" style={{
                    fontSize: '1.25rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-xl)',
                    maxWidth: '600px'
                }}>
                    Explore complex concepts through interactive visualizations and curated content.
                </p>

                <div className="grid-layout" style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 'var(--space-lg)',
                    width: '100%',
                    maxWidth: '1000px'
                }}>
                    {topics.map((topic, index) => (
                        <div
                            key={topic.id}
                            onClick={() => onSelectTopic(topic.id)}
                            className="glass-card fade-in"
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                textAlign: 'left',
                                animationDelay: `${index * 0.1}s`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Decorative gradient blob */}
                            <div style={{
                                position: 'absolute',
                                top: '-50px',
                                right: '-50px',
                                width: '150px',
                                height: '150px',
                                background: `var(${index % 2 === 0 ? '--color-primary' : '--color-secondary'})`,
                                filter: 'blur(60px)',
                                opacity: 0.2,
                                borderRadius: '50%'
                            }} />

                            <h3 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-xs)' }}>
                                {topic.title}
                            </h3>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
                                {topic.description}
                            </p>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                                Start Module <span>→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
