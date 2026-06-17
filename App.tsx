import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  AIConfig,
  ClassRoom,
  ResourceItem,
  Role,
  StudentProfile,
  buildDiagnostic,
  defaultAIConfig,
  roleLabels,
  seedClasses,
  seedResources,
  seedStudents,
} from './src/domain';
import {
  Card,
  EmptyState,
  Field,
  Icon,
  IconButton,
  Metric,
  Pill,
  ProgressBar,
  SectionTitle,
  Segmented,
  colors,
  styles as uiStyles,
  typeColor,
} from './src/ui';

type TabKey = 'dashboard' | 'profile' | 'diagnosis' | 'plans' | 'practice' | 'classroom';

const roleOptions = [
  { value: 'teacher' as Role, label: '老师', icon: 'school' as const, color: typeColor.teacher },
  { value: 'parent' as Role, label: '家长', icon: 'home' as const, color: typeColor.parent },
  { value: 'student' as Role, label: '学生', icon: 'person' as const, color: typeColor.student },
];

const tabsByRole: Record<Role, Array<{ key: TabKey; label: string; icon: React.ComponentProps<typeof Icon>['name'] }>> = {
  teacher: [
    { key: 'dashboard', label: '总览', icon: 'grid' },
    { key: 'profile', label: '资料库', icon: 'folder-open' },
    { key: 'diagnosis', label: '诊断', icon: 'sparkles' },
    { key: 'classroom', label: '班级', icon: 'people' },
  ],
  parent: [
    { key: 'dashboard', label: '首页', icon: 'home' },
    { key: 'profile', label: '资料', icon: 'id-card' },
    { key: 'plans', label: '计划', icon: 'calendar' },
    { key: 'classroom', label: '班级圈', icon: 'chatbubbles' },
  ],
  student: [
    { key: 'dashboard', label: '学习台', icon: 'rocket' },
    { key: 'practice', label: '强化练', icon: 'barbell' },
    { key: 'profile', label: '我的资料', icon: 'person-circle' },
    { key: 'classroom', label: '班级圈', icon: 'trophy' },
  ],
};

const today = '06/17';

function averageScore(student: StudentProfile) {
  return Math.round(student.subjects.reduce((sum, item) => sum + item.score, 0) / student.subjects.length);
}

function highestGap(student: StudentProfile) {
  return [...student.subjects].sort((a, b) => b.target - b.score - (a.target - a.score))[0];
}

function roleName(role: Role) {
  return roleLabels[role];
}

export default function App() {
  const { width } = useWindowDimensions();
  const [role, setRole] = useState<Role>('teacher');
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [students, setStudents] = useState(seedStudents);
  const [selectedStudentId, setSelectedStudentId] = useState(seedStudents[0].id);
  const [resources, setResources] = useState(seedResources);
  const [classes, setClasses] = useState(seedClasses);
  const [aiConfig, setAiConfig] = useState<AIConfig>(defaultAIConfig);
  const [noteText, setNoteText] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [newResource, setNewResource] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [answered, setAnswered] = useState<Record<string, string>>({});
  const [diagnosisRun, setDiagnosisRun] = useState(1);
  const [reaction, setReaction] = useState('已打卡');

  const selectedStudent = students.find((item) => item.id === selectedStudentId) ?? students[0];
  const report = useMemo(
    () => buildDiagnostic(selectedStudent, resources, aiConfig),
    [selectedStudent, resources, aiConfig, diagnosisRun],
  );
  const currentTabs = tabsByRole[role];
  const heroGap = highestGap(selectedStudent);
  const shellMaxWidth = width > 780 ? 430 : undefined;

  const changeRole = (next: Role) => {
    setRole(next);
    setActiveTab(tabsByRole[next][0].key);
    setAnswered({});
  };

  const updateStudent = (updater: (student: StudentProfile) => StudentProfile) => {
    setStudents((current) => current.map((student) => (student.id === selectedStudent.id ? updater(student) : student)));
  };

  const addNote = () => {
    const text = noteText.trim();
    if (!text) return;
    updateStudent((student) => ({
      ...student,
      notes: [
        {
          id: `n-${Date.now()}`,
          role,
          author: role === 'teacher' ? student.mentor : role === 'parent' ? student.guardian : student.name,
          text,
          date: today,
        },
        ...student.notes,
      ],
    }));
    setNoteText('');
  };

  const addCustomField = () => {
    const text = customValue.trim();
    if (!text) return;
    updateStudent((student) => ({
      ...student,
      customFields: [
        {
          label: `${roleName(role)}补充`,
          value: text,
          owner: role,
        },
        ...student.customFields,
      ],
    }));
    setCustomValue('');
  };

  const addResource = () => {
    const title = newResource.trim();
    if (!title) return;
    const subject = heroGap.name;
    setResources((current) => [
      {
        id: `r-${Date.now()}`,
        subject,
        title,
        type: 'worksheet',
        level: 'core',
        maintainedBy: selectedStudent.mentor,
        tags: [heroGap.focus, 'AI 推荐'],
      },
      ...current,
    ]);
    setNewResource('');
    setDiagnosisRun((value) => value + 1);
  };

  const createClass = () => {
    const name = newClassName.trim();
    if (!name) return;
    const code = `${name.slice(0, 1).toUpperCase()}${Math.floor(1000 + Math.random() * 8999)}`;
    const next: ClassRoom = {
      id: `c-${Date.now()}`,
      name,
      code,
      teacher: selectedStudent.mentor,
      members: 1,
      mood: '本周目标：让每一次订正都有下一步',
      challenge: '小组互问互答，完成 5 次有效追问',
      leaderboard: [{ name: selectedStudent.name, streak: 1, points: 40 }],
      wall: [{ author: selectedStudent.mentor, text: '班级已创建，欢迎同学和家长加入。', tag: '公告' }],
    };
    setClasses((current) => [next, ...current]);
    setNewClassName('');
  };

  const joinClass = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setClasses((current) =>
      current.map((item) =>
        item.code === code
          ? {
              ...item,
              members: item.members + 1,
              wall: [
                {
                  author: selectedStudent.name,
                  text: `${roleName(role)}视角加入班级，准备参与本周挑战。`,
                  tag: '加入',
                },
                ...item.wall,
              ],
            }
          : item,
      ),
    );
    setJoinCode('');
  };

  const answerQuestion = (questionId: string, option: string) => {
    setAnswered((current) => ({ ...current, [questionId]: option }));
    updateStudent((student) => ({
      ...student,
      notes: [
        {
          id: `n-answer-${Date.now()}`,
          role: 'student',
          author: student.name,
          text: `完成强化题 ${questionId}，选择「${option}」。`,
          date: today,
        },
        ...student.notes.slice(0, 8),
      ],
    }));
  };

  const renderScreen = () => {
    if (activeTab === 'dashboard') {
      return (
        <DashboardScreen
          role={role}
          student={selectedStudent}
          report={report}
          onOpenDiagnosis={() => setActiveTab(role === 'student' ? 'practice' : role === 'parent' ? 'plans' : 'diagnosis')}
        />
      );
    }
    if (activeTab === 'profile') {
      return (
        <ProfileScreen
          role={role}
          student={selectedStudent}
          students={students}
          resources={resources}
          aiConfig={aiConfig}
          noteText={noteText}
          customValue={customValue}
          newResource={newResource}
          onSelectStudent={setSelectedStudentId}
          onNoteChange={setNoteText}
          onAddNote={addNote}
          onCustomChange={setCustomValue}
          onAddCustom={addCustomField}
          onResourceChange={setNewResource}
          onAddResource={addResource}
          onAIConfigChange={setAiConfig}
        />
      );
    }
    if (activeTab === 'diagnosis' || activeTab === 'plans') {
      return (
        <DiagnosisScreen
          role={role}
          student={selectedStudent}
          report={report}
          resources={resources}
          aiConfig={aiConfig}
          onRun={() => setDiagnosisRun((value) => value + 1)}
          onOpenPractice={() => setActiveTab('practice')}
        />
      );
    }
    if (activeTab === 'practice') {
      return <PracticeScreen report={report} answered={answered} onAnswer={answerQuestion} />;
    }
    return (
      <ClassroomScreen
        role={role}
        student={selectedStudent}
        classes={classes}
        reaction={reaction}
        newClassName={newClassName}
        joinCode={joinCode}
        onReaction={setReaction}
        onClassNameChange={setNewClassName}
        onCreateClass={createClass}
        onJoinCodeChange={setJoinCode}
        onJoinClass={joinClass}
      />
    );
  };

  return (
    <SafeAreaView style={screen.safe}>
      <StatusBar style="dark" />
      <View style={[screen.shell, shellMaxWidth ? { maxWidth: shellMaxWidth } : null]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={screen.content}>
          <AppHeader
            role={role}
            student={selectedStudent}
            onRoleChange={changeRole}
            onSelectStudent={setSelectedStudentId}
            students={students}
          />
          {renderScreen()}
        </ScrollView>
        <BottomTabs tabs={currentTabs} active={activeTab} role={role} onChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

function AppHeader({
  role,
  student,
  students,
  onRoleChange,
  onSelectStudent,
}: {
  role: Role;
  student: StudentProfile;
  students: StudentProfile[];
  onRoleChange: (role: Role) => void;
  onSelectStudent: (id: string) => void;
}) {
  const gap = highestGap(student);
  return (
    <View style={screen.header}>
      <View style={screen.brandRow}>
        <View>
          <Text style={screen.brand}>课伴星 K12</Text>
          <Text style={screen.brandSub}>AI 学情诊断与三方共育</Text>
        </View>
        <View style={[screen.roleBadge, { backgroundColor: `${typeColor[role]}16` }]}>
          <Icon name="shield-checkmark" color={typeColor[role]} size={16} />
          <Text style={[screen.roleBadgeText, { color: typeColor[role] }]}>{roleName(role)}</Text>
        </View>
      </View>

      <Segmented value={role} options={roleOptions} onChange={onRoleChange} />

      <View style={screen.hero}>
        <View style={screen.avatar}>
          <Text style={screen.avatarText}>{student.avatar}</Text>
        </View>
        <View style={screen.heroInfo}>
          <Text style={screen.heroTitle}>{student.name}</Text>
          <Text style={screen.heroMeta}>
            {student.grade} · {student.className}
          </Text>
          <View style={screen.heroPills}>
            <Pill color={colors.teal} icon="analytics">
              资料完整度 {Math.min(98, 72 + student.notes.length * 3)}%
            </Pill>
            <Pill color={colors.coral} icon="flag">
              优先补 {gap.name}
            </Pill>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={screen.studentStrip}>
        {students.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onSelectStudent(item.id)}
            style={({ pressed }) => [
              screen.studentChip,
              item.id === student.id && { borderColor: typeColor[role], backgroundColor: `${typeColor[role]}12` },
              pressed && uiStyles.pressed,
            ]}
          >
            <Text style={screen.studentChipAvatar}>{item.avatar}</Text>
            <View>
              <Text style={screen.studentChipName}>{item.name}</Text>
              <Text style={screen.studentChipMeta}>{item.className}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function DashboardScreen({
  role,
  student,
  report,
  onOpenDiagnosis,
}: {
  role: Role;
  student: StudentProfile;
  report: ReturnType<typeof buildDiagnostic>;
  onOpenDiagnosis: () => void;
}) {
  const gap = highestGap(student);
  const roleCopy = {
    teacher: {
      title: '今日教学雷达',
      action: '推送诊断',
      card: '按学生画像、班级资源和错因记录生成分层任务。',
    },
    parent: {
      title: '孩子今日学习状态',
      action: '查看计划',
      card: '把老师诊断拆成家庭可执行的陪跑动作。',
    },
    student: {
      title: '我的学习台',
      action: '开始强化',
      card: '今天先解决一个高优先级卡点，再把会的讲出来。',
    },
  }[role];

  return (
    <View>
      <SectionTitle eyebrow={roleName(role)} title={roleCopy.title} />
      <View style={screen.metricsGrid}>
        <Metric label="综合均分" value={`${averageScore(student)}`} icon="pulse" color={colors.blue} />
        <Metric label="本周资料更新" value={`${student.notes.length}`} icon="layers" color={colors.teal} />
        <Metric label="AI 置信度" value={`${report.confidence}%`} icon="sparkles" color={colors.lavender} />
      </View>

      <Card tone="blue">
        <View style={screen.cardHeader}>
          <Pill color={typeColor[role]} icon="locate">
            当前主线
          </Pill>
          <IconButton icon="arrow-forward" label={roleCopy.action} color={typeColor[role]} onPress={onOpenDiagnosis} />
        </View>
        <Text style={screen.bigText}>{report.headline}</Text>
        <Text style={screen.mutedText}>{roleCopy.card}</Text>
      </Card>

      <SectionTitle eyebrow="Subjects" title="学科表现" />
      <View style={screen.stack}>
        {student.subjects.map((subject) => (
          <Card key={subject.name}>
            <View style={screen.subjectTop}>
              <View>
                <Text style={screen.cardTitle}>{subject.name}</Text>
                <Text style={screen.mutedText}>{subject.focus}</Text>
              </View>
              <View style={screen.scoreBubble}>
                <Text style={screen.scoreText}>{subject.score}</Text>
              </View>
            </View>
            <ProgressBar value={subject.score} target={subject.target} color={subject.name === gap.name ? colors.coral : colors.teal} />
            <View style={screen.rowBetween}>
              <Text style={screen.caption}>目标 {subject.target}</Text>
              <Pill color={subject.trend === 'up' ? colors.green : subject.trend === 'down' ? colors.rose : colors.gold}>
                {subject.trend === 'up' ? '上升' : subject.trend === 'down' ? '波动' : '稳定'}
              </Pill>
            </View>
          </Card>
        ))}
      </View>

      <SectionTitle eyebrow="Next" title="下一步建议" />
      <View style={screen.stack}>
        {report[role === 'teacher' ? 'teacherPlan' : role === 'parent' ? 'parentPlan' : 'studentPlan'].map((item) => (
          <Card key={item.title} tone={role === 'teacher' ? 'blue' : role === 'parent' ? 'mint' : 'gold'}>
            <View style={screen.planTop}>
              <Icon name="checkmark-circle" color={typeColor[role]} />
              <Text style={screen.cardTitle}>{item.title}</Text>
              <Text style={screen.cadence}>{item.cadence}</Text>
            </View>
            <Text style={screen.bodyText}>{item.detail}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
}

function ProfileScreen({
  role,
  student,
  students,
  resources,
  aiConfig,
  noteText,
  customValue,
  newResource,
  onSelectStudent,
  onNoteChange,
  onAddNote,
  onCustomChange,
  onAddCustom,
  onResourceChange,
  onAddResource,
  onAIConfigChange,
}: {
  role: Role;
  student: StudentProfile;
  students: StudentProfile[];
  resources: ResourceItem[];
  aiConfig: AIConfig;
  noteText: string;
  customValue: string;
  newResource: string;
  onSelectStudent: (id: string) => void;
  onNoteChange: (text: string) => void;
  onAddNote: () => void;
  onCustomChange: (text: string) => void;
  onAddCustom: () => void;
  onResourceChange: (text: string) => void;
  onAddResource: () => void;
  onAIConfigChange: (config: AIConfig) => void;
}) {
  return (
    <View>
      {role === 'teacher' ? (
        <>
          <SectionTitle eyebrow="Roster" title="学生切换" />
          <View style={screen.stack}>
            {students.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onSelectStudent(item.id)}
                style={({ pressed }) => [pressed && uiStyles.pressed]}
              >
                <Card style={item.id === student.id ? { borderColor: colors.navy, borderWidth: 2 } : undefined}>
                  <View style={screen.subjectTop}>
                    <View style={screen.row}>
                      <View style={screen.smallAvatar}>
                        <Text style={screen.smallAvatarText}>{item.avatar}</Text>
                      </View>
                      <View>
                        <Text style={screen.cardTitle}>{item.name}</Text>
                        <Text style={screen.mutedText}>{item.grade} · {item.school}</Text>
                      </View>
                    </View>
                    <Pill color={colors.blue}>{averageScore(item)} 均分</Pill>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <ProfileVault
        role={role}
        student={student}
        noteText={noteText}
        customValue={customValue}
        onNoteChange={onNoteChange}
        onAddNote={onAddNote}
        onCustomChange={onCustomChange}
        onAddCustom={onAddCustom}
      />

      <AIConfigPanel config={aiConfig} onChange={onAIConfigChange} />

      <SectionTitle eyebrow="Public Library" title="老师公共资料库" />
      <View style={screen.stack}>
        {role === 'teacher' ? (
          <Card tone="gold">
            <Field label="新增公共资料" value={newResource} onChangeText={onResourceChange} placeholder="例：一次函数图像与性质错因题组" />
            <IconButton icon="cloud-upload" label="沉淀到公共库" color={colors.gold} onPress={onAddResource} />
          </Card>
        ) : null}
        {resources.map((item) => (
          <Card key={item.id}>
            <View style={screen.cardHeader}>
              <View>
                <Text style={screen.cardTitle}>{item.title}</Text>
                <Text style={screen.mutedText}>{item.subject} · {item.maintainedBy}</Text>
              </View>
              <Pill color={item.level === 'stretch' ? colors.lavender : item.level === 'core' ? colors.blue : colors.green}>
                {item.level === 'stretch' ? '拔高' : item.level === 'core' ? '核心' : '基础'}
              </Pill>
            </View>
            <View style={screen.wrapRow}>
              {item.tags.map((tag) => (
                <Pill key={tag} color={colors.muted}>
                  {tag}
                </Pill>
              ))}
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}

function ProfileVault({
  role,
  student,
  noteText,
  customValue,
  onNoteChange,
  onAddNote,
  onCustomChange,
  onAddCustom,
}: {
  role: Role;
  student: StudentProfile;
  noteText: string;
  customValue: string;
  onNoteChange: (text: string) => void;
  onAddNote: () => void;
  onCustomChange: (text: string) => void;
  onAddCustom: () => void;
}) {
  return (
    <>
      <SectionTitle eyebrow="Personal Vault" title="学生个人资料库" />
      <Card tone="mint">
        <Text style={screen.bigText}>{student.summary}</Text>
        <View style={screen.wrapRow}>
          <Pill color={colors.teal} icon="bulb">
            {student.learningStyle}
          </Pill>
          <Pill color={colors.coral} icon="heart">
            {student.motivation}
          </Pill>
        </View>
        <Text style={screen.mutedText}>风险观察：{student.risk}</Text>
      </Card>

      <View style={screen.twoCol}>
        <Card style={screen.flexCard}>
          <Text style={screen.cardTitle}>目标</Text>
          {student.goals.map((goal) => (
            <View key={goal} style={screen.listRow}>
              <Icon name="flag" color={colors.coral} />
              <Text style={screen.bodyText}>{goal}</Text>
            </View>
          ))}
        </Card>
        <Card style={screen.flexCard}>
          <Text style={screen.cardTitle}>习惯</Text>
          {student.habits.map((habit) => (
            <View key={habit} style={screen.listRow}>
              <Icon name="time" color={colors.teal} />
              <Text style={screen.bodyText}>{habit}</Text>
            </View>
          ))}
        </Card>
      </View>

      <SectionTitle eyebrow="Co-edit" title="三方共同维护" />
      <Card>
        <Field
          label={`${roleName(role)}补充观察`}
          value={noteText}
          onChangeText={onNoteChange}
          placeholder="记录课堂表现、家庭观察、学生自评或新的卡点"
          multiline
        />
        <IconButton icon="add-circle" label="写入资料库" color={typeColor[role]} onPress={onAddNote} />
      </Card>
      <Card>
        <Field
          label="自定义画像字段"
          value={customValue}
          onChangeText={onCustomChange}
          placeholder="例：喜欢用图像法理解题目；周五晚不适合安排重任务"
          multiline
        />
        <IconButton icon="create" label="新增自定义字段" color={colors.lavender} onPress={onAddCustom} />
      </Card>

      <View style={screen.stack}>
        {student.customFields.map((field, index) => (
          <Card key={`${field.label}-${index}`}>
            <View style={screen.cardHeader}>
              <Text style={screen.cardTitle}>{field.label}</Text>
              <Pill color={typeColor[field.owner]}>{roleName(field.owner)}</Pill>
            </View>
            <Text style={screen.bodyText}>{field.value}</Text>
          </Card>
        ))}
        {student.notes.map((note) => (
          <Card key={note.id}>
            <View style={screen.cardHeader}>
              <View style={screen.row}>
                <Pill color={typeColor[note.role]}>{roleName(note.role)}</Pill>
                <Text style={screen.cardTitle}>{note.author}</Text>
              </View>
              <Text style={screen.caption}>{note.date}</Text>
            </View>
            <Text style={screen.bodyText}>{note.text}</Text>
          </Card>
        ))}
      </View>
    </>
  );
}

function AIConfigPanel({
  config,
  onChange,
}: {
  config: AIConfig;
  onChange: (config: AIConfig) => void;
}) {
  return (
    <>
      <SectionTitle eyebrow="AI" title="个人 AI 接入配置" />
      <Card tone="blue">
        <Field label="Provider" value={config.provider} onChangeText={(provider) => onChange({ ...config, provider })} />
        <Field label="Model" value={config.model} onChangeText={(model) => onChange({ ...config, model })} />
        <Field label="Endpoint" value={config.endpoint} onChangeText={(endpoint) => onChange({ ...config, endpoint })} />
        <View style={screen.twoCol}>
          <IconButton
            icon={config.usePersonalVault ? 'checkbox' : 'square-outline'}
            label="个人资料库"
            active={config.usePersonalVault}
            color={colors.teal}
            onPress={() => onChange({ ...config, usePersonalVault: !config.usePersonalVault })}
          />
          <IconButton
            icon={config.usePublicLibrary ? 'checkbox' : 'square-outline'}
            label="公共资料库"
            active={config.usePublicLibrary}
            color={colors.blue}
            onPress={() => onChange({ ...config, usePublicLibrary: !config.usePublicLibrary })}
          />
        </View>
        <Segmented
          value={config.privacyMode}
          options={[
            { value: 'local-first', label: '本地优先', icon: 'phone-portrait', color: colors.teal },
            { value: 'cloud', label: '云端增强', icon: 'cloud', color: colors.lavender },
          ]}
          onChange={(privacyMode) => onChange({ ...config, privacyMode })}
        />
      </Card>
    </>
  );
}

function DiagnosisScreen({
  role,
  student,
  report,
  resources,
  aiConfig,
  onRun,
  onOpenPractice,
}: {
  role: Role;
  student: StudentProfile;
  report: ReturnType<typeof buildDiagnostic>;
  resources: ResourceItem[];
  aiConfig: AIConfig;
  onRun: () => void;
  onOpenPractice: () => void;
}) {
  return (
    <View>
      <SectionTitle
        eyebrow="AI Diagnosis"
        title={role === 'parent' ? '家长提升计划书' : 'AI 学习评估诊断'}
        action={<IconButton icon="refresh" label="重新诊断" color={typeColor[role]} onPress={onRun} />}
      />
      <Card tone="blue">
        <View style={screen.cardHeader}>
          <Pill color={colors.lavender} icon="sparkles">
            {aiConfig.model}
          </Pill>
          <Pill color={colors.teal}>{report.confidence}% 置信</Pill>
        </View>
        <Text style={screen.bigText}>{report.headline}</Text>
        <Text style={screen.mutedText}>数据源：{report.dataSources.join(' / ')}</Text>
      </Card>

      <SectionTitle eyebrow="Gaps" title="查漏补缺优先级" />
      <View style={screen.stack}>
        {report.gaps.map((gap, index) => (
          <Card key={`${gap.subject}-${gap.title}`} tone={gap.priority === 'high' ? 'rose' : gap.priority === 'medium' ? 'gold' : 'mint'}>
            <View style={screen.cardHeader}>
              <View style={screen.row}>
                <View style={screen.rank}>
                  <Text style={screen.rankText}>{index + 1}</Text>
                </View>
                <View>
                  <Text style={screen.cardTitle}>{gap.subject} · {gap.title}</Text>
                  <Text style={screen.caption}>{gap.priority === 'high' ? '高优先级' : gap.priority === 'medium' ? '中优先级' : '低优先级'}</Text>
                </View>
              </View>
            </View>
            <Text style={screen.bodyText}>{gap.evidence}</Text>
          </Card>
        ))}
      </View>

      <SectionTitle eyebrow="Plans" title="三方提升计划书" action={<IconButton icon="barbell" label="出题训练" color={colors.coral} onPress={onOpenPractice} />} />
      <PlanDeck role={role} report={report} />

      <SectionTitle eyebrow="Library Match" title="命中的公共资料" />
      <View style={screen.stack}>
        {resources
          .filter((item) => report.gaps.some((gap) => gap.subject === item.subject))
          .slice(0, 4)
          .map((item) => (
            <Card key={item.id}>
              <Text style={screen.cardTitle}>{item.title}</Text>
              <Text style={screen.mutedText}>{item.subject} · {item.tags.join(' / ')}</Text>
            </Card>
          ))}
      </View>
    </View>
  );
}

function PlanDeck({ role, report }: { role: Role; report: ReturnType<typeof buildDiagnostic> }) {
  const decks = [
    { key: 'student', label: '给学生', color: typeColor.student, items: report.studentPlan },
    { key: 'parent', label: '给家长', color: typeColor.parent, items: report.parentPlan },
    { key: 'teacher', label: '给老师', color: typeColor.teacher, items: report.teacherPlan },
  ] as const;
  return (
    <View style={screen.stack}>
      {decks.map((deck) => (
        <Card key={deck.key} tone={deck.key === 'student' ? 'gold' : deck.key === 'parent' ? 'mint' : 'blue'}>
          <View style={screen.cardHeader}>
            <Pill color={deck.color}>{deck.label}</Pill>
            {deck.key === role ? <Pill color={colors.green} icon="eye">当前视角</Pill> : null}
          </View>
          {deck.items.map((item) => (
            <View key={item.title} style={screen.planItem}>
              <Text style={screen.cardTitle}>{item.title}</Text>
              <Text style={screen.bodyText}>{item.detail}</Text>
              <Text style={screen.caption}>{item.cadence}</Text>
            </View>
          ))}
        </Card>
      ))}
    </View>
  );
}

function PracticeScreen({
  report,
  answered,
  onAnswer,
}: {
  report: ReturnType<typeof buildDiagnostic>;
  answered: Record<string, string>;
  onAnswer: (questionId: string, option: string) => void;
}) {
  return (
    <View>
      <SectionTitle eyebrow="Practice" title="针对性强化训练" />
      <Card tone="gold">
        <Text style={screen.bigText}>今天只练 {report.practice.length} 个关键卡点</Text>
        <Text style={screen.mutedText}>题目来自 AI 诊断结果，答题记录会回写个人资料库，成为下一轮诊断证据。</Text>
      </Card>

      <View style={screen.stack}>
        {report.practice.map((question, index) => {
          const selected = answered[question.id];
          const correct = selected === question.answer;
          return (
            <Card key={question.id}>
              <View style={screen.cardHeader}>
                <Pill color={colors.coral}>第 {index + 1} 题</Pill>
                <Pill color={colors.blue}>{question.subject}</Pill>
              </View>
              <Text style={screen.cardTitle}>{question.stem}</Text>
              <View style={screen.stackSmall}>
                {question.options.map((option) => {
                  const isSelected = selected === option;
                  const isAnswer = selected && option === question.answer;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => onAnswer(question.id, option)}
                      style={({ pressed }) => [
                        screen.option,
                        isSelected && { borderColor: correct ? colors.green : colors.rose, backgroundColor: correct ? '#EEF9F1' : '#FFF1F0' },
                        isAnswer && { borderColor: colors.green, backgroundColor: '#EEF9F1' },
                        pressed && uiStyles.pressed,
                      ]}
                    >
                      <Icon
                        name={isAnswer ? 'checkmark-circle' : isSelected ? 'radio-button-on' : 'radio-button-off'}
                        color={isAnswer ? colors.green : isSelected ? colors.rose : colors.faint}
                      />
                      <Text style={screen.optionText}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {selected ? (
                <Card tone={correct ? 'mint' : 'rose'} style={screen.innerCard}>
                  <Text style={screen.cardTitle}>{correct ? '答对了' : `正确答案：${question.answer}`}</Text>
                  <Text style={screen.bodyText}>{question.explanation}</Text>
                </Card>
              ) : null}
            </Card>
          );
        })}
      </View>
    </View>
  );
}

function ClassroomScreen({
  role,
  student,
  classes,
  reaction,
  newClassName,
  joinCode,
  onReaction,
  onClassNameChange,
  onCreateClass,
  onJoinCodeChange,
  onJoinClass,
}: {
  role: Role;
  student: StudentProfile;
  classes: ClassRoom[];
  reaction: string;
  newClassName: string;
  joinCode: string;
  onReaction: (value: string) => void;
  onClassNameChange: (value: string) => void;
  onCreateClass: () => void;
  onJoinCodeChange: (value: string) => void;
  onJoinClass: () => void;
}) {
  const activeClass = classes.find((item) => item.code === student.classCode) ?? classes[0];

  return (
    <View>
      <SectionTitle eyebrow="Class" title="班级学习氛围" />
      {role === 'teacher' ? (
        <Card tone="blue">
          <Field label="创建班级" value={newClassName} onChangeText={onClassNameChange} placeholder="例：八年级暑期提升班" />
          <IconButton icon="people-circle" label="创建班级" color={typeColor.teacher} onPress={onCreateClass} />
        </Card>
      ) : (
        <Card tone="mint">
          <Field label="加入班级码" value={joinCode} onChangeText={onJoinCodeChange} placeholder={student.classCode} />
          <IconButton icon="enter" label="加入班级" color={typeColor[role]} onPress={onJoinClass} />
        </Card>
      )}

      {activeClass ? (
        <View style={screen.stack}>
          <Card tone="gold">
            <View style={screen.cardHeader}>
              <View>
                <Text style={screen.bigText}>{activeClass.name}</Text>
                <Text style={screen.mutedText}>班级码 {activeClass.code} · {activeClass.members} 人 · {activeClass.teacher}</Text>
              </View>
              <Pill color={colors.gold} icon="flame">挑战中</Pill>
            </View>
            <Text style={screen.bodyText}>{activeClass.mood}</Text>
            <Text style={screen.bodyText}>互动任务：{activeClass.challenge}</Text>
          </Card>

          <SectionTitle eyebrow="Atmosphere" title="互动机制" />
          <View style={screen.twoCol}>
            <Card style={screen.flexCard}>
              <Text style={screen.cardTitle}>今日打卡</Text>
              <View style={screen.reactions}>
                {['已打卡', '求讲解', '我会讲'].map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => onReaction(item)}
                    style={({ pressed }) => [
                      screen.reactionButton,
                      reaction === item && { backgroundColor: colors.ink, borderColor: colors.ink },
                      pressed && uiStyles.pressed,
                    ]}
                  >
                    <Text style={[screen.reactionText, reaction === item && { color: colors.surface }]}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </Card>
            <Card style={screen.flexCard}>
              <Text style={screen.cardTitle}>小组徽章</Text>
              <View style={screen.badgeLine}>
                <Icon name="medal" color={colors.gold} size={28} />
                <Icon name="ribbon" color={colors.coral} size={28} />
                <Icon name="sparkles" color={colors.lavender} size={28} />
              </View>
              <Text style={screen.caption}>讲解、追问、复盘都可加分</Text>
            </Card>
          </View>

          <SectionTitle eyebrow="Leaderboard" title="学习气氛榜" />
          <View style={screen.stack}>
            {activeClass.leaderboard.map((item, index) => (
              <Card key={item.name}>
                <View style={screen.cardHeader}>
                  <View style={screen.row}>
                    <View style={[screen.rank, { backgroundColor: index === 0 ? colors.gold : colors.blue }]}>
                      <Text style={screen.rankText}>{index + 1}</Text>
                    </View>
                    <View>
                      <Text style={screen.cardTitle}>{item.name}</Text>
                      <Text style={screen.mutedText}>连续 {item.streak} 天 · {item.points} 分</Text>
                    </View>
                  </View>
                  <Icon name="trending-up" color={colors.green} />
                </View>
              </Card>
            ))}
          </View>

          <SectionTitle eyebrow="Wall" title="班级互动墙" />
          <View style={screen.stack}>
            {activeClass.wall.map((item, index) => (
              <Card key={`${item.author}-${index}`}>
                <View style={screen.cardHeader}>
                  <View style={screen.row}>
                    <Pill color={colors.blue}>{item.tag}</Pill>
                    <Text style={screen.cardTitle}>{item.author}</Text>
                  </View>
                </View>
                <Text style={screen.bodyText}>{item.text}</Text>
              </Card>
            ))}
          </View>
        </View>
      ) : (
        <EmptyState icon="people" title="还没有班级" detail="老师创建班级后，学生和家长可以用班级码加入。" />
      )}
    </View>
  );
}

function BottomTabs({
  tabs,
  active,
  role,
  onChange,
}: {
  tabs: Array<{ key: TabKey; label: string; icon: React.ComponentProps<typeof Icon>['name'] }>;
  active: TabKey;
  role: Role;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <View style={screen.tabBar}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => [screen.tabItem, pressed && uiStyles.pressed]}
          >
            <View style={[screen.tabIcon, isActive && { backgroundColor: typeColor[role] }]}>
              <Icon name={tab.icon} size={19} color={isActive ? colors.surface : colors.faint} />
            </View>
            <Text style={[screen.tabText, isActive && { color: typeColor[role] }]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const screen = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#EAF0F3',
    alignItems: 'center',
  },
  shell: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.paper,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 104,
  },
  header: {
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: {
    color: colors.ink,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
  },
  brandSub: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  roleBadge: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  hero: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8E1EA',
    backgroundColor: colors.surface,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  avatarText: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: '900',
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
  },
  heroMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  studentStrip: {
    gap: 8,
    paddingRight: 4,
  },
  studentChip: {
    minWidth: 152,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentChipAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EEF2F6',
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '900',
  },
  studentChipName: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  studentChipMeta: {
    color: colors.faint,
    fontSize: 11,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  stack: {
    gap: 10,
  },
  stackSmall: {
    gap: 7,
  },
  twoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  flexCard: {
    flex: 1,
    minWidth: 150,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  subjectTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  scoreBubble: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4FA',
  },
  scoreText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  bigText: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '900',
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  bodyText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  mutedText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  caption: {
    color: colors.faint,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  cadence: {
    color: colors.faint,
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 'auto',
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  planItem: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10,
    gap: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAvatarText: {
    color: colors.surface,
    fontWeight: '900',
  },
  rank: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: colors.surface,
    fontWeight: '900',
    fontSize: 13,
  },
  option: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionText: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  innerCard: {
    boxShadow: 'none',
  },
  reactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reactionButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  reactionText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  badgeLine: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  tabBar: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    minHeight: 68,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    paddingVertical: 7,
    boxShadow: '0px 8px 20px rgba(13, 20, 36, 0.12)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F3F7',
  },
  tabText: {
    color: colors.faint,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
  },
});
