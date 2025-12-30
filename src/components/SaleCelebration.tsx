import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Howl } from 'howler';
import { X, DollarSign } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

// Cash register sound (base64 encoded short beep as fallback)
const cashSound = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2058/2058-preview.mp3'],
  volume: 0.5,
  onloaderror: () => {
    console.log('Sound failed to load, continuing without audio');
  },
});

export function SaleCelebration() {
  const { showCelebration, celebrationData, hideCelebration, addRevenue } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showCelebration && celebrationData) {
      setIsVisible(true);
      
      // Play cash sound
      try {
        cashSound.play();
      } catch (e) {
        console.log('Audio playback failed');
      }
      
      // Fire confetti from both corners
      const duration = 3000;
      const end = Date.now() + duration;
      
      const colors = ['#00ffff', '#00ff88', '#aa55ff', '#ffd700'];
      
      const fireConfetti = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 1 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(fireConfetti);
        }
      };
      
      fireConfetti();
      
      // Add revenue to stats
      addRevenue(celebrationData.amount);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(hideCelebration, 300);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showCelebration, celebrationData, hideCelebration, addRevenue]);

  if (!showCelebration || !celebrationData) return null;

  return (
    <div
      className={`fixed top-12 left-0 right-0 z-[100] transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="bg-background border-b-2 border-success glow-success p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center animate-bounce">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-success text-glow-success">
                💰 SALE CLOSED!
              </h2>
              <p className="text-muted-foreground">
                <span className="text-foreground font-semibold">{celebrationData.businessName}</span>
                {' — '}
                <span className="text-success font-mono font-bold text-lg">
                  ${celebrationData.amount.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(hideCelebration, 300);
            }}
            className="p-2 hover:bg-secondary/50 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
