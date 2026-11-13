import React, { useState } from 'react';
import { FacesCardItem } from '../../data/facesAndThingsDeck';
import { Compass, Navigation, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../../utils/sound';

export interface TreasurePlottedItem {
  id: string;
  card: FacesCardItem;
  x: number;
  y: number;
  isTreasure?: boolean;
}

interface TreasureMapViewProps {
  gridSize?: number;
  plottedItems: TreasurePlottedItem[];
  targetItem: TreasurePlottedItem;
  onCoordinateFound: (x: number, y: number, correct: boolean) => void;
  onReset?: () => void;
  allowCoordinateGuess?: boolean;
}

export const TreasureMapView: React.FC<TreasureMapViewProps> = ({
  gridSize = 8,
  plottedItems,
  targetItem,
  onCoordinateFound,
}) => {
  const [selectedCoord, setSelectedCoord] = useState<{ x: number; y: number } | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const handleIntersectionClick = (x: number, y: number) => {
    setSelectedCoord({ x, y });
    soundEngine.playPop();

    const isMatch = x === targetItem.x && y === targetItem.y;
    if (isMatch) {
      setFeedback('correct');
      soundEngine.playMatch();
      onCoordinateFound(x, y, true);
      setTimeout(() => {
        setFeedback('idle');
        setSelectedCoord(null);
      }, 900);
    } else {
      setFeedback('wrong');
      soundEngine.playError();
      onCoordinateFound(x, y, false);
      setTimeout(() => {
        setFeedback('idle');
      }, 900);
    }
  };

  const coords = Array.from({ length: gridSize }, (_, i) => i);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center select-none font-child">
      <div className="w-full bg-[#7f27a8] text-white rounded-2xl p-4 mb-4 border-2 border-black shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#ffd400] border-2 border-black flex items-center justify-center text-black shadow-inner">
            <Compass className="w-7 h-7 animate-spin-slow" />
          </div>
          <div>
            <div className="text-xs uppercase font-black tracking-widest text-[#ffd400] flex items-center gap-1.5">
              <span>Coordinate Grid Challenge</span>
              <span className="text-[10px] bg-[#c1008f] text-white px-2 py-0.5 rounded-full">
                {gridSize}×{gridSize} Map
              </span>
            </div>
            <h3 className="text-lg font-black text-white">Find the Treasure Coordinates!</h3>
          </div>
        </div>

        <div className="bg-[#53b0c9] text-black border-2 border-black rounded-xl px-4 py-2 flex items-center gap-3 shadow-md">
          <div className="text-3xl">{targetItem.card.emoji}</div>
          <div className="text-left">
            <div className="text-[11px] uppercase tracking-wider font-black">
              Target Item
            </div>
            <div className="text-base font-black">{targetItem.card.name}</div>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-square max-w-[560px] p-4 sm:p-6 bg-[#ffd400]/20 rounded-3xl border-4 border-[#7f27a8] shadow-2xl overflow-hidden flex flex-col justify-between bg-white">
        <div className="absolute top-6 right-6 opacity-25 pointer-events-none flex flex-col items-center">
          <Navigation className="w-16 h-16 text-[#7f27a8] -rotate-45" />
          <span className="text-xs font-black text-[#7f27a8] tracking-widest mt-0.5">NORTH</span>
        </div>

        <div className="absolute -left-1 sm:left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] uppercase tracking-widest font-black text-black">
          Latitude (Y) ↑
        </div>

        <div className="relative w-full h-full flex flex-col justify-between z-10 pl-4 sm:pl-6 pb-4 sm:pb-6">
          {[...coords].reverse().map((y) => (
            <div key={y} className="flex-1 flex items-center relative">
              <div className="w-5 -ml-5 sm:-ml-6 text-xs sm:text-sm font-black text-black text-center select-none">
                {y}
              </div>

              <div className="absolute left-0 right-0 h-0.5 border-b border-dashed border-[#53b0c9] pointer-events-none" />

              <div className="w-full flex justify-between relative h-full items-center">
                {coords.map((x) => {
                  const plotted = plottedItems.find((p) => p.x === x && p.y === y);
                  const isSelected = selectedCoord?.x === x && selectedCoord?.y === y;

                  return (
                    <div
                      key={`${x}-${y}`}
                      onClick={() => handleIntersectionClick(x, y)}
                      className="relative flex items-center justify-center -translate-x-1/2 cursor-pointer group"
                      style={{ width: `${100 / gridSize}%` }}
                    >
                      <div className="absolute top-[-500%] bottom-[-500%] w-0.5 border-r border-dashed border-[#53b0c9]/70 pointer-events-none" />

                      <div
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 z-20 ${
                          plotted
                            ? 'bg-[#ffd400] border-2 border-black shadow-md group-hover:scale-125'
                            : 'bg-[#53b0c9]/30 hover:bg-[#f76400] hover:scale-125 hover:border-2 hover:border-black'
                        } ${isSelected ? 'ring-4 ring-[#c1008f] scale-125' : ''}`}
                        title={`Coordinates: (${x}, ${y})`}
                      >
                        {plotted ? (
                          <span className="text-base sm:text-xl select-none">
                            {plotted.card.emoji}
                          </span>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-black group-hover:bg-white" />
                        )}
                      </div>

                      <div className="absolute -top-7 hidden group-hover:flex items-center px-2 py-0.5 rounded bg-black text-white text-[10px] font-black z-30 pointer-events-none whitespace-nowrap shadow">
                        ({x}, {y})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="w-full flex justify-between relative pt-2 border-t-2 border-black">
            {coords.map((x) => (
              <div
                key={x}
                className="text-xs sm:text-sm font-black text-black text-center select-none -translate-x-1/2"
                style={{ width: `${100 / gridSize}%` }}
              >
                {x}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full text-center text-[11px] uppercase tracking-widest font-black text-black mt-1">
          Longitude (X) →
        </div>
      </div>

      <div className="w-full mt-4 bg-white rounded-2xl p-4 border-2 border-[#53b0c9] shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs text-black/70 font-bold uppercase tracking-wider">
            Instructions
          </div>
          <div className="text-sm font-black text-black">
            Tap the grid intersection or coordinate of{' '}
            <span className="text-[#7f27a8] font-black underline">
              {targetItem.card.name} {targetItem.card.emoji}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { x: targetItem.x, y: targetItem.y },
            { x: (targetItem.x + 2) % gridSize, y: targetItem.y },
            { x: targetItem.x, y: (targetItem.y + 3) % gridSize },
            { x: (targetItem.x + 1) % gridSize, y: (targetItem.y + 2) % gridSize },
          ]
            .sort((a, b) => a.x * 10 + a.y - (b.x * 10 + b.y))
            .map((coord, idx) => (
              <button
                key={idx}
                onClick={() => handleIntersectionClick(coord.x, coord.y)}
                className="px-4 py-2 rounded-xl border-2 border-black bg-[#ffd400] hover:bg-[#f76400] hover:text-white text-black font-black text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                ({coord.x}, {coord.y})
              </button>
            ))}
        </div>
      </div>

      {feedback === 'correct' && (
        <div className="mt-3 flex items-center gap-2 text-black font-black text-base bg-[#ffd400] px-4 py-2 rounded-xl border-2 border-black animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#7f27a8]" />
          <span>Coordinates Verified! Found {targetItem.card.name} at ({targetItem.x}, {targetItem.y})!</span>
        </div>
      )}
    </div>
  );
};
