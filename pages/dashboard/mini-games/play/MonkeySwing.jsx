import { useEffect, useRef, useState } from 'react';

const GraspGasp = () => {
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [playerX, setPlayerX] = useState(100);
  const [playerY, setPlayerY] = useState(200);
  const [velocityX, setVelocityX] = useState(0);
  const [velocityY, setVelocityY] = useState(0);
  const [isSwinging, setIsSwinging] = useState(true);
  const [currentAnchor, setCurrentAnchor] = useState({ x: 100, y: 80 });
  const [angle, setAngle] = useState(0);
  const [ropeLength, setRopeLength] = useState(120);
  const [obstacles, setObstacles] = useState([]);
  const [stars, setStars] = useState([]);
  const [anchors, setAnchors] = useState([]);
  const gameLoopRef = useRef();

  const GRAVITY = 0.4;
  const SWING_SPEED = 0.03;
  const ROPE_THROW_RANGE = 150;
  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 600;

  // Initialize game elements
  useEffect(() => {
    const treeAnchors = [];
    const initialObstacles = [];
    const initialStars = [];
    
    // Create anchor points on tree branches
    for (let i = 0; i < 8; i++) {
      treeAnchors.push({
        x: 80 + i * 50,
        y: 80,
        id: i
      });
    }
    
    // Create obstacles
    for (let i = 0; i < 10; i++) {
      initialObstacles.push({
        x: 50 + i * 60 + Math.random() * 30,
        y: 250 + Math.random() * 250,
        width: 50,
        height: 15,
        id: i
      });
    }
    
    // Create stars
    for (let i = 0; i < 15; i++) {
      initialStars.push({
        x: 30 + i * 40 + Math.random() * 50,
        y: 150 + Math.random() * 300,
        collected: false,
        id: i
      });
    }
    
    setAnchors(treeAnchors);
    setObstacles(initialObstacles);
    setStars(initialStars);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(() => {
        if (isSwinging) {
          // Swinging physics - pendulum motion
          setAngle(prevAngle => {
            // Add swing momentum
            const swingForce = Math.sin(prevAngle) * SWING_SPEED;
            const newAngle = prevAngle + velocityX - swingForce;
            
            // Calculate player position based on pendulum
            const newX = currentAnchor.x + Math.sin(newAngle) * ropeLength;
            const newY = currentAnchor.y + Math.cos(newAngle) * ropeLength;
            
            setPlayerX(newX);
            setPlayerY(newY);
            
            // Apply pendulum physics
            setVelocityX(prev => (prev - swingForce) * 0.995);
            
            return newAngle;
          });
        } else {
          // Free fall physics
          setPlayerX(prev => prev + velocityX);
          setPlayerY(prev => {
            const newY = prev + velocityY;
            
            // Ground collision
            if (newY > GAME_HEIGHT - 40) {
              setGameState('gameOver');
              return GAME_HEIGHT - 40;
            }
            
            // Side wall collision  
            if (prev < 0 || prev > GAME_WIDTH - 30) {
              setGameState('gameOver');
            }
            
            return newY;
          });
          
          setVelocityY(prev => prev + GRAVITY);
          setVelocityX(prev => prev * 0.98);
        }
        
        // Scroll world to follow player (moving forward effect)
        if (playerX > GAME_WIDTH * 0.7 && isSwinging) {
          // Move all elements left to simulate forward movement
          setAnchors(prev => prev.map(anchor => ({ ...anchor, x: anchor.x - 2 })));
          setObstacles(prev => prev.map(obstacle => ({ ...obstacle, x: obstacle.x - 2 })));
          setStars(prev => prev.map(star => ({ ...star, x: star.x - 2 })));
          setCurrentAnchor(prev => ({ ...prev, x: prev.x - 2 }));
          setPlayerX(prev => prev - 2);
          
          // Add new anchors on the right
          if (Math.random() < 0.3) {
            setAnchors(prev => [...prev, {
              x: GAME_WIDTH + 50,
              y: 80,
              id: Date.now()
            }]);
          }
          
          // Add new obstacles
          if (Math.random() < 0.2) {
            setObstacles(prev => [...prev, {
              x: GAME_WIDTH + 30,
              y: 250 + Math.random() * 250,
              width: 50,
              height: 15,
              id: Date.now()
            }]);
          }
          
          // Add new stars
          if (Math.random() < 0.4) {
            setStars(prev => [...prev, {
              x: GAME_WIDTH + 20,
              y: 150 + Math.random() * 300,
              collected: false,
              id: Date.now()
            }]);
          }
          
          setScore(prev => prev + 1);
        }
        
        // Clean up off-screen elements
        setAnchors(prev => prev.filter(anchor => anchor.x > -50));
        setObstacles(prev => prev.filter(obstacle => obstacle.x > -100));
        setStars(prev => prev.filter(star => star.x > -50));
        
        // Check star collection
        setStars(prev => prev.map(star => {
          if (!star.collected && 
              Math.abs(star.x - playerX) < 25 && 
              Math.abs(star.y - playerY) < 25) {
            setScore(s => s + 10);
            return { ...star, collected: true };
          }
          return star;
        }));
        
        // Check obstacle collision
        obstacles.forEach(obstacle => {
          if (playerX < obstacle.x + obstacle.width &&
              playerX + 30 > obstacle.x &&
              playerY < obstacle.y + obstacle.height &&
              playerY + 30 > obstacle.y) {
            setGameState('gameOver');
          }
        });
        
      }, 16);
    }
    
    return () => clearInterval(gameLoopRef.current);
  }, [gameState, isSwinging, velocityX, velocityY, playerX, playerY, currentAnchor, ropeLength, obstacles]);

  const findNearestAnchor = () => {
    let nearest = null;
    let minDistance = ROPE_THROW_RANGE;
    
    anchors.forEach(anchor => {
      const distance = Math.sqrt(
        Math.pow(anchor.x - playerX, 2) + Math.pow(anchor.y - playerY, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = anchor;
      }
    });
    
    return nearest;
  };

  const handleTap = () => {
    if (gameState === 'ready') {
      setGameState('playing');
      return;
    }
    
    if (gameState === 'playing') {
      if (isSwinging) {
        // Let go of the rope
        setIsSwinging(false);
        // Convert swing momentum to forward velocity
        const forwardVelocity = Math.abs(velocityX) * 15 + 3;
        setVelocityX(forwardVelocity);
        setVelocityY(-2);
      } else {
        // Try to throw rope to nearest anchor
        const nearestAnchor = findNearestAnchor();
        if (nearestAnchor) {
          setIsSwinging(true);
          setCurrentAnchor(nearestAnchor);
          
          // Calculate rope length and initial angle
          const dx = playerX - nearestAnchor.x;
          const dy = playerY - nearestAnchor.y;
          const newRopeLength = Math.sqrt(dx * dx + dy * dy);
          const newAngle = Math.atan2(dx, dy);
          
          setRopeLength(newRopeLength);
          setAngle(newAngle);
          setVelocityX(velocityX * 0.1); // Convert linear to angular velocity
          setVelocityY(0);
        }
      }
    }
    
    if (gameState === 'gameOver') {
      resetGame();
    }
  };

  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setPlayerX(100);
    setPlayerY(200);
    setVelocityX(0);
    setVelocityY(0);
    setIsSwinging(true);
    setCurrentAnchor({ x: 100, y: 80 });
    setAngle(0);
    setRopeLength(120);
    
    // Reset positions
    const treeAnchors = [];
    for (let i = 0; i < 8; i++) {
      treeAnchors.push({
        x: 80 + i * 50,
        y: 80,
        id: i
      });
    }
    setAnchors(treeAnchors);
    setStars(prev => prev.map(star => ({ ...star, collected: false })));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-300 to-blue-400 p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-2">Grasp Gasp</h1>
        <p className="text-center text-gray-600 text-sm">Score: {score}</p>
      </div>
      
      <div 
        className="relative bg-gradient-to-b from-sky-200 to-green-200 rounded-lg shadow-xl overflow-hidden cursor-pointer"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={handleTap}
      >
        {/* Tree branches */}
        <div className="absolute top-16 left-0 w-full h-12 bg-gradient-to-b from-green-700 to-green-800 rounded-lg">
          <div className="absolute inset-0 opacity-40">
            {Array.from({length: 15}).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-green-900 rounded-full opacity-60"
                style={{
                  left: `${i * 7}%`,
                  top: `${2 + (i % 3) * 8}px`,
                  width: '6px',
                  height: '3px'
                }}
              />
            ))}
          </div>
        </div>

        {/* Anchor points on tree */}
        {anchors.map(anchor => (
          <div
            key={anchor.id}
            className="absolute w-3 h-3 bg-brown-600 rounded-full border border-brown-800"
            style={{
              left: anchor.x - 6,
              top: anchor.y - 6,
            }}
          />
        ))}

        {/* Show rope throw range when not swinging */}
        {!isSwinging && (
          <div 
            className="absolute border-2 border-dashed border-yellow-400 rounded-full opacity-50"
            style={{
              left: playerX + 15 - ROPE_THROW_RANGE,
              top: playerY + 15 - ROPE_THROW_RANGE,
              width: ROPE_THROW_RANGE * 2,
              height: ROPE_THROW_RANGE * 2,
            }}
          />
        )}

        {/* Background clouds */}
        <div className="absolute top-32 left-8 w-14 h-7 bg-white rounded-full opacity-50"></div>
        <div className="absolute top-48 right-12 w-16 h-8 bg-white rounded-full opacity-60"></div>

        {/* Obstacles */}
        {obstacles.map(obstacle => (
          <div
            key={obstacle.id}
            className="absolute bg-red-500 rounded shadow-md"
            style={{
              left: obstacle.x,
              top: obstacle.y,
              width: obstacle.width,
              height: obstacle.height
            }}
          />
        ))}

        {/* Stars */}
        {stars.map(star => (
          !star.collected && (
            <div
              key={star.id}
              className="absolute text-yellow-400 text-xl animate-pulse"
              style={{
                left: star.x - 10,
                top: star.y - 10,
              }}
            >
              ⭐
            </div>
          )
        ))}

        {/* Rope */}
        {isSwinging && (
          <svg className="absolute inset-0 pointer-events-none">
            <line
              x1={currentAnchor.x}
              y1={currentAnchor.y}
              x2={playerX + 15}
              y2={playerY + 15}
              stroke="#8B4513"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* Player */}
        <div
          className="absolute transition-all duration-75"
          style={{
            left: playerX,
            top: playerY,
            width: 30,
            height: 30,
          }}
        >
          <div className="w-full h-full bg-amber-600 rounded-full border-2 border-amber-800">
            <div className="absolute inset-1 bg-amber-400 rounded-full"></div>
            <div className="absolute top-1 left-1 w-2 h-2 bg-black rounded-full"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full"></div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
          </div>
        </div>

        {/* Game state overlays */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-green-800 mb-2">Grasp Gasp</h2>
              <p className="text-gray-600 mb-4">Tap sekali untuk lepas tali<br/>Tap lagi untuk lempar tali baru<br/>Tali tidak menempel ke lubang!</p>
              <p className="text-sm text-gray-500">Tap untuk mulai berayun!</p>
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Game Over!</h2>
              <p className="text-gray-600 mb-2">Final Score: {score}</p>
              <p className="text-sm text-gray-500">Tap untuk main lagi!</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center text-white">
        <p className="text-sm">
          {gameState === 'playing' ? 
            (isSwinging ? 'Tap untuk lepas tali' : 'Tap untuk lempar tali ke titik terdekat') : 
            'Berayun dari satu tali ke tali lainnya!'}
        </p>
      </div>
    </div>
  );
};

export default GraspGasp;