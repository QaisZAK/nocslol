'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RotateCcw, HelpCircle } from 'lucide-react'

interface Ability {
  key: string
  name: string
  givesCS: boolean
  description: string
  notes: string
  image?: string
}

interface Champion {
  id: string
  name: string
  title: string
  image: string
  csMechanics: {
    abilities: Ability[]
  }
}

interface DailyTrivia {
  champion: Champion
  ability: Ability
  date: string
}

export default function TriviaPage() {
  const [dailyTrivia, setDailyTrivia] = useState<DailyTrivia | null>(null)
  const [userGuess, setUserGuess] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch daily trivia from API
  const fetchDailyTrivia = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/trivia')
      if (!response.ok) {
        throw new Error('Failed to fetch daily trivia')
      }
      const trivia = await response.json()
      setDailyTrivia(trivia)
      
      // Check if user has already answered today
      const answeredToday = localStorage.getItem(`trivia-${trivia.date}`)
      if (answeredToday) {
        setHasAnswered(true)
        setUserGuess(answeredToday === 'true')
        setShowResult(true)
        setIsCorrect(answeredToday === trivia.ability.givesCS.toString())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDailyTrivia()
  }, [])

  const handleGuess = (guess: boolean) => {
    if (!dailyTrivia || hasAnswered) return
    
    setUserGuess(guess)
    setShowResult(true)
    setIsCorrect(guess === dailyTrivia.ability.givesCS)
    setHasAnswered(true)
    
    // Store answer in localStorage
    localStorage.setItem(`trivia-${dailyTrivia.date}`, guess.toString())
  }

  const resetDaily = () => {
    setUserGuess(null)
    setShowResult(false)
    setIsCorrect(false)
    setHasAnswered(false)
    localStorage.removeItem(`trivia-${dailyTrivia?.date}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-lol-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lol-gold"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-lol-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Trivia</h2>
          <p className="text-lol-accent mb-4">{error}</p>
          <button
            onClick={fetchDailyTrivia}
            className="px-6 py-3 bg-lol-gold text-lol-dark rounded-lg font-semibold hover:bg-lol-gold/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!dailyTrivia) {
    return (
      <div className="min-h-screen bg-lol-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-lol-accent mb-4">No Trivia Available</h2>
          <p className="text-lol-accent/60">Unable to load today's trivia.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-lol-dark">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-lol-gold mb-2">Daily CS Trivia</h1>
          <p className="text-lol-accent text-lg">
            Test your knowledge of champion abilities and CS mechanics!
          </p>
          <p className="text-lol-accent/60 text-sm mt-2">
            {new Date(dailyTrivia.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

                 {/* Champion Info */}
         <div className="bg-lol-darker rounded-lg p-6 mb-8 border border-lol-gold/30">
           <div className="flex items-center space-x-6">
             <img 
               src={dailyTrivia.champion.image} 
               alt={dailyTrivia.champion.name}
               className="w-24 h-24 rounded-lg object-cover"
             />
             <div className="flex-1">
               <h2 className="text-2xl font-bold text-lol-gold">{dailyTrivia.champion.name}</h2>
               <p className="text-lol-accent/80">{dailyTrivia.champion.title}</p>
             </div>
             {dailyTrivia.ability.image && (
               <div className="text-center">
                 <img 
                   src={dailyTrivia.ability.image} 
                   alt={dailyTrivia.ability.name}
                   className="w-16 h-16 rounded-lg object-cover mx-auto mb-2"
                 />
                 <p className="text-sm text-lol-accent/60">{dailyTrivia.ability.key}</p>
               </div>
             )}
           </div>
         </div>

        {/* Question */}
        <div className="bg-lol-darker rounded-lg p-8 mb-8 border border-lol-gold/30">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-lol-accent mb-2">Today's Question:</h3>
            <div className="bg-lol-dark rounded-lg p-4 border border-lol-gold/20">
              <p className="text-lg text-lol-gold font-medium">
                Does {dailyTrivia.champion.name}'s <span className="text-yellow-400">{dailyTrivia.ability.key} - {dailyTrivia.ability.name}</span> give CS?
              </p>
            </div>
          </div>

          {/* Answer Buttons */}
          {!hasAnswered && (
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleGuess(true)}
                className="flex items-center space-x-2 px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Yes, it gives CS</span>
              </button>
              <button
                onClick={() => handleGuess(false)}
                className="flex items-center space-x-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
              >
                <XCircle className="w-5 h-5" />
                <span>No, it doesn't give CS</span>
              </button>
            </div>
          )}

          {/* Result */}
          {showResult && (
            <div className="mt-6">
              <div className={`text-center p-4 rounded-lg border ${
                isCorrect 
                  ? 'bg-green-600/20 border-green-500 text-green-400' 
                  : 'bg-red-600/20 border-red-500 text-red-400'
              }`}>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                  <span className="text-xl font-semibold">
                    {isCorrect ? 'Correct!' : 'Incorrect!'}
                  </span>
                </div>
                <p className="text-lg">
                  {dailyTrivia.ability.givesCS ? 'Yes' : 'No'}, {dailyTrivia.champion.name}'s {dailyTrivia.ability.name} {dailyTrivia.ability.givesCS ? 'gives CS' : 'does not give CS'}.
                </p>
              </div>

              {/* Explanation */}
              <div className="mt-4 bg-lol-dark rounded-lg p-4 border border-lol-gold/20">
                <h4 className="text-lol-gold font-semibold mb-2 flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>Explanation</span>
                </h4>
                <p className="text-lol-accent mb-2">{dailyTrivia.ability.description}</p>
                {dailyTrivia.ability.notes && (
                  <p className="text-lol-accent/80 text-sm italic">{dailyTrivia.ability.notes}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        {hasAnswered && (
          <div className="text-center">
            <button
              onClick={resetDaily}
              className="flex items-center space-x-2 px-6 py-3 bg-lol-gold/20 hover:bg-lol-gold/30 text-lol-gold rounded-lg font-medium transition-colors border border-lol-gold/30"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset for Today</span>
            </button>
          </div>
        )}

        {/* Rules */}
        <div className="mt-12 bg-lol-darker rounded-lg p-6 border border-lol-gold/30">
          <h3 className="text-xl font-semibold text-lol-gold mb-4">How it works:</h3>
          <ul className="space-y-2 text-lol-accent">
            <li>• A new champion ability is selected each day</li>
            <li>• You need to guess whether the ability gives CS</li>
            <li>• You can only answer once per day</li>
            <li>• Come back tomorrow for a new challenge!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
