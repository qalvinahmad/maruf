import { useRouter } from 'next/router';
import MonkeySwing from './MonkeySwing';
import WagTagGame from './WagTag';

const PlayGame = () => {
  const router = useRouter();
  const { gameId } = router.query;

  // If gameId is WagTag or 1, show the WagTag game
  if (gameId === 'WagTag' || gameId === '1') {
    return <WagTagGame />;
  }

  // If gameId is MonkeySwing or 2, show the MonkeySwing game
  if (gameId === 'MonkeySwing' || gameId === '2') {
    return <MonkeySwing />;
  }

  // Loading or redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-slate-600">Loading game...</p>
      </div>
    </div>
  );
};

export default PlayGame;
