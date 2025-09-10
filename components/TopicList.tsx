import React, { useEffect, useState } from "react";
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { TopicCard } from './TopicCard';
import { Plus, Filter } from 'lucide-react';
import { supabase } from '../src/lib/supabaseClient'

type Page = 'home' | 'create' | 'mypage' | 'profile-edit';
type Category = 'all' | '恋愛' | '政治';
type SortBy = 'new' | 'votes';

interface Topic {
  id: any;
  title: string;
  description: string;
  category?: string | null;
  user?: { name?: string; icon?: string | null } | null;
  options?: Array<{ id: any; label: string; votes?: number }>;
  totalVotes?: number;
  createdAt?: string;
  expiresAt?: string;
  hasVoted?: boolean;
  userVote?: number;
}

interface User {
  id: number;
  name: string;
  iconUrl: string | null;
  isLoggedIn: boolean;
}

interface TopicListProps {
  topics: Topic[];
  onNavigate: (page: Page) => void;
  user: User;
  onVote: (topicId: number, optionId: number) => void;
}

export function TopicList({ topics: initialTopics = [], onNavigate, user, onVote }: TopicListProps) {
  const [category, setCategory] = useState<Category>('all')
  const [sortBy, setSortBy] = useState<SortBy>('new')
  const [topics, setTopics] = useState<Topic[]>(initialTopics)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // if topics were not passed in or empty, fetch from Supabase
    if (!initialTopics || initialTopics.length === 0) {
      fetchTopics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchTopics() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('topics').select('*, topic_options(*)').order('created_at', { ascending: false })
      if (error) throw error
      const mapped = (data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        options: (t.topic_options || []).map((o: any) => ({ id: o.id, label: o.label, votes: o.votes })),
        createdAt: t.created_at
      }))
      setTopics(mapped)
    } catch (err) {
      console.error('Failed to fetch topics', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedTopics = topics
    .filter(topic => category === 'all' || topic.category === category)
    .sort((a, b) => {
      if (sortBy === 'new') {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      } else {
        return (b.totalVotes || 0) - (a.totalVotes || 0)
      }
    })

  return (
    <div className="space-y-6">
      {/* ヘッダー部分 */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">議題一覧</h1>
          <p className="text-gray-500 mt-1">
            気になる議題に投票してみよう
          </p>
        </div>

      </div>

      {/* フィルタとソート */}
  <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">カテゴリ:</span>
          <Select value={category} onValueChange={(value: Category) => setCategory(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="恋愛">恋愛</SelectItem>
              <SelectItem value="政治">政治</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">並び順:</span>
          <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">投稿日順</SelectItem>
              <SelectItem value="votes">投票数順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-gray-500">
            {filteredAndSortedTopics.length}件の議題
          </span>
        </div>
      </div>

      {/* アクティブフィルタ表示 */}
      {category !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">フィルタ:</span>
          <Badge variant="secondary" className="gap-1">
            {category}
            <button 
              onClick={() => setCategory('all')}
              className="ml-1 hover:bg-white rounded-full p-0.5"
            >
              ×
            </button>
          </Badge>
        </div>
      )}

      {/* 議題一覧 */}
      <div className="space-y-4">
        {filteredAndSortedTopics.length > 0 ? (
          filteredAndSortedTopics.map(topic => (
            <TopicCard key={topic.id} topic={topic} onVote={onVote} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">該当する議題が見つかりませんでした</p>
          </div>
        )}
      </div>

      {/* ページネーション（将来的にスクロール無限読み込みに変更） */}
      {filteredAndSortedTopics.length > 0 && (
        <div className="text-center py-6">
          <Button variant="outline">
            さらに読み込む
          </Button>
        </div>
      )}
    </div>
  );
}