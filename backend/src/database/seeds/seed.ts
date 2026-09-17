import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { Organization } from '../../organizations/organization.entity';
import { User, UserRole } from '../../users/user.entity';
import { Company } from '../../companies/company.entity';
import { Contact } from '../../contacts/contact.entity';
import { Deal } from '../../deals/deal.entity';
import { Pipeline } from '../../pipelines/pipeline.entity';
import { PipelineStage } from '../../pipelines/pipeline-stage.entity';
import { PipelineMember } from '../../pipelines/pipeline-member.entity';
import { Activity, ActivityType } from '../../activities/activity.entity';
import { Segment } from '../../catalogs/segment.entity';

async function seed() {
  await AppDataSource.initialize();

  const orgRepo = AppDataSource.getRepository(Organization);
  const userRepo = AppDataSource.getRepository(User);
  const companyRepo = AppDataSource.getRepository(Company);
  const contactRepo = AppDataSource.getRepository(Contact);
  const dealRepo = AppDataSource.getRepository(Deal);
  const activityRepo = AppDataSource.getRepository(Activity);
  const pipelineRepo = AppDataSource.getRepository(Pipeline);
  const stageRepo = AppDataSource.getRepository(PipelineStage);
  const pipelineMemberRepo = AppDataSource.getRepository(PipelineMember);
  const segmentRepo = AppDataSource.getRepository(Segment);

  let org = await orgRepo.findOne({ where: { slug: 'seu-zuca-crm' } });
  if (!org) {
    org = await orgRepo.save(
      orgRepo.create({
        name: 'Seu Zuca CRM',
        slug: 'seu-zuca-crm',
        plan: 'free',
      }),
    );
  }

  let admin = await userRepo.findOne({ where: { email: 'admin@crm.local' } });
  if (!admin) {
    admin = await userRepo.save(
      userRepo.create({
        orgId: org.id,
        email: 'admin@crm.local',
        name: 'Admin Seu Zuca',
        passwordHash: await bcrypt.hash('password123', 12),
        role: UserRole.ADMIN,
      }),
    );
  }

  let rep = await userRepo.findOne({ where: { email: 'vendedor@crm.local' } });
  if (!rep) {
    rep = await userRepo.save(
      userRepo.create({
        orgId: org.id,
        email: 'vendedor@crm.local',
        name: 'Vendedor Exemplo',
        passwordHash: await bcrypt.hash('password123', 12),
        role: UserRole.REP,
      }),
    );
  }

  let pipeline = await pipelineRepo.findOne({
    where: { orgId: org.id, isDefault: true },
  });
  if (!pipeline) {
    pipeline = await pipelineRepo.save(
      pipelineRepo.create({
        orgId: org.id,
        name: 'Pipeline Padrão',
        isDefault: true,
        order: 0,
      }),
    );
    await stageRepo.save([
      stageRepo.create({
        pipelineId: pipeline.id,
        name: 'Lead',
        order: 0,
        probability: 20,
      }),
      stageRepo.create({
        pipelineId: pipeline.id,
        name: 'Proposta',
        order: 1,
        probability: 50,
      }),
      stageRepo.create({
        pipelineId: pipeline.id,
        name: 'Negociação',
        order: 2,
        probability: 75,
      }),
      stageRepo.create({
        pipelineId: pipeline.id,
        name: 'Ganho',
        order: 3,
        probability: 100,
        isWon: true,
      }),
      stageRepo.create({
        pipelineId: pipeline.id,
        name: 'Perdido',
        order: 4,
        probability: 0,
        isLost: true,
      }),
    ]);
  }
  const stages = await stageRepo.find({
    where: { pipelineId: pipeline.id },
    order: { order: 'ASC' },
  });
  const leadStage = stages.find((s) => s.name === 'Lead');
  const proposalStage = stages.find((s) => s.name === 'Proposta');
  const negotiationStage = stages.find((s) => s.name === 'Negociação');

  for (const userId of [admin.id, rep.id]) {
    const existingMembership = await pipelineMemberRepo.findOne({
      where: { pipelineId: pipeline.id, userId },
    });
    if (!existingMembership) {
      await pipelineMemberRepo.save(
        pipelineMemberRepo.create({ pipelineId: pipeline.id, userId }),
      );
    }
  }

  const segmentNames = ['construção', 'distribuição', 'indústria'];
  const segmentsByName = new Map<string, Segment>();
  for (const name of segmentNames) {
    let segment = await segmentRepo.findOne({ where: { orgId: org.id, name } });
    if (!segment) {
      segment = await segmentRepo.save(
        segmentRepo.create({ orgId: org.id, name }),
      );
    }
    segmentsByName.set(name, segment);
  }

  const companiesData = [
    {
      razaoSocial: 'Construtora Alvorada Ltda',
      nomeFantasia: 'Alvorada Construções',
      segmentId: segmentsByName.get('construção')!.id,
      cnpj: '12.345.678/0001-90',
    },
    {
      razaoSocial: 'Distribuidora Ferro & Aço S.A.',
      nomeFantasia: 'Ferro & Aço',
      segmentId: segmentsByName.get('distribuição')!.id,
      cnpj: '98.765.432/0001-10',
    },
    {
      razaoSocial: 'Indústria Metalúrgica Sul',
      nomeFantasia: 'MetalSul',
      segmentId: segmentsByName.get('indústria')!.id,
      cnpj: '11.222.333/0001-44',
    },
  ];

  const companies: Company[] = [];
  for (const data of companiesData) {
    let company = await companyRepo.findOne({
      where: { orgId: org.id, cnpj: data.cnpj },
    });
    if (!company) {
      company = await companyRepo.save(
        companyRepo.create({ ...data, orgId: org.id }),
      );
    }
    companies.push(company);
  }

  const contactsData = [
    {
      name: 'João Silva',
      email: 'joao.silva@alvorada.com',
      phone: '11987654321',
      company: companies[0],
      tags: ['decision-maker'],
    },
    {
      name: 'Maria Santos',
      email: 'maria.santos@ferroaco.com',
      phone: '11976543210',
      company: companies[1],
      tags: ['vip'],
    },
    {
      name: 'Carlos Pereira',
      email: 'carlos.pereira@metalsul.com',
      phone: '11965432109',
      company: companies[2],
      tags: [],
    },
  ];

  const contacts: Contact[] = [];
  for (const data of contactsData) {
    let contact = await contactRepo.findOne({
      where: { orgId: org.id, email: data.email },
    });
    if (!contact) {
      contact = await contactRepo.save(
        contactRepo.create({
          orgId: org.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          tags: data.tags,
          linkedCompanyId: data.company.id,
          createdBy: admin.id,
        }),
      );
    }
    contacts.push(contact);
  }

  const dealsData = [
    {
      title: 'Venda de cimento - Alvorada',
      value: 45000,
      stage: leadStage,
      contact: contacts[0],
      company: companies[0],
    },
    {
      title: 'Fornecimento de vergalhões',
      value: 128000,
      stage: proposalStage,
      contact: contacts[1],
      company: companies[1],
    },
    {
      title: 'Contrato anual de chapas de aço',
      value: 320000,
      stage: negotiationStage,
      contact: contacts[2],
      company: companies[2],
    },
    {
      title: 'Venda Q4 2026',
      value: 50000,
      stage: leadStage,
      contact: contacts[0],
      company: companies[0],
    },
  ];

  for (const data of dealsData) {
    const existing = await dealRepo.findOne({
      where: { orgId: org.id, title: data.title },
    });
    if (!existing && data.stage) {
      const deal = await dealRepo.save(
        dealRepo.create({
          orgId: org.id,
          title: data.title,
          value: data.value,
          pipelineId: pipeline.id,
          stageId: data.stage.id,
          probability: data.stage.probability,
          contactId: data.contact.id,
          companyId: data.company.id,
          ownerId: rep.id,
        }),
      );

      await activityRepo.save(
        activityRepo.create({
          orgId: org.id,
          type: ActivityType.NOTE,
          title: 'Deal criado (seed)',
          dealId: deal.id,
          contactId: deal.contactId,
          completedAt: new Date(),
        }),
      );
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seed concluído.');
  // eslint-disable-next-line no-console
  console.log('Login: admin@crm.local / password123');

  await AppDataSource.destroy();
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Erro ao rodar seed:', error);
  process.exit(1);
});
