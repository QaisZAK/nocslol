# NoCSLOL - No Creep Score League of Legends Challenge

A comprehensive website dedicated to the ultimate League of Legends challenge: winning games without getting any creep score (CS). Built with Next.js, TypeScript, and Tailwind CSS.

## 🎯 What is NoCSLOL?

NoCSLOL is a unique challenge where players must win League of Legends games without gaining a single creep score. This website provides:

- **Champion Database**: Detailed information about every champion's abilities and what gives/doesn't give CS
- **Live Game Assistant**: AI-powered advice for your current game composition
- **Community Submissions**: Submit new findings about CS mechanics
- **Strategy Guides**: Learn how to master the NoCS challenge

## ✨ Features

### 🏆 Champions Database
- **Complete index of all 148 League of Legends champions** (Patch 10.10.5)
- **Dual View System**: "Play AS" and "Play AGAINST" perspectives
- Filterable by role, difficulty, and champion type
- Detailed ability breakdowns with CS mechanics
- Individual champion pages with strategies and tips
- **CS Mechanics Focus**: Every champion analyzed for NoCS strategies

### ⚡ Live Game Assistant
- Input your team and enemy composition
- Get AI-powered advice for NoCS strategies
- Real-time recommendations based on champion matchups
- Personalized tips for your specific situation

### 📝 Information Submission
- Submit new findings about CS mechanics
- Include proof (text, links, or file descriptions)
- Automatic Discord webhook integration for review
- Community-driven database expansion

### 🎨 League of Legends Inspired Design
- Authentic LoL color scheme and typography
- Responsive design for all devices
- Smooth animations and hover effects
- Professional gaming aesthetic

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 🆕 What's New
- **Complete Champion Database**: All 148 champions from LoL patch 10.10.5
- **Dual View System**: Switch between "Play AS" and "Play AGAINST" perspectives
- **CS Mechanics Guide**: Comprehensive guide to what gives/doesn't give CS
- **Ready for Manual Updates**: Each champion has a template for you to add specific CS mechanics

### 📚 Adding Champion CS Mechanics
The website includes all champions with default templates. To add specific CS mechanics information:

1. **Read the Guide**: Check `CHAMPION_CS_GUIDE.md` for detailed instructions
2. **Update Data**: Edit `public/data/champions.json` to add ability names and CS mechanics
3. **Test Changes**: Refresh the website to see your updates
4. **Be Accurate**: Only add information you've verified through testing or reliable sources

**Example**: Update Jhin's E ability to note that destroying his flowers gives CS

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nocslol
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
nocslol/
├── app/                    # Next.js 13+ app directory
│   ├── components/         # Reusable components
│   │   └── Navigation.tsx # Main navigation component
│   ├── champions/          # Champion-related pages
│   │   ├── page.tsx       # Champions index (with dual view system)
│   │   └── [id]/          # Individual champion pages
│   ├── cs-mechanics/      # CS mechanics guide
│   │   └── page.tsx
│   ├── live-game/         # Live game assistant
│   │   └── page.tsx
│   ├── submit-info/       # Information submission
│   │   └── page.tsx
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── public/                 # Static assets
│   └── data/              # JSON data files
│       ├── champions.json  # Complete champion database (148 champions)
│       └── cs-mechanics.json # General CS mechanics guide
├── data/                   # Data Dragon files (LoL patch 10.10.5)
│   └── dragontail-10.10.5/
├── scripts/                # Utility scripts
│   └── generate-champions.js # Script to generate champion data
├── CHAMPION_CS_GUIDE.md   # Guide for adding CS mechanics
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 🎨 Design System

### Colors
- **Primary Gold**: `#C89B3C` - League of Legends signature gold
- **Dark Blue**: `#0A1428` - Deep, professional background
- **Accent**: `#F0E6D2` - Light, readable text
- **Success**: `#38A169` - Green for "no CS" abilities
- **Warning**: `#C53030` - Red for "gives CS" abilities

### Typography
- **Primary Font**: Inter - Clean, modern sans-serif
- **Display Font**: Beaufort (LoL-inspired) - For headings and titles

### Components
- **Cards**: Semi-transparent with gold borders
- **Buttons**: Gradient gold with hover effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Sticky header with backdrop blur

## 🔧 Configuration

### Discord Webhook Setup

1. Create a Discord server or use an existing one
2. Go to Server Settings > Integrations > Webhooks
3. Create a new webhook
4. Copy the webhook URL
5. Add it to your `.env.local` file

### Tailwind CSS

The project uses a custom Tailwind configuration with:
- League of Legends color palette
- Custom animations (glow, float)
- Responsive breakpoints
- Custom component classes

### Next.js

- App Router (Next.js 13+)
- TypeScript support
- Image optimization
- API routes ready for future expansion

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms

The project can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain responsive design
- Test on multiple devices
- Follow the existing code style

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Desktop**: Full navigation, detailed layouts
- **Tablet**: Adapted grids, touch-friendly interactions
- **Mobile**: Stacked layouts, mobile-first navigation

## 🔮 Future Features

- **Real-time Updates**: Live CS tracking during games
- **User Accounts**: Save favorite champions and strategies
- **Leaderboards**: Track NoCS challenge achievements
- **API Integration**: Real League of Legends data
- **Mobile App**: React Native companion app
- **Community Features**: Forums, guides, and discussions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Riot Games** for League of Legends
- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icons
- **NoCS Community** for inspiration and feedback

## 📞 Support

- **Discord**: Join our community server
- **Issues**: Report bugs on GitHub
- **Discussions**: Share ideas and feedback

---

**NoCSLOL** - Master the ultimate League of Legends challenge! 🏆⚔️
