import { IconArrowLeft } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

const WagTagGame = () => {
  const router = useRouter();
  const GAME_WIDTH = 480;
  const GAME_HEIGHT = 480;
  const SEGMENT_SIZE = 25;
  const MOVE_SPEED = 1.5;
  const TURN_SPEED = 0.05;
  
  // Karakter-karakter lucu seperti di gambar
  const characters = ['🐶', '🐱', '🐸', '🐰', '🦊', '🐻', '🐼', '🐷', '🐮', '🐯'];
  const foods = ['🍄', '⭐', '🌟', '💎', '🍎'];
  const loneCharacters = ['🐵', '🐨', '🐹', '🐧', '🦁']; // Karakter sendirian
  const arrows = ['⬆️', '⬇️', '⬅️', '➡️', '↗️', '↘️', '↙️', '↖️']; // Panah penunjuk arah
  
  const [snake, setSnake] = useState([
    { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, char: '🐶' },
    { x: GAME_WIDTH / 2 - 30, y: GAME_HEIGHT / 2, char: '🐱' },
    { x: GAME_WIDTH / 2 - 60, y: GAME_HEIGHT / 2, char: '🐸' }
  ]);
  const [angle, setAngle] = useState(0); // Direction in radians
  const [turnDirection, setTurnDirection] = useState(0); // -1 left, 0 straight, 1 right
  const [items, setItems] = useState([]); // Array untuk berbagai item
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Generate random item (makanan, karakter sendirian, atau tengkorak)
  const generateItem = useCallback(() => {
    const itemTypes = ['food', 'character', 'skull', 'arrow'];
    const weights = [0.4, 0.25, 0.15, 0.2]; // Probabilitas masing-masing item
    
    let randomValue = Math.random();
    let itemType = 'food';
    
    for (let i = 0; i < weights.length; i++) {
      if (randomValue < weights[i]) {
        itemType = itemTypes[i];
        break;
      }
      randomValue -= weights[i];
    }
    
    let char;
    switch (itemType) {
      case 'food':
        char = foods[Math.floor(Math.random() * foods.length)];
        break;
      case 'character':
        char = loneCharacters[Math.floor(Math.random() * loneCharacters.length)];
        break;
      case 'skull':
        char = '💀';
        break;
      case 'arrow':
        char = arrows[Math.floor(Math.random() * arrows.length)];
        break;
      default:
        char = '🍄';
    }
    
    return {
      x: Math.random() * (GAME_WIDTH - 60) + 30,
      y: Math.random() * (GAME_HEIGHT - 60) + 30,
      char,
      type: itemType,
      id: Math.random()
    };
  }, []);

  // Initialize items
  useEffect(() => {
    setItems([generateItem(), generateItem(), generateItem()]);
  }, [generateItem]);

  // Handle tap/click for turning
  const handleTap = () => {
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }

    if (gameOver) {
      // Restart game
      setSnake([
        { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, char: '🐶' },
        { x: GAME_WIDTH / 2 - 30, y: GAME_HEIGHT / 2, char: '🐱' },
        { x: GAME_WIDTH / 2 - 60, y: GAME_HEIGHT / 2, char: '🐸' }
      ]);
      setAngle(0);
      setTurnDirection(0);
      setItems([generateItem(), generateItem(), generateItem()]);
      setScore(0);
      setGameOver(false);
      setGameStarted(false);
      return;
    }

    // Toggle turn direction (tap to change rotation direction)
    setTurnDirection(prev => prev === 0 ? 1 : prev === 1 ? -1 : 1);
  };

  // Game loop - smooth movement
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setAngle(prevAngle => prevAngle + (turnDirection * TURN_SPEED));
      
      setSnake(currentSnake => {
        const newSnake = [...currentSnake];
        
        // Move head
        const head = { ...newSnake[0] };
        head.x += Math.cos(angle) * MOVE_SPEED;
        head.y += Math.sin(angle) * MOVE_SPEED;
        
        // Check wall collision
        if (head.x < 20 || head.x > GAME_WIDTH - 20 || head.y < 20 || head.y > GAME_HEIGHT - 20) {
          setGameOver(true);
          return currentSnake;
        }
        
        // Check self collision - improved detection
        for (let i = 3; i < newSnake.length; i++) { // Start from index 3 to avoid immediate collision
          const segment = newSnake[i];
          const distance = Math.sqrt(
            Math.pow(head.x - segment.x, 2) + Math.pow(head.y - segment.y, 2)
          );
          if (distance < SEGMENT_SIZE - 5) { // Slightly smaller collision box
            setGameOver(true);
            return currentSnake;
          }
        }
        
        // Check tail collision with body (any part of snake hitting any other part)
        for (let i = 0; i < newSnake.length; i++) {
          for (let j = i + 3; j < newSnake.length; j++) {
            const distance = Math.sqrt(
              Math.pow(newSnake[i].x - newSnake[j].x, 2) + 
              Math.pow(newSnake[i].y - newSnake[j].y, 2)
            );
            if (distance < SEGMENT_SIZE - 5) {
              setGameOver(true);
              return currentSnake;
            }
          }
        }
        
        newSnake[0] = head;
        
        // Update tail segments to follow with proper distance
        for (let i = 1; i < newSnake.length; i++) {
          const current = newSnake[i];
          const target = newSnake[i - 1];
          
          const dx = target.x - current.x;
          const dy = target.y - current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Maintain proper distance between segments
          const targetDistance = SEGMENT_SIZE + 5;
          if (distance > targetDistance) {
            const ratio = (distance - targetDistance) / distance;
            current.x += dx * ratio;
            current.y += dy * ratio;
          }
        }
        
        // Check item collisions
        setItems(currentItems => {
          const newItems = [...currentItems];
          let itemConsumed = false;
          
          for (let i = newItems.length - 1; i >= 0; i--) {
            const item = newItems[i];
            const itemDistance = Math.sqrt(
              Math.pow(head.x - item.x, 2) + Math.pow(head.y - item.y, 2)
            );
            
            if (itemDistance < 30) {
              // Handle different item types
              switch (item.type) {
                case 'food':
                  // Add new segment at the end
                  const tail = newSnake[newSnake.length - 1];
                  const prevTail = newSnake[newSnake.length - 2];
                  
                  // Calculate position for new segment
                  const dx = tail.x - prevTail.x;
                  const dy = tail.y - prevTail.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  
                  let newX = tail.x;
                  let newY = tail.y;
                  
                  if (distance > 0) {
                    newX = tail.x + (dx / distance) * (SEGMENT_SIZE + 5);
                    newY = tail.y + (dy / distance) * (SEGMENT_SIZE + 5);
                  }
                  
                  const newChar = characters[Math.floor(Math.random() * characters.length)];
                  newSnake.push({ 
                    x: newX, 
                    y: newY, 
                    char: newChar 
                  });
                  
                  setScore(prev => prev + 10);
                  break;
                  
                case 'character':
                  // Add the lone character to the snake
                  const tailChar = newSnake[newSnake.length - 1];
                  const prevTailChar = newSnake[newSnake.length - 2];
                  
                  const dxChar = tailChar.x - prevTailChar.x;
                  const dyChar = tailChar.y - prevTailChar.y;
                  const distanceChar = Math.sqrt(dxChar * dxChar + dyChar * dyChar);
                  
                  let newXChar = tailChar.x;
                  let newYChar = tailChar.y;
                  
                  if (distanceChar > 0) {
                    newXChar = tailChar.x + (dxChar / distanceChar) * (SEGMENT_SIZE + 5);
                    newYChar = tailChar.y + (dyChar / distanceChar) * (SEGMENT_SIZE + 5);
                  }
                  
                  newSnake.push({ 
                    x: newXChar, 
                    y: newYChar, 
                    char: item.char 
                  });
                  
                  setScore(prev => prev + 15);
                  break;
                  
                case 'skull':
                  // Remove one segment from the end if snake has more than 2 segments
                  if (newSnake.length > 2) {
                    newSnake.pop();
                    setScore(prev => Math.max(0, prev - 5));
                  } else {
                    // If snake is too small, game over
                    setGameOver(true);
                    return currentItems;
                  }
                  break;
                  
                case 'arrow':
                  // Just give points for collecting arrows (direction indicators)
                  setScore(prev => prev + 5);
                  break;
              }
              
              // Remove consumed item and add new one
              newItems.splice(i, 1);
              itemConsumed = true;
            }
          }
          
          // Add new item if one was consumed
          if (itemConsumed) {
            newItems.push(generateItem());
          }
          
          return newItems;
        });
        
        return newSnake;
      });
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, angle, turnDirection, generateItem]);

  // Create checkered background
  const createCheckeredBackground = () => {
    const squares = [];
    const squareSize = 40;
    const cols = Math.ceil(GAME_WIDTH / squareSize);
    const rows = Math.ceil(GAME_HEIGHT / squareSize);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isLight = (row + col) % 2 === 0;
        squares.push(
          <div
            key={`${row}-${col}`}
            className={`absolute ${isLight ? 'bg-amber-100' : 'bg-amber-200'}`}
            style={{
              left: col * squareSize,
              top: row * squareSize,
              width: squareSize,
              height: squareSize,
            }}
          />
        );
      }
    }
    return squares;
  };

  const getItemGlow = (itemType) => {
    switch (itemType) {
      case 'food': return 'drop-shadow-lg';
      case 'character': return 'drop-shadow-lg animate-bounce';
      case 'skull': return 'drop-shadow-lg animate-pulse';
      case 'arrow': return 'drop-shadow-lg animate-ping';
      default: return '';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <Head>
        <title>Wag Tag - Snake Game</title>
      </Head>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <IconArrowLeft size={20} className="text-slate-600" />
            </motion.button>
            
            <div>
              <h1 className="text-2xl font-bold text-slate-800">🐍 Wag Tag</h1>
              <p className="text-slate-600 text-sm">Kendalikan ular lucu dengan karakter emoji</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-amber-300">
          <h1 className="text-4xl font-bold text-amber-800 text-center mb-4">
            🏷️ Wag Tag 🏷️
          </h1>
          
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-amber-700">
              Score: {score}
            </div>
            <div className="text-lg text-amber-600">
              Friends: {snake.length}
            </div>
          </div>

          {/* Item Legend */}
          <div className="flex justify-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <span>🍄</span>
              <span className="text-green-600">+Grow</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🐵</span>
              <span className="text-blue-600">+Friend</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💀</span>
              <span className="text-red-600">-Length</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⬆️</span>
              <span className="text-purple-600">+Points</span>
            </div>
          </div>

          <div 
            className="relative border-4 border-amber-400 rounded-lg mx-auto mb-4 cursor-pointer overflow-hidden"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
            onClick={handleTap}
          >
            {/* Checkered background */}
            {createCheckeredBackground()}
            
            {/* Items */}
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                className={`absolute text-2xl z-10 ${getItemGlow(item.type)}`}
                style={{
                  left: item.x - 16,
                  top: item.y - 16,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  scale: item.type === 'skull' ? [1, 1.2, 1] : [1, 1.1, 1],
                  rotate: item.type === 'arrow' ? [0, 360] : 0,
                }}
                transition={{
                  duration: item.type === 'arrow' ? 2 : 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {item.char}
              </motion.div>
            ))}
            
            {/* Snake segments */}
            {snake.map((segment, index) => (
              <motion.div
                key={index}
                className={`absolute text-2xl z-20 ${index === 0 ? 'animate-pulse' : ''}`}
                style={{
                  left: segment.x - 16,
                  top: segment.y - 16,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={index === 0 ? {
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {segment.char}
              </motion.div>
            ))}
          </div>

          <div className="text-center space-y-2">
            {!gameStarted && !gameOver && (
              <div className="text-amber-700">
                <p className="text-lg font-semibold">Tap to Start!</p>
                <p className="text-sm">Tap to change direction of rotation</p>
              </div>
            )}
            
            {gameOver && (
              <div className="text-red-600">
                <p className="text-xl font-bold">Game Over!</p>
                <p className="text-lg">Final Score: {score}</p>
                <p className="text-sm">Tap to restart</p>
              </div>
            )}
            
            {gameStarted && !gameOver && (
              <div className="text-amber-700">
                <p className="text-sm">Collect items and avoid your tail!</p>
                <p className="text-xs">Rotation: {turnDirection === 1 ? 'Right ↻' : turnDirection === -1 ? 'Left ↺' : 'Straight ↑'}</p>
              </div>
            )}
          </div>

          {/* Mobile-friendly tap button */}
          <div className="mt-4 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTap}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg"
            >
              {!gameStarted ? '🎮 Start' : gameOver ? '🔄 Restart' : '↻ Change Direction'}
            </motion.button>
          </div>

          <div className="mt-4 text-center text-sm text-amber-600">
            <p>🎮 Mini Game Paradise - Wag Tag 🎮</p>
            <p className="text-xs mt-1">Tap to change the direction of rotation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WagTagGame;
