import { NextRequest, NextResponse } from 'next/server';

// Blocked user agents (bots, crawlers, scrapers)
const BLOCKED_USER_AGENTS = [
  'bot', 'crawler', 'spider', 'scraper', 'scraping',
  'curl', 'wget', 'python-requests', 'python-urllib',
  'java', 'go-http', 'php', 'ruby', 'perl',
  'selenium', 'puppeteer', 'playwright', 'headless',
  'automated', 'script', 'tool', 'api-client',
  'postman', 'insomnia', 'httpie', 'axios',
  'requests', 'urllib', 'httpx', 'aiohttp',
  'scrapy', 'beautifulsoup', 'lxml', 'mechanize',
  'phantomjs', 'nightmare', 'casper', 'zombie',
  'webdriver', 'chromedriver', 'geckodriver',
  'selenium-webdriver', 'webdriverio', 'testcafe'
];

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  blockDuration: 60 * 60 * 1000, // 1 hour block
};

function isBlockedUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BLOCKED_USER_AGENTS.some(blocked => ua.includes(blocked));
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return false;
  }
  
  if (now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return false;
  }
  
  if (record.count >= RATE_LIMIT.maxRequests) {
    return true;
  }
  
  record.count++;
  return false;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

function addSecurityHeaders(response: NextResponse): void {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (relaxed for development)
  const csp = process.env.NODE_ENV === 'development' 
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';"
    : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';";
  
  response.headers.set('Content-Security-Policy', csp);
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
}

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = getClientIP(request);
  const path = request.nextUrl.pathname;
  
  // Skip security checks for local development
  if (process.env.NODE_ENV === 'development' || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }
  
  // Block requests without user agent (only in production)
  if (!userAgent) {
    return new NextResponse('Access Denied', { status: 403 });
  }
  
  // Block known bots and scrapers (only in production)
  if (isBlockedUserAgent(userAgent)) {
    return new NextResponse('Access Denied', { status: 403 });
  }
  
  // Rate limiting
  if (isRateLimited(ip)) {
    return new NextResponse('Rate limit exceeded', { status: 429 });
  }
  
  // Block suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];
  
  for (const header of suspiciousHeaders) {
    if (request.headers.get(header) && !request.headers.get('cf-connecting-ip')) {
      // Allow Cloudflare headers but block others
      if (header !== 'cf-connecting-ip') {
        return new NextResponse('Access Denied', { status: 403 });
      }
    }
  }
  
  // Block requests to sensitive files
  if (path.includes('.json') || path.includes('.env') || path.includes('config')) {
    return new NextResponse('Access Denied', { status: 403 });
  }
  
  // Add security headers
  const response = NextResponse.next();
  addSecurityHeaders(response);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
