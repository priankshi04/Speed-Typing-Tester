import React from 'react';

export interface CharacterState {
    char: string;
    state: 'correct' | 'incorrect' | 'pending';
    isCursor: boolean;
}

interface SentenceDisplayProps {
    characters: CharacterState[];
}

const Character: React.FC<{ charState: CharacterState }> = ({ charState }) => {
    const { char, state, isCursor } = charState;

    const stateClasses = {
        correct: 'text-green-400',
        incorrect: 'text-red-400 bg-red-900/50 rounded-sm',
        pending: 'text-gray-500',
    };

    const cursorClass = isCursor ? 'border-l-2 border-yellow-400 animate-pulse' : '';
    
    // Use a non-breaking space for space characters to ensure they are rendered and have height.
    const displayChar = char === ' ' ? '\u00A0' : char;

    return (
        <span className={`${stateClasses[state]} ${cursorClass} transition-colors duration-200`}>
            {displayChar}
        </span>
    );
};


const SentenceDisplay: React.FC<SentenceDisplayProps> = ({ characters }) => {
    return (
        <p className="whitespace-pre-wrap">
            {characters.map((charState, index) => (
                <Character key={index} charState={charState} />
            ))}
        </p>
    );
};

export default SentenceDisplay;