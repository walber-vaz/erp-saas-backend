import type { PrismaClient } from '@generated/prisma/client';
import { v7 as uuidv7 } from 'uuid';

export async function seedModules(prisma: PrismaClient) {
  const modulesData = [
    {
      code: 'FINANCE',
      name: 'Financeiro',
      description: 'Gestão de contas a pagar e receber, fluxo de caixa.',
    },
    {
      code: 'INVENTORY',
      name: 'Estoque',
      description: 'Controle de produtos, entradas, saídas e inventário.',
    },
    {
      code: 'SALES',
      name: 'Vendas',
      description: 'Gestão de orçamentos, pedidos e faturamento de vendas.',
    },
    {
      code: 'PURCHASE',
      name: 'Compras',
      description: 'Requisições, pedidos de compra e gestão de fornecedores.',
    },
    {
      code: 'HR',
      name: 'Recursos Humanos',
      description: 'Gestão de funcionários, folha de pagamento e benefícios.',
    },
    {
      code: 'FISCAL',
      name: 'Fiscal',
      description: 'Apuração de impostos e emissão de documentos fiscais.',
    },
    {
      code: 'CRM',
      name: 'CRM',
      description:
        'Gestão do relacionamento com clientes e oportunidades de venda.',
    },
    {
      code: 'BOOKING',
      name: 'Reservas',
      description: 'Sistema de agendamento e gestão de reservas.',
    },
  ];

  for (const moduleData of modulesData) {
    await prisma.module.upsert({
      where: { code: moduleData.code },
      update: {
        name: moduleData.name,
        description: moduleData.description,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        id: uuidv7(),
        code: moduleData.code,
        name: moduleData.name,
        description: moduleData.description,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('Modules seeded successfully.');
}
