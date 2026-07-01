import type { ModuleConfig } from '../types';

export const MODULES: Record<string, ModuleConfig> = {
  learning: {
    name: '学习成长', icon: '📚', color: '#0EA5E9', desc: '记录每一份知识的积累',
    fields: [
      { key: 'type', label: '类型', type: 'select', options: ['书籍', '课程', '技能', '文章', '播客'], required: true },
      { key: 'title', label: '标题', type: 'text', required: true, placeholder: '学了什么？' },
      { key: 'source', label: '来源', type: 'text', placeholder: '作者 / 平台 / 讲师' },
      { key: 'date', label: '日期', type: 'date' },
      { key: 'status', label: '状态', type: 'select', options: ['计划中', '进行中', '已完成'] },
      { key: 'rating', label: '评分', type: 'rating' },
      { key: 'notes', label: '笔记 / 收获', type: 'textarea', placeholder: '学到了什么？有什么启发？' },
    ],
  },
  travel: {
    name: '旅行日记', icon: '✈️', color: '#F97316', desc: '记录每一段旅程的感悟',
    fields: [
      { key: 'destination', label: '目的地', type: 'text', required: true, placeholder: '去了哪里？' },
      { key: 'start_date', label: '出发日期', type: 'date' },
      { key: 'end_date', label: '返回日期', type: 'date' },
      { key: 'mood', label: '旅行心情', type: 'rating' },
      { key: 'weather', label: '天气', type: 'text', placeholder: '晴 / 雨 / 多云...' },
      { key: 'highlights', label: '高光时刻', type: 'textarea', placeholder: '最难忘的瞬间是什么？' },
      { key: 'reflections', label: '感悟 / 心态', type: 'textarea', placeholder: '这次旅行给你带来了什么？心情和心态有什么变化？' },
    ],
  },
  achievements: {
    name: '成就墙', icon: '🏆', color: '#F59E0B', desc: '每一个里程碑都值得铭记',
    fields: [
      { key: 'title', label: '成就标题', type: 'text', required: true, placeholder: '完成了什么了不起的事？' },
      { key: 'category', label: '类别', type: 'select', options: ['工作', '学习', '生活', '个人成长', '健康', '社交'], required: true },
      { key: 'date', label: '达成日期', type: 'date' },
      { key: 'description', label: '描述', type: 'textarea', placeholder: '具体做了什么？' },
      { key: 'feeling', label: '当时的感受', type: 'textarea', placeholder: '达成时的心情？' },
    ],
  },
  mood: {
    name: '心情心态', icon: '🌙', color: '#EC4899', desc: '关注内心，记录情绪的起伏',
    fields: [
      { key: 'date', label: '日期', type: 'date', required: true },
      { key: 'score', label: '心情指数', type: 'rating', required: true },
      { key: 'emotions', label: '情绪标签', type: 'tags', placeholder: '开心 / 平静 / 焦虑 / 感恩...' },
      { key: 'journal', label: '心情日记', type: 'textarea', placeholder: '今天发生了什么？心态如何？有什么感悟？' },
    ],
  },
  goals: {
    name: '目标管理', icon: '🎯', color: '#10B981', desc: '把梦想拆解为可追踪的行动',
    fields: [
      { key: 'title', label: '目标标题', type: 'text', required: true, placeholder: '你想实现什么？' },
      { key: 'category', label: '类别', type: 'select', options: ['学习', '职业', '健康', '财务', '生活', '个人成长'], required: true },
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
      { key: 'category', label: '分类', type: 'select', options: ['挚友', '同事', '行业人脉', '家人', '导师', '其他'] },
      { key: 'last_contact', label: '最近联系日期', type: 'date' },
      { key: 'notes', label: '备注', type: 'textarea', placeholder: '有什么值得记住的？' },
    ],
  },
  insights: {
    name: '收获感悟', icon: '💡', color: '#F43F5E', desc: '把经历提炼为智慧',
    fields: [
      { key: 'title', label: '感悟标题', type: 'text', required: true, placeholder: '一句话总结你的感悟' },
      { key: 'source', label: '来源', type: 'select', options: ['学习', '旅行', '工作', '生活', '阅读', '对话', '反思', '其他'] },
      { key: 'date', label: '日期', type: 'date' },
      { key: 'content', label: '详细内容', type: 'textarea', placeholder: '展开描述你的感悟...' },
    ],
  },
};

export const FINANCE_FIELDS: any[] = [
  { key: 'type', label: '类型', type: 'select', options: ['支出', '收入'], required: true },
  { key: 'category', label: '分类', type: 'select', options: ['餐饮', '交通', '购物', '娱乐', '房租', '学习', '投资', '工资', '兼职', '其他'], required: true },
  { key: 'amount', label: '金额(元)', type: 'number', required: true, placeholder: '0.00' },
  { key: 'date', label: '日期', type: 'date' },
  { key: 'note', label: '备注', type: 'text', placeholder: '补充说明' },
];

export const HEALTH_LOG_FIELDS: any[] = [
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
  { key: 'achievements', name: '成就墙', icon: '🏆', color: '#F59E0B' },
  { key: 'mood', name: '心情心态', icon: '🌙', color: '#EC4899' },
  { key: 'goals', name: '目标管理', icon: '🎯', color: '#10B981' },
  { key: 'health', name: '健康习惯', icon: '💪', color: '#14B8A6' },
  { key: 'finance', name: '财务管理', icon: '💰', color: '#8B5CF6' },
  { key: 'social', name: '社交人脉', icon: '🤝', color: '#06B6D4' },
  { key: 'insights', name: '收获感悟', icon: '💡', color: '#F43F5E' },
];
