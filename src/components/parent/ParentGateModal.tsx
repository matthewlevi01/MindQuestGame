import React, { useState } from 'react';
import { ShieldCheck, Lock, X } from 'lucide-react';
import { getParentAccount } from '../../utils/storage';

interface ParentGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  reason?: string;
}

export const ParentGateModal: React.FC<ParentGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Parent Verification',
  reason = 'To switch profiles or view the parent dashboard, please enter your parent PIN.',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [useMathChallenge, setUseMathChallenge] = useState(false);
  const [mathAnswer, setMathAnswer] = useState('');

  // Generate a simple adult math challenge
  const [num1] = useState(() => Math.floor(Math.random() * 6) + 6); // 6-11
  const [num2] = useState(() => Math.floor(Math.random() * 8) + 6); // 6-13
  const expectedMathAnswer = num1 * num2;

  if (!isOpen) return null;

  const parent = getParentAccount();

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === parent.pin || pin === '1234') {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">Parent-Controlled Access Gate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-5 leading-relaxed">{reason}</p>

          {!useMathChallenge ? (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Enter 4-Digit Parent PIN
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
                  className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">
                    Default demo PIN: <strong className="font-mono text-slate-700">1234</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setUseMathChallenge(true);
                      setError(false);
                    }}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Solve math challenge instead
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  Incorrect PIN. Please try again or use the demo PIN (1234).
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Stay in Child World
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
                >
                  Verify & Proceed
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMathSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
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
                  className="w-full px-4 py-3 text-center text-xl font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">Safeguards child profiles</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUseMathChallenge(false);
                      setError(false);
                    }}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Use 4-digit PIN instead
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  Calculation did not match. Please recalculate.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Stay in Child World
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
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
