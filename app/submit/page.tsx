'use client'

import { useState } from 'react'
import { Upload, Send, AlertTriangle, CheckCircle, XCircle, Info, FileText, Link as LinkIcon } from 'lucide-react'

interface SubmissionForm {
  championName: string
  abilityName: string
  givesCS: boolean
  description: string
  proof: string
  proofType: 'text' | 'link' | 'file'
  additionalNotes: string
  submitterName: string
  submitterDiscord: string
}

export default function SubmitInfoPage() {
  const [formData, setFormData] = useState<SubmissionForm>({
    championName: '',
    abilityName: '',
    givesCS: false,
    description: '',
    proof: '',
    proofType: 'text',
    additionalNotes: '',
    submitterName: '',
    submitterDiscord: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: keyof SubmissionForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.championName.trim()) {
      setError('Champion name is required')
      return false
    }
    if (!formData.abilityName.trim()) {
      setError('Ability name is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!formData.proof.trim()) {
      setError('Proof is required')
      return false
    }
    if (!formData.submitterName.trim()) {
      setError('Your name is required')
      return false
    }
    return true
  }

  const submitToDiscord = async (data: SubmissionForm) => {
    try {
      const response = await fetch('/api/submit-discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit')
      }

      return true
    } catch (error) {
      console.error('Submission error:', error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const success = await submitToDiscord(formData)
      
      if (success) {
        setSubmitted(true)
        setFormData({
          championName: '',
          abilityName: '',
          givesCS: false,
          description: '',
          proof: '',
          proofType: 'text',
          additionalNotes: '',
          submitterName: '',
          submitterDiscord: ''
        })
      } else {
        setError('Failed to submit. Please try again or contact support.')
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-lol-dark flex items-center justify-center">
        <div className="lol-card p-12 text-center max-w-2xl">
          <CheckCircle className="w-24 h-24 text-lol-green mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-lol-gold mb-4">Submission Successful!</h1>
          <p className="text-xl text-lol-accent mb-6">
            Thank you for contributing to the NoCS community! Your submission has been sent to our team for review.
          </p>
          <p className="text-lol-accent/70 mb-8">
            We'll review the information and add it to our database if it's accurate. You'll be credited for your contribution!
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="lol-button"
          >
            Submit Another Finding
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-lol-dark">
      {/* Header */}
      <div className="bg-lol-darker border-b border-lol-gold/30 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-lol-gold mb-4 text-shadow">
            Submit Information
          </h1>
          <p className="text-xl text-lol-accent/80">
            Help build the most accurate NoCS database by submitting your findings
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="lol-card p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-lol-gold mb-4 flex items-center">
              <Info className="w-6 h-6 mr-3" />
              How to Submit
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-lol-dark/50 rounded-lg">
                <div className="w-12 h-12 bg-lol-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lol-gold font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-lol-accent mb-2">Fill Out Form</h3>
                <p className="text-sm text-lol-accent/70">Provide detailed information about the ability or mechanic</p>
              </div>
              <div className="text-center p-4 bg-lol-dark/50 rounded-lg">
                <div className="w-12 h-12 bg-lol-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lol-gold font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-lol-accent mb-2">Include Proof</h3>
                <p className="text-sm text-lol-accent/70">Attach evidence like screenshots, videos, or links</p>
              </div>
              <div className="text-center p-4 bg-lol-dark/50 rounded-lg">
                <div className="w-12 h-12 bg-lol-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lol-gold font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-lol-accent mb-2">Team Review</h3>
                <p className="text-sm text-lol-accent/70">Our team will verify and add it to the database</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champion and Ability */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lol-accent font-medium mb-2">
                  Champion Name *
                </label>
                <input
                  type="text"
                  value={formData.championName}
                  onChange={(e) => handleInputChange('championName', e.target.value)}
                  placeholder="e.g., Ahri, Yasuo, Thresh"
                  className="w-full bg-lol-blue/80 border border-lol-gold/30 rounded-lg px-4 py-3 text-lol-accent placeholder-lol-accent/40 focus:outline-none focus:border-lol-gold/60"
                />
              </div>
              
              <div>
                <label className="block text-lol-accent font-medium mb-2">
                  Ability Name *
                </label>
                <input
                  type="text"
                  value={formData.abilityName}
                  onChange={(e) => handleInputChange('abilityName', e.target.value)}
                  placeholder="e.g., Q - Orb of Deception"
                  className="w-full bg-lol-blue/80 border border-lol-gold/30 rounded-lg px-4 py-3 text-lol-accent placeholder-lol-accent/40 focus:outline-none focus:border-lol-gold/60"
                />
              </div>
            </div>

            {/* CS Status */}
            <div>
              <label className="block text-lol-accent font-medium mb-3">
                Does this ability give CS? *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="givesCS"
                    checked={formData.givesCS === true}
                    onChange={() => handleInputChange('givesCS', true)}
                    className="mr-2 text-lol-gold focus:ring-lol-gold"
                  />
                  <span className="text-lol-red font-medium">Yes, it gives CS</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="givesCS"
                    checked={formData.givesCS === false}
                    onChange={() => handleInputChange('givesCS', false)}
                    className="mr-2 text-lol-gold focus:ring-lol-gold"
                  />
                  <span className="text-lol-green font-medium">No, it doesn't give CS</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-lol-accent font-medium mb-2">
                Detailed Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe exactly how the ability works in relation to CS. Be specific about conditions, timing, etc."
                rows={4}
                className="w-full bg-lol-blue/80 border border-lol-gold/30 rounded-lg px-4 py-3 text-lol-accent placeholder-lol-accent/40 focus:outline-none focus:border-lol-gold/60 resize-vertical"
              />
            </div>

            {/* Proof Type and Content */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lol-accent font-medium mb-2">
                  Proof Type *
                </label>
                <select
                  value={formData.proofType}
                  onChange={(e) => handleInputChange('proofType', e.target.value)}
                  className="w-full bg-lol-blue/80 border border-lol-gold/30 rounded-lg px-4 py-3 text-lol-accent focus:outline-none focus:border-lol-gold/60"
                >
                  <option value="text">Text Description</option>
                  <option value="link">Video/Image Link</option>
                  <option value="file">File Upload</option>
                </select>
              </div>
              
              <div>
                <label className="block text-lol-accent font-medium mb-2">
                  Proof Content *
                </label>
                {formData.proofType === 'text' && (
                  <textarea
                    value={formData.proof}
                    onChange={(e) => handleInputChange('proof', e.target.value)}
                    placeholder="Describe how you tested this and what you observed..."
                    rows={3}
                    className="w-full bg-lol-blue/80 border border-lol-gold/30 rounded-lg px-4 py-3 text-lol-accent placeholder-lol-accent/40 focus:outline-none focus:border-lol-gold/60 resize-vertical"
                  />
                )}
                {formData.proofType === 'link' && (
                  <input
                    type="url"
                    value={formData.proof}
                    onChange={(e) => handleInputChange('proof', e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://imgur.com/..."
                    className="w-full bg-lol-blue/80 border border-lol-gold/30 rounded-lg px-4 py-3 text-lol-accent placeholder-lol-accent/40 focus:outline-none focus:border-lol-gold/60"
                  />
                )}
                {formData.proofType === 'file' && (
                  <div className="border-2 border-dashed border-lol-gold/30 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-lol-gold/60 mx-auto mb-2" />
                    <p className="text-lol-accent/60 text-sm">
                      File uploads will be handled via Discord. Please provide a description of what you're uploading.
                    </p>
                    <textarea
                      value={formData.proof}
                      onChange={(e) => handleInputChange('proof', e.target.value)}
                      placeholder="Describe the file you're uploading and what it shows..."
                      rows={3}
                      className="w-full bg-lol-blue/80 border border-lol-gold/30 rounded-lg px-4 py-3 text-lol-accent placeholder-lol-accent/40 focus:outline-none focus:border-lol-gold/60 resize-vertical mt-3"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-lol-accent font-medium mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                placeholder="Any additional context, tips, or observations that might be helpful..."
                rows={3}
                className="w-full bg-lol-blue/80 border border-lol-gold/30 rounded-lg px-4 py-3 text-lol-accent placeholder-lol-accent/40 focus:outline-none focus:border-lol-gold/60 resize-vertical"
              />
            </div>

            {/* Submitter Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lol-accent font-medium mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.submitterName}
                  onChange={(e) => handleInputChange('submitterName', e.target.value)}
                  placeholder="How should we credit you?"
                  className="w-full bg-lol-blue/80 border border-lol-gold/30 rounded-lg px-4 py-3 text-lol-accent placeholder-lol-accent/40 focus:outline-none focus:border-lol-gold/60"
                />
              </div>
              
              <div>
                <label className="block text-lol-accent font-medium mb-2">
                  Discord Username
                </label>
                <input
                  type="text"
                  value={formData.submitterDiscord}
                  onChange={(e) => handleInputChange('submitterDiscord', e.target.value)}
                  placeholder="username#1234"
                  className="w-full bg-lol-blue/80 border border-lol-gold/30 rounded-lg px-4 py-3 text-lol-accent placeholder-lol-accent/40 focus:outline-none focus:border-lol-gold/60"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-lol-red/20 border border-lol-red/30 rounded-lg p-4 text-lol-red">
                <AlertTriangle className="inline w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="lol-button w-full flex items-center justify-center py-4 text-lg"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-lol-dark mr-3"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Information
                </>
              )}
            </button>
          </form>

          {/* Note about Discord */}
          <div className="mt-8 p-4 bg-lol-blue/30 border border-lol-gold/20 rounded-lg">
            <div className="flex items-start gap-3">
              <LinkIcon className="w-5 h-5 text-lol-gold mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-lol-gold mb-1">Discord Integration</h4>
                <p className="text-sm text-lol-accent/70">
                  All submissions are sent directly to our Discord server for review. Our team will verify the information 
                  and add it to the database if accurate. You'll be credited for your contribution!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
