import React from "react";
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { LogIn, User, Plus, Home } from 'lucide-react';

type Page = 'home' | 'create' | 'mypage' | 'profile-edit';

interface User {
  id: number;
  name: string;
  iconUrl: string | null;
  isLoggedIn: boolean;
}

interface HeaderProps {
  user: User;
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export function Header({ user, onNavigate, currentPage }: HeaderProps) {
  const handleLogin = () => {
    // 実際のアプリではOAuth認証をここで実行
    console.log('Google OAuth login');
  };

  const handleLogout = () => {
    // 実際のアプリではログアウト処理をここで実行
    console.log('Logout');
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('home')}
              className="text-2xl font-bold text-black hover:opacity-80 transition-opacity"
            >
              WeVote
            </button>
            
            <nav className="hidden md:flex items-center gap-4">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                ホーム
              </Button>
              
              {user.isLoggedIn && (
                <>
                  <Button
                    variant={currentPage === 'create' ? 'default' : 'ghost'}
                    onClick={() => onNavigate('create')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    議題作成
                  </Button>
                  <Button
                    variant={currentPage === 'mypage' ? 'default' : 'ghost'}
                    onClick={() => onNavigate('mypage')}
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    マイページ
                  </Button>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user.isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.iconUrl || undefined} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onNavigate('mypage')}>
                    マイページ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('profile-edit')}>
                    プロフィール編集
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin} className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                ログイン
              </Button>
            )}
          </div>
        </div>

        {/* モバイルナビゲーション */}
        {user.isLoggedIn && (
          <nav className="md:hidden flex items-center gap-2 mt-3 pt-3 border-t">
            <Button
              variant={currentPage === 'home' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              ホーム
            </Button>
            <Button
              variant={currentPage === 'create' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('create')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              議題作成
            </Button>
            <Button
              variant={currentPage === 'mypage' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('mypage')}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              マイページ
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}