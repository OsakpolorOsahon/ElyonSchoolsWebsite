'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Upload, Loader2, ImagePlus, X } from 'lucide-react'

export default function GalleryUploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'campus',
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 5MB.', variant: 'destructive' })
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      toast({ title: 'No file selected', description: 'Please choose an image to upload.', variant: 'destructive' })
      return
    }
    if (!formData.title) {
      toast({ title: 'Missing title', description: 'Please enter a title for the image.', variant: 'destructive' })
      return
    }

    setIsUploading(true)
    try {
      const data = new FormData()
      data.append('file', selectedFile)
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('category', formData.category)

      const res = await fetch('/api/admin/gallery', { method: 'POST', body: data })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || 'Upload failed')

      toast({ title: 'Image uploaded!', description: `"${formData.title}" has been added to the gallery.` })
      router.push('/admin/gallery')
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader title="Upload Image" subtitle="Add photos to the school gallery" role="admin" />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/gallery">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Gallery
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Gallery Image</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="mb-2 block">Image File * (Max 5MB)</Label>
                {preview ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted mb-2">
                    <Image src={preview} alt="Preview" fill className="object-contain" />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => { setPreview(null); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-10 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">Click to select an image</p>
                    <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP up to 5MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Cultural Day 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of the photo"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="campus">Campus</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="graduation">Graduation</SelectItem>
                    <SelectItem value="students">Student Life</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isUploading || !selectedFile} className="gap-2">
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <Link href="/admin/gallery">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
