export type UserRole = 'admin' | 'manager' | 'rep';
export type UserStatus = 'active' | 'inactive';

export interface AuthUser {
  id: string;
  orgId: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface CatalogItem {
  id: string;
  orgId: string;
  name: string;
  active: boolean;
  order: number;
}

export type LeadSource = CatalogItem;
export type Campaign = CatalogItem;
export type LossReason = CatalogItem;
export type Segment = CatalogItem;

export interface Product extends CatalogItem {
  description?: string | null;
  price?: number | null;
  sku?: string | null;
}

export interface Company {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string | null;
  cnpj?: string | null;
  segmentId?: string | null;
  segment?: Segment | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  seuZucaId?: string | null;
  createdAt: string;
  updatedAt: string;
  contacts?: Contact[];
}

export interface Contact {
  id: string;
  name: string;
  type: 'individual' | 'company_contact';
  email?: string | null;
  phone?: string | null;
  cnpjCpf?: string | null;
  tags?: string[] | null;
  linkedCompanyId?: string | null;
  linkedCompany?: Company | null;
  sourceId?: string | null;
  source?: LeadSource | null;
  campaignId?: string | null;
  campaign?: Campaign | null;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  pipelineId: string;
  name: string;
  order: number;
  probability: number;
  isWon: boolean;
  isLost: boolean;
}

export interface Pipeline {
  id: string;
  orgId: string;
  name: string;
  isDefault: boolean;
  order: number;
  stages: PipelineStage[];
}

export interface PipelineMember {
  id: string;
  pipelineId: string;
  userId: string;
  user?: { id: string; name: string; email: string } | null;
}

export interface Deal {
  id: string;
  title: string;
  description?: string | null;
  value?: number | null;
  currency: string;
  pipelineId: string;
  pipeline?: Pipeline | null;
  stageId: string;
  stage?: PipelineStage | null;
  probability: number;
  expectedCloseDate?: string | null;
  ownerId?: string | null;
  owner?: { id: string; name: string } | null;
  contactId?: string | null;
  contact?: Contact | null;
  companyId?: string | null;
  company?: Company | null;
  status: 'active' | 'archived';
  closedAt?: string | null;
  lossReasonId?: string | null;
  lossReason?: LossReason | null;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'call' | 'email' | 'note' | 'meeting' | 'task';

export interface Activity {
  id: string;
  type: ActivityType;
  title?: string | null;
  description?: string | null;
  contactId?: string | null;
  contact?: Contact | null;
  dealId?: string | null;
  deal?: Deal | null;
  companyId?: string | null;
  company?: Company | null;
  durationMinutes?: number | null;
  assignedTo?: string | null;
  dueAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: { id: string; name: string; email: string } | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface PipelineStageSummary {
  count: number;
  totalValue: number;
}

export interface PipelineSummary {
  pipelineId: string;
  byStage: Record<string, PipelineStageSummary>;
  totalOpenValue: number;
  totalDeals: number;
  stalledDeals: Deal[];
}

export interface DashboardData {
  pipeline: PipelineSummary;
  recentActivities: Activity[];
  seuZucaSyncStatus: string;
}

export interface SalesGoalEntry {
  userId: string;
  userName: string;
  targetValue: number;
  targetCount: number;
}

export interface RepGoalProgress extends SalesGoalEntry {
  wonValue: number;
  wonCount: number;
  progressValuePct: number | null;
  progressCountPct: number | null;
}

export interface GoalsProgress {
  from: string;
  to: string;
  reps: RepGoalProgress[];
  orgTotals: {
    targetValue: number;
    targetCount: number;
    wonValue: number;
    wonCount: number;
    progressValuePct: number | null;
    progressCountPct: number | null;
  };
}

export interface RepKpi {
  userId: string;
  userName: string;
  dealsCreated: number;
  dealsWon: number;
  dealsLost: number;
  wonValue: number;
  winRate: number | null;
  avgDealValue: number | null;
  avgCycleDays: number | null;
  openDeals: number;
  openValue: number;
  activitiesLogged: number;
}

export interface RepsKpiData {
  from: string;
  to: string;
  reps: RepKpi[];
}

export interface ProspectingData {
  from: string;
  to: string;
  newContacts: number;
  newCompanies: number;
  newDeals: { count: number; value: number };
  bySource: { sourceId: string | null; sourceName: string; count: number }[];
  timeline: { date: string; contacts: number; deals: number }[];
  funnel: { stageId: string; stageName: string; count: number; totalValue: number }[];
}
