export function OrganizationSchema() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nexus.ai",
    "alternateName": "N8Nexus",
    "url": "https://n8nexus.com.br",
    "logo": "https://n8nexus.com.br/Logo sem fundo.png",
    "description": "Sistema Operacional de Vendas - A máquina que transforma tráfego em vendas qualificadas",
    "email": "contato@n8nexus.com.br",
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  )
}

