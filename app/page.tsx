import Link from 'next/link'
import { Sword, Users, Zap, Target, Shield, Star, BookOpen, Trophy, Skull, Heart, Flame, Crown, Upload, Monitor } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-lol-gradient opacity-90"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-lol-gold/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-lol-red/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-lol-blue/15 rounded-full animate-spin" style={{animationDuration: '8s'}}></div>
        <div className="absolute top-1/3 right-16 w-20 h-20 bg-lol-green/20 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          {/* Main Title with Fun Subtitle */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-lol-gold mb-4 text-shadow">
              NoCSLOL
            </h1>
          </div>

          {/* Fun Challenge Description */}
          <div className="mb-8">
            <p className="text-2xl md:text-3xl text-lol-accent mb-4">
              🎯 The Ultimate Flex Challenge
            </p>
            <p className="text-lg text-lol-accent/80 mb-6 max-w-3xl mx-auto">
              Win games with <span className="text-lol-red font-bold">ZERO</span> creep score. 
              Because fu*k what X, Reddit, and Twitch chat think. We play for fun.
            </p>
            
            {/* Fun Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-lol-dark/50 rounded-lg p-3 border border-lol-gold/30">
                <div className="text-2xl font-bold text-lol-gold">0</div>
                <div className="text-sm text-lol-accent/70">CS Goal</div>
              </div>
              <div className="bg-lol-dark/50 rounded-lg p-3 border border-lol-gold/30">
                <div className="text-2xl font-bold text-lol-red">∞</div>
                <div className="text-sm text-lol-accent/70">Flex Potential</div>
              </div>
              <div className="bg-lol-dark/50 rounded-lg p-3 border border-lol-gold/30">
                <div className="text-2xl font-bold text-lol-green">100%</div>
                <div className="text-sm text-lol-accent/70">Aura Farming</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/champions" className="lol-button text-lg group">
              <Sword className="inline-block w-5 h-5 mr-2 group-hover:animate-pulse" />
              Browse Champions
            </Link>
                            <Link href="/guide" className="lol-button-secondary text-lg group">
              <BookOpen className="inline-block w-5 h-5 mr-2 group-hover:animate-bounce" />
              Learn CS Mechanics
            </Link>
          </div>

          {/* Fun Disclaimer */}
          <div className="text-sm text-lol-accent/50 max-w-md mx-auto">
            ⚠️ Warning: May cause your teammates to flame you
          </div>
          

        </div>
      </section>

             {/* What is NoCS Section */}
       <section className="py-20 px-4 bg-lol-darker">
         <div className="max-w-6xl mx-auto">
           <h2 className="text-4xl font-bold text-center text-lol-gold mb-16 text-shadow">
             🤔 "What even is NoCS?"
           </h2>
           
                       {/* Challenge Explanation */}
            <div className="text-center mb-12">
              <div className="inline-block bg-lol-dark/50 rounded-2xl p-8 border border-lol-gold/30 max-w-4xl">
                <Target className="w-16 h-16 text-lol-gold mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-lol-gold mb-4">The Ultimate Flex Challenge</h3>
                <p className="text-lg text-lol-accent/80 max-w-3xl mx-auto mb-8">
                  Win League of Legends games with <span className="text-lol-red font-bold">ZERO</span> creep score. 
                  No minions, no jungle monsters, no CS at all. It's the ultimate test of skill and patience.
                </p>
                
                {/* CS Rules Grid */}
                <div className="grid md:grid-cols-2 gap-8 text-left">
                  <div className="bg-lol-dark/30 rounded-xl p-6 border border-lol-red/30">
                    <h4 className="text-lol-red font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="text-2xl">❌</span>
                      What Gives CS
                    </h4>
                    <ul className="space-y-3 text-lol-accent/80">
                      <li className="flex items-start gap-3">
                        <span className="text-lol-red text-sm mt-1">•</span>
                        <span>Killing minions</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-lol-red text-sm mt-1">•</span>
                        <span>Destroying wards</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-lol-red text-sm mt-1">•</span>
                        <span>Some champion abilities</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-lol-red text-sm mt-1">•</span>
                        <span>Jungle monsters</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-lol-dark/30 rounded-xl p-6 border border-lol-green/30">
                    <h4 className="text-lol-green font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      What Doesn't Give CS
                    </h4>
                    <ul className="space-y-3 text-lol-accent/80">
                      <li className="flex items-start gap-3">
                        <span className="text-lol-green text-sm mt-1">•</span>
                        <span>Champion kills</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-lol-green text-sm mt-1">•</span>
                        <span>Most abilities</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-lol-green text-sm mt-1">•</span>
                        <span>Towers, Inhibitors, and Nexus</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

           {/* Why Do This Section */}
           <div className="text-center">
             <h3 className="text-2xl font-bold text-lol-gold mb-4">🤷‍♂️ Why Would Anyone Do This?</h3>
             <p className="text-lol-accent/80 max-w-3xl mx-auto">
               Because sometimes challenge is fun, sometimes we don't want to pick meta characters.
               Plus, the aura of winning with 0 CS. 
               <span className="text-lol-gold font-bold"> GG EZ.</span>
             </p>
           </div>
         </div>
       </section>

      {/* Features Section - Redesigned */}
      <section className="py-20 px-4 bg-lol-dark">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-lol-gold mb-16 text-shadow">
            🛠️ Tools for the Insane
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/champions" className="lol-card p-6 text-center group hover:scale-105 transition-transform cursor-pointer">
              <Users className="w-12 h-12 text-lol-gold mx-auto mb-4 group-hover:animate-bounce" />
              <h3 className="text-lg font-semibold text-lol-accent mb-2">Champion Database</h3>
              <p className="text-sm text-lol-accent/70">
                Every champion's abilities analyzed. Know what to avoid like the plague.
              </p>
            </Link>
            
                         <Link href="/guide" className="lol-card p-6 text-center group hover:scale-105 transition-transform cursor-pointer">
               <BookOpen className="w-12 h-12 text-lol-gold mx-auto mb-4 group-hover:animate-bounce" />
               <h3 className="text-lg font-semibold text-lol-accent mb-2">CS Mechanics Guide</h3>
               <p className="text-sm text-lol-accent/70">
                 The bible of what gives CS. Study it like your life depends on it.
               </p>
             </Link>
             
             <Link href="/submit" className="lol-card p-6 text-center group hover:scale-105 transition-transform cursor-pointer">
               <Upload className="w-12 h-12 text-lol-gold mx-auto mb-4 group-hover:animate-bounce" />
               <h3 className="text-lg font-semibold text-lol-accent mb-2">Submit Findings</h3>
               <p className="text-sm text-lol-accent/70">
                 Found something new? Share it with the community of madmen.
               </p>
             </Link>
             
             <div className="lol-card p-6 text-center group opacity-50 cursor-not-allowed">
               <Monitor className="w-12 h-12 text-lol-accent/50 mx-auto mb-4" />
               <h3 className="text-lg font-semibold text-lol-accent/50 mb-2">Stream Overlay</h3>
               <p className="text-sm text-lol-accent/50">
                 Create custom NoCS overlays for your stream. (Temporarily Disabled)
               </p>
             </div>
             
            
            
            <div className="lol-card p-6 text-center group opacity-50 cursor-not-allowed">
              <Trophy className="w-12 h-12 text-lol-accent/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-lol-accent/50 mb-2">Pro Strategies</h3>
              <p className="text-sm text-lol-accent/50">
                Advanced techniques from players who've lost their minds. (Coming Soon™)
              </p>
            </div>
            
            <div className="lol-card p-6 text-center group opacity-50 cursor-not-allowed">
              <Heart className="w-12 h-12 text-lol-accent/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-lol-accent/50 mb-2">Community</h3>
              <p className="text-sm text-lol-accent/50">
                Join other players who think this is a good idea. (Coming Soon™)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fun CTA Section */}
      <section className="py-20 px-4 bg-lol-gradient">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-lol-gold mb-6 text-shadow">
            🚀 Ready to Join the Madness?
          </h2>
          <p className="text-xl text-lol-accent mb-8">
            Become a legend. Or become a meme. Either way, it'll be entertaining.
          </p>
          
          {/* Fun Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-lol-dark/30 rounded-lg p-4 border border-lol-gold/40">
              <div className="text-3xl font-bold text-lol-gold">🎯</div>
              <div className="text-sm text-lol-accent/70">Perfect 0 CS Games</div>
            </div>
            <div className="bg-lol-dark/30 rounded-lg p-4 border border-lol-gold/40">
              <div className="text-3xl font-bold text-lol-gold">🔥</div>
              <div className="text-sm text-lol-accent/70">Maximum Flex</div>
            </div>
            <div className="bg-lol-dark/30 rounded-lg p-4 border border-lol-gold/40">
              <div className="text-3xl font-bold text-lol-gold">👑</div>
              <div className="text-sm text-lol-accent/70">Chad Status</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/champions" className="lol-button text-lg group">
              <Crown className="inline-block w-5 h-5 mr-2 group-hover:animate-pulse" />
              Start Your Journey
            </Link>
                            <Link href="/submit" className="lol-button-secondary text-lg group">
              <Flame className="inline-block w-5 h-5 mr-2 group-hover:animate-bounce" />
              Share Your Wisdom
            </Link>
          </div>
        </div>
      </section>

             {/* Fun Footer */}
       <footer className="bg-lol-darker py-10 px-4 border-t border-lol-gold/30">
         <div className="max-w-4xl mx-auto">
           {/* Logo and Brand */}
           <div className="text-center mb-6">
             <div className="inline-flex items-center gap-3 mb-3">
               <div className="w-10 h-10 bg-gradient-to-br from-lol-gold to-yellow-500 rounded-lg flex items-center justify-center">
                 <Sword className="w-6 h-6 text-lol-dark" />
               </div>
               <span className="text-2xl font-bold text-lol-gold">NoCSLOL</span>
             </div>
             <p className="text-lol-accent/60 text-base">
               Made with 💜 by Habibi / MeatKebab
             </p>
           </div>

           {/* Main Content Row */}
           <div className="grid md:grid-cols-3 gap-6 mb-6">
             {/* Left Column - Legal */}
             <div className="text-center md:text-left">
               <p className="text-lol-accent/40 text-sm leading-relaxed">
                 Not affiliated with Riot Games. League of Legends is a trademark of Riot Games, Inc.
               </p>
             </div>

             {/* Center Column - Warning */}
             <div className="text-center">
               <p className="text-lol-accent/30 text-xs leading-relaxed max-w-xs mx-auto">
                 ⚠️ Side effects may include: intense team flame, valid crashouts when you get more than 0 CS, and an overwhelming urge to flex when you win
               </p>
             </div>

             {/* Right Column - Contact */}
             <div className="text-center md:text-right">
               <a 
                 href="/contact" 
                 className="inline-flex items-center gap-2 px-4 py-2 text-xs text-lol-accent/50 hover:text-lol-gold transition-colors border border-lol-gold/20 hover:border-lol-gold/40 rounded-lg hover:bg-lol-gold/10"
               >
                 <span>📧</span>
                 <span>Contact Us</span>
               </a>
             </div>
           </div>

           {/* Bottom Border */}
           <div className="w-full h-px bg-gradient-to-r from-transparent via-lol-gold/20 to-transparent"></div>
         </div>
       </footer>
    </div>
  )
}
