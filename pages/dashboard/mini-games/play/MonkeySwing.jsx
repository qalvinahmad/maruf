import { IconArrowLeft } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

const MonkeySwing = () => {
  const router = useRouter();
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const GRAVITY = 0.3;
  const SWING_POWER = 8;
  const TREE_DISTANCE = 200;
  
  const [monkey, setMonkey] = useState({
    x: 100,
    y: 400,
    vx: 0,
    vy: 0,
    isSwinging: false,
    currentTree: 0,
    angle: 0,
    swingRadius: 120
  });
  
  const [trees, setTrees] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [collectibles, setCollectibles] = useState([]);
  const [grappleHook, setGrappleHook] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [distance, setDistance] = useState(0);
  const [particles, setParticles] = useState([]);

  // Initialize trees
  useEffect(() => {
    const initialTrees = [];
    for (let i = 0; i < 20; i++) {
      initialTrees.push({
        x: 100 + (i * TREE_DISTANCE),
        y: 300 + Math.random() * 100,
        id: i
      });
    }
    setTrees(initialTrees);
  }, []);

  // Generate obstacles and collectibles
  const generateObstacle = useCallback((treeIndex) => {
    return {
      x: 100 + (treeIndex * TREE_DISTANCE) + Math.random() * 150,
      y: 350 + Math.random() * 150,
      vx: -2 - Math.random() * 3,
      vy: -1 - Math.random() * 2,
      id: Math.random(),
      type: 'banana'
    };
  }, []);

  const generateCollectible = useCallback((treeIndex) => {
    return {
      x: 100 + (treeIndex * TREE_DISTANCE) + Math.random() * 150,
      y: 300 + Math.random() * 200,
      id: Math.random(),
      collected: false
    };
  }, []);

  // Initialize obstacles and collectibles
  useEffect(() => {
    if (trees.length > 0) {
      const newObstacles = [];
      const newCollectibles = [];
      
      for (let i = 2; i < trees.length; i++) {
        if (Math.random() < 0.4) { // 40% chance for obstacle
          newObstacles.push(generateObstacle(i));
        }
        if (Math.random() < 0.6) { // 60% chance for collectible
          newCollectibles.push(generateCollectible(i));
        }
      }
      
      setObstacles(newObstacles);
      setCollectibles(newCollectibles);
    }
  }, [trees, generateObstacle, generateCollectible]);

  // Handle tap/click
  const handleTap = () => {
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }

    if (gameOver) {
      // Restart game
      setMonkey({
        x: 100,
        y: 400,
        vx: 0,
        vy: 0,
        isSwinging: false,
        currentTree: 0,
        angle: 0,
        swingRadius: 120
      });
      setGrappleHook(null);
      setScore(0);
      setDistance(0);
      setParticles([]);
      setGameOver(false);
      setGameStarted(false);
      
      // Regenerate obstacles and collectibles
      const newObstacles = [];
      const newCollectibles = [];
      
      for (let i = 2; i < trees.length; i++) {
        if (Math.random() < 0.4) {
          newObstacles.push(generateObstacle(i));
        }
        if (Math.random() < 0.6) {
          newCollectibles.push(generateCollectible(i));
        }
      }
      
      setObstacles(newObstacles);
      setCollectibles(newCollectibles);
      return;
    }

    if (monkey.isSwinging) {
      // Release from current tree
      const currentTree = trees[monkey.currentTree];
      if (currentTree) {
        const releaseVx = Math.cos(monkey.angle) * SWING_POWER;
        const releaseVy = Math.sin(monkey.angle) * SWING_POWER;
        
        setMonkey(prev => ({
          ...prev,
          isSwinging: false,
          vx: releaseVx,
          vy: releaseVy
        }));
      }
    } else if (!grappleHook) {
      // Shoot grapple hook to nearest tree in front
      const nearestTree = trees.find(tree => 
        tree.x > monkey.x && 
        tree.x < monkey.x + 300 &&
        Math.abs(tree.y - monkey.y) < 200
      );
      
      if (nearestTree) {
        setGrappleHook({
          startX: monkey.x,
          startY: monkey.y,
          endX: nearestTree.x,
          endY: nearestTree.y,
          targetTree: nearestTree
        });
      }
    }
  };

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setMonkey(currentMonkey => {
        let newMonkey = { ...currentMonkey };

        if (newMonkey.isSwinging) {
          // Swinging physics
          const currentTree = trees[newMonkey.currentTree];
          if (currentTree) {
            newMonkey.angle += 0.05; // Swing speed
            newMonkey.x = currentTree.x + Math.cos(newMonkey.angle) * newMonkey.swingRadius;
            newMonkey.y = currentTree.y + Math.sin(newMonkey.angle) * newMonkey.swingRadius;
          }
        } else {
          // Free fall/flight physics
          newMonkey.vy += GRAVITY;
          newMonkey.x += newMonkey.vx;
          newMonkey.y += newMonkey.vy;

          // Check if monkey falls below screen
          if (newMonkey.y > GAME_HEIGHT) {
            setGameOver(true);
            return currentMonkey;
          }

          // Check if monkey goes too far left (falls behind)
          if (newMonkey.x < -100) {
            setGameOver(true);
            return currentMonkey;
          }
        }

        return newMonkey;
      });

      // Update grapple hook
      setGrappleHook(currentHook => {
        if (currentHook) {
          // Check if hook reaches target
          const hookDistance = Math.sqrt(
            Math.pow(currentHook.endX - monkey.x, 2) + 
            Math.pow(currentHook.endY - monkey.y, 2)
          );
          
          if (hookDistance < 60) {
            // Attach to tree
            const treeIndex = trees.findIndex(tree => tree.id === currentHook.targetTree.id);
            const attachAngle = Math.atan2(
              monkey.y - currentHook.targetTree.y,
              monkey.x - currentHook.targetTree.x
            );
            
            setMonkey(prev => ({
              ...prev,
              isSwinging: true,
              currentTree: treeIndex,
              angle: attachAngle,
              swingRadius: Math.min(hookDistance, 120),
              vx: 0,
              vy: 0
            }));
            return null; // Remove grapple hook
          }
        }
        return currentHook;
      });

      // Update obstacles
      setObstacles(currentObstacles => {
        return currentObstacles.map(obstacle => ({
          ...obstacle,
          x: obstacle.x + obstacle.vx,
          y: obstacle.y + obstacle.vy,
          vy: obstacle.vy + GRAVITY * 0.5
        })).filter(obstacle => 
          obstacle.x > -50 && obstacle.x < GAME_WIDTH + 50 && 
          obstacle.y < GAME_HEIGHT + 50
        );
      });

      // Check obstacle collisions
      setObstacles(currentObstacles => {
        const newObstacles = currentObstacles.filter(obstacle => {
          const distance = Math.sqrt(
            Math.pow(obstacle.x - monkey.x, 2) + 
            Math.pow(obstacle.y - monkey.y, 2)
          );
          
          if (distance < 30) {
            setGameOver(true);
            return false;
          }
          return true;
        });
        return newObstacles;
      });

      // Check collectible collisions
      setCollectibles(currentCollectibles => {
        return currentCollectibles.map(collectible => {
          if (!collectible.collected) {
            const distance = Math.sqrt(
              Math.pow(collectible.x - monkey.x, 2) + 
              Math.pow(collectible.y - monkey.y, 2)
            );
            
            if (distance < 25) {
              setScore(prev => prev + 1);
              
              // Add particles effect
              const newParticles = [];
              for (let i = 0; i < 5; i++) {
                newParticles.push({
                  id: Math.random(),
                  x: collectible.x,
                  y: collectible.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  life: 30,
                  char: '✨'
                });
              }
              setParticles(prev => [...prev, ...newParticles]);
              
              return { ...collectible, collected: true };
            }
          }
          return collectible;
        });
      });

      // Update particles
      setParticles(currentParticles => {
        return currentParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1
          }))
          .filter(particle => particle.life > 0);
      });

      // Update distance
      setDistance(monkey.x);

    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, monkey.x, monkey.y, trees]);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <Head>
        <title>Monkey Swing - Adventure Game</title>
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
              <h1 className="text-2xl font-bold text-slate-800">🐒 Monkey Swing</h1>
              <p className="text-slate-600 text-sm">Bantu monyet berayun melewati sungai dengan capit mekanik</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-200 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-green-300">
          <h1 className="text-4xl font-bold text-green-800 text-center mb-4">
            🐒 Monkey Swing Adventure 🌴
          </h1>
          
          <div className="text-center mb-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {score}
                </div>
                <div className="text-sm text-green-600">Points</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-blue-700">
                  {Math.floor(distance / 10)}m
                </div>
                <div className="text-sm text-blue-600">Distance</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-purple-700">
                  {Math.floor(monkey.currentTree)}
                </div>
                <div className="text-sm text-purple-600">Trees</div>
              </div>
            </div>
          </div>

          {/* Game Instructions */}
          <div className="flex justify-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <span>🐒</span>
              <span className="text-green-600">Monyet</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🌴</span>
              <span className="text-brown-600">Pohon</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🍌</span>
              <span className="text-red-600">Hindari!</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span className="text-yellow-600">+1 Point</span>
            </div>
          </div>

          <div 
            className="relative border-4 border-green-400 rounded-lg mx-auto mb-4 cursor-pointer overflow-hidden bg-gradient-to-b from-sky-200 to-green-300"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
            onClick={handleTap}
          >
            {/* River background */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-blue-400 opacity-70"></div>
            
            {/* Trees */}
            {trees.map((tree, index) => (
              <div
                key={tree.id}
                className="absolute"
                style={{
                  left: tree.x - monkey.x + GAME_WIDTH / 4,
                  top: tree.y - 100,
                  transform: 'translate(-50%, 0)',
                }}
              >
                <div className="text-6xl">🌴</div>
                {/* Tree trunk/branch */}
                <div 
                  className="absolute bg-amber-600 rounded"
                  style={{
                    top: 60,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 80,
                    height: 8
                  }}
                ></div>
              </div>
            ))}

            {/* Obstacles (bananas) */}
            {obstacles.map((obstacle) => (
              <motion.div
                key={obstacle.id}
                className="absolute text-3xl"
                style={{
                  left: obstacle.x - monkey.x + GAME_WIDTH / 4,
                  top: obstacle.y,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                🍌
              </motion.div>
            ))}

            {/* Collectibles */}
            {collectibles.map((collectible) => (
              !collectible.collected && (
                <motion.div
                  key={collectible.id}
                  className="absolute text-2xl"
                  style={{
                    left: collectible.x - monkey.x + GAME_WIDTH / 4,
                    top: collectible.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  ⭐
                </motion.div>
              )
            ))}

            {/* Particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute text-lg pointer-events-none"
                style={{
                  left: particle.x - monkey.x + GAME_WIDTH / 4,
                  top: particle.y,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  scale: [1, 1.5, 0],
                  opacity: [1, 0.8, 0],
                }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                }}
              >
                {particle.char}
              </motion.div>
            ))}

            {/* Grapple Hook */}
            {grappleHook && (
              <>
                <svg
                  className="absolute top-0 left-0 pointer-events-none"
                  width={GAME_WIDTH}
                  height={GAME_HEIGHT}
                >
                  <line
                    x1={GAME_WIDTH / 4}
                    y1={monkey.y}
                    x2={grappleHook.endX - monkey.x + GAME_WIDTH / 4}
                    y2={grappleHook.endY}
                    stroke="#654321"
                    strokeWidth="4"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                </svg>
                {/* Mechanical claw at the end */}
                <motion.div
                  className="absolute text-2xl z-10"
                  style={{
                    left: grappleHook.endX - monkey.x + GAME_WIDTH / 4,
                    top: grappleHook.endY,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  🦾
                </motion.div>
              </>
            )}

            {/* Monkey */}
            <motion.div
              className="absolute text-4xl z-20"
              style={{
                left: GAME_WIDTH / 4,
                top: monkey.y,
                transform: 'translate(-50%, -50%)',
              }}
              animate={monkey.isSwinging ? {
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1],
              } : {
                rotate: monkey.vx > 0 ? 15 : monkey.vx < 0 ? -15 : 0,
              }}
              transition={{
                duration: 0.4,
                repeat: monkey.isSwinging ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              🐒
              {/* Show excitement when swinging fast */}
              {monkey.isSwinging && Math.abs(monkey.vx) > 5 && (
                <motion.div
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-lg"
                  animate={{
                    y: [-5, -15, -5],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  💨
                </motion.div>
              )}
            </motion.div>

            {/* Swing rope when swinging */}
            {monkey.isSwinging && trees[monkey.currentTree] && (
              <>
                <svg
                  className="absolute top-0 left-0 pointer-events-none"
                  width={GAME_WIDTH}
                  height={GAME_HEIGHT}
                >
                  <line
                    x1={trees[monkey.currentTree].x - monkey.x + GAME_WIDTH / 4}
                    y1={trees[monkey.currentTree].y}
                    x2={GAME_WIDTH / 4}
                    y2={monkey.y}
                    stroke="#8B4513"
                    strokeWidth="4"
                  />
                </svg>
                
                {/* Swing direction indicator */}
                <motion.div
                  className="absolute text-2xl"
                  style={{
                    left: GAME_WIDTH / 4 + 30,
                    top: monkey.y - 30,
                  }}
                  animate={{
                    x: [0, Math.cos(monkey.angle) * 20, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {Math.cos(monkey.angle) > 0 ? "➡️" : "⬅️"}
                </motion.div>
              </>
            )}
          </div>

          <div className="text-center space-y-2">
            {!gameStarted && !gameOver && (
              <div className="text-green-700">
                <p className="text-lg font-semibold">Tap to Start!</p>
                <p className="text-sm">Tap untuk ayun dan lepas, tap lagi untuk tembak capit</p>
              </div>
            )}
            
            {gameOver && (
              <div className="text-red-600">
                <p className="text-xl font-bold">Game Over!</p>
                <p className="text-lg">Score: {score} | Distance: {Math.floor(distance / 10)}m</p>
                <p className="text-sm">Tap to restart</p>
              </div>
            )}
            
            {gameStarted && !gameOver && (
              <div className="text-green-700">
                <p className="text-sm">
                  {monkey.isSwinging 
                    ? "Tap untuk lepas ayunan!" 
                    : grappleHook 
                      ? "Capit sedang terbang..." 
                      : "Tap untuk tembak capit mekanik!"
                  }
                </p>
              </div>
            )}
          </div>

          {/* Mobile-friendly tap button */}
          <div className="mt-4 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTap}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg"
            >
              {!gameStarted ? '🐒 Start' : gameOver ? '🔄 Restart' : 
               monkey.isSwinging ? '🚀 Release' : 
               grappleHook ? '⏳ Flying...' : '🦾 Shoot'}
            </motion.button>
          </div>

          <div className="mt-4 text-center text-sm text-green-600">
            <p>🎮 Mini Game Paradise - Monkey Swing 🎮</p>
            <p className="text-xs mt-1">Gunakan gravitasi dan momentum untuk berayun!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonkeySwing;
