'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  MessageSquare,
  CheckCircle,
  Building2,
  MessageCircle
} from 'lucide-react'

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Us',
    details: ['123 Education Avenue', 'Ikeja, Lagos', 'Nigeria'],
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+234 803 123 4567', '+234 809 876 5432'],
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: ['info@elyonschools.edu.ng', 'admissions@elyonschools.edu.ng'],
  },
  {
    icon: Clock,
    title: 'Office Hours',
    details: ['Monday - Friday: 7:30 AM - 4:00 PM', 'Saturday: 9:00 AM - 1:00 PM'],
  },
]

const subjects = [
  'General Inquiry',
  'Admissions Information',
  'Fee Payment',
  'Academic Programs',
  'School Visit Request',
  'Other',
]

export default function ContactPage() {

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const message = `*New Message from Elyon Schools Website*\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Phone:* ${formData.phone || 'Not provided'}\n*Subject:* ${formData.subject}\n\n*Message:*\n${formData.message}`

    const whatsappUrl = `https://wa.me/2347035175566?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  return (
    <div>
      <section className="relative py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Have questions about our programs or admissions? We&apos;re here to help. 
              Reach out to us and our team will get back to you promptly.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Send Us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <MessageCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">WhatsApp Opened!</h3>
                      <p className="text-muted-foreground mb-6">
                        Your message has been prepared and WhatsApp has been opened. Please send it to complete your enquiry.
                      </p>
                      <Button onClick={() => {
                        setIsSubmitted(false)
                        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
                      }} data-testid="button-send-another">
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            placeholder="Your full name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            data-testid="input-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            data-testid="input-email"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+234 xxx xxx xxxx"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            data-testid="input-phone"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Select
                            value={formData.subject}
                            onValueChange={(value) => setFormData({ ...formData, subject: value })}
                            required
                          >
                            <SelectTrigger id="subject" data-testid="select-subject">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="How can we help you?"
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          data-testid="input-message"
                        />
                      </div>

                      <Button type="submit" className="w-full gap-2 bg-green-600 hover:bg-green-700" disabled={isSubmitting} data-testid="button-submit-contact">
                        {isSubmitting ? (
                          <>Opening WhatsApp...</>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4" />
                            Send via WhatsApp
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info) => (
                <Card key={info.title}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                        {info.details.map((detail, index) => (
                          <p key={index} className="text-sm text-muted-foreground">{detail}</p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
              Find Us
            </h2>
            <p className="text-muted-foreground">
              Our campus is located in the heart of Ikeja, easily accessible by public transport.
            </p>
          </div>
          
          <div className="relative aspect-[21/9] rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 flex items-center justify-center">
            <Building2 className="w-32 h-32 text-primary/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="font-semibold text-lg">Elyon Schools Main Campus</p>
              <p className="text-sm text-white/80">123 Education Avenue, Ikeja, Lagos</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
