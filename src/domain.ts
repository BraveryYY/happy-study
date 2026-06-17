export type Role = 'teacher' | 'parent' | 'student';

export type SubjectRecord = {
  name: string;
  score: number;
  target: number;
  trend: 'up' | 'steady' | 'down';
  focus: string;
};

export type ProfileNote = {
  id: string;
  role: Role;
  author: string;
  text: string;
  date: string;
};

export type CustomField = {
  label: string;
  value: string;
  owner: Role;
};

export type StudentProfile = {
  id: string;
  name: string;
  grade: string;
  school: string;
  avatar: string;
  className: string;
  classCode: string;
  mentor: string;
  guardian: string;
  summary: string;
  learningStyle: string;
  motivation: string;
  risk: string;
  goals: string[];
  habits: string[];
  subjects: SubjectRecord[];
  customFields: CustomField[];
  notes: ProfileNote[];
};

export type ResourceItem = {
  id: string;
  subject: string;
  title: string;
  type: 'concept' | 'worksheet' | 'video' | 'exam';
  level: 'foundation' | 'core' | 'stretch';
  maintainedBy: string;
  tags: string[];
};

export type AIConfig = {
  provider: string;
  model: string;
  endpoint: string;
  usePersonalVault: boolean;
  usePublicLibrary: boolean;
  privacyMode: 'local-first' | 'cloud';
};

export type DiagnosticGap = {
  subject: string;
  title: string;
  evidence: string;
  priority: 'high' | 'medium' | 'low';
};

export type PlanItem = {
  title: string;
  detail: string;
  cadence: string;
};

export type PracticeQuestion = {
  id: string;
  subject: string;
  stem: string;
  options: string[];
  answer: string;
  explanation: string;
  skill: string;
};

export type DiagnosticReport = {
  headline: string;
  confidence: number;
  gaps: DiagnosticGap[];
  studentPlan: PlanItem[];
  parentPlan: PlanItem[];
  teacherPlan: PlanItem[];
  practice: PracticeQuestion[];
  dataSources: string[];
};

export type ClassRoom = {
  id: string;
  name: string;
  code: string;
  teacher: string;
  members: number;
  mood: string;
  challenge: string;
  leaderboard: Array<{ name: string; streak: number; points: number }>;
  wall: Array<{ author: string; text: string; tag: string }>;
};

export type TeacherAsset = {
  id: string;
  title: string;
  type: 'course' | 'material' | 'exam' | 'service';
  status: 'ready' | 'draft' | 'review';
  owner: string;
  usage: number;
  nextAction: string;
};

export type TeachingRoom = {
  id: string;
  name: string;
  type: 'online' | 'offline';
  capacity: number;
  occupancy: number;
  schedule: string;
  equipment: string[];
  status: 'available' | 'booked' | 'maintenance';
};

export type Institution = {
  id: string;
  name: string;
  type: 'training-center' | 'independent-teacher' | 'online-school';
  address: string;
};

export type CourseAutomationKey =
  | 'parentReminder'
  | 'studentReminder'
  | 'preStudy'
  | 'homework'
  | 'reviewMaterial'
  | 'studentFeedback';

export type CourseAutomationItem = {
  key: CourseAutomationKey;
  title: string;
  owner: 'teacher' | 'system';
  timing: 'pre-class' | 'post-class';
  done: number;
  total: number;
};

export type CourseFeedbackStatus = {
  studentId: string;
  status: 'done' | 'pending' | 'draft';
  note: string;
};

export type Course = {
  id: string;
  name: string;
  subject: string;
  institutionId: string;
  teacher: string;
  time: string;
  date: string;
  location: string;
  mode: 'online' | 'offline';
  enrolled: number;
  capacity: number;
  nextLesson: string;
  focus: string;
  prep: string;
  homework: string;
  review: string;
  studentIds: string[];
  automations: CourseAutomationItem[];
  feedback: CourseFeedbackStatus[];
};

export type CourseEnrollment = {
  studentId: string;
  courseId: string;
  institutionId: string;
  progress: number;
  nextTask: string;
  status: 'active' | 'trial' | 'paused';
};

export const roleLabels: Record<Role, string> = {
  teacher: '老师',
  parent: '家长',
  student: '学生',
};

export const seedStudents: StudentProfile[] = [
  {
    id: 's-lin',
    name: '林亦辰',
    grade: '七年级',
    school: '星河中学',
    avatar: '林',
    className: '七年级 A 班',
    classCode: 'A7X204',
    mentor: '周老师',
    guardian: '林妈妈',
    summary: '逻辑推理强，课堂表达偏谨慎，遇到综合应用题容易跳步。',
    learningStyle: '先看例题再迁移，适合短周期反馈。',
    motivation: '喜欢积分、同伴榜样和阶段性可视化成果。',
    risk: '周末作业集中完成，错题复盘容易被挤压。',
    goals: ['数学月考稳定 90+', '英语阅读正确率提升到 85%', '每天 15 分钟错题回看'],
    habits: ['晚间 20:30-21:15 学习效率高', '课堂笔记完整', '主动提问频率低'],
    subjects: [
      { name: '数学', score: 78, target: 92, trend: 'up', focus: '分式方程与几何辅助线' },
      { name: '英语', score: 82, target: 88, trend: 'steady', focus: '阅读推断与长难句' },
      { name: '语文', score: 86, target: 90, trend: 'steady', focus: '现代文主旨概括' },
      { name: '科学', score: 74, target: 86, trend: 'down', focus: '实验变量控制' },
    ],
    customFields: [
      { label: '睡眠观察', value: '工作日 22:40 前入睡时，第二天课堂状态明显更稳。', owner: 'parent' },
      { label: '课堂触发点', value: '被点名前先给 20 秒思考时间，表达质量更好。', owner: 'teacher' },
      { label: '自我偏好', value: '喜欢先做 3 道基础题找手感，再挑战压轴题。', owner: 'student' },
    ],
    notes: [
      { id: 'n1', role: 'teacher', author: '周老师', text: '最近应用题审题更细，但仍需要把“已知/求证”写完整。', date: '06/15' },
      { id: 'n2', role: 'parent', author: '林妈妈', text: '周三晚饭后精神最好，建议把数学强化放在这段时间。', date: '06/14' },
      { id: 'n3', role: 'student', author: '林亦辰', text: '我想先把科学实验题补起来，因为每次都不确定该控制什么变量。', date: '06/13' },
    ],
  },
  {
    id: 's-chen',
    name: '陈予安',
    grade: '五年级',
    school: '梧桐小学',
    avatar: '陈',
    className: '五年级 B 班',
    classCode: 'B5Q881',
    mentor: '李老师',
    guardian: '陈爸爸',
    summary: '基础扎实，注意力受课堂节奏影响较大，口算速度提升明显。',
    learningStyle: '适合游戏化闯关和即时鼓励。',
    motivation: '对小组合作和作品展示很投入。',
    risk: '阅读题容易只看局部句子，忽略上下文。',
    goals: ['语文阅读少丢步骤分', '数学计算保持 95% 准确率', '每周完成一次口头复述'],
    habits: ['喜欢画思维导图', '作业开始快', '检查习惯还不稳定'],
    subjects: [
      { name: '数学', score: 91, target: 95, trend: 'up', focus: '小数混合运算' },
      { name: '英语', score: 79, target: 86, trend: 'steady', focus: '单词拼写与听力细节' },
      { name: '语文', score: 76, target: 88, trend: 'up', focus: '阅读理解信息定位' },
      { name: '科学', score: 88, target: 92, trend: 'steady', focus: '现象解释表达' },
    ],
    customFields: [
      { label: '情绪补给', value: '连续学习 25 分钟后需要 3 分钟走动。', owner: 'parent' },
      { label: '课堂合作', value: '担任记录员时参与度最高。', owner: 'teacher' },
      { label: '喜欢主题', value: '天文、植物和侦探故事。', owner: 'student' },
    ],
    notes: [
      { id: 'n4', role: 'teacher', author: '李老师', text: '阅读题可以先圈关键词，再回原文找证据。', date: '06/15' },
      { id: 'n5', role: 'parent', author: '陈爸爸', text: '最近愿意自己整理错题，但需要提醒写原因。', date: '06/12' },
      { id: 'n6', role: 'student', author: '陈予安', text: '我想用闯关的方式背英语单词。', date: '06/11' },
    ],
  },
];

export const seedResources: ResourceItem[] = [
  {
    id: 'r1',
    subject: '数学',
    title: '分式方程易错模型库',
    type: 'worksheet',
    level: 'core',
    maintainedBy: '周老师',
    tags: ['审题', '去分母', '验根'],
  },
  {
    id: 'r2',
    subject: '数学',
    title: '几何辅助线 12 个常见触发条件',
    type: 'concept',
    level: 'stretch',
    maintainedBy: '周老师',
    tags: ['辅助线', '全等', '相似'],
  },
  {
    id: 'r3',
    subject: '英语',
    title: '阅读推断题证据链模板',
    type: 'concept',
    level: 'core',
    maintainedBy: '王老师',
    tags: ['推断', '长难句', '定位'],
  },
  {
    id: 'r4',
    subject: '语文',
    title: '现代文主旨概括评分样例',
    type: 'exam',
    level: 'core',
    maintainedBy: '刘老师',
    tags: ['主旨', '结构', '关键词'],
  },
  {
    id: 'r5',
    subject: '科学',
    title: '实验变量控制诊断题组',
    type: 'worksheet',
    level: 'foundation',
    maintainedBy: '赵老师',
    tags: ['变量', '对照', '实验表达'],
  },
];

export const seedClasses: ClassRoom[] = [
  {
    id: 'c1',
    name: '七年级 A 班',
    code: 'A7X204',
    teacher: '周老师',
    members: 28,
    mood: '本周目标：把不会变成会讲',
    challenge: '错题讲解接力：每人贡献 1 个“我终于懂了”的讲解',
    leaderboard: [
      { name: '林亦辰', streak: 6, points: 286 },
      { name: '沈嘉禾', streak: 5, points: 241 },
      { name: '赵澄', streak: 4, points: 226 },
    ],
    wall: [
      { author: '周老师', text: '今天的“验根提醒”卡片已经发布，完成后可领取小组徽章。', tag: '公告' },
      { author: '林亦辰', text: '我把第 4 题的去分母步骤录成了 40 秒讲解。', tag: '同伴讲解' },
      { author: '林妈妈', text: '孩子愿意主动讲错题了，今晚在家再复述一次。', tag: '家校共育' },
    ],
  },
];

export const seedTeacherAssets: TeacherAsset[] = [
  {
    id: 'ta1',
    title: '七年级数学系统课',
    type: 'course',
    status: 'ready',
    owner: '周老师',
    usage: 18,
    nextAction: '下周补充分式方程第 3 讲讲义',
  },
  {
    id: 'ta2',
    title: '期中诊断卷 A/B 版',
    type: 'exam',
    status: 'review',
    owner: '周老师',
    usage: 11,
    nextAction: '核对科学实验题答案解析',
  },
  {
    id: 'ta3',
    title: '阅读推断题证据链卡片',
    type: 'material',
    status: 'ready',
    owner: '王老师',
    usage: 24,
    nextAction: '沉淀 3 个课堂追问模板',
  },
  {
    id: 'ta4',
    title: '一对一课后反馈服务包',
    type: 'service',
    status: 'draft',
    owner: '周老师',
    usage: 6,
    nextAction: '完善家长周报样例',
  },
];

export const seedTeachingRooms: TeachingRoom[] = [
  {
    id: 'room1',
    name: '线上小班教室 A',
    type: 'online',
    capacity: 12,
    occupancy: 9,
    schedule: '今晚 19:30 数学强化班',
    equipment: ['录播', '白板', '随堂测'],
    status: 'booked',
  },
  {
    id: 'room2',
    name: '线下教室 2',
    type: 'offline',
    capacity: 8,
    occupancy: 5,
    schedule: '明天 10:00 五年级阅读课',
    equipment: ['投屏', '讲义打印', '错题盒'],
    status: 'available',
  },
  {
    id: 'room3',
    name: '试听咨询室',
    type: 'online',
    capacity: 4,
    occupancy: 2,
    schedule: '周六 15:00 2 组试听',
    equipment: ['试听卷', '家长沟通表'],
    status: 'available',
  },
];

export const seedInstitutions: Institution[] = [
  {
    id: 'i-star',
    name: '星火培优',
    type: 'training-center',
    address: '星河路 88 号 302',
  },
  {
    id: 'i-wutong',
    name: '梧桐学习中心',
    type: 'training-center',
    address: '梧桐街 16 号',
  },
  {
    id: 'i-zhou',
    name: '周老师工作室',
    type: 'independent-teacher',
    address: '线上小班教室 A',
  },
  {
    id: 'i-online',
    name: '云上素养课',
    type: 'online-school',
    address: '线上直播',
  },
];

export const seedCourses: Course[] = [
  {
    id: 'course-math-7',
    name: '七年级数学系统提升',
    subject: '数学',
    institutionId: 'i-zhou',
    teacher: '周老师',
    time: '周三 19:30-21:00',
    date: '06/17',
    location: '线上小班教室 A',
    mode: 'online',
    enrolled: 9,
    capacity: 12,
    nextLesson: '分式方程验根与应用题审题',
    focus: '分式方程与几何辅助线',
    prep: '课前 8 分钟微课 + 3 道验根题',
    homework: '分式方程分层题组 A/B',
    review: '错因复盘卡：去分母、验根、设未知数',
    studentIds: ['s-lin'],
    automations: [
      { key: 'parentReminder', title: '家长上课提醒', owner: 'system', timing: 'pre-class', done: 8, total: 9 },
      { key: 'studentReminder', title: '学生上课提醒', owner: 'system', timing: 'pre-class', done: 9, total: 9 },
      { key: 'preStudy', title: '课前预习资料', owner: 'teacher', timing: 'pre-class', done: 7, total: 9 },
      { key: 'homework', title: '课后作业', owner: 'teacher', timing: 'post-class', done: 6, total: 9 },
      { key: 'reviewMaterial', title: '复习资料', owner: 'teacher', timing: 'post-class', done: 5, total: 9 },
      { key: 'studentFeedback', title: '学生课后反馈', owner: 'teacher', timing: 'post-class', done: 6, total: 9 },
    ],
    feedback: [
      { studentId: 's-lin', status: 'pending', note: '需要补充验根步骤和下次课前提醒。' },
      { studentId: 's-chen', status: 'done', note: '不在本课程正式名单，仅试听反馈已完成。' },
    ],
  },
  {
    id: 'course-reading-5',
    name: '五年级阅读理解精讲',
    subject: '语文',
    institutionId: 'i-wutong',
    teacher: '李老师',
    time: '周六 10:00-11:30',
    date: '06/20',
    location: '梧桐学习中心 2 号教室',
    mode: 'offline',
    enrolled: 5,
    capacity: 8,
    nextLesson: '信息定位与主旨概括',
    focus: '阅读理解信息定位',
    prep: '阅读短文圈画关键词',
    homework: '主旨概括 4 篇短文',
    review: '证据句定位清单',
    studentIds: ['s-chen'],
    automations: [
      { key: 'parentReminder', title: '家长上课提醒', owner: 'system', timing: 'pre-class', done: 5, total: 5 },
      { key: 'studentReminder', title: '学生上课提醒', owner: 'system', timing: 'pre-class', done: 4, total: 5 },
      { key: 'preStudy', title: '课前预习资料', owner: 'teacher', timing: 'pre-class', done: 3, total: 5 },
      { key: 'homework', title: '课后作业', owner: 'teacher', timing: 'post-class', done: 2, total: 5 },
      { key: 'reviewMaterial', title: '复习资料', owner: 'teacher', timing: 'post-class', done: 2, total: 5 },
      { key: 'studentFeedback', title: '学生课后反馈', owner: 'teacher', timing: 'post-class', done: 2, total: 5 },
    ],
    feedback: [
      { studentId: 's-chen', status: 'draft', note: '课堂参与高，阅读证据链还需家里复述一次。' },
    ],
  },
  {
    id: 'course-english-online',
    name: '英语阅读推断专项',
    subject: '英语',
    institutionId: 'i-online',
    teacher: '王老师',
    time: '周日 19:00-20:00',
    date: '06/21',
    location: '线上直播',
    mode: 'online',
    enrolled: 16,
    capacity: 20,
    nextLesson: '长难句与推断题证据链',
    focus: '阅读推断与长难句',
    prep: '10 个高频连接词预习',
    homework: '阅读推断题 6 题',
    review: '长难句拆分模板',
    studentIds: ['s-lin', 's-chen'],
    automations: [
      { key: 'parentReminder', title: '家长上课提醒', owner: 'system', timing: 'pre-class', done: 15, total: 16 },
      { key: 'studentReminder', title: '学生上课提醒', owner: 'system', timing: 'pre-class', done: 14, total: 16 },
      { key: 'preStudy', title: '课前预习资料', owner: 'teacher', timing: 'pre-class', done: 10, total: 16 },
      { key: 'homework', title: '课后作业', owner: 'teacher', timing: 'post-class', done: 9, total: 16 },
      { key: 'reviewMaterial', title: '复习资料', owner: 'teacher', timing: 'post-class', done: 9, total: 16 },
      { key: 'studentFeedback', title: '学生课后反馈', owner: 'teacher', timing: 'post-class', done: 8, total: 16 },
    ],
    feedback: [
      { studentId: 's-lin', status: 'done', note: '推断题证据句定位更稳定。' },
      { studentId: 's-chen', status: 'pending', note: '等待听力细节作业后补充反馈。' },
    ],
  },
];

export const seedEnrollments: CourseEnrollment[] = [
  {
    studentId: 's-lin',
    courseId: 'course-math-7',
    institutionId: 'i-zhou',
    progress: 72,
    nextTask: '完成分式方程验根题 3 道',
    status: 'active',
  },
  {
    studentId: 's-lin',
    courseId: 'course-english-online',
    institutionId: 'i-online',
    progress: 64,
    nextTask: '预习高频连接词 10 个',
    status: 'active',
  },
  {
    studentId: 's-chen',
    courseId: 'course-reading-5',
    institutionId: 'i-wutong',
    progress: 58,
    nextTask: '完成主旨概括 2 篇',
    status: 'active',
  },
  {
    studentId: 's-chen',
    courseId: 'course-english-online',
    institutionId: 'i-online',
    progress: 46,
    nextTask: '补交阅读推断题第 4 题订正',
    status: 'trial',
  },
];

const priorityFromGap = (gap: number): DiagnosticGap['priority'] => {
  if (gap >= 12) return 'high';
  if (gap >= 7) return 'medium';
  return 'low';
};

const resourceLabel = (resource: ResourceItem) => {
  const levelText = {
    foundation: '基础',
    core: '核心',
    stretch: '拔高',
  }[resource.level];
  return `${resource.title}（${levelText}）`;
};

export function buildDiagnostic(
  student: StudentProfile,
  resources: ResourceItem[],
  config: AIConfig,
): DiagnosticReport {
  const sortedSubjects = [...student.subjects].sort((a, b) => b.target - b.score - (a.target - a.score));
  const topSubjects = sortedSubjects.slice(0, 3);
  const gaps = topSubjects.map((subject) => {
    const matched = resources.find((item) => item.subject === subject.name);
    return {
      subject: subject.name,
      title: subject.focus,
      evidence: `${student.name} 当前 ${subject.score} 分，目标 ${subject.target} 分；结合资料库中“${matched ? resourceLabel(matched) : '待补充资源'}”推断为近期优先补强点。`,
      priority: priorityFromGap(subject.target - subject.score),
    };
  });

  const mainGap = gaps[0];
  const confidence = Math.min(
    96,
    76 + student.notes.length * 3 + student.customFields.length * 2 + (config.usePublicLibrary ? 7 : 0),
  );

  return {
    headline: `${student.name} 的主线是先稳住 ${mainGap.subject} 的「${mainGap.title}」，再用短题组建立可迁移方法。`,
    confidence,
    gaps,
    studentPlan: [
      {
        title: '15 分钟靶向训练',
        detail: `每天完成 3 道 ${mainGap.subject} 关键题，先写思路标签，再写完整步骤。`,
        cadence: '每日',
      },
      {
        title: '错题复述',
        detail: '把错因说成一句话：我漏看了什么、下一次先检查什么。',
        cadence: '每周 3 次',
      },
      {
        title: '同伴讲解',
        detail: '选择一道已订正题发布到班级讲解墙，获得同学追问后再补充。',
        cadence: '每周 1 次',
      },
    ],
    parentPlan: [
      {
        title: '家庭观察补充',
        detail: `在 ${student.learningStyle} 的基础上，只记录学习开始时间、卡住点和恢复方式。`,
        cadence: '每晚 2 分钟',
      },
      {
        title: '轻量陪跑',
        detail: '只问三个问题：今天最会的是哪题、最卡的是哪步、明天先做什么。',
        cadence: '每日',
      },
      {
        title: '节奏保护',
        detail: `优先保护 ${student.habits[0]}，避免把强化训练放到低效时段。`,
        cadence: '本周',
      },
    ],
    teacherPlan: [
      {
        title: '分层任务',
        detail: `为 ${student.name} 推送 2 道基础巩固 + 1 道迁移题，课堂检查思路标签。`,
        cadence: '下节课',
      },
      {
        title: '公共资料库补齐',
        detail: `将 ${mainGap.title} 的易错模型沉淀到班级公共资料库，供同类学生复用。`,
        cadence: '本周',
      },
      {
        title: '家校同步',
        detail: '把诊断证据和下一步计划分别同步给学生与家长，避免只反馈分数。',
        cadence: '诊断后',
      },
    ],
    practice: [
      {
        id: 'q1',
        subject: mainGap.subject,
        stem:
          mainGap.subject === '数学'
            ? '解分式方程时，去分母后得到 x = 2。下一步最应该做什么？'
            : mainGap.subject === '英语'
              ? '阅读推断题中，最可靠的答题依据是什么？'
              : mainGap.subject === '科学'
                ? '做对照实验时，除研究因素外，其他条件应该怎样处理？'
                : '概括现代文主旨时，最应该先抓住什么信息？',
        options:
          mainGap.subject === '数学'
            ? ['直接写答案', '代回原分式方程验根', '把分母全部约掉', '重新设未知数']
            : mainGap.subject === '英语'
              ? ['自己的常识', '文章中的证据链', '最长的选项', '题目里的生词']
              : mainGap.subject === '科学'
                ? ['全部不同', '只保留一个变量不同', '越多变化越好', '不需要记录']
                : ['作者国籍', '文章结构和关键词', '段落字数', '生僻字数量'],
        answer:
          mainGap.subject === '数学'
            ? '代回原分式方程验根'
            : mainGap.subject === '英语'
              ? '文章中的证据链'
              : mainGap.subject === '科学'
                ? '只保留一个变量不同'
                : '文章结构和关键词',
        explanation: `这道题针对「${mainGap.title}」。系统会把答题结果回写到个人资料库，作为下一轮诊断证据。`,
        skill: mainGap.title,
      },
      {
        id: 'q2',
        subject: topSubjects[1]?.name ?? mainGap.subject,
        stem: `请把「${topSubjects[1]?.focus ?? mainGap.title}」的解题步骤压缩成 3 个关键词。`,
        options: ['定位-证据-复核', '猜测-跳过-背答案', '抄题-等待-订正', '看分-比较-结束'],
        answer: '定位-证据-复核',
        explanation: '关键词化能帮助学生在相似题型中迁移方法，而不只是记住某一道题。',
        skill: topSubjects[1]?.focus ?? mainGap.title,
      },
    ],
    dataSources: [
      config.usePersonalVault ? '学生个人资料库' : '手动输入资料',
      config.usePublicLibrary ? '老师公共资料库' : '未启用公共资料库',
      `${config.provider} / ${config.model}`,
    ],
  };
}

export const defaultAIConfig: AIConfig = {
  provider: 'OpenAI Compatible',
  model: 'gpt-4.1-mini',
  endpoint: 'https://api.example.com/v1',
  usePersonalVault: true,
  usePublicLibrary: true,
  privacyMode: 'local-first',
};
