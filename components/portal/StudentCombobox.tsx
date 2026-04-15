'use client'

import { useState, useMemo } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { ChevronsUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const ALL_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]
const CLASS_ORDER = ALL_CLASSES.reduce<Record<string, number>>(
  (acc, cls, i) => { acc[cls] = i; return acc }, {}
)

export interface StudentOption {
  id: string
  name: string
  admission_number: string
  class: string
}

interface StudentComboboxProps {
  students: StudentOption[]
  value: string
  onValueChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
  testId?: string
}

export function StudentCombobox({
  students,
  value,
  onValueChange,
  placeholder = 'Select student...',
  disabled,
  testId,
}: StudentComboboxProps) {
  const [open, setOpen] = useState(false)

  const sortedStudents = useMemo(
    () =>
      [...students].sort((a, b) => {
        const oa = CLASS_ORDER[a.class] ?? 99
        const ob = CLASS_ORDER[b.class] ?? 99
        if (oa !== ob) return oa - ob
        return a.name.localeCompare(b.name)
      }),
    [students]
  )

  const byClass = useMemo(() => {
    const groups = new Map<string, StudentOption[]>()
    for (const s of sortedStudents) {
      if (!groups.has(s.class)) groups.set(s.class, [])
      groups.get(s.class)!.push(s)
    }
    return groups
  }, [sortedStudents])

  const selected = students.find(s => s.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-left h-auto min-h-10 py-2"
          disabled={disabled}
          data-testid={testId}
        >
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected
              ? `${selected.name} · ${selected.admission_number} (${selected.class})`
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[340px]" align="start">
        <Command>
          <CommandInput placeholder="Type name or admission number..." />
          <CommandList className="max-h-64">
            <CommandEmpty>No student found.</CommandEmpty>
            {Array.from(byClass.entries()).map(([cls, classStudents]) => (
              <CommandGroup key={cls} heading={cls}>
                {classStudents.map(s => (
                  <CommandItem
                    key={s.id}
                    value={`${s.name} ${s.admission_number} ${s.class}`}
                    onSelect={() => {
                      onValueChange(s.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn('mr-2 h-4 w-4 shrink-0', value === s.id ? 'opacity-100' : 'opacity-0')}
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium truncate">{s.name}</span>
                      <span className="text-muted-foreground text-xs shrink-0">{s.admission_number}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function sortStudentOptions(students: StudentOption[]): StudentOption[] {
  return [...students].sort((a, b) => {
    const oa = CLASS_ORDER[a.class] ?? 99
    const ob = CLASS_ORDER[b.class] ?? 99
    if (oa !== ob) return oa - ob
    return a.name.localeCompare(b.name)
  })
}
