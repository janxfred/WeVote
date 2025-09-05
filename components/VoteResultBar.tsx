import React from "react";
interface VoteOption {
  id: number;
  text: string;
  votes: number;
}

interface VoteResultBarProps {
  options: VoteOption[];
  totalVotes: number;
  userVote?: number;
}

export function VoteResultBar({ options, totalVotes, userVote }: VoteResultBarProps) {
  if (options.length === 0 || totalVotes === 0) {
    return (
      <div className="w-full h-8 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-sm text-gray-500">投票データなし</span>
      </div>
    );
  }

  // 2つの選択肢の場合は、要件通りの青（賛成）赤（反対）形式
  if (options.length === 2) {
    const [option1, option2] = options;
    const option1Percentage = (option1.votes / totalVotes) * 100;
    const option2Percentage = (option2.votes / totalVotes) * 100;

    return (
      <div className="space-y-3">
        <div className="w-full h-12 bg-muted rounded-lg overflow-hidden flex">
          {/* 左側（青色 - 賛成） */}
          <div 
            className="bg-blue-500 h-full flex items-center justify-center text-white text-sm font-medium transition-all duration-500"
            style={{ width: `${option1Percentage}%` }}
          >
            {option1Percentage > 15 && (
              <span>{option1.text}</span>
            )}
          </div>
          
          {/* 右側（赤色 - 反対） */}
          <div 
            className="bg-red-500 h-full flex items-center justify-center text-white text-sm font-medium transition-all duration-500"
            style={{ width: `${option2Percentage}%` }}
          >
            {option2Percentage > 15 && (
              <span>{option2.text}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3つ以上の選択肢の場合は、カラフルなバー表示
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500'
  ];

  return (
    <div className="space-y-3">
  <div className="w-full h-12 bg-gray-100 rounded-xl overflow-hidden flex shadow border">
        {options.map((option, index) => {
          const percentage = (option.votes / totalVotes) * 100;
          const colorClass = colors[index % colors.length];
          
          return (
            <div
              key={option.id}
              className={`${colorClass} h-full flex items-center justify-center text-white text-sm font-medium transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            >
              {percentage > 10 && (
                <span className="truncate px-1">{option.text}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}