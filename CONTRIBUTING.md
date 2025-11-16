# Contributing to Learn Nepali Dictionary

Thank you for your interest in contributing to the Learn Nepali Dictionary! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- Git
- A GitHub account

### Setup Development Environment

1. **Fork the repository**
   - Click the "Fork" button on GitHub
   - Clone your fork: `git clone https://github.com/YOUR_USERNAME/learn-nepali.git`

2. **Install dependencies**
   ```bash
   cd learn-nepali
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Create a branch for your changes**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Types of Contributions

### 1. Adding New Words

**Where to add words:**
- Edit JSON files in `public/data/` directory
- Choose the appropriate category file (e.g., `food.json`, `verbs.json`)

**Word structure:**
```json
{
  "DevanagriWord": "नयाँ",
  "romanization": "naya",
  "pos": "adjective",
  "definitions": ["new", "fresh"],
  "examples": "यो नयाँ किताब हो।",
  "examplesRomanized": "yo naya kitab ho.",
  "exampleEnglish": "This is a new book.",
  "frequency": "high",
  "category": "general"
}
```

**Guidelines:**
- Use proper Devanagari script
- Provide accurate romanization
- Include multiple definitions when possible
- Add realistic examples
- Set appropriate frequency (high/medium/low)

### 2. Improving Search Functionality

**Files to modify:**
- `src/lib/dataLoader.ts` - Main search engine
- `src/components/DictionarySearch.tsx` - Search interface

**Areas for improvement:**
- Search algorithm optimization
- New search features
- Performance improvements
- Better result ranking

### 3. UI/UX Improvements

**Files to modify:**
- `src/components/` - React components
- `src/app/globals.css` - Global styles
- `src/app/layout.tsx` - Layout component

**Ideas:**
- Better mobile responsiveness
- New UI features
- Accessibility improvements
- Dark/light mode enhancements

### 4. Documentation

**Files to modify:**
- `README.md` - Main documentation
- `CONTRIBUTING.md` - This file
- Code comments and JSDoc

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use meaningful variable names
- Add comments for complex logic

### Testing
- Test your changes locally
- Ensure search functionality works
- Check for TypeScript errors
- Verify responsive design

### Performance
- Keep bundle size small
- Optimize search performance
- Use efficient data structures
- Minimize re-renders

## 📋 Pull Request Process

### Before Submitting
1. **Test your changes**
   ```bash
   npm run build
   npm run dev
   ```

2. **Check for errors**
   ```bash
   npm run lint
   ```

3. **Update documentation** if needed

### Submitting a PR
1. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: description of your changes"
   ```

2. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Fill out the template
   - Submit the PR

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tested locally
- [ ] No TypeScript errors
- [ ] Search functionality works

## Screenshots (if applicable)
Add screenshots for UI changes
```

## 🐛 Reporting Issues

### Before Reporting
1. Check if the issue already exists
2. Try the latest version
3. Test in different browsers

### Issue Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Search for '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows, macOS, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]
```

## 💡 Feature Requests

### Before Requesting
1. Check existing issues
2. Consider if it fits the project goals
3. Think about implementation complexity

### Request Template
```markdown
**Feature Description**
Clear description of the feature.

**Use Case**
Why would this be useful?

**Proposed Solution**
How would you implement this?

**Alternatives**
Other ways to achieve the same goal.
```

## 🏷️ Categories for New Words

When adding words, use these categories:
- `general` - Common words
- `verbs` - Action words
- `adverbs` - Descriptive words
- `food` - Culinary terms
- `sports` - Sports and recreation
- `animals` - Animal names
- `colors` - Color names
- `family` - Family relationships
- `time` - Time-related words
- `places` - Location names
- `professions` - Job titles
- `education` - School/learning terms
- `health` - Medical terms
- `transport` - Transportation
- `technology` - Tech terms
- `nature` - Natural world
- `clothing` - Clothing items
- `tools` - Tools and equipment
- `music` - Musical terms
- `religion` - Religious terms

## 📞 Getting Help

- **GitHub Discussions**: For questions and ideas
- **GitHub Issues**: For bugs and feature requests
- **Email**: your-email@example.com

## 🎉 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Given credit in the application

Thank you for contributing to the Nepali language learning community! 🙏

