'use client'

import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas com devicePixelRatio para telas de alta resolução
    let currentWidth = window.innerWidth
    let currentHeight = window.innerHeight
    
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      
      canvas.width = newWidth * dpr
      canvas.height = newHeight * dpr
      canvas.style.width = `${newWidth}px`
      canvas.style.height = `${newHeight}px`
      
      // Reescalar o contexto após resize
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      
      // Reposicionar partículas proporcionalmente ao novo tamanho
      if (currentWidth !== newWidth || currentHeight !== newHeight) {
        particles.forEach(p => {
          p.x = (p.x / currentWidth) * newWidth
          p.y = (p.y / currentHeight) * newHeight
        })
        currentWidth = newWidth
        currentHeight = newHeight
      }
    }
    resize()

    // Partículas com cores variadas
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      color: string
      size: number
    }> = []

    // Cores Nexus: azul e roxo
    const colors = [
      { r: 96, g: 165, b: 250 },   // Azul (#60A5FA)
      { r: 139, g: 92, b: 246 },   // Roxo (#8B5CF6)
      { r: 124, g: 58, b: 237 },   // Violeta (#7C3AED)
      { r: 59, g: 130, b: 246 },   // Azul escuro (#3B82F6)
    ]

    for (let i = 0; i < 100; i++) {
      const colorIndex = Math.floor(Math.random() * colors.length)
      const color = colors[colorIndex]
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: `rgb(${color.r}, ${color.g}, ${color.b})`,
        size: Math.random() * 2 + 1,
      })
    }

    // Animar
    let animationId: number
    const animate = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Fundo com gradiente sutil mais escuro
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        width
      )
      gradient.addColorStop(0, '#0D0D0D')
      gradient.addColorStop(0.4, '#0F0A1C')
      gradient.addColorStop(0.7, '#0A0A16')
      gradient.addColorStop(1, '#0D0D0D')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Atualizar e desenhar
      particles.forEach((p, i) => {
        // Mover
        p.x += p.vx
        p.y += p.vy

        // Bounce
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Desenhar partícula com brilho mais intenso
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5)
        glow.addColorStop(0, p.color)
        glow.addColorStop(0.3, p.color.replace('rgb', 'rgba').replace(')', ', 0.8)'))
        glow.addColorStop(0.6, p.color.replace('rgb', 'rgba').replace(')', ', 0.3)'))
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
        
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2)
        ctx.fill()

        // Desenhar núcleo da partícula mais brilhante
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        
        // Núcleo interno super brilhante
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.globalAlpha = 0.8
        ctx.fill()
        ctx.globalAlpha = 1.0

        // Conectar com próximas partículas
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x
          const dy = p.y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 180) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            
            // Gradiente na linha conectora mais visível
            const lineGradient = ctx.createLinearGradient(p.x, p.y, particles[j].x, particles[j].y)
            const opacity = 0.3 * (1 - dist / 180)
            lineGradient.addColorStop(0, p.color.replace('rgb', 'rgba').replace(')', `, ${opacity})`))
            lineGradient.addColorStop(1, particles[j].color.replace('rgb', 'rgba').replace(')', `, ${opacity})`))
            
            ctx.strokeStyle = lineGradient
            ctx.lineWidth = 1.2
            ctx.stroke()
          }
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Resize
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
