# Guia Completo: Como Replicar o Fundo Animado de Partículas Conectadas

Este guia detalhado explica passo a passo como replicar o fundo animado de partículas conectadas usado neste projeto em qualquer outro site. O efeito consiste em partículas que se movem pela tela e se conectam entre si através de linhas quando estão próximas.

---

## 📋 Índice

1. [Entendendo o Componente](#entendendo-o-componente)
2. [Dependências Necessárias](#dependências-necessárias)
3. [Implementação Passo a Passo](#implementação-passo-a-passo)
4. [Versão para Vanilla JavaScript (HTML/CSS/JS)](#versão-para-vanilla-javascript)
5. [Customização e Ajustes](#customização-e-ajustes)
6. [Troubleshooting](#troubleshooting)
7. [Otimizações de Performance](#otimizações-de-performance)

---

## 🎯 Entendendo o Componente

### O que é?

O fundo animado é um efeito visual criado usando **Canvas API** que consiste em:

- **Partículas**: Pequenos círculos que se movem pela tela
- **Conexões**: Linhas que conectam partículas próximas
- **Animação contínua**: Loop infinito usando `requestAnimationFrame`

### Como funciona?

1. Cria múltiplas partículas em posições aleatórias
2. Cada partícula tem velocidade (vx, vy) e se move constantemente
3. Quando uma partícula atinge a borda, sua velocidade inverte
4. A cada frame, verifica quais partículas estão próximas (distância < 120px)
5. Desenha linhas conectando partículas próximas
6. Desenha as partículas

---

## 📦 Dependências Necessárias

### Para React/Next.js:

```json
{
  "react": "^18",
  "react-dom": "^18"
}
```

### Para Vanilla JavaScript:

**Nenhuma dependência externa necessária!** Usa apenas APIs nativas do navegador.

---

## 🔧 Implementação Passo a Passo

### Opção 1: React/Next.js (Recomendado)

#### Passo 1: Criar o Arquivo do Componente

Crie um arquivo chamado `animated-background.tsx` (ou `.jsx` se não estiver usando TypeScript) na pasta `components/`:

```tsx
'use client'

import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    // Partículas simples
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
    }> = []

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      })
    }

    // Animar
    let animationId: number
    const animate = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Fundo escuro simples
      ctx.fillStyle = '#0D0D0D'
      ctx.fillRect(0, 0, width, height)

      // Atualizar e desenhar
      particles.forEach((p, i) => {
        // Mover
        p.x += p.vx
        p.y += p.vy

        // Bounce
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Desenhar partícula
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(96, 165, 250, 0.3)'
        ctx.fill()

        // Conectar com próximas
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x
          const dy = p.y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            const opacity = 0.1 * (1 - dist / 120)
            ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`
            ctx.lineWidth = 0.5
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
```

#### Passo 2: Importar e Usar o Componente

No seu componente principal ou página (ex: `page.tsx`, `App.tsx`, `index.tsx`):

```tsx
import { AnimatedBackground } from '@/components/animated-background'

export default function HomePage() {
  return (
    <main className="min-h-screen relative">
      {/* O fundo animado deve estar ATRÁS de todo conteúdo */}
      <AnimatedBackground />
      
      {/* Todo o resto do seu conteúdo deve ter z-index maior */}
      <div className="relative z-10">
        {/* Seu header, conteúdo, etc */}
      </div>
    </main>
  )
}
```

#### Passo 3: Estilização com CSS (Opcional)

Se você quiser personalizar ainda mais:

```css
/* Em seu arquivo globals.css ou componente CSS */
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Permite cliques através do canvas */
  z-index: 0;
  background-color: #0D0D0D;
}
```

**IMPORTANTE:** Certifique-se de que:
- O canvas tem `pointer-events-none` para não bloquear interações
- O canvas tem `z-index: 0` (ou menor)
- Seu conteúdo principal tem `z-index` maior (ex: `z-10` ou `z-20`)
- O canvas está posicionado com `fixed` ou `absolute`

---

## 🌐 Versão para Vanilla JavaScript (HTML/CSS/JS)

Se você não está usando React, pode implementar em HTML/CSS/JavaScript puro.

### Passo 1: Estrutura HTML

Crie um arquivo `index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fundo Animado - Partículas</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            margin: 0;
            overflow-x: hidden;
            background: #0D0D0D;
        }

        #animated-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        }

        .content {
            position: relative;
            z-index: 10;
            min-height: 100vh;
            color: white;
            padding: 2rem;
        }
    </style>
</head>
<body>
    <!-- Canvas para o fundo animado -->
    <canvas id="animated-background"></canvas>

    <!-- Seu conteúdo -->
    <div class="content">
        <h1>Meu Site com Fundo Animado</h1>
        <p>Partículas conectadas em movimento!</p>
    </div>

    <script src="animated-background.js"></script>
</body>
</html>
```

### Passo 2: JavaScript (animated-background.js)

Crie um arquivo `animated-background.js`:

```javascript
(function() {
    'use strict';

    const canvas = document.getElementById('animated-background');
    const ctx = canvas.getContext('2d');

    let particles = [];
    let animationId = null;

    // Redimensionar canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Criar partículas
    function createParticles() {
        particles = [];
        const particleCount = 80;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
            });
        }
    }

    // Atualizar e desenhar
    function animate() {
        const width = canvas.width;
        const height = canvas.height;

        // Fundo
        ctx.fillStyle = '#0D0D0D';
        ctx.fillRect(0, 0, width, height);

        // Processar partículas
        particles.forEach((p, i) => {
            // Mover
            p.x += p.vx;
            p.y += p.vy;

            // Bounce
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            // Desenhar partícula
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(96, 165, 250, 0.3)';
            ctx.fill();

            // Conectar com outras partículas
            for (let j = i + 1; j < particles.length; j++) {
                const dx = p.x - particles[j].x;
                const dy = p.y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    const opacity = 0.1 * (1 - dist / 120);
                    ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });

        animationId = requestAnimationFrame(animate);
    }

    // Inicializar
    function init() {
        resizeCanvas();
        createParticles();
        animate();

        window.addEventListener('resize', () => {
            resizeCanvas();
            createParticles();
        });
    }

    // Iniciar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
```

---

## 🎨 Customização e Ajustes

### Mudando as Cores

#### Cores das Partículas
Localize esta linha no código:
```tsx
ctx.fillStyle = 'rgba(96, 165, 250, 0.3)'
```
Altere os valores RGB:
- `rgba(255, 100, 100, 0.3)` = Vermelho
- `rgba(100, 255, 100, 0.3)` = Verde
- `rgba(255, 200, 50, 0.3)` = Amarelo/Laranja
- `rgba(200, 100, 255, 0.3)` = Roxo

#### Cores das Linhas
Localize:
```tsx
ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`
```

#### Cor de Fundo
```tsx
ctx.fillStyle = '#0D0D0D'  // Preto
ctx.fillStyle = '#1a1a2e'  // Azul escuro
ctx.fillStyle = '#16213e'  // Azul marinho
```

### Ajustando o Número de Partículas

```tsx
// Mais partículas (mais denso)
for (let i = 0; i < 120; i++) {

// Menos partículas (mais esparso)
for (let i = 0; i < 50; i++) {
```

### Ajustando a Velocidade

```tsx
// Mais rápido
vx: (Math.random() - 0.5) * 1.0,
vy: (Math.random() - 0.5) * 1.0,

// Mais lento
vx: (Math.random() - 0.5) * 0.1,
vy: (Math.random() - 0.5) * 0.1,
```

### Ajustando a Distância de Conexão

```tsx
if (dist < 120) {  // Padrão

// Mais conexões
if (dist < 180) {

// Menos conexões
if (dist < 80) {
```

### Ajustando o Tamanho das Partículas

```tsx
// Partículas maiores
ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)

// Partículas menores
ctx.arc(p.x, p.y, 1, 0, Math.PI * 2)
```

### Ajustando a Opacidade

```tsx
// Partículas mais visíveis
ctx.fillStyle = 'rgba(96, 165, 250, 0.6)'

// Partículas mais sutis
ctx.fillStyle = 'rgba(96, 165, 250, 0.1)'

// Linhas mais visíveis
const opacity = 0.3 * (1 - dist / 120)

// Linhas mais sutis
const opacity = 0.05 * (1 - dist / 120)
```

---

## 🔍 Troubleshooting

### Problema: Canvas não aparece

**Solução:**
1. Verifique se o canvas está sendo renderizado (inspecione no DevTools)
2. Certifique-se de que tem dimensões: `width` e `height` definidos
3. Verifique o `z-index` (canvas deve estar atrás do conteúdo)

### Problema: Canvas bloqueia cliques

**Solução:**
Adicione `pointer-events-none`:
```css
pointer-events: none;
```

### Problema: Animação não inicia

**Solução:**
1. Abra o Console (F12) e verifique erros
2. Certifique-se de que `requestAnimationFrame` está rodando
3. Verifique se o canvas tem contexto: `canvas.getContext('2d')`

### Problema: Performance ruim / Lag

**Soluções:**
1. **Reduza o número de partículas:**
   ```tsx
   for (let i = 0; i < 40; i++) {
   ```

2. **Reduza a distância máxima:**
   ```tsx
   if (dist < 80) {
   ```

3. **Use `will-change` no CSS:**
   ```css
   canvas {
       will-change: contents;
   }
   ```

### Problema: Fundo não preenche toda a tela

**Solução:**
Verifique se o canvas tem:
- `position: fixed`
- `width: 100vw` e `height: 100vh`
- `top: 0`, `left: 0`

### Problema: Partículas desaparecem nas bordas

**Solução:**
Certifique-se de que o canvas está redimensionando corretamente:
```tsx
canvas.width = window.innerWidth
canvas.height = window.innerHeight
```

---

## ⚡ Otimizações de Performance

### 1. Otimizar para Telas de Alta Resolução

```tsx
const resize = () => {
  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
  ctx.scale(dpr, dpr)
}
```

### 2. Usar Distância ao Quadrado (mais rápido)

```tsx
const maxDistSquared = 120 * 120 // Evita Math.sqrt
const dx = p.x - particles[j].x
const dy = p.y - particles[j].y
const distSquared = dx * dx + dy * dy

if (distSquared < maxDistSquared) {
  const dist = Math.sqrt(distSquared) // Só calcula quando necessário
  // ...
}
```

### 3. Pausar quando Página Não Está Visível

```tsx
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (animationId) cancelAnimationFrame(animationId)
  } else {
    animate()
  }
})
```

### 4. Debounce no Redimensionamento

```tsx
let resizeTimeout: NodeJS.Timeout

const handleResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    resize()
    createParticles()
  }, 250)
}
```

---

## 📱 Compatibilidade

### Navegadores Suportados:
- ✅ Chrome/Edge (últimas versões)
- ✅ Firefox (últimas versões)
- ✅ Safari (últimas versões)
- ✅ Opera (últimas versões)
- ✅ Navegadores móveis modernos

### Requisitos:
- Canvas API
- `requestAnimationFrame`

---

## 📝 Exemplo Mínimo para Testes Rápidos

```tsx
"use client"
import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let particles: Array<{x: number, y: number, vx: number, vy: number}> = []

    const init = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }))
    }

    const animate = () => {
      ctx.fillStyle = '#0D0D0D'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        particles.slice(i + 1).forEach(other => {
          const dx = p.x - other.x
          const dy = p.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.1 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })

        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(96, 165, 250, 0.3)"
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    init()
    animate()
    window.addEventListener("resize", init)
    return () => window.removeEventListener("resize", init)
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
```

---

## 🎓 Recursos para Aprender Mais

- [MDN - Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MDN - requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)

---

## ✅ Checklist Final

Antes de considerar completo, verifique:

- [ ] Canvas renderizando corretamente
- [ ] Partículas se movendo
- [ ] Conexões aparecendo entre partículas próximas
- [ ] Animação suave (60 FPS)
- [ ] Canvas não bloqueia interações (`pointer-events-none`)
- [ ] Responsivo (funciona em diferentes tamanhos)
- [ ] Performance boa (sem lag)
- [ ] Cleanup funcionando (sem memory leaks)

---

**Pronto!** Agora você tem um guia completo para replicar o fundo animado em qualquer site.


