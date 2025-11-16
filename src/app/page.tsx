import DictionarySearch from '@/components/DictionarySearch';
import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Animated Background with Falling Devanagari Characters */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute text-gray-800 dark:text-gray-700 text-2xl md:text-3xl lg:text-4xl animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${0}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
              animationIterationCount: 'infinite'
            }}
          >
            {['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ'][Math.floor(Math.random() * 35)]}
          </div>
        ))}
      </div>

      {/* Theme Toggle Button */}
      <ThemeToggle />

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Centered Dictionary Section */}
          <div className="w-[80vw] mx-auto">
            <DictionarySearch />
          </div>
        </main>
      </div>
    </div>
  );
}
