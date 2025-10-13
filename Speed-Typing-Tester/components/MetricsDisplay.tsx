
import React from 'react';

interface MetricsDisplayProps {
    time: number;
    wpm: number;
    accuracy: number;
    isFinished: boolean;
}

const MetricBox: React.FC<{ label: string; value: string | number; final?: boolean }> = ({ label, value, final = false }) => (
    <div className={`flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg shadow-md transition-all duration-300 ${final ? 'transform scale-110 ring-2 ring-yellow-400' : ''}`}>
        <span className="text-sm text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-3xl font-bold text-yellow-400">{value}</span>
    </div>
);

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ time, wpm, accuracy, isFinished }) => {
    return (
        <div className="grid grid-cols-3 gap-4 mb-8">
            <MetricBox label="Time Left" value={`${time}s`} final={isFinished} />
            <MetricBox label="WPM" value={wpm} final={isFinished} />
            <MetricBox label="Accuracy" value={`${accuracy.toFixed(1)}%`} final={isFinished} />
        </div>
    );
};

export default MetricsDisplay;