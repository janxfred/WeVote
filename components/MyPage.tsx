import React from "react";
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { TopicCard } from './TopicCard';
import { Settings, Edit, Vote, FileText, User } from 'lucide-react';

type Page = 'home' | 'create' | 'mypage' | 'profile-edit';

interface User {
  id: number;
  name: string;
  iconUrl: string | null;
  isLoggedIn: boolean;
}

interface Topic {
  id: number;
  title: string;
  description: string;
  category: string;
  user: { name: string; icon: string | null };
  options: Array<{ id: number; text: string; votes: number }>;
  totalVotes: number;
  createdAt: string;
  expiresAt: string;
  hasVoted: boolean;
  userVote?: number;
  images?: string[];
}

interface MyPageProps {
  user: User;
  topics: Topic[];
  onNavigate: (page: Page) => void;
  onEditTopic: (topic: Topic) => void;
}

export function MyPage({ user, topics, onNavigate, onEditTopic }: MyPageProps) {
  const [activeTab, setActiveTab] = useState<'created' | 'voted'>('created');

  // 実際のアプリでは、ユーザーが作成した議題と投票した議題を別々にAPIから取得
  const createdTopics = topics.filter(topic => topic.user.name === user.name);
  const votedTopics = topics.filter(topic => topic.hasVoted);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const getTopicStatus = (topic: Topic) => {
    const now = new Date();
    const expires = new Date(topic.expiresAt);
    const created = new Date(topic.createdAt);
    const canEdit = (now.getTime() - created.getTime()) < 5 * 60 * 1000 && topic.totalVotes === 0;

    if (expires < now) return { label: '期限切れ', variant: 'destructive' as const };
    if (canEdit) return { label: '編集可能', variant: 'secondary' as const };
    return { label: '投票受付中', variant: 'default' as const };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* プロフィールヘッダー */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.iconUrl || undefined} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">
                  作成した議題: {createdTopics.length}件 | 投票した議題: {votedTopics.length}件
                </p>
              </div>
            </div>
            <Button 
              onClick={() => onNavigate('profile-edit')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              プロフィール編集
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* タブで切り替え */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'created' | 'voted')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="created" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            作成した議題
          </TabsTrigger>
          <TabsTrigger value="voted" className="flex items-center gap-2">
            <Vote className="w-4 h-4" />
            投票した議題
          </TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">作成した議題</h2>
            <Button 
              onClick={() => onNavigate('create')}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              新しい議題を作成
            </Button>
          </div>

          {createdTopics.length > 0 ? (
            <div className="space-y-4">
              {createdTopics.map(topic => {
                const status = getTopicStatus(topic);
                return (
                  <Card key={topic.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{topic.category}</Badge>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                          <h3 className="text-lg font-semibold">{topic.title}</h3>
                          {topic.description && (
                            <p className="text-muted-foreground text-sm mt-1">{topic.description}</p>
                          )}
                        </div>
                        {status.label === '編集可能' && (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onEditTopic(topic)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm">
                              削除
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>作成日: {formatDate(topic.createdAt)}</span>
                        <span>投票数: {topic.totalVotes}票</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">まだ議題を作成していません</p>
              <Button onClick={() => onNavigate('create')}>
                最初の議題を作成
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="voted" className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">投票した議題</h2>

          {votedTopics.length > 0 ? (
            <div className="space-y-4">
              {votedTopics.map(topic => (
                <TopicCard key={topic.id} topic={topic} onVote={() => {}} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">まだ投票していません</p>
              <Button onClick={() => onNavigate('home')}>
                議題を見に行く
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}