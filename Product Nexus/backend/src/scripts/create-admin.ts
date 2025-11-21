import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Script para criar um usuário ADMIN internamente (BOOTSTRAP)
 * 
 * ⚠️  IMPORTANTE: Este script é apenas para criar o PRIMEIRO ADMIN do sistema.
 * 
 * Após o primeiro ADMIN ser criado, TODOS os outros ADMINs devem ser criados
 * apenas por outros ADMINs através do endpoint: POST /api/users (com role: ADMIN)
 * 
 * Este script só deve ser usado uma vez, para o bootstrap inicial do sistema.
 * 
 * Uso:
 *   npx tsx src/scripts/create-admin.ts
 */
async function createAdmin() {
  try {
    console.log('🔐 Criando usuário ADMIN...\n');

    // Obter dados do ambiente ou argumentos
    const email = process.env.ADMIN_EMAIL || process.argv[2];
    const password = process.env.ADMIN_PASSWORD || process.argv[3];
    const name = process.env.ADMIN_NAME || process.argv[4] || 'Administrador Sistema';

    if (!email || !password) {
      console.error('❌ ERRO: Email e senha são obrigatórios!\n');
      console.error('Uso:');
      console.error('  Opção 1: Via argumentos');
      console.error('    npx tsx src/scripts/create-admin.ts <email> <senha> [nome]\n');
      console.error('  Opção 2: Via variáveis de ambiente');
      console.error('    ADMIN_EMAIL=admin@nexus.ai ADMIN_PASSWORD=SenhaSegura123! npx tsx src/scripts/create-admin.ts\n');
      console.error('  Opção 3: No arquivo .env');
      console.error('    ADMIN_EMAIL=admin@nexus.ai');
      console.error('    ADMIN_PASSWORD=SenhaSegura123!\n');
      process.exit(1);
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      if (existingUser.role === Role.ADMIN) {
        console.log(`⚠️  ADMIN já existe com este email: ${email}`);
        console.log('   Nada a fazer.\n');
        process.exit(0);
      } else {
        console.error(`❌ ERRO: Já existe um usuário com este email, mas com role: ${existingUser.role}`);
        console.error('   Não é possível converter um usuário existente para ADMIN via script.');
        console.error('   Faça isso manualmente via Prisma Studio ou diretamente no banco.\n');
        process.exit(1);
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar ADMIN SEM companyId (ADMIN não pertence a nenhuma empresa específica)
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: Role.ADMIN,
        companyId: null, // ADMIN não tem companyId
        active: true
      }
    });

    console.log('✅ ADMIN criado com sucesso!\n');
    console.log('📊 Detalhes:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Nome: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   CompanyId: ${admin.companyId || '(nenhuma - acesso global)'}\n`);
    console.log('🔑 Credenciais de acesso:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}\n`);
    console.log('⚠️  IMPORTANTE: Guarde estas credenciais com segurança!');
    console.log('   ADMINs têm acesso a dados de todas as empresas.\n');

  } catch (error) {
    console.error('❌ Erro ao criar ADMIN:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
createAdmin()
  .then(() => {
    console.log('✅ Processo finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

