"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

const GRAVITY = -0.1
const JUMP_FORCE = 3
const OBSTACLE_SPEED = -2
const OBSTACLE_GAP = 350
const OBSTACLE_WIDTH = 6
const OBSTACLE_SPACING = 350
const ANIMATION_SPEED = 6 // Lower number = faster animation

// Array of crane animation frames
const CRANE_FRAMES = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skeleton-animation_00-ORwunvOGjBjVkhr2IkykzW3oevDnYB.png", // 00
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skeleton-animation_01-xR9Rse1xNzsiKfBdyXmczNHr5Ar2pk.png", // 01
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skeleton-animation_02-V4C7se5xxZSNmZeEffdgbqkkvaC1n5.png", // 02
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skeleton-animation_03-7waLEFxv1ucpLEKnvR42Nf3nnDe4oI.png", // 03
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skeleton-animation_04-6stDK1ZCCk7l1TWeCkHiHxvNgFILMS.png", // 04
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skeleton-animation_05-QbL5uKFvMLo2IAoBbcxnCJwZIw3wyO.png", // 05
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skeleton-animation_06-RMwQzc18HVzokPwyO77GTFoKLqsawv.png", // 06
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skeleton-animation_07-XQvUckVLucjinuDLZUlafq7oUDiVCz.png", // 07
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skeleton-animation_08-k9e2PyOVP2iReaTO8sD1uh6jUUaqvH.png", // 08
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skeleton-animation_09-Dh8dfG0kmKmvL6JRmp9Vc89QD8xKiY.png", // 09
]

export default function KampalaKrane() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameOver">("ready")
  const [score, setScore] = useState(0)
  const frameCounterRef = useRef(0)
  const currentFrameRef = useRef(0)
  const gameObjectsRef = useRef({
    crane: {
      x: 100,
      y: 200,
      velocity: 0,
      width: 50,
      height: 50,
    },
    obstacles: [] as Array<{
      x: number
      topHeight: number
      passed: boolean
      sparkOffset: number
    }>,
  })

  // Dynamically resize the canvas to cover the entire viewport.
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  // Preload crane images
  useEffect(() => {
    CRANE_FRAMES.forEach((src) => {
      const img = new Image()
      img.src = src
      img.crossOrigin = "anonymous"
    })
  }, [])

  // Game loop with progressive difficulty
  useEffect(() => {
    if (!canvasRef.current || gameState !== "playing") return

    let animationFrameId: number
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Preload crane images for the animation
    const craneImages = CRANE_FRAMES.map((src) => {
      const img = new Image()
      img.src = src
      img.crossOrigin = "anonymous"
      return img
    })

    // Preload background images
    const backgroundImg = new Image()
    backgroundImg.src = "/background.jpg"

    const mbararaImg = new Image()
    mbararaImg.src = "/Mbarara.jpg"

    const jijnjaImg = new Image()
    jijnjaImg.src = "/jijnja.jpg"

    const gameLoop = () => {
      const { crane, obstacles } = gameObjectsRef.current

      // Update crane physics
      crane.velocity += GRAVITY
      crane.y += crane.velocity

      // Update animation frame
      frameCounterRef.current++
      if (frameCounterRef.current >= ANIMATION_SPEED) {
        frameCounterRef.current = 0
        currentFrameRef.current = (currentFrameRef.current + 1) % CRANE_FRAMES.length
      }

      // Compute dynamic difficulty parameters based on score:
      const dynamicSpeed = OBSTACLE_SPEED - score * 0.1 // Faster obstacles as score increases
      const dynamicGap = Math.max(OBSTACLE_GAP - score * 5, 200) // Gap decreases, but not below 200
      const dynamicSpacing = Math.max(OBSTACLE_SPACING - score * 5, 200) // Spacing decreases, but not below 200

      // Update obstacles
      obstacles.forEach((obstacle) => {
        obstacle.x += dynamicSpeed
        obstacle.sparkOffset += 0.2
      })

      // Add new obstacles based on dynamic spacing
      if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvasRef.current!.width - dynamicSpacing) {
        obstacles.push({
          x: canvasRef.current!.width,
          topHeight: Math.random() * (canvasRef.current!.height - dynamicGap - 100) + 50,
          passed: false,
          sparkOffset: 0,
        })
      }

      // Remove obstacles that have gone off-screen
      if (obstacles[0]?.x < -OBSTACLE_WIDTH) {
        obstacles.shift()
      }

      // Check collisions and scoring
      obstacles.forEach((obstacle) => {
        if (
          crane.x + crane.width * 0.7 > obstacle.x &&
          crane.x + crane.width * 0.3 < obstacle.x + OBSTACLE_WIDTH &&
          (crane.y + crane.height * 0.3 < obstacle.topHeight ||
            crane.y + crane.height * 0.7 > obstacle.topHeight + dynamicGap)
        ) {
          setGameState("gameOver")
        }

        if (!obstacle.passed && crane.x > obstacle.x + OBSTACLE_WIDTH) {
          obstacle.passed = true
          setScore((prev) => prev + 1)
        }
      })

      // Check for boundaries
      if (crane.y > canvasRef.current!.height - crane.height || crane.y < 0) {
        setGameState("gameOver")
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)

      // Draw background based on score:
      // <10: background.jpg, 10-29: mbarara.jpg, >=30: jijnja.jpg
      if (score < 10) {
        if (backgroundImg.complete) {
          ctx.drawImage(backgroundImg, 0, 0, canvasRef.current!.width, canvasRef.current!.height)
        } else {
          const gradient = ctx.createLinearGradient(0, 0, 0, canvasRef.current!.height)
          gradient.addColorStop(0, "#1c3f80")
          gradient.addColorStop(1, "#f08c4a")
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
        }
      } else if (score < 30) {
        if (mbararaImg.complete) {
          ctx.drawImage(mbararaImg, 0, 0, canvasRef.current!.width, canvasRef.current!.height)
        } else {
          const gradient = ctx.createLinearGradient(0, 0, 0, canvasRef.current!.height)
          gradient.addColorStop(0, "#1c3f80")
          gradient.addColorStop(1, "#f08c4a")
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
        }
      } else {
        if (jijnjaImg.complete) {
          ctx.drawImage(jijnjaImg, 0, 0, canvasRef.current!.width, canvasRef.current!.height)
        } else {
          const gradient = ctx.createLinearGradient(0, 0, 0, canvasRef.current!.height)
          gradient.addColorStop(0, "#1c3f80")
          gradient.addColorStop(1, "#f08c4a")
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
        }
      }

      // Draw obstacles
      obstacles.forEach((obstacle) => {
        // Draw curved electricity line
        ctx.strokeStyle = "#303030"
        ctx.lineWidth = OBSTACLE_WIDTH
        ctx.beginPath()
        const controlPoint1X = obstacle.x - 20
        const controlPoint2X = obstacle.x + 20
        ctx.moveTo(obstacle.x, 0)
        ctx.bezierCurveTo(
          controlPoint1X,
          obstacle.topHeight * 0.3,
          controlPoint2X,
          obstacle.topHeight * 0.7,
          obstacle.x,
          obstacle.topHeight,
        )
        ctx.stroke()

        // Draw electricity sparks along the curve
        const numSparks = 5
        for (let i = 0; i < numSparks; i++) {
          const t = i / (numSparks - 1)
          const sparkY = obstacle.topHeight * t
          const curveX = obstacle.x + Math.sin(t * Math.PI) * 20
          const sparkOffset = ((obstacle.sparkOffset + i * 0.2) % 1) * obstacle.topHeight
          const finalSparkY = (sparkY + sparkOffset) % obstacle.topHeight

          ctx.strokeStyle = "#f0f0f0"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(curveX - 10, finalSparkY)
          for (let j = 1; j <= 10; j++) {
            ctx.lineTo(curveX - 10 + j * 2, finalSparkY + (Math.random() - 0.5) * 10)
          }
          ctx.stroke()
        }

        // Draw bottom chimney using dynamic gap
        const chimneyWidth = OBSTACLE_WIDTH * 20
        const chimneyX = obstacle.x - OBSTACLE_WIDTH * 8
        const chimneyY = obstacle.topHeight + dynamicGap

        // Draw main chimney body
        ctx.fillStyle = "#8B4513" // Brown color for chimney
        ctx.fillRect(chimneyX, chimneyY, chimneyWidth, canvasRef.current!.height - chimneyY)

        // Draw chimney top detail
        ctx.fillStyle = "#654321" // Darker brown for top detail
        ctx.fillRect(chimneyX - 5, chimneyY, chimneyWidth + 10, 20)
      })

      // Draw animated crane sprite
      const currentFrame = craneImages[currentFrameRef.current]
      if (currentFrame.complete) {
        ctx.save()
        const rotation = Math.atan2(crane.velocity * 0.5, 15)
        ctx.translate(crane.x + crane.width / 2, crane.y + crane.height / 2)
        ctx.rotate(rotation)
        ctx.drawImage(currentFrame, -crane.width / 2, -crane.height / 2, crane.width, crane.height)
        ctx.restore()
      }

      // Draw score background
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(10, 10, 200, 40)
      ctx.strokeStyle = "#FFF"
      ctx.lineWidth = 2
      ctx.strokeRect(10, 10, 200, 40)

      // Draw score text
      ctx.fillStyle = "#FFF"
      ctx.font = "24px 'Press Start 2P', monospace"
      ctx.fillText(`SCORE:${score.toString().padStart(5, "0")}`, 20, 40)

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    animationFrameId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationFrameId)
  }, [gameState, score])

  useEffect(() => {
    const loadFont = async () => {
      const font = new FontFace(
        "Press Start 2P",
        "url(https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2)",
      )
      await font.load()
      document.fonts.add(font)
    }
    loadFont()
  }, [])

  const handleClick = () => {
    if (gameState === "gameOver") {
      gameObjectsRef.current = {
        crane: {
          x: 100,
          y: 200,
          velocity: 0,
          width: 50,
          height: 50,
        },
        obstacles: [],
      }
      setScore(0)
      setGameState("playing")
    } else if (gameState === "ready") {
      setGameState("playing")
    } else {
      gameObjectsRef.current.crane.velocity = JUMP_FORCE
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <div className="relative">
        <canvas ref={canvasRef} className="rounded-lg border-4 border-gray-700" onClick={handleClick} />
        {gameState !== "playing" && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            {gameState === "gameOver" ? (
              <>
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gameover-removebg-preview-gQxYCnJf9hu3d7RJdGmm6LxoRvU2JX.png"
                  alt="Game Over"
                  className="mb-8 h-32 w-auto"
                />
                <div className="mb-8 rounded bg-black/50 p-4 backdrop-blur">
                  <p className="mb-4 font-['Press_Start_2P'] text-xl text-yellow-400">FINAL SCORE</p>
                  <p className="font-['Press_Start_2P'] text-3xl text-white">{score.toString().padStart(5, "0")}</p>
                </div>
              </>
            ) : (
              <h1 className="mb-8 font-['Press_Start_2P'] text-4xl text-yellow-400 [text-shadow:4px_4px_0_#ff1744]">
                KAMPALA KRANE
              </h1>
            )}
            <div className="rounded bg-black/50 p-2 backdrop-blur">
              <Button
                onClick={handleClick}
                className="font-['Press_Start_2P'] bg-yellow-400 px-8 py-4 text-lg text-black hover:bg-yellow-500"
              >
                {gameState === "ready" ? "START GAME" : "PLAY AGAIN"}
              </Button>
            </div>
          </div>
        )}
      </div>
      <p className="mt-4 font-['Press_Start_2P'] text-sm text-yellow-400">CLICK OR TAP TO FLY!</p>
    </div>
  )
}

