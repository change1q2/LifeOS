export interface SeedData {
  learning: any[];
  travel: any[];
  achievements: any[];
  mood: any[];
  goals: any[];
  health_habits: any[];
  habit_records: { habit_id: number; date: string }[];
  health_logs: any[];
  finance: any[];
  social: any[];
  insights: any[];
  milestones: any[];
  [key: string]: any[] | { habit_id: number; date: string }[];
}

function dateOffset(days: number): string {
  const t = new Date();
  t.setDate(t.getDate() - days);
  return t.toISOString().split('T')[0];
}

export function getSeedData(): SeedData {
  const d = dateOffset;
  return {
    learning: [
      { id: 1, category: '职业能力提升', title: '《原则》', source: '瑞·达利欧', start_date: d(20), end_date: d(10), duration_hours: 15, progress: 100, self_rating: 5, notes: '关于决策和人生原则的深刻思考，核心观点是"极度透明+极度真实"才能做出好决策。', created_at: d(20) },
      { id: 2, category: '职业能力提升', title: '产品经理进阶训练营', source: '极客时间', start_date: d(10), end_date: '', duration_hours: 8.5, progress: 60, self_rating: 4, notes: '系统学习产品方法论，从需求分析到产品落地全流程。', created_at: d(10) },
      { id: 3, category: '投资理财学习', title: 'SQL数据分析', source: '自学', start_date: d(5), end_date: '', duration_hours: 0, progress: 35, self_rating: 0, notes: '为数据驱动决策打基础，正在练习复杂查询。', created_at: d(5) },
    ],
    travel: [
      { id: 1, category: '亚洲旅行', destination: '京都', country: '日本', province: '京都', city: '京都', district: '东山区', start_date: d(45), end_date: d(41), mood: 5, weather: '晴', highlights: '樱花季的哲学之道，漫步在花瓣飘落的小路上，时间仿佛静止了。清水寺的夜景也很震撼。', highlights_blocks: [], reflections: '旅行最大的收获是学会了放慢脚步。在京都的古寺里坐了一下午，什么也没做，但内心前所未有的平静。原来生活不需要时刻奔跑。', created_at: d(45) },
      { id: 2, category: '国内旅行', destination: '大理', country: '中国', province: '云南', city: '大理', district: '大理市', start_date: d(80), end_date: d(75), mood: 4, weather: '多云', highlights: '洱海骑行，苍山徒步，在古城里喝茶发呆。', highlights_blocks: [], reflections: '大理让我重新思考了"生活节奏"这件事。不是所有地方都需要像大城市一样快。', created_at: d(80) },
    ],
    achievements: [
      { id: 1, title: '独立负责产品从0到1上线', module: '手动成就', category: '职业', subcategory: '产品管理', source_id: null, source_module: '', source_title: '', parent_id: null, locked: false, date: d(30), description: '从需求调研到产品上线全流程负责，上线后首周用户量突破预期。', feeling: '成就感爆棚！更加坚定了做产品的信心。原来把一件事从头做到尾的感觉这么好。', created_at: d(30) },
      { id: 2, title: '坚持跑步100天', module: '手动成就', category: '健康', subcategory: '运动', source_id: null, source_module: '', source_title: '', parent_id: null, locked: false, date: d(15), description: '连续100天每天跑步3公里以上，体重减了5公斤。', feeling: '自律带来的自由感，比任何事情都让人踏实。', created_at: d(15) },
      { id: 3, title: '读完12本书', module: '手动成就', category: '学习', subcategory: '阅读习惯', source_id: null, source_module: '', source_title: '', parent_id: null, locked: false, date: d(60), description: '半年读完12本书，涵盖产品、心理学、传记等领域。', feeling: '知识的复利效应开始显现，看问题的角度更多元了。', created_at: d(60) },
      { id: 4, title: '学习成长基础', module: '学习成长', category: '', subcategory: '', source_id: null, source_module: '', source_title: '', parent_id: null, locked: true, date: d(90), description: '学习成长模块的根节点成就', feeling: '持续学习是人生最好的投资。', created_at: d(90) },
      { id: 5, title: '旅行日记起点', module: '旅行日记', category: '', subcategory: '', source_id: null, source_module: '', source_title: '', parent_id: null, locked: true, date: d(85), description: '旅行日记模块的根节点成就', feeling: '世界那么大，去看看。', created_at: d(85) },
    ],
    mood: [
      { id: 1, date: d(0), score: 4, emotions: ['平静', '感恩', '充实'], journal: '今天完成了季度汇报，反馈不错。晚上散步时突然觉得，生活中值得感激的事情其实很多。', created_at: d(0) },
      { id: 2, date: d(1), score: 3, emotions: ['一般', '略疲惫'], journal: '加班到很晚，有些累。但想到正在做的产品有意义，也就不那么难熬了。', created_at: d(1) },
      { id: 3, date: d(2), score: 5, emotions: ['开心', '满足'], journal: '和好朋友吃了一顿火锅，聊了很多。能有人倾诉和分享，是很大的幸福。', created_at: d(2) },
      { id: 4, date: d(3), score: 2, emotions: ['焦虑', '迷茫'], journal: '对未来有些不确定感。但理性想想，这种焦虑本身也是一种动力。', created_at: d(3) },
      { id: 5, date: d(4), score: 4, emotions: ['有干劲', '乐观'], journal: '制定了一个新的学习计划，感觉找到了方向。行动是治愈焦虑的良药。', created_at: d(4) },
      { id: 6, date: d(5), score: 3, emotions: ['平静'], journal: '普通的一天，按部就班。有时候平淡也是一种幸福。', created_at: d(5) },
      { id: 7, date: d(6), score: 5, emotions: ['兴奋', '自豪'], journal: '跑步突破了个人最好成绩！身体和心态都在变好。', created_at: d(6) },
    ],
    goals: [
      { id: 1, title: '2026年读完24本书', category: '学习', deadline: '2026-12-31', key_results: [{ title: '每月读2本书', done: true }, { title: '建立读书笔记体系', done: true }, { title: '输出12篇读书笔记', done: false }], note: '阅读是投入产出比最高的自我投资。', created_at: d(60) },
      { id: 2, title: '存款达到年度目标', category: '财务', deadline: '2026-12-31', key_results: [{ title: '月度储蓄率≥30%', done: true }, { title: '建立应急基金', done: false }, { title: '开始基金定投', done: true }], note: '财务自由是人生自由的基础。', created_at: d(60) },
      { id: 3, title: '提升产品专业能力', category: '职业', deadline: '2026-09-30', key_results: [{ title: '完成产品训练营', done: false }, { title: '独立负责一个产品模块', done: true }, { title: '输出5篇产品方法论文章', done: false }], note: '持续精进，做有价值的产品。', created_at: d(60) },
    ],
    health_habits: [
      { id: 1, habit_name: '每日阅读30分钟', frequency: '每日', created_at: d(14) },
      { id: 2, habit_name: '运动30分钟', frequency: '每日', created_at: d(14) },
      { id: 3, habit_name: '早起7点前', frequency: '每日', created_at: d(14) },
    ],
    habit_records: (() => {
      const records: { habit_id: number; date: string }[] = [];
      for (let i = 0; i < 7; i++) {
        for (let h = 1; h <= 3; h++) {
          if (Math.random() > 0.3 || i < 3) records.push({ habit_id: h, date: d(i) });
        }
      }
      return records;
    })(),
    health_logs: [
      { id: 1, category: '运动', date: d(0), exercise: '跑步5公里', sleep: 7.5, water: 8, weight: 65.5, note: '状态不错，跑步时心率稳定。', created_at: d(0) },
      { id: 2, category: '睡眠', date: d(1), exercise: '瑜伽30分钟', sleep: 6.5, water: 6, weight: 65.8, note: '睡眠不太够，明天早点睡。', created_at: d(1) },
      { id: 3, category: '运动', date: d(2), exercise: '游泳40分钟', sleep: 8, water: 8, weight: 65.3, note: '睡眠充足，感觉精力充沛。', created_at: d(2) },
    ],
    finance: [
      { id: 1, title: '日本旅行基金', category: '旅行基金', target_amount: 30000, current_amount: 18000, mood: 4, completion: 60, deadline: '2026-10-01', note: '计划国庆去京都，预计机票+酒店+餐饮共需 3 万，已存 60%。', date: d(30), created_at: d(30) },
      { id: 2, title: '应急备用金', category: '应急基金', target_amount: 50000, current_amount: 32000, mood: 3, completion: 64, deadline: '2026-12-31', note: '目标储备 6 个月生活费，应对突发情况。每月固定存入 5000。', date: d(60), created_at: d(60) },
      { id: 3, title: '产品经理进阶课程', category: '学习投资', target_amount: 2000, current_amount: 2000, mood: 5, completion: 100, deadline: '2026-08-15', note: '极客时间年度会员，已经完成。物超所值，强烈推荐。', date: d(45), created_at: d(45) },
      { id: 4, title: '房屋首付储备', category: '房屋首付', target_amount: 500000, current_amount: 120000, mood: 4, completion: 24, deadline: '2028-12-31', note: '长期目标，每月定投+定期存款，稳步推进中。', date: d(90), created_at: d(90) },
      { id: 5, title: '摄影器材升级', category: '梦想基金', target_amount: 15000, current_amount: 4500, mood: 3, completion: 30, deadline: '2026-09-30', note: '一直想要的 Sony A7M4，攒到 30% 了，继续努力。', date: d(20), created_at: d(20) },
    ],
    social: [
      { id: 1, name: '老王', relationship: '大学室友', category: '挚友', last_contact: d(3), notes: '最近在创业，做教育方向。可以多交流产品经验。', created_at: d(30) },
      { id: 2, name: '李老师', relationship: '前领导', category: '导师', last_contact: d(15), notes: '产品启蒙导师，每隔一段时间聊聊收获很大。', created_at: d(60) },
      { id: 3, name: '小张', relationship: '同事', category: '同事', last_contact: d(1), notes: '技术大牛，合作做项目很靠谱。', created_at: d(20) },
    ],
    insights: [
      { id: 1, title: '焦虑的本质是对不确定性的恐惧', category: '反思', source: '反思', date: d(3), content: '发现每次焦虑都是因为想要控制无法控制的事情。真正的解法不是消除不确定性，而是提升自己应对不确定性的能力。行动本身就是最好的焦虑解药。', created_at: d(3) },
      { id: 2, title: '旅行的意义在于"停下来"', category: '旅行', source: '旅行', date: d(40), content: '在京都的时候，最大的收获不是看到了什么，而是终于"停下来"了。日常生活中我们总是在赶路，旅行给了我们一个名正言顺的理由，去享受"无所事事"的奢侈。', created_at: d(40) },
      { id: 3, title: '输出是最好的输入', category: '学习', source: '学习', date: d(12), content: '读完书后写笔记，比单纯读效果好10倍。因为输出逼迫你思考、组织、表达，这个过程本身就是深度学习。', created_at: d(12) },
    ],
    milestones: [
      { id: 1, title: '产品经理训练营毕业', category: '学习', target_date: '2026-09-30', completed: false, description: '完成极客时间产品经理进阶训练营全部课程', progress: 60, related_module: 'learning', related_id: 2, priority: 2, created_at: d(60) },
      { id: 2, title: '日本旅行出发', category: '旅行', target_date: '2026-10-01', completed: false, description: '国庆假期前往日本京都旅行', progress: 80, related_module: 'finance', related_id: 1, priority: 1, created_at: d(90) },
      { id: 3, title: '应急备用金达标', category: '财务', target_date: '2026-12-31', completed: false, description: '完成5万元应急备用金储备', progress: 64, related_module: 'finance', related_id: 2, priority: 1, created_at: d(60) },
      { id: 4, title: '年度阅读目标', category: '学习', target_date: '2026-12-31', completed: false, description: '全年读完24本书', progress: 50, related_module: 'goals', related_id: 1, priority: 2, created_at: d(60) },
      { id: 5, title: '坚持跑步365天', category: '健康', target_date: '2026-06-15', completed: true, completion_date: d(15), description: '连续跑步365天，每天3公里以上', progress: 100, related_module: 'health', priority: 3, created_at: d(380) },
      { id: 6, title: '存款突破10万', category: '财务', target_date: '2026-12-31', completed: false, description: '个人存款达到10万元', progress: 75, related_module: 'finance', priority: 1, created_at: d(90) },
    ],
  };
}