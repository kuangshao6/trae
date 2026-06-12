import { Crown, Zap, Sparkles, Check, Star } from "lucide-react";
import Layout from "../components/Layout";

const plans = [
  {
    name: "免费版",
    price: "0",
    period: "永久",
    description: "适合新手作者体验",
    features: [
      "每日 50 次 AI 生成",
      "3 个作品上限",
      "基础创作工具",
      "云端草稿保存",
    ],
    notIncluded: [
      "批量章节生成",
      "高级 AI 润色",
      "优先响应速度",
      "专属客服支持",
    ],
    gradient: "from-gray-400 to-gray-500",
    popular: false,
  },
  {
    name: "月度会员",
    price: "29",
    period: "/月",
    description: "适合认真创作的作者",
    features: [
      "每日 500 次 AI 生成",
      "无限作品数量",
      "高级创作工具",
      "云端草稿保存",
      "批量章节生成",
      "高级 AI 润色",
    ],
    notIncluded: [
      "优先响应速度",
      "专属客服支持",
    ],
    gradient: "from-purple-500 to-indigo-600",
    popular: true,
  },
  {
    name: "年度会员",
    price: "199",
    period: "/年",
    description: "适合专业网文作者",
    features: [
      "无限次 AI 生成",
      "无限作品数量",
      "全部创作工具",
      "云端草稿保存",
      "批量章节生成",
      "高级 AI 润色",
      "优先响应速度",
      "专属客服支持",
      "优先体验新功能",
    ],
    notIncluded: [],
    gradient: "from-amber-400 to-orange-500",
    popular: false,
  },
];

const benefits = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "AI 智能创作",
    description: "突破创作瓶颈，让灵感源源不断",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "极速创作体验",
    description: "优先响应，写你所想即刻呈现",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "专属特权",
    description: "会员专属功能，创作更加得心应手",
  },
];

export default function MembershipPage() {
  const handleSubscribe = (planName: string) => {
    alert(`您选择了 ${planName}，支付功能即将上线，敬请期待！`);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 tag-sketchy text-sm font-medium mb-4" style={{borderColor:'#f59e0b',color:'#d97706'}}>
            <Crown className="w-4 h-4" />
            升级会员
          </div>
          <h1 className="text-3xl font-bold text-ink-800 mb-3 font-sketchy">
            解锁全部创作能力
          </h1>
          <p className="text-ink-500 max-w-xl mx-auto">
            选择适合您的会员方案，开启高效的 AI 智能创作之旅
          </p>
        </div>

        {/* 会员权益 */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="card-sketchy p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 sketchy-accent bg-accent-50 flex items-center justify-center text-purple-600">
                {benefit.icon}
              </div>
              <h3 className="font-semibold text-ink-800 mb-2 font-sketchy">{benefit.title}</h3>
              <p className="text-sm text-ink-500">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* 价格方案 */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card-sketchy overflow-hidden ${
                plan.popular ? "ring-2 ring-accent-500 shadow-lg" : ""
              }`}
            >
              {plan.popular && (
                <div className="bg-ink-800 text-white text-center py-2 text-sm font-medium">
                  最受欢迎
                </div>
              )}
              <div className="p-6">
                <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center text-white`}>
                  <Crown className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-ink-800 text-center mb-1">{plan.name}</h3>
                <p className="text-sm text-ink-500 text-center mb-4">{plan.description}</p>
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-ink-800 font-sketchy">¥{plan.price}</span>
                  <span className="text-ink-400">{plan.period}</span>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.name)}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    plan.popular
                      ? "btn-sketchy-primary text-white"
                      : "btn-sketchy text-ink-700"
                  }`}
                >
                  {plan.price === "0" ? "当前方案" : "立即开通"}
                </button>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-ink-600">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 flex-shrink-0" />
                      <span className="text-ink-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 常见问题 */}
        <div className="card-sketchy p-6">
          <h2 className="text-xl font-bold text-ink-800 mb-6 text-center">常见问题</h2>
          <div className="space-y-4">
            <div className="pb-4">
              <h3 className="font-medium text-ink-800 mb-2">会员可以退款吗？</h3>
              <p className="text-sm text-ink-500">月度会员在开通后 7 天内如不满意可以申请退款，年度会员在开通后 30 天内如不满意可以申请退款。</p>
            </div>
            <hr className="divider-sketchy" />
            <div className="pb-4">
              <h3 className="font-medium text-ink-800 mb-2">AI 生成次数用完怎么办？</h3>
              <p className="text-sm text-ink-500">免费用户每日凌晨零点重置次数，会员用户在会员有效期内持续享有对应的生成额度。</p>
            </div>
            <hr className="divider-sketchy" />
            <div>
              <h3 className="font-medium text-ink-800 mb-2">如何成为会员？</h3>
              <p className="text-sm text-ink-500">选择您想要的会员方案，点击"立即开通"按钮完成支付即可成为会员。</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
