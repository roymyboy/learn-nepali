# Learn Nepali — Open Source Dictionary

A comprehensive Nepali–English dictionary with Devanagari script, romanization, and English translations. Built with Next.js and optimized for fast searching.

## 🌟 Features

- **Multi-field search**: Search in Devanagari, romanization, or English definitions
- **Fast & precise**: Exact-match prioritization and lightweight indexing
- **Organized data**: 40+ categories stored as JSON
- **Modern UI**: Dark/light mode with responsive design
- **Open source**: Free for everyone to use and contribute

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone your fork of the repository
git clone <your-repo-url>
cd learn-nepali

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Data Structure

The dictionary contains words organized by categories:
- See `public/data/` for available categories (e.g., General, Verbs, Adverbs, Sports, Food, Technology, Health, and more)

Each entry includes:
- Devanagari script
- Romanization
- Part of speech
- Multiple definitions
- Usage examples
- Category

## 🔍 Search Features

### Exact Match Prioritization
- **Devanagari words**: Exact matches rank highest
- **Romanization**: Case-insensitive exact matches
- **Definitions**: Single-word definitions rank above multi-word

### Search Examples
```bash
# Search in Devanagari
खेल → Returns words with exact Devanagari match

# Search in romanization  
khel → Returns romanized matches

# Search in definitions
sports → Returns words with "sports" in definitions
```

## 🛠️ Development

### Project Structure
```
src/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Utilities and data loading
├── contexts/           # React contexts
└── types.ts           # TypeScript definitions

public/
└── data/              # JSON dictionary files
```

### Key Files
- `src/lib/dataLoader.ts` - Search engine and data loading
- `src/components/DictionarySearch.tsx` - Main search interface
- `public/data/` - Dictionary JSON files

### Useful Scripts
- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run start` — Start the production server
- `npm run export` — Static export (outputs to `out/`)
- `npm run lint` — Run ESLint
- `npm run type-check` — TypeScript checks

## 🚀 Deployment
See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for options and detailed steps. For a quick start:
- Vercel: connect your repository and deploy (Next.js is auto-detected)
- Static hosting: `npm run build && npm run export` and deploy the `out/` directory

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Adding Words
1. Edit the JSON files in `public/data/`
2. Follow the existing structure:
```json
{
  "devanagari": "नयाँ",
  "romanization": "naya",
  "pos": "adjective",
  "definitions": ["new", "fresh"],
  "examples": "यो नयाँ किताब हो।",
  "examplesRomanized": "yo naya kitab ho.",
  "exampleEnglish": "This is a new book.",
  "category": "general"
}
```

### Improving Search
- Enhance the search algorithm in `src/lib/dataLoader.ts`
- Add new search features
- Optimize performance

### UI/UX Improvements
- Improve the interface in `src/components/`
- Add new features
- Fix bugs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Data contributors who helped build the dictionary
- Open source community for tools and libraries
- Nepali language learners and teachers

## 📞 Support

- Open an issue in this repository for bugs or feature requests.

## 🌐 Live Demo

If a live demo is available, link it here.

---

Made with ❤️ for the Nepali language learning community