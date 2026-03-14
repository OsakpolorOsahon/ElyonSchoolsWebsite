'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, Users, UserPlus, Mail, Search } from 'lucide-react'

interface UserRecord {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  teacher: 'bg-blue-100 text-blue-700',
  parent: 'bg-purple-100 text-purple-700',
  student: 'bg-green-100 text-green-700',
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [filtered, setFiltered] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ full_name: string } | null>(null)
  const [search, setSearch] = useState('')
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [invite, setInvite] = useState({ email: '', full_name: '', role: 'parent' })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(p)
      await fetchUsers()
    }
    load()
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(users.filter(u =>
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    ))
  }, [search, users])

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users || [])
    setFiltered(data.users || [])
    setLoading(false)
  }

  const updateRole = async (id: string, newRole: string) => {
    setUpdatingRole(id)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role: newRole }),
    })
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u))
      toast({ title: 'Role updated successfully' })
    } else {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' })
    }
    setUpdatingRole(null)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invite.email || !invite.role) return
    setInviting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invite),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Invitation sent!', description: `An invite has been sent to ${invite.email}` })
      setInviteOpen(false)
      setInvite({ email: '', full_name: '', role: 'parent' })
      await fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send invite'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="User Management"
        subtitle={`Welcome back, ${profile?.full_name || 'Administrator'}`}
        role="admin"
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <h2 className="text-xl font-semibold">All Users ({filtered.length})</h2>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" /> Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="inv-name">Full Name</Label>
                  <Input
                    id="inv-name"
                    value={invite.full_name}
                    onChange={e => setInvite(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="e.g. Amaka Johnson"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-email">Email Address *</Label>
                  <Input
                    id="inv-email"
                    type="email"
                    value={invite.email}
                    onChange={e => setInvite(p => ({ ...p, email: e.target.value }))}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select value={invite.role} onValueChange={v => setInvite(p => ({ ...p, role: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  The user will receive an email invitation to set up their account.
                </p>
                <div className="flex gap-3 pt-1">
                  <Button type="submit" disabled={inviting} className="gap-2">
                    {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{users.length === 0 ? 'No users yet' : 'No results match your search'}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium">Name</th>
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Role</th>
                      <th className="text-left px-4 py-3 font-medium">Joined</th>
                      <th className="text-left px-4 py-3 font-medium">Change Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user, i) => (
                      <tr key={user.id} className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                        <td className="px-4 py-3 font-medium">{user.full_name || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge className={roleColors[user.role] || 'bg-gray-100 text-gray-700'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Select
                              value={user.role}
                              onValueChange={role => updateRole(user.id, role)}
                              disabled={updatingRole === user.id}
                            >
                              <SelectTrigger className="h-8 w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                              </SelectContent>
                            </Select>
                            {updatingRole === user.id && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
