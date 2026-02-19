
import { useState } from 'preact/hooks';
import { TopicMenu } from './components/TopicMenu';
import { TopicViewer } from './components/TopicViewer';
import { topics } from './data/content';


export function App() {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  const handleSelectTopic = (id: string) => {
    setActiveTopicId(id);
  };

  const handleBack = () => {
    setActiveTopicId(null);
  };

  const activeTopic = topics.find(t => t.id === activeTopicId);

  return (
    <div style={{
      background: 'var(--color-bg-dark)',
      minHeight: '100vh',
      color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-body)'
    }}>
      {activeTopic ? (
        <TopicViewer topic={activeTopic} onBack={handleBack} />
      ) : (
        <TopicMenu topics={topics} onSelectTopic={handleSelectTopic} />
      )}
    </div>
  );
}
