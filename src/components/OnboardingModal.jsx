import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const OnboardingModal = ({ user, onClose }) => {
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    { id: 'q1', text: 'What is your primary goal for using our service?' },
    { id: 'q2', text: 'How did you hear about us?' },
    { id: 'q3', text: 'What is your experience level with cryptocurrency?' },
    { id: 'q4', text: 'Which feature are you most excited about?' },
  ];

  const handleCheckboxChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { error } = await supabase
      .from('onboarding_responses')
      .insert({ user_id: user.id, responses });

    if (error) {
      console.error('Error saving onboarding responses:', error);
    } else {
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
        <p className="mb-6">Help us understand your needs by answering a few questions.</p>
        <div className="space-y-4">
          {questions.map(q => (
            <div key={q.id}>
              <p className="font-semibold">{q.text}</p>
              <div className="flex space-x-4 mt-2">
                <label><input type="checkbox" onChange={() => handleCheckboxChange(q.id, 'A')} /> Option A</label>
                <label><input type="checkbox" onChange={() => handleCheckboxChange(q.id, 'B')} /> Option B</label>
                <label><input type="checkbox" onChange={() => handleCheckboxChange(q.id, 'C')} /> Option C</label>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
