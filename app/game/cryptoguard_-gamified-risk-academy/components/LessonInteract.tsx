import React, { useState } from 'react';
import { Lesson, QuestionType } from '../types';
import Button from './ui/Button';
import { CheckCircle, XCircle, ArrowRight, Terminal } from 'lucide-react';

interface LessonInteractProps {
  lesson: Lesson;
  onComplete: () => void;
  onBack: () => void;
}

const LessonInteract: React.FC<LessonInteractProps> = ({ lesson, onComplete, onBack }) => {
  const [step, setStep] = useState(0); // 0 = Content, 1..n = Questions
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string[]>([]);

  const currentQuestion = step > 0 ? lesson.questions[step - 1] : null;

  const handleNext = () => {
    setFeedback(null);
    setSelectedOption(null);
    if (step === lesson.questions.length) {
      onComplete();
    } else {
      setStep(prev => prev + 1);
      // Initialize sort order if next question is sorting
      const nextQ = lesson.questions[step]; // Logic index matches next
      if (nextQ && nextQ.type === QuestionType.SORTING) {
        setSortOrder([...nextQ.options].sort(() => Math.random() - 0.5)); // Shuffle initially
      }
    }
  };

  const handleSubmit = () => {
    if (!currentQuestion) return;

    let isCorrect = false;

    if (currentQuestion.type === QuestionType.SORTING) {
      isCorrect = JSON.stringify(sortOrder) === JSON.stringify(currentQuestion.correctAnswer);
    } else {
      isCorrect = selectedOption === currentQuestion.correctAnswer;
    }

    setFeedback(isCorrect ? 'correct' : 'incorrect');
  };

  // Sorting helper: Move item up
  const moveItem = (index: number, direction: -1 | 1) => {
    const newOrder = [...sortOrder];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setSortOrder(newOrder);
    }
  };

  // --- RENDER HELPERS ---
  
  // Progress Bar (Retro Style)
  const renderProgressBar = () => {
    const total = lesson.questions.length;
    const current = step; // 0 is reading, 1 is q1
    const pct = (current / total) * 100;
    
    return (
      <div className="w-full h-6 border-2 border-gray-600 bg-black p-1 mb-6 relative">
        <div 
          className="h-full bg-arcade-neon transition-all duration-300 relative z-10"
          style={{ width: `${Math.min(pct, 100)}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-retro text-white z-20 mix-blend-difference">
           PROGRESS_BAR.EXE [{current}/{total}]
        </div>
      </div>
    );
  };

  // Content Slide
  if (step === 0) {
    return (
      <div className="flex flex-col h-full p-4 md:p-8 animate-fade-in max-w-3xl mx-auto font-retro relative overflow-hidden">
        {/* CRT Overlay */}
        <div className="arcade-scanline"></div>
        
        <div className="border-4 border-arcade-cyan bg-gray-900/90 p-1 relative shadow-[0_0_20px_rgba(0,255,255,0.2)] flex flex-col h-full">
            <div className="border border-arcade-cyan/50 flex flex-col h-full p-6">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 border-b-2 border-dashed border-gray-600 pb-4">
                    <Terminal className="text-arcade-pink w-8 h-8" />
                    <div>
                        <h1 className="text-4xl text-white uppercase tracking-wider">{lesson.title}</h1>
                        <p className="text-arcade-cyan text-xl">/// {lesson.description}</p>
                    </div>
                </div>
                
                {/* Content Box */}
                <div className="flex-grow overflow-y-auto font-sans text-lg leading-relaxed text-gray-300 space-y-4 pr-2 mb-8 custom-scrollbar">
                  {/* Using font-sans here for readability of long text, but keeping headers retro */}
                  <div className="bg-black/50 p-6 border-l-4 border-arcade-pink font-mono text-green-400">
                    <p className="typing-effect">{lesson.content}</p>
                  </div>
                </div>

                <div className="space-y-4 mt-auto z-20">
                    <Button onClick={handleNext} fullWidth variant="arcade">
                    INITIALIZE QUIZ SEQUENCE <ArrowRight className="ml-2 w-6 h-6" />
                    </Button>
                    <button onClick={onBack} className="w-full text-gray-500 hover:text-white uppercase tracking-widest text-lg hover:underline">
                        Abort Mission
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // Quiz Slides
  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col h-full p-4 md:p-8 max-w-3xl mx-auto animate-fade-in relative font-retro">
       <div className="arcade-scanline"></div>

       <div className="border-4 border-arcade-yellow bg-gray-900/95 p-1 relative shadow-[0_0_20px_rgba(255,255,0,0.15)] flex flex-col h-full">
         <div className="border border-arcade-yellow/30 flex flex-col h-full p-6 relative z-10">
            
            {renderProgressBar()}

            <div className="flex-grow flex flex-col justify-center">
                <div className="mb-8">
                    <span className="text-arcade-yellow text-xl mb-2 block">QUERY_ID: {currentQuestion.id}</span>
                    <h2 className="text-3xl md:text-4xl text-white leading-tight">
                    {currentQuestion.type === QuestionType.FILL_BLANK ? "COMPLETE THE DATA STREAM:" : currentQuestion.prompt}
                    </h2>
                </div>

                {/* Question Area */}
                <div className="space-y-4 w-full">
                
                {/* FILL BLANK & MULTIPLE CHOICE UI */}
                {(currentQuestion.type === QuestionType.MULTIPLE_CHOICE || currentQuestion.type === QuestionType.FILL_BLANK) && (
                    <div className="grid gap-4">
                    {currentQuestion.options.map((opt, idx) => {
                        const isSelected = selectedOption === opt;
                        let containerClass = "border-2 bg-black transition-transform cursor-pointer hover:translate-x-2";
                        let textClass = "text-gray-400";
                        let borderClass = "border-gray-700";

                        if (feedback === 'correct' && opt === currentQuestion.correctAnswer) {
                            borderClass = "border-emerald-500 shadow-[0_0_10px_#10b981]";
                            textClass = "text-emerald-400 animate-pulse";
                        } else if (feedback === 'incorrect' && isSelected) {
                            borderClass = "border-red-500 shadow-[0_0_10px_#ef4444]";
                            textClass = "text-red-400";
                        } else if (isSelected) {
                            borderClass = "border-arcade-cyan";
                            textClass = "text-arcade-cyan";
                            containerClass += " translate-x-2";
                        } else {
                            // Default Hover
                            borderClass = "hover:border-white";
                            textClass = "hover:text-white";
                        }

                        return (
                        <button
                            key={opt}
                            onClick={() => !feedback && setSelectedOption(opt)}
                            className={`p-4 text-left group flex items-center ${containerClass} ${borderClass}`}
                            disabled={!!feedback}
                        >
                            <span className={`w-8 h-8 flex items-center justify-center border mr-4 text-xl font-bold ${borderClass} ${textClass}`}>
                                {['A','B','C','D'][idx]}
                            </span>
                            <span className={`text-2xl uppercase ${textClass}`}>
                                {opt}
                            </span>
                        </button>
                        )
                    })}
                    </div>
                )}

                {/* SORTING UI */}
                {currentQuestion.type === QuestionType.SORTING && (
                    <div className="space-y-3">
                    <p className="text-xl text-gray-500 mb-4">> REORDER DATA PACKETS:</p>
                    {sortOrder.map((item, idx) => (
                        <div key={item} className={`flex items-center justify-between p-4 border-2 bg-black
                        ${feedback === 'correct' ? 'border-emerald-500' : 'border-arcade-pink'}
                        `}>
                        <span className="text-white text-2xl font-bold">[{idx + 1}] {item}</span>
                        {!feedback && (
                            <div className="flex gap-2">
                            <button 
                                onClick={() => moveItem(idx, -1)} 
                                disabled={idx === 0}
                                className="w-10 h-10 border border-gray-500 text-white hover:bg-gray-800 disabled:opacity-30 flex items-center justify-center text-xl">▲</button>
                            <button 
                                onClick={() => moveItem(idx, 1)} 
                                disabled={idx === sortOrder.length - 1}
                                className="w-10 h-10 border border-gray-500 text-white hover:bg-gray-800 disabled:opacity-30 flex items-center justify-center text-xl">▼</button>
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
                )}
                </div>
            </div>

            {/* Feedback & Actions */}
            <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-700">
                {feedback ? (
                    <div className="animate-bounce-short">
                        <div className={`flex items-start gap-4 mb-4 ${feedback === 'correct' ? 'text-emerald-400' : 'text-red-500'}`}>
                            {feedback === 'correct' ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                            <div>
                                <h3 className="text-3xl font-bold uppercase">{feedback === 'correct' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}</h3>
                                <p className="text-gray-300 text-lg font-sans mt-2 border-l-2 pl-4 border-gray-600">{currentQuestion.explanation}</p>
                            </div>
                        </div>
                        <Button onClick={feedback === 'correct' ? handleNext : () => setFeedback(null)} variant="arcade" fullWidth>
                            {feedback === 'correct' ? (step === lesson.questions.length ? 'COMPLETE LEVEL' : 'NEXT DATA BLOCK >>') : 'RETRY SEQUENCE'}
                        </Button>
                    </div>
                ) : (
                    <Button 
                        onClick={handleSubmit} 
                        fullWidth 
                        variant="arcade"
                        disabled={!selectedOption && currentQuestion.type !== QuestionType.SORTING}
                        style={{opacity: (!selectedOption && currentQuestion.type !== QuestionType.SORTING) ? 0.5 : 1}}
                    >
                        EXECUTE CODE
                    </Button>
                )}
            </div>

         </div>
       </div>
    </div>
  );
};

export default LessonInteract;