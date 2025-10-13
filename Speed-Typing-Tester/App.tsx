import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStatus } from './types';
import { getRandomParagraph } from './services/sentenceService';
import SentenceDisplay, { CharacterState } from './components/SentenceDisplay';
import MetricsDisplay from './components/MetricsDisplay';
import RestartButton from './components/RestartButton';

const GAME_DURATION = 60; // Initial game duration in seconds
const WORD_BONUS = 5; // Seconds to add for a correct word
const WORD_PENALTY = 10; // Seconds to remove for an incorrect word

const App: React.FC = () => {
    const [sentence, setSentence] = useState<string>('');
    const [userInput, setUserInput] = useState<string>('');
    const [status, setStatus] = useState<GameStatus>(GameStatus.Waiting);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [bonusTime, setBonusTime] = useState<number>(0);
    const [wpm, setWpm] = useState<number>(0);
    const [accuracy, setAccuracy] = useState<number>(100);
    const inputRef = useRef<HTMLInputElement>(null);

    const resetGame = useCallback(() => {
        setSentence(getRandomParagraph());
        setUserInput('');
        setStatus(GameStatus.Waiting);
        setStartTime(null);
        setElapsedTime(0);
        setBonusTime(0);
        setWpm(0);
        setAccuracy(100);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        resetGame();
    }, [resetGame]);

    useEffect(() => {
        let timer: number | undefined;
        if (status === GameStatus.Started) {
            timer = window.setInterval(() => {
                if (startTime) {
                    const newElapsedTime = (Date.now() - startTime) / 1000;
                    const totalDuration = GAME_DURATION + bonusTime;
                    
                    if (newElapsedTime >= totalDuration) {
                        setElapsedTime(totalDuration);
                        setStatus(GameStatus.Finished);
                    } else {
                        setElapsedTime(newElapsedTime);
                    }
                }
            }, 1000);
        }
        return () => window.clearInterval(timer);
    }, [status, startTime, bonusTime]);

    useEffect(() => {
        if (status === GameStatus.Waiting) {
            setWpm(0);
            setAccuracy(100);
            return;
        }

        if (elapsedTime > 0) {
            const durationInMinutes = elapsedTime / 60;
            const wordsTyped = userInput.length / 5;
            setWpm(Math.round(wordsTyped / durationInMinutes));
        } else {
            setWpm(0);
        }

        let correctChars = 0;
        const testSentence = sentence.replace(/\n/g, ' ');
        for (let i = 0; i < userInput.length; i++) {
            if (userInput[i] === testSentence[i]) {
                correctChars++;
            }
        }
        const newAccuracy = userInput.length > 0 ? (correctChars / userInput.length) * 100 : 100;
        setAccuracy(newAccuracy);

    }, [userInput, sentence, elapsedTime, status]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (status === GameStatus.Finished) return;

        let currentStartTime = startTime;
        if (status === GameStatus.Waiting && value.length > 0) {
            setStatus(GameStatus.Started);
            const now = Date.now();
            setStartTime(now);
            currentStartTime = now;
        }
        
        // Check for word completion (space pressed) and apply bonus/penalty
        if (value.endsWith(' ') && !userInput.endsWith(' ')) {
            const wordsInSentence = sentence.split(/[\s\n]+/);
            const typedWords = userInput.split(' ');
            const currentWordIndex = typedWords.length - 1;

            if (currentWordIndex < wordsInSentence.length) {
                const typedWord = typedWords[currentWordIndex];
                const correctWord = wordsInSentence[currentWordIndex];
                if (typedWord === correctWord) {
                    setBonusTime(prev => prev + WORD_BONUS);
                } else {
                    setBonusTime(prev => prev - WORD_PENALTY);
                }
            }
        }

        setUserInput(value);
        
        const testSentence = sentence.replace(/\n/g, ' ');
        if (value === testSentence) {
            if (currentStartTime) {
                const finalElapsedTime = (Date.now() - currentStartTime) / 1000;
                setElapsedTime(finalElapsedTime);
            }
            setStatus(GameStatus.Finished);
        }
    };

    const timeLeft = Math.ceil(Math.max(0, GAME_DURATION + bonusTime - elapsedTime));

    const testSentenceForCharComparison = sentence.replace(/\n/g, ' ');
    const characters: CharacterState[] = sentence.split('').map((char, index) => {
        let state: 'correct' | 'incorrect' | 'pending' = 'pending';
        if (index < userInput.length) {
            state = userInput[index] === testSentenceForCharComparison[index] ? 'correct' : 'incorrect';
        }
        const isCursor = index === userInput.length;
        return { char, state, isCursor };
    });

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-300 font-mono p-4">
            <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-yellow-400 mb-8">Typing Speed Test</h1>

                <MetricsDisplay
                    time={timeLeft}
                    wpm={wpm}
                    accuracy={accuracy}
                    isFinished={status === GameStatus.Finished}
                />
                
                <div className="relative text-2xl leading-relaxed bg-gray-800 p-6 rounded-lg shadow-lg mb-8 w-full" onClick={() => inputRef.current?.focus()}>
                    <SentenceDisplay characters={characters} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-text"
                        disabled={status === GameStatus.Finished}
                        autoFocus
                    />
                </div>

                <div className="text-center">
                    <RestartButton onRestart={resetGame} />
                </div>
            </div>
        </div>
    );
};

export default App;