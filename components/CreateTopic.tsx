import React from "react";
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Plus, X, Upload, AlertTriangle } from 'lucide-react';

type Page = 'home' | 'create' | 'mypage' | 'profile-edit';

interface EditingTopic {
  id: number;
  title: string;
  description: string;
  category: string;
  options: string[];
  images: string[];
}

interface CreateTopicProps {
  onNavigate: (page: Page) => void;
  onCreateTopic: (topic: any) => void;
  editingTopic?: EditingTopic | null;
  onCancelEdit?: () => void;
}

interface TopicFormData {
  title: string;
  description: string;
  categories: string[];
  options: string[];
  images: File[];
}

export function CreateTopic({ onNavigate, onCreateTopic, editingTopic, onCancelEdit }: CreateTopicProps) {
  const [formData, setFormData] = useState<TopicFormData>({
    title: editingTopic?.title || '',
    description: editingTopic?.description || '',
    categories: editingTopic?.category ? [editingTopic.category] : [],
    options: editingTopic?.options || ['', ''],
    images: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableCategories = ['恋愛', '政治'];

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const addOption = () => {
    if (formData.options.length < 8) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(file => {
        const isValidType = file.type === 'image/jpeg' || file.type === 'image/png';
        const isValidSize = file.size <= 4 * 1024 * 1024; // 4MB
        return isValidType && isValidSize;
      });

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    } else if (formData.title.length > 255) {
      newErrors.title = 'タイトルは255文字以内で入力してください';
    }

    if (formData.categories.length === 0) {
      newErrors.categories = '少なくとも1つのカテゴリを選択してください';
    }

    const validOptions = formData.options.filter(option => option.trim());
    if (validOptions.length < 2) {
      newErrors.options = '少なくとも2つの選択肢を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // 有効な選択肢のみを抽出
    const validOptions = formData.options.filter(option => option.trim());

    // 画像URLを準備（実際のアプリではAPI経由でアップロード）
    const imageUrls = formData.images.map(file => URL.createObjectURL(file));

    const newTopic = {
      title: formData.title,
      description: formData.description,
      category: formData.categories[0], // 最初のカテゴリを使用
      options: validOptions,
      images: imageUrls
    };

    // 議題を作成
    onCreateTopic(newTopic);
    
    // 成功後、ホームページに戻る
    onNavigate('home');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </Button>
        <h1 className="text-3xl font-bold">
          {editingTopic ? '議題を編集' : '新しい議題を作成'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="投票のタイトルを入力してください"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明文</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="議題の詳細な説明を入力してください（任意）"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>カテゴリ *</Label>
              <div className="flex gap-4">
                {availableCategories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={formData.categories.includes(category)}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(category, checked as boolean)
                      }
                    />
                    <Label htmlFor={category}>{category}</Label>
                  </div>
                ))}
              </div>
              {errors.categories && (
                <p className="text-sm text-destructive">{errors.categories}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>選択肢</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`選択肢 ${index + 1}`}
                  className="flex-1"
                />
                {formData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {formData.options.length < 8 && (
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="w-full flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                選択肢を追加
              </Button>
            )}
            
            {errors.options && (
              <p className="text-sm text-destructive">{errors.options}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>画像添付（任意）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="images">画像ファイル</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="images"
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                JPEG、PNG形式、4MB以下のファイルをアップロードできます
              </p>
            </div>

            {formData.images.length > 0 && (
              <div className="space-y-2">
                <Label>アップロード済み画像</Label>
                <div className="grid grid-cols-2 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            作成後5分以内かつ投票が0票の場合のみ編集・削除が可能です。投票期限は作成から半年後に設定されます。
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onNavigate('home')}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button type="submit" className="flex-1">
            {editingTopic ? '変更を保存' : '議題を作成'}
          </Button>
        </div>
      </form>
    </div>
  );
}