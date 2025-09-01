'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function LiveGameRedirectPage() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const region = params.region as string
    const summonerParam = params.summoner as string
    
    if (region && summonerParam) {
      // Parse the summoner parameter to extract summoner name and tag
      // The format should be: summonerName-tag (OP.GG style)
      const parts = summonerParam.split('-')
      const summonerName = decodeURIComponent(parts[0]) // Decode URL-encoded characters
      const tag = parts[1] || region // If no tag found, use region as fallback
      
      // Redirect to the main live page with search parameters
      const searchParams = new URLSearchParams({
        region: region,
        summoner: summonerName,
        tag: tag
      })
      
      router.replace(`/live?${searchParams.toString()}`)
    } else {
      // If no valid parameters, redirect to the main live page
      router.replace('/live')
    }
  }, [params, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-300">Redirecting to live game analysis...</p>
      </div>
    </div>
  )
}
