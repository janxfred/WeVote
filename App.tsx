import { useState } from 'react';
import { Header } from './components/Header';
import { TopicList } from './components/TopicList';
import { CreateTopic } from './components/CreateTopic';
import { MyPage } from './components/MyPage';
import { ProfileEdit } from './components/ProfileEdit';

type Page = 'home' | 'create' | 'mypage' | 'profile-edit';

// モックデータ
const mockTopics = [
  {
    id: 1,
    title: '好きなデートスポットはどこですか？',
    description: '初回デートで行きたい場所について教えてください',
    category: '恋愛',
    user: { name: 'さくら', icon: null },
    options: [
      { id: 1, text: '映画館', votes: 45 },
      { id: 2, text: 'カフェ', votes: 32 },
      { id: 3, text: '水族館', votes: 28 },
      { id: 4, text: '公園', votes: 15 }
    ],
    totalVotes: 120,
    createdAt: '2024-01-15T10:00:00Z',
    expiresAt: '2024-07-15T10:00:00Z',
    hasVoted: false,
    images: ['https://images.unsplash.com/photo-1604881990409-b9f246db39da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMGRhdGUlMjBjb3VwbGUlMjBjYWZlfGVufDF8fHx8MTc1Njg4MTQzMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral']
  },
  {
    id: 2,
    title: '次回の選挙で重視すべき政策は？',
    description: '来年の選挙で最も重要だと考える政策分野について',
    category: '政治',
    user: { name: 'たろう', icon: null },
    options: [
      { id: 5, text: '経済政策', votes: 89 },
      { id: 6, text: '社会保障', votes: 67 },
      { id: 7, text: '環境政策', votes: 34 },
      { id: 8, text: '外交・安全保障', votes: 25 }
    ],
    totalVotes: 215,
    createdAt: '2024-01-10T14:30:00Z',
    expiresAt: '2024-07-10T14:30:00Z',
    hasVoted: true,
    userVote: 5,
    images: ['https://images.unsplash.com/photo-1651507050817-dbcbec1e66c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwcG9saXRpY3MlMjB2b3Rpbmd8ZW58MXx8fHwxNzU2OTQzODkyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral']
  }
];

const mockUser = {
  id: 1,
  name: 'ユーザー名',
  iconUrl: null,
  isLoggedIn: true
};

type EditingTopic = {
  id: number;
  title: string;
  description: string;
  category: string;
  options: string[];
  images: string[];
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState(mockUser);
  const [topics, setTopics] = useState(mockTopics);
  const [editingTopic, setEditingTopic] = useState<EditingTopic | null>(null);

  const handleCreateTopic = (newTopic: any) => {
    const topic = {
      ...newTopic,
      id: topics.length + 1,
      user: { name: user.name, icon: user.iconUrl },
      totalVotes: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6ヶ月後
      hasVoted: false,
      options: newTopic.options.map((text: string, index: number) => ({
        id: topics.length * 10 + index + 1,
        text,
        votes: 0
      }))
    };
    setTopics(prev => [topic, ...prev]);
  };

  const handleVote = (topicId: number, optionId: number) => {
    setTopics(prev => prev.map(topic => {
      if (topic.id === topicId) {
        const updatedOptions = topic.options.map(option => ({
          ...option,
          votes: option.id === optionId ? option.votes + 1 : option.votes
        }));
        
        return {
          ...topic,
          options: updatedOptions,
          totalVotes: topic.totalVotes + 1,
          hasVoted: true,
          userVote: optionId
        };
      }
      return topic;
    }));
  };

  const handleEditTopic = (topic: any) => {
    setEditingTopic({
      id: topic.id,
      title: topic.title,
      description: topic.description,
      category: topic.category,
      options: topic.options.map((opt: any) => opt.text),
      images: topic.images || []
    });
    setCurrentPage('create');
  };

  const handleUpdateTopic = (updatedTopic: any) => {
    setTopics(prev => prev.map(topic => 
      topic.id === editingTopic?.id ? {
        ...topic,
        ...updatedTopic,
        options: updatedTopic.options.map((text: string, index: number) => ({
          id: topic.options[index]?.id || topic.id * 10 + index + 1,
          text,
          votes: topic.options[index]?.votes || 0
        }))
      } : topic
    ));
    setEditingTopic(null);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Header 
        user={user}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {currentPage === 'home' && (
          <TopicList 
            topics={topics} 
            onNavigate={setCurrentPage} 
            user={user} 
            onVote={handleVote}
          />
        )}
        {currentPage === 'create' && (
          <CreateTopic 
            onNavigate={setCurrentPage} 
            onCreateTopic={editingTopic ? handleUpdateTopic : handleCreateTopic}
            editingTopic={editingTopic}
            onCancelEdit={() => setEditingTopic(null)}
          />
        )}
        {currentPage === 'mypage' && (
          <MyPage 
            user={user} 
            topics={topics} 
            onNavigate={setCurrentPage} 
            onEditTopic={handleEditTopic}
          />
        )}
        {currentPage === 'profile-edit' && (
          <ProfileEdit user={user} onNavigate={setCurrentPage} onUpdateUser={setUser} />
        )}
      </main>
    </div>
  );
}