# 📁 Pasta Public - Imagens e Assets

Esta pasta contém arquivos estáticos que são servidos diretamente pelo Next.js.

## 📍 Onde Adicionar Imagens

### Logo da Empresa

**Caminho:** `dashboard/public/logo.png` (ou `.svg`, `.jpg`)

**Formatos recomendados:**
- `.svg` - Melhor qualidade, escalável
- `.png` - Com transparência
- `.jpg` - Sem transparência

**Tamanhos recomendados:**
- Logo horizontal: 200x50px
- Logo quadrado: 100x100px
- Favicon: 32x32px ou 64x64px

## 🖼️ Como Usar no Código

### No Sidebar (Logo no menu lateral)

```tsx
import Image from 'next/image'

<Image 
  src="/logo.png" 
  alt="Nexus Sales OS" 
  width={120} 
  height={40}
/>
```

### No Login (Logo na página de login)

```tsx
import Image from 'next/image'

<Image 
  src="/logo.png" 
  alt="Nexus Sales OS" 
  width={200} 
  height={60}
/>
```

### Favicon (Ícone do navegador)

Coloque em: `public/favicon.ico`

## 📂 Estrutura Recomendada

```
public/
├── logo.png          # Logo principal
├── logo-white.png    # Logo para fundo escuro
├── favicon.ico       # Ícone do navegador
└── images/           # Outras imagens
    ├── dashboard/
    └── icons/
```

## ✅ Próximos Passos

1. Adicione sua logo em `public/logo.png`
2. Atualize o componente Sidebar para usar a logo
3. Atualize a página de Login para usar a logo
4. Adicione o favicon em `public/favicon.ico`

