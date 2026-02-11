'use client';

import { useState } from 'react';

interface FlashcardProps {
    front: string;
    frontSubtext?: string;
    back: string;
    backSubtext?: string;
    isFlipped: boolean;
    onFlip: () => void;
}

export default function Flashcard({
    front,
    frontSubtext,
    back,
    backSubtext,
    isFlipped,
    onFlip,
}: FlashcardProps) {
    return (
        <div className="flashcard-container" onClick={onFlip}>
            <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
                {/* Front of card */}
                <div className="flashcard-face flashcard-front">
                    <div className="flashcard-content">
                        <p className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                            {front}
                        </p>
                        {frontSubtext && (
                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
                                {frontSubtext}
                            </p>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
                        Click or press Space to flip
                    </p>
                </div>

                {/* Back of card */}
                <div className="flashcard-face flashcard-back">
                    <div className="flashcard-content">
                        <p className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            {back}
                        </p>
                        {backSubtext && (
                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
                                {backSubtext}
                            </p>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
                        Click or press Space to flip back
                    </p>
                </div>
            </div>

            <style jsx>{`
        .flashcard-container {
          perspective: 1000px;
          width: 100%;
          max-width: 600px;
          height: 400px;
          cursor: pointer;
          margin: 0 auto;
        }

        .flashcard {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flashcard.flipped {
          transform: rotateY(180deg);
        }

        .flashcard-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .flashcard-front {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .flashcard-back {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          transform: rotateY(180deg);
        }

        .flashcard-content {
          text-align: center;
          color: white;
        }

        .flashcard-face p {
          color: white !important;
        }

        @media (max-width: 768px) {
          .flashcard-container {
            height: 350px;
          }
        }
      `}</style>
        </div>
    );
}
