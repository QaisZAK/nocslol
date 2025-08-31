'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/contact-discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      setSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('Contact error:', error)
      setError(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (success) {
    return (
      <div className="min-h-screen bg-lol-gradient flex items-center justify-center px-4">
        <div className="lol-card p-12 text-center max-w-md mx-auto">
          <CheckCircle className="w-16 h-16 text-lol-green mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-lol-gold mb-4">Message Sent!</h1>
          <p className="text-lol-accent/80 mb-6">
            Thank you for contacting us. We'll get back to you as soon as possible.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="lol-button"
          >
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-lol-gradient py-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-lol-gold to-yellow-500 rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-lol-dark" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-lol-gold mb-4 text-shadow">
            Contact Us
          </h1>
          <p className="text-lol-accent/80 text-lg">
            Have a question, suggestion, or just want to say hi? We'd love to hear from you!
          </p>
        </div>

        {/* Contact Form */}
        <div className="lol-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-lol-gold mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-lol-dark text-lol-accent border border-lol-gold/30 rounded-lg px-4 py-3 focus:outline-none focus:border-lol-gold focus:ring-2 focus:ring-lol-gold/20 transition-all"
                placeholder="Your name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-lol-gold mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-lol-dark text-lol-accent border border-lol-gold/30 rounded-lg px-4 py-3 focus:outline-none focus:border-lol-gold focus:ring-2 focus:ring-lol-gold/20 transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-lol-gold mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full bg-lol-dark text-lol-accent border border-lol-gold/30 rounded-lg px-4 py-3 focus:outline-none focus:border-lol-gold focus:ring-2 focus:ring-lol-gold/20 transition-all"
                placeholder="What's this about?"
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-lol-gold mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full bg-lol-dark text-lol-accent border border-lol-gold/30 rounded-lg px-4 py-3 focus:outline-none focus:border-lol-gold focus:ring-2 focus:ring-lol-gold/20 transition-all resize-none"
                placeholder="Tell us what's on your mind..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-lol-red bg-lol-red/10 border border-lol-red/20 rounded-lg px-4 py-3">
                <XCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${
                loading
                  ? 'bg-lol-accent/20 text-lol-accent/40 cursor-not-allowed'
                  : 'lol-button hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-lol-accent/60 text-sm">
            We typically respond within a week or so. For urgent matters, you can also reach us directly at Discord: @habibiqais
          </p>
        </div>
      </div>
    </div>
  )
}
