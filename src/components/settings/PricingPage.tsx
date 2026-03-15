/**
 * 订阅与计费页面
 */

import { useState } from 'react'
import { Check, X, Sparkles } from 'lucide-react'
import { PageContainer } from '@components/layout/PageContainer'
import { Card, CardContent, CardHeader } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'

interface Plan {
  id: string
  name: string
  price: number
  period: 'month' | 'year'
  features: string[]
  notIncluded?: string[]
  popular?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: '免费版',
    price: 0,
    period: 'month',
    features: [
      '最多 3 个 Agent',
      '基础对话功能',
      '100 条消息/天',
      '基础知识库 (1MB)',
      '社区支持',
    ],
    notIncluded: [
      '高级模型 (GPT-4, Claude)',
      '自定义工具',
      '优先支持',
    ],
  },
  {
    id: 'pro',
    name: '专业版',
    price: 99,
    period: 'month',
    features: [
      '无限 Agent',
      '高级对话功能',
      '无限消息',
      '知识库 (100MB)',
      '支持所有 LLM 模型',
      '自定义工具',
      '优先支持',
      'API 访问',
    ],
    notIncluded: [
      '团队协作',
      '企业级安全',
    ],
    popular: true,
  },
  {
    id: 'team',
    name: '团队版',
    price: 299,
    period: 'month',
    features: [
      '无限 Agent',
      '高级对话功能',
      '无限消息',
      '知识库 (1GB)',
      '支持所有 LLM 模型',
      '自定义工具',
      '优先支持',
      'API 访问',
      '团队协作 (10 人)',
      '企业级安全',
      'SSO 集成',
    ],
  },
]

export function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month')
  const [currentPlan] = useState('free') // TODO: 从 API 获取

  const getPrice = (plan: Plan) => {
    if (billingPeriod === 'year' && plan.id !== 'free') {
      return Math.round(plan.price * 10) // 年付 8 折
    }
    return plan.price
  }

  return (
    <PageContainer
      title="订阅计划"
      description="选择适合您的计划"
    >
      {/* 切换月付/年付 */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'month'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => setBillingPeriod('month')}
          >
            月付
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'year'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => setBillingPeriod('year')}
          >
            年付 <Badge variant="success" className="ml-2 text-xs">省 20%</Badge>
          </button>
        </div>
      </div>

      {/* 计划卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.popular ? 'border-primary-500 ring-2 ring-primary-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="primary" className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  最受欢迎
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-2">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">¥{getPrice(plan)}</span>
                {plan.id !== 'free' && (
                  <span className="text-gray-500">/{billingPeriod === 'month' ? '月' : '年'}</span>
                )}
              </div>
              {billingPeriod === 'year' && plan.id !== 'free' && (
                <p className="text-sm text-green-600 mt-1">
                  年付 ¥{getPrice(plan) * 12}/年
                </p>
              )}
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded?.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 opacity-50">
                    <X className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {currentPlan === plan.id ? (
                  <Button variant="outline" className="w-full" disabled>
                    当前计划
                  </Button>
                ) : (
                  <Button 
                    variant={plan.popular ? 'primary' : 'outline'} 
                    className="w-full"
                  >
                    {plan.id === 'free' ? '免费开始' : '立即订阅'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-8">常见问题</h2>
        <div className="space-y-4">
          <FAQItem
            question="可以随时取消订阅吗？"
            answer="是的，您可以随时取消订阅。取消后，您将继续使用当前计划直到订阅期结束。"
          />
          <FAQItem
            question="支持哪些支付方式？"
            answer="我们支持微信支付、支付宝、信用卡等多种支付方式。"
          />
          <FAQItem
            question="可以升级或降级计划吗？"
            answer="是的，您可以随时升级或降级您的订阅计划。升级立即生效，降级将在下个计费周期生效。"
          />
        </div>
      </div>
    </PageContainer>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card>
      <button
        className="w-full text-left p-4 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{question}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-gray-600">
          {answer}
        </div>
      )}
    </Card>
  )
}
