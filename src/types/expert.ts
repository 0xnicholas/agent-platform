/**
 * Expert Agent 类型定义
 */

export type ExpertDomain = 
  | 'customer_service'
  | 'sales'
  | 'legal'
  | 'finance'
  | 'education'
  | 'programming'
  | 'healthcare'
  | 'other'

export interface ExpertProfile {
  domain: ExpertDomain
  expertise: string[]
  certifications: string[]
  experience: string
  trainingDocs: TrainingDoc[]
  caseStudies: CaseStudy[]
  faqs: FAQ[]
}

export interface TrainingDoc {
  id: string
  name: string
  content: string
  source: 'manual' | 'uploaded' | 'web'
  chunkCount: number
  embeddingStatus: 'pending' | 'processing' | 'completed'
}

export interface CaseStudy {
  id: string
  title: string
  description: string
  steps: string[]
  expectedOutcome: string
  tags: string[]
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category?: string
}

export const DOMAIN_LABELS: Record<ExpertDomain, string> = {
  customer_service: '客服',
  sales: '销售',
  legal: '法律',
  finance: '金融',
  education: '教育',
  programming: '编程',
  healthcare: '医疗',
  other: '其他',
}

export const DOMAIN_DESCRIPTIONS: Record<ExpertDomain, string> = {
  customer_service: '处理客户咨询、投诉和售后支持',
  sales: '销售咨询、产品推广和线索跟进',
  legal: '法律咨询、合同审查和合规建议',
  finance: '投资建议、财务分析和风险管理',
  education: '教学辅导、课程设计和学习评估',
  programming: '代码审查、调试和技术方案',
  healthcare: '健康咨询、症状分析和就医指导',
  other: '自定义领域的专业咨询',
}
