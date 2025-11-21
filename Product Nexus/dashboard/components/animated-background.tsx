'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

interface Connection {
  from: Particle
  to: Particle
  opacity: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const connectionsRef = useRef<Connection[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Função para redimensionar o canvas com devicePixelRatio
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const displayWidth = window.innerWidth
      const displayHeight = window.innerHeight
      
      canvas.width = displayWidth * dpr
      canvas.height = displayHeight * dpr
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`
      
      ctx.scale(dpr, dpr)
    }

    // Criar partículas
    const createParticles = () => {
      const particles: Particle[] = []
      const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 10000)

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.2,
        })
      }

      particlesRef.current = particles
    }

    // Atualizar posição das partículas
    const updateParticles = () => {
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Inverte velocidade nas bordas
        if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1
        if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1

        // Mantém dentro dos limites
        particle.x = Math.max(0, Math.min(window.innerWidth, particle.x))
        particle.y = Math.max(0, Math.min(window.innerHeight, particle.y))
      })
    }

    // Criar conexões otimizado (usando distância ao quadrado)
    const createConnections = () => {
      const connections: Connection[] = []
      const maxDistance = 120
      const maxDistanceSquared = maxDistance * maxDistance

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x
          const dy = particlesRef.current[i].y - particlesRef.current[j].y
          const distanceSquared = dx * dx + dy * dy

          if (distanceSquared < maxDistanceSquared) {
            const distance = Math.sqrt(distanceSquared)
            connections.push({
              from: particlesRef.current[i],
              to: particlesRef.current[j],
              opacity: (1 - distance / maxDistance) * 0.15,
            })
          }
        }
      }

      connectionsRef.current = connections
    }

    // Desenhar
    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      // Fundo
      ctx.fillStyle = '#0D0D0D'
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      // Desenhar conexões
      connectionsRef.current.forEach((connection) => {
        ctx.beginPath()
        ctx.moveTo(connection.from.x, connection.from.y)
        ctx.lineTo(connection.to.x, connection.to.y)
        ctx.strokeStyle = `rgba(96, 165, 250, ${connection.opacity})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      })

      // Desenhar partículas com glow
      particlesRef.current.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(96, 165, 250, ${particle.opacity})`
        ctx.shadowColor = 'rgba(96, 165, 250, 0.3)'
        ctx.shadowBlur = 5
        ctx.fill()
        ctx.shadowBlur = 0
      })
    }

    // Loop de animação
    const animate = () => {
      updateParticles()
      createConnections()
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }

    // Inicialização
    resizeCanvas()
    createParticles()
    animate()

    // Handler de resize com debounce
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        resizeCanvas()
        createParticles()
      }, 250)
    }

    // Pausar animação quando página não está visível
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      } else {
        animate()
      }
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        background: '#0D0D0D',
      }}
    />
  )
}
