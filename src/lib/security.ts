// Security utilities for client-side protection

// Anti-scraping measures
export class SecurityManager {
  private static instance: SecurityManager;
  private isHuman: boolean = false;
  private mouseMovements: number = 0;
  private keyPresses: number = 0;
  private startTime: number = Date.now();

  private constructor() {
    // Only initialize protection in production
    if (process.env.NODE_ENV === 'production') {
      this.initializeProtection();
    }
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private initializeProtection(): void {
    if (typeof window === 'undefined') return;

    // Detect human interaction
    this.detectHumanInteraction();
    
    // Anti-debugging measures
    this.antiDebugging();
    
    // Detect automation tools
    this.detectAutomation();
    
    // Obfuscate data
    this.obfuscateData();
    
    // Rate limiting on client side
    this.clientSideRateLimit();
  }

  private detectHumanInteraction(): void {
    // Track mouse movements
    document.addEventListener('mousemove', () => {
      this.mouseMovements++;
      this.isHuman = true;
    });

    // Track keyboard input
    document.addEventListener('keydown', () => {
      this.keyPresses++;
      this.isHuman = true;
    });

    // Track clicks
    document.addEventListener('click', () => {
      this.isHuman = true;
    });

    // Check for human behavior patterns
    setInterval(() => {
      this.validateHumanBehavior();
    }, 5000);
  }

  private validateHumanBehavior(): void {
    const timeSpent = Date.now() - this.startTime;
    
    // If no human interaction detected within reasonable time, block access
    if (timeSpent > 10000 && !this.isHuman) {
      this.blockAccess('No human interaction detected');
    }
    
    // If too many rapid interactions (bot-like behavior)
    if (this.mouseMovements > 1000 || this.keyPresses > 500) {
      this.blockAccess('Suspicious interaction pattern');
    }
  }

  private antiDebugging(): void {
    // Detect developer tools
    let devtools = false;
    
    const checkDevTools = () => {
      if (devtools) {
        this.blockAccess('Developer tools detected');
      }
    };

    // Method 1: Check window dimensions
    setInterval(() => {
      const threshold = 160;
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        devtools = true;
        checkDevTools();
      }
    }, 500);

    // Method 2: Console detection
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function() {
        checkDevTools();
        throw new Error('DevTools detected');
      }
    });
    
    setInterval(() => {
      console.log(element);
      console.clear();
    }, 1000);
  }

  private detectAutomation(): void {
    // Detect Selenium
    if (window.navigator.webdriver) {
      this.blockAccess('Automation tool detected');
    }

    // Detect headless browsers
    if (window.navigator.userAgent.includes('HeadlessChrome')) {
      this.blockAccess('Headless browser detected');
    }

    // Detect PhantomJS
    if (window.navigator.userAgent.includes('PhantomJS')) {
      this.blockAccess('PhantomJS detected');
    }

    // Check for automation properties
    const automationProps = [
      'webdriver',
      '__webdriver_evaluate',
      '__selenium_evaluate',
      '__webdriver_script_function',
      '__webdriver_script_func',
      '__webdriver_script_fn',
      '__fxdriver_evaluate',
      '__driver_unwrapped',
      '__webdriver_unwrapped',
      '__driver_evaluate',
      '__selenium_unwrapped',
      '__fxdriver_unwrapped'
    ];

    for (const prop of automationProps) {
      if (window[prop as keyof Window]) {
        this.blockAccess('Automation property detected');
      }
    }
  }

  private obfuscateData(): void {
    // Obfuscate sensitive data in DOM
    const obfuscateText = (element: Element) => {
      if (element.textContent) {
        const text = element.textContent;
        const obfuscated = text.split('').map(char => 
          Math.random() > 0.5 ? char : String.fromCharCode(char.charCodeAt(0) + 1)
        ).join('');
        
        // Only apply to certain elements
        if (element.classList.contains('obfuscate')) {
          element.textContent = obfuscated;
        }
      }
    };

    // Apply obfuscation to sensitive elements
    document.querySelectorAll('.sensitive-data').forEach(obfuscateText);
  }

  private clientSideRateLimit(): void {
    const requests: number[] = [];
    const maxRequests = 50;
    const timeWindow = 60000; // 1 minute

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const now = Date.now();
      
      // Clean old requests
      while (requests.length > 0 && requests[0] < now - timeWindow) {
        requests.shift();
      }
      
      // Check rate limit
      if (requests.length >= maxRequests) {
        this.blockAccess('Rate limit exceeded');
        throw new Error('Rate limit exceeded');
      }
      
      requests.push(now);
      return originalFetch(...args);
    };
  }

  private blockAccess(reason: string): void {
    console.error('Access blocked:', reason);
    
    // Clear the page content
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: Arial, sans-serif;
        background: #f0f0f0;
        color: #333;
      ">
        <div style="text-align: center;">
          <h1>Access Denied</h1>
          <p>This website is protected against automated access.</p>
          <p>Please use a standard web browser.</p>
        </div>
      </div>
    `;
    
    // Prevent further execution
    throw new Error('Access blocked');
  }

  public isHumanUser(): boolean {
    return this.isHuman;
  }

  public getInteractionStats() {
    return {
      mouseMovements: this.mouseMovements,
      keyPresses: this.keyPresses,
      timeSpent: Date.now() - this.startTime,
      isHuman: this.isHuman
    };
  }
}

// Initialize security manager
if (typeof window !== 'undefined') {
  SecurityManager.getInstance();
}
