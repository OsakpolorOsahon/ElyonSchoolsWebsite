export interface FeeStructureItem {
  id?: string
  fee_type: string
  amount: number
}

export interface Scholarship {
  id: string
  student_id: string
  name: string
  coverage_type: 'full' | 'percentage' | 'fixed'
  coverage_value: number
  fee_types: string[] | null
  applies_to_term: string | null
  applies_to_year: number | null
  active: boolean
  notes: string | null
  created_by: string | null
  created_at: string
}

/**
 * Calculate how much scholarship credit applies for a given student's fees.
 * Returns a value in Naira (₦).
 *
 * @param feeStructures  The fee rows for the student's class/term/year
 * @param scholarship    The student's active scholarship (or null)
 * @param currentTerm    The active school term
 * @param currentYear    The active school year
 */
export function calcScholarshipCredit(
  feeStructures: FeeStructureItem[],
  scholarship: Scholarship | null | undefined,
  currentTerm: string,
  currentYear: number,
): number {
  if (!scholarship || !scholarship.active) return 0

  if (scholarship.applies_to_term && scholarship.applies_to_term !== currentTerm) return 0
  if (scholarship.applies_to_year && scholarship.applies_to_year !== currentYear) return 0

  const hasTypeFilter = Array.isArray(scholarship.fee_types) && scholarship.fee_types.length > 0

  const applicableFees = hasTypeFilter
    ? feeStructures.filter(f => scholarship.fee_types!.includes(f.fee_type))
    : feeStructures

  const applicableTotal = applicableFees.reduce((s, f) => s + Number(f.amount), 0)
  if (applicableTotal === 0) return 0

  if (scholarship.coverage_type === 'full') {
    return applicableTotal
  }
  if (scholarship.coverage_type === 'percentage') {
    return Math.round((Number(scholarship.coverage_value) / 100) * applicableTotal)
  }
  if (scholarship.coverage_type === 'fixed') {
    return Math.min(Number(scholarship.coverage_value), applicableTotal)
  }

  return 0
}
