import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { supabase } from '../src/lib/supabaseClient'

type Page = 'home' | 'create' | 'mypage' | 'profile-edit'

interface CreateTopicProps {
  onNavigate: (page: Page) => void
  onCreateTopic: (topic: any) => void
}

interface TopicFormData {
  title: string
  description: string
  options: string[]
  images: File[]
}

export function CreateTopic({ onNavigate, onCreateTopic }: CreateTopicProps) {
  const [formData, setFormData] = useState<TopicFormData>({
    title: '',
    description: '',
    options: ['', ''],
    images: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleOptionChange = (index: number, value: string) => {
    setFormData(prev => ({ ...prev, options: prev.options.map((o, i) => i === index ? value : o) }))
  }

  const addOption = () => setFormData(prev => ({ ...prev, options: [...prev.options, ''] }))
  const removeOption = (index: number) => setFormData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }))

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const valid = Array.from(files).filter(f => ['image/jpeg', 'image/png'].includes(f.type) && f.size <= 4 * 1024 * 1024)
    setFormData(prev => ({ ...prev, images: [...prev.images, ...valid] }))
  }

  const validateForm = () => {
    const errs: Record<string, string> = {}
    if (!formData.title.trim()) errs.title = 'タイトルは必須です'
    if (formData.options.filter(o => o.trim()).length < 2) errs.options = '選択肢は2つ以上必要です'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      const { data: topic, error } = await supabase.from('topics').insert({ title: formData.title, description: formData.description }).select('*').single()
      if (error) throw error
      const optionRecords = formData.options.filter(o => o.trim()).map(label => ({ topic_id: topic.id, label }))
      const { error: optErr } = await supabase.from('topic_options').insert(optionRecords)
      if (optErr) throw optErr
      onCreateTopic({ ...topic, options: optionRecords })
      setFormData({ title: '', description: '', options: ['', ''], images: [] })
      onNavigate('home')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('home')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </Button>
        <h1 className="text-3xl font-bold">新しい議題を作成</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>基本情報</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">タイトル</Label>
              <Input id="title" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="description">説明</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>選択肢</CardTitle></CardHeader>
          <CardContent>
            {formData.options.map((opt, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input value={opt} onChange={e => handleOptionChange(i, e.target.value)} className="flex-1" />
                {formData.options.length > 2 && <Button type="button" variant="outline" onClick={() => removeOption(i)}><X className="w-4 h-4" /></Button>}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOption}><Plus className="w-4 h-4" /> 選択肢を追加</Button>
            {errors.options && <p className="text-sm text-destructive mt-2">{errors.options}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>画像添付</CardTitle></CardHeader>
          <CardContent>
            <Input type="file" accept="image/jpeg,image/png" multiple onChange={handleImageUpload} />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => onNavigate('home')} className="flex-1">キャンセル</Button>
          <Button type="submit" className="flex-1" disabled={loading}>{loading ? '作成中...' : '議題を作成'}</Button>
        </div>
      </form>
    </div>
  )
}
