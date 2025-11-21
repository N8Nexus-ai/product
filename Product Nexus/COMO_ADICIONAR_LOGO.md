# 🖼️ Como Adicionar a Logo

## 📍 Onde Colocar a Imagem

**Pasta:** `dashboard/public/`

**Arquivo:** `logo.png` (ou `.svg`, `.jpg`)

**Caminho completo:**
```
dashboard/public/logo.png
```

---

## 📝 Passos

### 1. Adicionar a Imagem

Copie sua logo para:
```
/Users/marco/Downloads/Automation/Product Nexus/dashboard/public/logo.png
```

**Formatos suportados:**
- `.png` - Recomendado (com transparência)
- `.svg` - Melhor qualidade (escalável)
- `.jpg` - Sem transparência

**Tamanhos recomendados:**
- Logo horizontal: 200x50px ou 240x60px
- Logo quadrado: 100x100px ou 120x120px

### 2. Verificar se Foi Adicionada

```bash
ls -la dashboard/public/logo.*
```

Você deve ver sua logo listada.

### 3. O Código Já Está Configurado!

O código já está preparado para usar a logo. Quando você adicionar o arquivo `logo.png` em `public/`, ela aparecerá automaticamente em:

- ✅ **Sidebar** (menu lateral)
- ✅ **Página de Login**

Se a logo não existir, o sistema mostra o texto "Nexus Sales OS" como fallback.

---

## 🎨 Onde a Logo Aparece

### 1. Sidebar (Menu Lateral)

**Localização:** `dashboard/components/sidebar.tsx`

**Tamanho:** 120x40px

**Código:**
```tsx
<Image 
  src="/logo.png" 
  alt="Nexus Sales OS" 
  width={120} 
  height={40}
/>
```

### 2. Página de Login

**Localização:** `dashboard/app/(auth)/login/page.tsx`

**Tamanho:** 192x64px (w-48 h-16)

**Código:**
```tsx
<Image 
  src="/logo.png" 
  alt="Nexus Sales OS" 
  fill
  className="object-contain"
/>
```

---

## 🔧 Personalizar Tamanho

Se sua logo tem tamanho diferente, ajuste no código:

### No Sidebar:

```tsx
<Image 
  src="/logo.png" 
  alt="Nexus Sales OS" 
  width={150}  // Ajuste aqui
  height={50}   // Ajuste aqui
/>
```

### No Login:

```tsx
<div className="relative w-56 h-20">  {/* Ajuste aqui */}
  <Image 
    src="/logo.png" 
    alt="Nexus Sales OS" 
    fill
  />
</div>
```

---

## 🎯 Logo para Fundo Escuro

Se você tem uma logo para fundo escuro (sidebar), pode usar:

1. Adicione: `public/logo-white.png`
2. Atualize o Sidebar:

```tsx
<Image 
  src="/logo-white.png"  // Logo para fundo escuro
  alt="Nexus Sales OS" 
  width={120} 
  height={40}
/>
```

---

## 📱 Favicon (Ícone do Navegador)

Para adicionar o favicon:

1. Crie um ícone 32x32px ou 64x64px
2. Salve como: `dashboard/public/favicon.ico`
3. O Next.js usa automaticamente!

**Ou use um gerador online:**
- https://favicon.io/
- https://realfavicongenerator.net/

---

## ✅ Verificar se Funcionou

1. Adicione a logo em `dashboard/public/logo.png`
2. Reinicie o dashboard (se estiver rodando)
3. Acesse: http://localhost:3000
4. Veja a logo no sidebar e na página de login

---

## 🐛 Troubleshooting

### Logo não aparece

**Verificar:**
```bash
# Ver se o arquivo existe
ls -la dashboard/public/logo.*

# Verificar permissões
chmod 644 dashboard/public/logo.png
```

### Logo aparece muito grande/pequena

**Solução:** Ajuste os valores `width` e `height` no código.

### Logo aparece cortada

**Solução:** Use `object-contain` no className:

```tsx
<Image 
  src="/logo.png" 
  className="object-contain"
/>
```

---

## 📚 Recursos

- [Next.js Image Component](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Otimização de Imagens](https://nextjs.org/docs/app/building-your-application/optimizing/images)

---

**Pronto!** Adicione sua logo em `dashboard/public/logo.png` e ela aparecerá automaticamente! 🎨

