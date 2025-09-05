import React from "react";
import { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Clock, User, Vote, Share, Eye } from 'lucide-react';
import { VoteResultBar } from './VoteResultBar';

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

interface TopicCardProps {
  topic: Topic;
  onVote: (topicId: number, optionId: number) => void;
}

export function TopicCard({ topic, onVote }: TopicCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(topic.hasVoted);
  const [userVote, setUserVote] = useState(topic.userVote);

  const handleVote = () => {
    if (selectedOption && !hasVoted) {
      onVote(topic.id, selectedOption);
      setHasVoted(true);
      setUserVote(selectedOption);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/topics/${topic.id}`;
    const text = `${topic.title} - WeVote`;
    
    // Web Share API対応の場合
    if (navigator.share) {
      try {
        await navigator.share({
          title: text,
          text: topic.description,
          url: url,
        });
      } catch (error) {
        console.log('共有がキャンセルされました');
      }
    } else {
      // フォールバック: SNS共有メニュー
      const confirmShare = confirm('どのSNSで共有しますか？\nOK: Twitter\nキャンセル: URLをコピー');
      
      if (confirmShare) {
        // Twitter共有
        const twitterText = `${topic.title}\n\n${topic.description}\n\n#WeVote`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
      } else {
        // URLをクリップボードにコピー
        try {
          await navigator.clipboard.writeText(url);
          alert('URLをクリップボードにコピーしました！');
        } catch (error) {
          console.error('クリップボードへのコピーに失敗しました', error);
          prompt('以下のURLをコピーしてください:', url);
        }
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const isExpired = new Date(topic.expiresAt) < new Date();
  const canVote = !hasVoted && !isExpired;
  const canSeeResults = hasVoted || isExpired;

  return (
  <Card className="w-full bg-white rounded-xl shadow border p-6">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{topic.category}</Badge>
              {isExpired && <Badge variant="destructive">期限切れ</Badge>}
            </div>
            <h3 className="text-xl font-semibold leading-tight text-black">{topic.title}</h3>
            {topic.description && (
              <p className="text-gray-500 mt-2">{topic.description}</p>
            )}
            
            {/* 議題の画像を表示 */}
            {topic.images && topic.images.length > 0 && (
              <div className="mt-3">
                {topic.images.length === 1 ? (
                  <img
                    src={topic.images[0]}
                    alt="議題の画像"
                    className="w-full h-48 object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {topic.images.slice(0, 4).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`議題の画像 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="shrink-0"
          >
            <Share className="w-4 h-4" />
          </Button>
        </div>

  <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Avatar className="w-5 h-5">
                <AvatarFallback>
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <span>{topic.user.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(topic.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Vote className="w-4 h-4" />
            <span>{topic.totalVotes}票</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {canVote && (
          <div className="space-y-3">
            <h4 className="font-medium">選択肢を選んで投票してください</h4>
            <div className="space-y-2">
              {topic.options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                >
                  <input
                    type="radio"
                    name={`topic-${topic.id}`}
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={() => setSelectedOption(option.id)}
                    className="w-4 h-4"
                  />
                  <span className="flex-1">{option.text}</span>
                </label>
              ))}
            </div>
            <Button 
              onClick={handleVote}
              disabled={!selectedOption}
              className="w-full"
            >
              投票する
            </Button>
          </div>
        )}

        {!canVote && !canSeeResults && (
          <div className="text-center py-6">
            <Eye className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              投票後に結果を確認できます
            </p>
          </div>
        )}

        {canSeeResults && (
          <div className="space-y-4">
            <h4 className="font-medium">投票結果</h4>
            
            {/* バーグラフ形式の結果表示 */}
            <VoteResultBar options={topic.options} totalVotes={topic.totalVotes} userVote={userVote} />
            
            {/* 詳細結果 */}
            <div className="space-y-2">
              {topic.options.map((option) => (
                <div key={option.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={userVote === option.id ? 'font-medium text-black' : ''}>
                      {option.text}
                    </span>
                    {userVote === option.id && (
                      <Badge variant="outline" className="text-xs">あなたの投票</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{option.votes}票</span>
                    <span className="text-gray-500">
                      ({topic.totalVotes > 0 ? Math.round((option.votes / topic.totalVotes) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-2 border-t">
          投票期限: {formatDate(topic.expiresAt)}
        </div>
      </CardContent>
    </Card>
  );
}