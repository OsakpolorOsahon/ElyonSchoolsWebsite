'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { 
  GraduationCap, 
  User, 
  Users, 
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'

const steps = [
  { id: 1, name: 'Student Information', icon: User },
  { id: 2, name: 'Guardian Details', icon: Users },
  { id: 3, name: 'Academic Information', icon: GraduationCap },
  { id: 4, name: 'Review & Submit', icon: FileText },
]

const classOptions = [
  { value: 'creche', label: 'Creche (6 months - 2 years)' },
  { value: 'toddlers', label: 'Toddlers (2 - 3 years)' },
  { value: 'pre-nursery', label: 'Pre-Nursery (3 - 4 years)' },
  { value: 'nursery', label: 'Nursery (4 - 5 years)' },
  { value: 'primary-1', label: 'Primary 1' },
  { value: 'primary-2', label: 'Primary 2' },
  { value: 'primary-3', label: 'Primary 3' },
  { value: 'primary-4', label: 'Primary 4' },
  { value: 'primary-5', label: 'Primary 5' },
  { value: 'primary-6', label: 'Primary 6' },
  { value: 'jss-1', label: 'JSS 1' },
  { value: 'jss-2', label: 'JSS 2' },
  { value: 'jss-3', label: 'JSS 3' },
  { value: 'sss-1', label: 'SSS 1' },
  { value: 'sss-2', label: 'SSS 2' },
  { value: 'sss-3', label: 'SSS 3' },
]

export default function ApplyPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    studentFirstName: '',
    studentLastName: '',
    studentMiddleName: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Nigerian',
    stateOfOrigin: '',
    guardianFirstName: '',
    guardianLastName: '',
    guardianEmail: '',
    guardianPhone: '',
    guardianAddress: '',
    guardianRelationship: '',
    guardianOccupation: '',
    classApplied: '',
    previousSchool: '',
    medicalConditions: '',
    agreeTerms: false,
  })

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!formData.agreeTerms) {
      toast({
        title: 'Please accept terms',
        description: 'You must agree to the terms and conditions to submit your application.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed')
      }

      toast({
        title: 'Application Submitted!',
        description: 'Redirecting you to complete payment...',
      })

      router.push(`/admissions/payment?id=${result.admissionId}&amount=${result.amount}&email=${encodeURIComponent(formData.guardianEmail)}`)
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'There was an error submitting your application. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
            <GraduationCap className="mr-1 h-3 w-3" />
            Admission Application
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Apply for Admission
          </h1>
          <p className="mt-4 text-muted-foreground">
            Complete the form below to apply for admission to Elyon Schools
          </p>
        </div>

        <nav aria-label="Progress" className="mb-8">
          <ol className="flex items-center justify-center">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'flex-1' : ''} flex items-center`}>
                <div className="flex flex-col items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    currentStep > step.id 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : currentStep === step.id 
                        ? 'border-primary text-primary' 
                        : 'border-muted-foreground/30 text-muted-foreground'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium hidden sm:block ${
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`} />
                )}
              </li>
            ))}
          </ol>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].name}</CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Enter the student\'s personal information'}
              {currentStep === 2 && 'Enter the parent/guardian\'s contact details'}
              {currentStep === 3 && 'Provide academic information and preferences'}
              {currentStep === 4 && 'Review your application before submitting'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studentFirstName">First Name *</Label>
                    <Input
                      id="studentFirstName"
                      value={formData.studentFirstName}
                      onChange={(e) => updateFormData('studentFirstName', e.target.value)}
                      placeholder="Enter first name"
                      data-testid="input-student-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentLastName">Last Name *</Label>
                    <Input
                      id="studentLastName"
                      value={formData.studentLastName}
                      onChange={(e) => updateFormData('studentLastName', e.target.value)}
                      placeholder="Enter last name"
                      data-testid="input-student-last-name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentMiddleName">Middle Name</Label>
                  <Input
                    id="studentMiddleName"
                    value={formData.studentMiddleName}
                    onChange={(e) => updateFormData('studentMiddleName', e.target.value)}
                    placeholder="Enter middle name (optional)"
                    data-testid="input-student-middle-name"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                      data-testid="input-date-of-birth"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => updateFormData('gender', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" data-testid="radio-male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" data-testid="radio-female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => updateFormData('nationality', e.target.value)}
                      placeholder="Enter nationality"
                      data-testid="input-nationality"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stateOfOrigin">State of Origin</Label>
                    <Input
                      id="stateOfOrigin"
                      value={formData.stateOfOrigin}
                      onChange={(e) => updateFormData('stateOfOrigin', e.target.value)}
                      placeholder="Enter state of origin"
                      data-testid="input-state-of-origin"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="guardianFirstName">Guardian First Name *</Label>
                    <Input
                      id="guardianFirstName"
                      value={formData.guardianFirstName}
                      onChange={(e) => updateFormData('guardianFirstName', e.target.value)}
                      placeholder="Enter first name"
                      data-testid="input-guardian-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianLastName">Guardian Last Name *</Label>
                    <Input
                      id="guardianLastName"
                      value={formData.guardianLastName}
                      onChange={(e) => updateFormData('guardianLastName', e.target.value)}
                      placeholder="Enter last name"
                      data-testid="input-guardian-last-name"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="guardianEmail">Email Address *</Label>
                    <Input
                      id="guardianEmail"
                      type="email"
                      value={formData.guardianEmail}
                      onChange={(e) => updateFormData('guardianEmail', e.target.value)}
                      placeholder="Enter email address"
                      data-testid="input-guardian-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianPhone">Phone Number *</Label>
                    <Input
                      id="guardianPhone"
                      type="tel"
                      value={formData.guardianPhone}
                      onChange={(e) => updateFormData('guardianPhone', e.target.value)}
                      placeholder="Enter phone number"
                      data-testid="input-guardian-phone"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianAddress">Home Address *</Label>
                  <Textarea
                    id="guardianAddress"
                    value={formData.guardianAddress}
                    onChange={(e) => updateFormData('guardianAddress', e.target.value)}
                    placeholder="Enter full home address"
                    rows={3}
                    data-testid="input-guardian-address"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="guardianRelationship">Relationship to Student *</Label>
                    <Select
                      value={formData.guardianRelationship}
                      onValueChange={(value) => updateFormData('guardianRelationship', value)}
                    >
                      <SelectTrigger data-testid="select-relationship">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="guardian">Guardian</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianOccupation">Occupation</Label>
                    <Input
                      id="guardianOccupation"
                      value={formData.guardianOccupation}
                      onChange={(e) => updateFormData('guardianOccupation', e.target.value)}
                      placeholder="Enter occupation"
                      data-testid="input-guardian-occupation"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="classApplied">Class Applying For *</Label>
                  <Select
                    value={formData.classApplied}
                    onValueChange={(value) => updateFormData('classApplied', value)}
                  >
                    <SelectTrigger data-testid="select-class">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousSchool">Previous School (if any)</Label>
                  <Input
                    id="previousSchool"
                    value={formData.previousSchool}
                    onChange={(e) => updateFormData('previousSchool', e.target.value)}
                    placeholder="Enter name of previous school"
                    data-testid="input-previous-school"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">Medical Conditions / Allergies</Label>
                  <Textarea
                    id="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={(e) => updateFormData('medicalConditions', e.target.value)}
                    placeholder="List any medical conditions or allergies we should be aware of"
                    rows={3}
                    data-testid="input-medical-conditions"
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Student Name</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">
                        {formData.studentFirstName} {formData.studentMiddleName} {formData.studentLastName}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Date of Birth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{formData.dateOfBirth || 'Not provided'}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Gender</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium capitalize">{formData.gender || 'Not provided'}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Class Applied</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">
                        {classOptions.find(c => c.value === formData.classApplied)?.label || 'Not selected'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Guardian Name</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{formData.guardianFirstName} {formData.guardianLastName}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Guardian Contact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{formData.guardianPhone || 'Not provided'}</p>
                      <p className="text-sm text-muted-foreground">{formData.guardianEmail}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex items-start space-x-3 pt-4">
                  <Checkbox
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => updateFormData('agreeTerms', checked as boolean)}
                    data-testid="checkbox-agree-terms"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="agreeTerms" className="text-sm font-normal">
                      I confirm that all information provided is accurate and I agree to the{' '}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms and Conditions
                      </Link>{' '}
                      of Elyon Schools.
                    </Label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
                data-testid="button-previous"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              {currentStep < 4 ? (
                <Button onClick={nextStep} className="gap-2" data-testid="button-next">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="gap-2"
                  data-testid="button-submit-application"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  {!isSubmitting && <CheckCircle className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need help? <Link href="/contact" className="text-primary hover:underline">Contact our admissions team</Link>
        </p>
      </div>
    </div>
  )
}
