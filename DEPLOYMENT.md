# Deployment Guide

This guide covers different ways to deploy the Learn Nepali Dictionary for free or at minimal cost.

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended - FREE)

**Best for**: Production deployment with automatic updates

#### Steps:
1. **Fork the repository** on GitHub
2. **Go to [Vercel](https://vercel.com)** and sign up with GitHub
3. **Import your forked repository**
4. **Configure deployment**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `out`
5. **Deploy** - Vercel will automatically deploy

#### Benefits:
- ✅ FREE for open source
- ✅ Automatic deployments from GitHub
- ✅ Global CDN
- ✅ Custom domains
- ✅ Preview deployments for PRs

#### Configuration:
The project includes `vercel.json` for optimal configuration.

---

### 2. Netlify (FREE)

**Best for**: Static hosting with form handling

#### Steps:
1. **Fork the repository** on GitHub
2. **Go to [Netlify](https://netlify.com)** and sign up
3. **Connect to Git** and select your repository
4. **Configure build settings**:
   - Build Command: `npm run build`
   - Publish Directory: `out`
5. **Deploy**

#### Benefits:
- ✅ FREE tier available
- ✅ Automatic deployments
- ✅ Form handling
- ✅ Branch previews

#### Configuration:
The project includes `netlify.toml` for optimal configuration.

---

### 3. GitHub Pages (FREE)

**Best for**: Simple static hosting

#### Steps:
1. **Enable GitHub Pages** in repository settings
2. **Set source** to "GitHub Actions"
3. **Create workflow** (already included in `.github/workflows/`)
4. **Push to main branch**

#### Benefits:
- ✅ FREE
- ✅ Direct from GitHub
- ✅ Custom domains

---

### 4. Railway (Very Cheap)

**Best for**: Full-stack hosting with database

#### Steps:
1. **Connect GitHub repository** to Railway
2. **Configure environment variables**
3. **Deploy**

#### Benefits:
- ✅ $5/month after free tier
- ✅ Full-stack hosting
- ✅ Database support
- ✅ Auto-deployments

---

## 🛠️ Manual Deployment

### Build for Static Hosting

```bash
# Install dependencies
npm install

# Build the project
npm run build

# The 'out' folder contains your static site
# Upload the contents of 'out' to any static host
```

### Build for Server Hosting

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

---

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env.local` file (optional for basic functionality):

```env
# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: Custom domain
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Production Optimizations

The project is already optimized for production:
- ✅ Static export enabled
- ✅ Image optimization disabled for static hosting
- ✅ Security headers configured
- ✅ Caching headers for data files
- ✅ TypeScript compilation
- ✅ ESLint configuration

---

## 📊 Performance Monitoring

### Vercel Analytics (FREE)
- Built-in performance monitoring
- Real user metrics
- Core Web Vitals tracking

### Google Analytics (FREE)
- Add your GA ID to environment variables
- Track user engagement
- Monitor search patterns

---

## 🔄 Continuous Deployment

### Automatic Deployments
- **Vercel/Netlify**: Automatically deploy on push to main
- **GitHub Pages**: Deploy via GitHub Actions
- **Railway**: Auto-deploy on push

### Manual Deployments
```bash
# Build and test locally
npm run build
npm run preview

# Deploy to your chosen platform
# (Follow platform-specific instructions)
```

---

## 🌐 Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS records

### GitHub Pages
1. Add CNAME file to repository
2. Configure DNS records

---

## 📈 Scaling Considerations

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month
- **Netlify**: 100GB bandwidth/month
- **GitHub Pages**: 1GB storage, 100GB bandwidth

### When to Upgrade
- High traffic (>100GB/month)
- Need server-side features
- Database requirements
- Custom server configuration

---

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### TypeScript Errors
```bash
# Check types
npm run type-check
```

#### Linting Errors
```bash
# Fix linting issues
npm run lint -- --fix
```

#### Static Export Issues
- Ensure `output: 'export'` in `next.config.ts`
- Check for server-side code that needs to be removed
- Verify all imports are client-side compatible

---

## 📞 Support

### Getting Help
- **GitHub Issues**: Report deployment problems
- **Documentation**: Check this guide and README
- **Community**: GitHub Discussions

### Contributing
- **Fork the repository**
- **Create a branch** for your changes
- **Submit a pull request**

---

## 🎯 Recommended Setup

### For Open Source Project
1. **Use Vercel** for main deployment (FREE)
2. **Enable GitHub Pages** as backup
3. **Set up GitHub Actions** for CI/CD
4. **Configure custom domain** (optional)

### For Personal Use
1. **Use Netlify** for simple deployment
2. **Connect to GitHub** for automatic updates
3. **Use free tier** unless you need more features

This setup ensures your Nepali dictionary is accessible to everyone while keeping costs at zero! 🎉

