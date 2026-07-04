import type { ModuleConfig } from '../types';

// ========== Module Category Mapping ==========
// Maps each module name to its first-level category options
// Used by achievement form for dynamic category dropdown
const MODULE_CATEGORIES_KEY = 'lifeos_skill_categories';

const DEFAULT_LEARNING_CATEGORIES = [
  '学历提升',
  '职业能力提升',
  '投资理财学习',
  '副业应用学习',
  '爱好兴趣学习',
  '其他技能学习',
];

const DEFAULT_EMOTION_TAGS = ['开心', '平静', '焦虑', '感恩', '充实', '感动', '喜悦', '沮丧', '孤单', '愤怒', '期待', '释然'];

export const STATIC_MODULE_CATEGORIES: Record<string, string[]> = {
  '旅行日记': ['国内旅行', '海外旅行', '短途出行', '深度旅行', '周末游'],
  '心情心态': ['情绪管理', '自我觉察', '心理成长', '压力应对', '冥想放松'],
  '目标管理': ['学习', '职业', '健康', '财务', '生活', '个人成长'],
  '健康习惯': ['运动', '饮食', '睡眠', '心理健康', '体重管理'],
  '财务管理': ['餐饮', '交通', '购物', '娱乐', '房租', '学习', '投资', '工资', '兼职', '其他'],
  '社交人脉': ['挚友', '同事', '行业人脉', '家人', '导师', '其他'],
  '收获感悟': ['学习', '旅行', '工作', '生活', '阅读', '对话', '反思', '其他'],
  '里程碑': ['学习', '旅行', '财务', '健康', '职业', '生活'],
  '手动成就': [],
};

export function getModuleCategories(moduleName: string): string[] {
  if (moduleName === '学习成长') {
    try {
      const raw = localStorage.getItem(MODULE_CATEGORIES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [...DEFAULT_LEARNING_CATEGORIES];
  }
  return STATIC_MODULE_CATEGORIES[moduleName] || [];
}

export const MODULES: Record<string, ModuleConfig> = {
  learning: {
    name: '学习成长', icon: '📚', color: '#0EA5E9', desc: '按技能树分类，记录每一份知识的积累',
    fields: [
      { key: 'category', label: '学习分类', type: 'select', options: ['学历提升', '职业能力提升', '投资理财学习', '副业应用学习', '爱好兴趣学习', '其他技能学习'], required: true },
      { key: 'title', label: '标题', type: 'text', required: true, placeholder: '学了什么？' },
      { key: 'source', label: '来源', type: 'text', placeholder: '作者 / 平台 / 讲师' },
      { key: 'start_date', label: '开始日期', type: 'date' },
      { key: 'end_date', label: '结束日期', type: 'date' },
      { key: 'duration_hours', label: '有效学习时长(小时)', type: 'number', placeholder: '如 12.5' },
      { key: 'progress', label: '学习进度', type: 'progress' },
      { key: 'self_rating', label: '自我学习评分', type: 'rating' },
      { key: 'notes', label: '笔记 / 收获', type: 'textarea', placeholder: '学到了什么？有什么启发？' },
    ],
  },
  travel: {
    name: '旅行日记', icon: '✈️', color: '#F97316', desc: '用图文记录每一段旅程的精彩',
    fields: [
      { key: 'category', label: '旅游分类', type: 'select', options: ['国内旅行', '亚洲旅行', '欧洲旅行', '美洲旅行', '大洋洲旅行', '短途周边', '深度旅行'], required: true },
      { key: 'destination', label: '目的地', type: 'text', required: true, placeholder: '如:京都 / 曼谷' },
      // cascader 字段通过 dependsOn='category' 自动联动国家范围
      { key: 'country', label: '国家 / 地区', type: 'cascader', dependsOn: 'category', placeholder: '选择国家 → 省/州 → 城市' },
      { key: 'start_date', label: '出发日期', type: 'date' },
      { key: 'end_date', label: '返回日期', type: 'date' },
      { key: 'mood', label: '旅行心情', type: 'rating' },
      { key: 'weather', label: '天气', type: 'text', placeholder: '晴 / 雨 / 多云...' },
      { key: 'highlights', label: '高光时刻(图文)', type: 'rich-content' },
      { key: 'reflections', label: '感悟 / 心态', type: 'textarea', placeholder: '这次旅行给你带来了什么？心情和心态有什么变化？' },
    ],
  },
  achievements: {
    name: '成就墙', icon: '🏆', color: '#F59E0B', desc: '技能树般记录每一个里程碑',
    fields: [
      { key: 'title', label: '成就标题', type: 'text', required: true, placeholder: '完成了什么？' },
      { key: 'module', label: '所属模块', type: 'select', options: ['学习成长', '旅行日记', '心情心态', '目标管理', '健康习惯', '财务管理', '社交人脉', '收获感悟', '手动成就'], required: true },
      { key: 'category', label: '一级分类', type: 'module-category', dependsOn: 'module', placeholder: '根据所属模块自动获取' },
      { key: 'subcategory', label: '二级分类', type: 'text', placeholder: '自定义细分领域，如：React 进阶' },
      { key: 'date', label: '达成日期', type: 'date' },
      { key: 'description', label: '描述', type: 'textarea', placeholder: '具体做了什么？' },
      { key: 'feeling', label: '当时的感受', type: 'textarea', placeholder: '达成时的心情？' },
    ],
  },
  mood: {
    name: '心情心态', icon: '🌙', color: '#EC4899', desc: '关注内心，记录情绪的起伏',
    fields: [
      { key: 'category', label: '心情分类', type: 'select', dynamicCategories: 'lifeos_mood_categories', required: true },
      { key: 'date', label: '日期', type: 'date', required: true },
      { key: 'score', label: '心情指数', type: 'rating', required: true },
      { key: 'emotions', label: '情绪标签', type: 'tags', presetOptions: DEFAULT_EMOTION_TAGS, placeholder: '选择预设标签或输入自定义标签' },
      { key: 'journal', label: '心情日记', type: 'textarea', placeholder: '今天发生了什么？心态如何？有什么感悟？' },
    ],
  },
  goals: {
    name: '目标管理', icon: '🎯', color: '#10B981', desc: '把梦想拆解为可追踪的行动',
    fields: [
      { key: 'title', label: '目标标题', type: 'text', required: true, placeholder: '你想实现什么？' },
      { key: 'category', label: '类别', type: 'select', dynamicCategories: 'lifeos_goal_categories', required: true },
      { key: 'deadline', label: '截止日期', type: 'date' },
      { key: 'keyResults', label: '关键结果', type: 'keyresults', placeholder: '拆解为可衡量的关键结果' },
      { key: 'note', label: '备注', type: 'textarea', placeholder: '为什么这个目标重要？' },
    ],
  },
  social: {
    name: '社交人脉', icon: '🤝', color: '#06B6D4', desc: '维护每一段重要的关系',
    fields: [
      { key: 'name', label: '姓名', type: 'text', required: true, placeholder: '对方姓名' },
      { key: 'relationship', label: '关系', type: 'text', placeholder: '朋友 / 同事 / 导师 / 家人' },
      { key: 'category', label: '分类', type: 'select', dynamicCategories: 'lifeos_social_categories' },
      { key: 'last_contact', label: '最近联系日期', type: 'date' },
      { key: 'notes', label: '备注', type: 'textarea', placeholder: '有什么值得记住的？' },
    ],
  },
  insights: {
    name: '收获感悟', icon: '💡', color: '#F43F5E', desc: '把经历提炼为智慧',
    fields: [
      { key: 'title', label: '感悟标题', type: 'text', required: true, placeholder: '一句话总结你的感悟' },
      { key: 'category', label: '分类', type: 'select', dynamicCategories: 'lifeos_insight_categories' },
      { key: 'source', label: '来源', type: 'select', options: ['学习', '旅行', '工作', '生活', '阅读', '对话', '反思', '其他'] },
      { key: 'date', label: '日期', type: 'date' },
      { key: 'content', label: '详细内容', type: 'textarea', placeholder: '展开描述你的感悟...' },
    ],
  },
  milestones: {
    name: '里程碑', icon: '🚩', color: '#10B981', desc: '追踪人生的重要时刻和目标节点',
    fields: [
      { key: 'title', label: '里程碑标题', type: 'text', required: true, placeholder: '你想达成什么目标？' },
      { key: 'category', label: '分类', type: 'select', options: ['学习', '旅行', '财务', '健康', '职业', '生活'], required: true },
      { key: 'target_date', label: '目标日期', type: 'date', required: true },
      { key: 'description', label: '描述', type: 'textarea', placeholder: '这个里程碑对你意味着什么？' },
      { key: 'related_module', label: '关联模块', type: 'select', options: ['learning', 'travel', 'goals', 'health', 'finance', 'social', 'insights', ''], placeholder: '可选：关联到其他模块的记录' },
      { key: 'priority', label: '优先级', type: 'select', options: ['1', '2', '3'], placeholder: '1=最高优先级' },
    ],
  },
};

export const FINANCE_FIELDS: any[] = [
  { key: 'title', label: '财务目标', type: 'text', required: true, placeholder: '例如：日本旅行基金 / 应急备用金' },
  { key: 'category', label: '目标分类', type: 'select', dynamicCategories: 'lifeos_finance_categories', required: true },
  { key: 'target_amount', label: '目标金额(元)', type: 'number', required: true, placeholder: '50000' },
  { key: 'current_amount', label: '当前已存(元)', type: 'number', required: true, placeholder: '20000' },
  { key: 'completion', label: '完成度', type: 'progress' },
  { key: 'mood', label: '当前心情', type: 'rating' },
  { key: 'deadline', label: '目标截止日期', type: 'date' },
  { key: 'note', label: '备注 / 阶段性想法', type: 'textarea', placeholder: '本月存下 2000 元，进展顺利...' },
  { key: 'date', label: '记录日期', type: 'date' },
];

export const HEALTH_LOG_FIELDS: any[] = [
  { key: 'category', label: '分类', type: 'select', dynamicCategories: 'lifeos_health_categories', required: true },
  { key: 'date', label: '日期', type: 'date', required: true },
  { key: 'exercise', label: '运动', type: 'text', placeholder: '如：跑步5公里 / 瑜伽30分钟' },
  { key: 'sleep', label: '睡眠(小时)', type: 'number', placeholder: '7.5' },
  { key: 'water', label: '饮水(杯)', type: 'number', placeholder: '8' },
  { key: 'weight', label: '体重(kg)', type: 'number', placeholder: '65.0' },
  { key: 'note', label: '备注', type: 'textarea', placeholder: '身体状态如何？' },
];

export const SIDEBAR_ITEMS = [
  { key: 'dashboard', name: '总览仪表盘', icon: '📊', color: '#6366F1' },
  { key: 'learning', name: '学习成长', icon: '📚', color: '#0EA5E9' },
  { key: 'travel', name: '旅行日记', icon: '✈️', color: '#F97316' },
  { key: 'mood', name: '心情心态', icon: '🌙', color: '#EC4899' },
  { key: 'goals', name: '目标管理', icon: '🎯', color: '#10B981' },
  { key: 'health', name: '健康习惯', icon: '💪', color: '#14B8A6' },
  { key: 'finance', name: '财务管理', icon: '💰', color: '#8B5CF6' },
  { key: 'social', name: '社交人脉', icon: '🤝', color: '#06B6D4' },
  { key: 'insights', name: '收获感悟', icon: '💡', color: '#F43F5E' },
  { key: 'achievements', name: '成就墙', icon: '🏆', color: '#F59E0B' },
  { key: 'milestones', name: '里程碑', icon: '🚩', color: '#10B981' },
];
