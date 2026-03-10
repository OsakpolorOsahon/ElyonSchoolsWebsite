import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMISSION_FEE = 50000

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studentFirstName,
      studentLastName,
      studentMiddleName,
      dateOfBirth,
      gender,
      nationality,
      stateOfOrigin,
      guardianFirstName,
      guardianLastName,
      guardianEmail,
      guardianPhone,
      guardianAddress,
      guardianRelationship,
      guardianOccupation,
      classApplied,
      previousSchool,
      medicalConditions,
    } = body

    if (!studentFirstName || !studentLastName || !guardianEmail || !classApplied) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('admissions')
      .insert({
        student_data: {
          firstName: studentFirstName,
          lastName: studentLastName,
          middleName: studentMiddleName || null,
          dateOfBirth: dateOfBirth || null,
          gender: gender || null,
          nationality: nationality || 'Nigerian',
          stateOfOrigin: stateOfOrigin || null,
          previousSchool: previousSchool || null,
          medicalConditions: medicalConditions || null,
        },
        guardian_data: {
          firstName: guardianFirstName,
          lastName: guardianLastName,
          email: guardianEmail,
          phone: guardianPhone || null,
          address: guardianAddress || null,
          relationship: guardianRelationship || null,
          occupation: guardianOccupation || null,
        },
        class_applied: classApplied,
        status: 'pending_payment',
        amount: ADMISSION_FEE,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Admissions DB error:', error)
      return NextResponse.json(
        { error: 'Failed to save application' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      admissionId: data.id,
      amount: ADMISSION_FEE,
    })
  } catch (error) {
    console.error('Admissions error:', error)
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    )
  }
}
