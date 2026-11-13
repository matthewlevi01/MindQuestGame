import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { getParentAccount } from '../../utils/storage';

interface ParentGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  reason?: string;
  expectedPin?: string;
}

export const ParentGateModal: React.FC<ParentGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Parent Verification',
  reason = 'To switch profiles or view the parent dashboard, please enter your parent PIN.',
  expectedPin,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [useMathChallenge, setUseMathChallenge] = useState(false);
  const [mathAnswer, setMathAnswer] = useState('');

  const [num1] = useState(() => Math.floor(Math.random() * 6) + 6);
  const [num2] = useState(() => Math.floor(Math.random() * 8) + 6);
  const expectedMathAnswer = num1 * num2;

  if (!isOpen) return null;

  const parent = getParentAccount();
  const activePin = expectedPin || parent.pin || '1234';
  const isCustomCloudPin = Boolean(expectedPin);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = isCustomCloudPin
      ? pin === activePin
      : pin === activePin || pin === '1234';

    if (isValid) {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(mathAnswer.trim(), 10) === expectedMathAnswer) {
      setError(false);
      setMathAnswer('');
      onSuccess();
    } else {
      setError(true);
      setMathAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-child">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-[#7f27a8] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#7f27a8] text-white border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ffd400] text-black border border-black flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">{title}</h3>
              <p className="text-xs text-white/90">Parent-Controlled Access Gate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-black">
          <p className="text-sm text-black font-medium mb-5 leading-relaxed">{reason}</p>

          {!useMathChallenge ? (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-2">
                  Enter Parent PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="••••"
                  autoFocus
                  className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono border-2 border-[#7f27a8] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#53b0c9] text-black bg-white"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-black font-semibold">
                    {isCustomCloudPin ? (
                      'Enter your Guardian PIN'
                    ) : (
                      <>
                        Default demo PIN: <strong className="font-mono text-[#7f27a8]">1234</strong>
                      </>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setUseMathChallenge(true);
                      setError(false);
                    }}
                    className="text-xs text-[#c1008f] hover:text-[#7f27a8] font-extrabold cursor-pointer"
                  >
                    Solve math challenge instead
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[#c1008f] border-2 border-black rounded-xl text-xs text-white font-bold">
                  {isCustomCloudPin
                    ? 'Incorrect PIN. Please try again or solve the math challenge.'
                    : 'Incorrect PIN. Please try again or use the demo PIN (1234).'}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-bold text-black bg-[#e885cf]/40 hover:bg-[#e885cf] rounded-xl transition-colors cursor-pointer"
                >
                  Stay in Child World
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-extrabold text-black bg-[#ffd400] hover:bg-[#53b0c9] border-2 border-black rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Verify &amp; Proceed
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMathSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-2">
                  Parent Check: What is {num1} × {num2}?
                </label>
                <input
                  type="number"
                  value={mathAnswer}
                  onChange={(e) => {
                    setMathAnswer(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Answer"
                  autoFocus
                  className="w-full px-4 py-3 text-center text-xl font-mono border-2 border-[#7f27a8] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#53b0c9] text-black bg-white"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-black font-semibold">Safeguards child profiles</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUseMathChallenge(false);
                      setError(false);
                    }}
                    className="text-xs text-[#c1008f] hover:text-[#7f27a8] font-extrabold cursor-pointer"
                  >
                    Use 4-digit PIN instead
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[#c1008f] border-2 border-black rounded-xl text-xs text-white font-bold">
                  Calculation did not match. Please recalculate.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-bold text-black bg-[#e885cf]/40 hover:bg-[#e885cf] rounded-xl transition-colors cursor-pointer"
                >
                  Stay in Child World
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-extrabold text-black bg-[#ffd400] hover:bg-[#53b0c9] border-2 border-black rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Confirm Parent
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
