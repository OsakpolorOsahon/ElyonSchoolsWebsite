'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, FileText, CreditCard, Wallet } from 'lucide-react'

interface Child {
  id: string
  admission_number: string
  class: string
  profiles: { full_name: string }[] | null
}

export default function ParentChildSelector({ children }: { children: Child[] }) {
  const [selectedId, setSelectedId] = useState(children[0]?.id || '')
  const selected = children.find(c => c.id === selectedId)

  const useTabs = children.length <= 3

  return (
    <div className="mb-8">
      {useTabs ? (
        <Tabs value={selectedId} onValueChange={setSelectedId}>
          <TabsList className="mb-4" data-testid="child-tabs">
            {children.map(c => (
              <TabsTrigger key={c.id} value={c.id} data-testid={`tab-child-${c.id}`}>
                {c.profiles?.[0]?.full_name || c.admission_number}
              </TabsTrigger>
            ))}
          </TabsList>
          {children.map(c => (
            <TabsContent key={c.id} value={c.id}>
              <ChildCard child={c} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-64 mb-4" data-testid="select-child">
              <SelectValue placeholder="Select child" />
            </SelectTrigger>
            <SelectContent>
              {children.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.profiles?.[0]?.full_name || c.admission_number} ({c.class})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected && <ChildCard child={selected} />}
        </>
      )}
    </div>
  )
}

function ChildCard({ child }: { child: Child }) {
  return (
    <Card className="hover-elevate" data-testid={`card-child-${child.id}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">{child.profiles?.[0]?.full_name || 'Student'}</h3>
            <p className="text-sm text-muted-foreground">{child.class}</p>
            <p className="text-xs text-muted-foreground">{child.admission_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <Link href={`/parent/results/${encodeURIComponent(child.admission_number)}`}>
              <FileText className="h-4 w-4 mr-1" />
              Results
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <Link href={`/parent/fees?child=${child.id}`}>
              <Wallet className="h-4 w-4 mr-1" />
              Fees
            </Link>
          </Button>
          <Button size="sm" className="flex-1" asChild>
            <Link href="/parent/payments">
              <CreditCard className="h-4 w-4 mr-1" />
              Payments
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
