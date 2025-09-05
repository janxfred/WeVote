import React from "react";
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from './ui/alert-dialog';
import { ArrowLeft, Upload, User, AlertTriangle, Trash2 } from 'lucide-react';

type Page = 'home' | 'create' | 'mypage' | 'profile-edit';

interface User {
  id: number;
  name: string;
  iconUrl: string | null;
  isLoggedIn: boolean;
}

interface ProfileEditProps {
  user: User;
  onNavigate: (page: Page) => void;
  onUpdateUser: (user: User) => void;
}

export function ProfileEdit({ user, onNavigate, onUpdateUser }: ProfileEditProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    iconFile: null as File | null
  });
  const [iconPreview, setIconPreview] = useState<string | null>(user.iconUrl);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // ファイルサイズとタイプのバリデーション
      if (file.size > 4 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, icon: 'ファイルサイズは4MB以下にしてください' }));
        return;
      }
      
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setErrors(prev => ({ ...prev, icon: 'JPEG、PNG形式のファイルをアップロードしてください' }));
        return;
      }

      setFormData(prev => ({ ...prev, iconFile: file }));
      setIconPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, icon: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'ユーザー名は必須です';
    } else if (formData.name.length > 30) {
      newErrors.name = 'ユーザー名は30文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 実際のアプリでは以下の処理を行う：
      // 1. 画像ファイルがある場合はアップロード
      // 2. ユーザー情報をAPIで更新
      
      // モック処理
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser: User = {
        ...user,
        name: formData.name,
        iconUrl: iconPreview
      };
      
      onUpdateUser(updatedUser);
      onNavigate('mypage');
      
      console.log('プロフィール更新:', { name: formData.name, iconFile: formData.iconFile });
      
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // 実際のアプリでは退会処理のAPIを呼び出す
      console.log('アカウント削除');
      
      // ログアウト状態にしてホームページへ
      onUpdateUser({ ...user, isLoggedIn: false });
      onNavigate('home');
      
    } catch (error) {
      console.error('退会処理エラー:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate('mypage')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </Button>
        <h1 className="text-3xl font-bold">プロフィール編集</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* アイコン画像 */}
            <div className="space-y-4">
              <Label>プロフィール画像</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={iconPreview || undefined} />
                  <AvatarFallback>
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleIconUpload}
                      className="w-64"
                    />
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    JPEG、PNG形式、4MB以下のファイル
                  </p>
                  {errors.icon && (
                    <p className="text-sm text-destructive">{errors.icon}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ユーザー名 */}
            <div className="space-y-2">
              <Label htmlFor="name">ユーザー名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ユーザー名を入力してください"
                className={errors.name ? 'border-destructive' : ''}
                maxLength={30}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                {errors.name ? (
                  <span className="text-destructive">{errors.name}</span>
                ) : (
                  <span>記号等すべて使用可能</span>
                )}
                <span>{formData.name.length}/30</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 保存ボタン */}
        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onNavigate('mypage')}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '変更を保存'}
          </Button>
        </div>
      </form>

      {/* 危険な操作 */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">危険な操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              アカウントを削除すると、作成した議題、投票履歴など、すべてのデータが完全に削除されます。
              この操作は取り消すことができません。
            </AlertDescription>
          </Alert>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                アカウントを削除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>アカウントの削除</AlertDialogTitle>
                <AlertDialogDescription>
                  本当にアカウントを削除しますか？
                  <br />
                  この操作を実行すると、すべてのデータが完全に削除され、復元することはできません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  削除する
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}