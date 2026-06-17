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
  Course,
  CourseAutomationItem,
  CourseEnrollment,
  Institution,
  Role,
  StudentProfile,
  buildDiagnostic,
  defaultAIConfig,
  roleLabels,
  seedCourses,
  seedEnrollments,
  seedInstitutions,
  seedResources,
  seedStudents,
  seedTeacherAssets,
  seedTeachingRooms,
} from './src/domain';
import { Card, Icon, IconButton, Metric, Pill, ProgressBar, SectionTitle, colors, styles as uiStyles, typeColor } from './src/ui';

type ViewKey = 'courses' | 'tasks' | 'profile' | 'children' | 'schedule' | 'detail' | 'automation' | 'resources' | 'ai';

type Module = {
  key: ViewKey;
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
};

const roleOptions: Array<{ value: Role; label: string; icon: React.ComponentProps<typeof Icon>['name']; detail: string }> = [
  { value: 'student', label: '学生', icon: 'book', detail: '按课程查看安排、预习、作业和复习资料' },
  { value: 'parent', label: '家长', icon: 'people', detail: '按孩子查看总课表和单个孩子详情' },
  { value: 'teacher', label: '老师', icon: 'school', detail: '按课程管理排课、人数、地点和课前课后事项' },
];

const modulesByRole: Record<Role, Module[]> = {
  student: [
    { key: 'courses', label: '课程', icon: 'albums' },
    { key: 'tasks', label: '任务', icon: 'checkmark-done' },
    { key: 'profile', label: '档案', icon: 'person-circle' },
  ],
  parent: [
    { key: 'children', label: '孩子', icon: 'people' },
    { key: 'schedule', label: '总课表', icon: 'calendar' },
    { key: 'detail', label: '详情', icon: 'id-card' },
  ],
  teacher: [
    { key: 'courses', label: '课程', icon: 'calendar' },
    { key: 'automation', label: '事项', icon: 'flash' },
    { key: 'resources', label: '资源', icon: 'cube' },
    { key: 'ai', label: 'AI', icon: 'sparkles' },
  ],
};

const roleHome: Record<Role, ViewKey> = {
  student: 'courses',
  parent: 'children',
  teacher: 'courses',
};

function roleName(role: Role) {
  return roleLabels[role];
}

function averageScore(student: StudentProfile) {
  return Math.round(student.subjects.reduce((sum, item) => sum + item.score, 0) / student.subjects.length);
}

function getHighestGap(student: StudentProfile) {
  return [...student.subjects].sort((a, b) => b.target - b.score - (a.target - a.score))[0];
}

function findInstitution(institutions: Institution[], course: Course) {
  return institutions.find((item) => item.id === course.institutionId) ?? institutions[0];
}

function getStudentCourses(studentId: string, courses: Course[], enrollments: CourseEnrollment[]) {
  const enrolledIds = new Set(enrollments.filter((item) => item.studentId === studentId).map((item) => item.courseId));
  return courses.filter((course) => enrolledIds.has(course.id));
}

function completionOf(items: CourseAutomationItem[]) {
  const done = items.reduce((sum, item) => sum + item.done, 0);
  const total = items.reduce((sum, item) => sum + item.total, 0);
  return total ? Math.round((done / total) * 100) : 0;
}

function enrollmentFor(studentId: string, courseId: string, enrollments: CourseEnrollment[]) {
  return enrollments.find((item) => item.studentId === studentId && item.courseId === courseId);
}

export default function App() {
  const { width } = useWindowDimensions();
  const [role, setRole] = useState<Role | null>(null);
  const [activeView, setActiveView] = useState<ViewKey>('courses');
  const [selectedStudentId, setSelectedStudentId] = useState(seedStudents[0].id);
  const [selectedCourseId, setSelectedCourseId] = useState(seedCourses[0].id);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const students = seedStudents;
  const courses = seedCourses;
  const enrollments = seedEnrollments;
  const institutions = seedInstitutions;
  const resources = seedResources;
  const teacherAssets = seedTeacherAssets;
  const teachingRooms = seedTeachingRooms;
  const selectedStudent = students.find((item) => item.id === selectedStudentId) ?? students[0];
  const selectedCourse = courses.find((item) => item.id === selectedCourseId) ?? courses[0];
  const selectedInstitution = findInstitution(institutions, selectedCourse);
  const report = useMemo(() => buildDiagnostic(selectedStudent, resources, defaultAIConfig), [selectedStudent, resources]);
  const shellMaxWidth = width > 780 ? 430 : undefined;

  const enterRole = (nextRole: Role) => {
    setRole(nextRole);
    setActiveView(roleHome[nextRole]);
    if (nextRole === 'student') {
      const firstCourse = getStudentCourses(selectedStudent.id, courses, enrollments)[0];
      if (firstCourse) setSelectedCourseId(firstCourse.id);
    }
  };

  const leaveRole = () => {
    setRole(null);
    setActiveView('courses');
  };

  const changeStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    const firstCourse = getStudentCourses(studentId, courses, enrollments)[0];
    if (firstCourse) setSelectedCourseId(firstCourse.id);
  };

  const renderWorkspace = () => {
    if (!role) return null;
    if (role === 'student') {
      return (
        <StudentWorkspace
          view={activeView}
          student={selectedStudent}
          courses={getStudentCourses(selectedStudent.id, courses, enrollments)}
          allCourses={courses}
          enrollments={enrollments}
          institutions={institutions}
          selectedCourseId={selectedCourseId}
          onSelectCourse={setSelectedCourseId}
          report={report}
          answers={answers}
          onAnswer={(id, answer) => setAnswers((current) => ({ ...current, [id]: answer }))}
        />
      );
    }
    if (role === 'parent') {
      return (
        <ParentWorkspace
          view={activeView}
          students={students}
          selectedStudent={selectedStudent}
          courses={courses}
          enrollments={enrollments}
          institutions={institutions}
          onSelectStudent={changeStudent}
          report={report}
        />
      );
    }
    return (
      <TeacherWorkspace
        view={activeView}
        students={students}
        courses={courses}
        institutions={institutions}
        selectedCourse={selectedCourse}
        onSelectCourse={setSelectedCourseId}
        resources={resources}
        teacherAssets={teacherAssets}
        teachingRooms={teachingRooms}
        report={report}
      />
    );
  };

  return (
    <SafeAreaView style={screen.safe}>
      <StatusBar style="dark" />
      <View style={[screen.shell, shellMaxWidth ? { maxWidth: shellMaxWidth } : null]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={screen.content}>
          {!role ? (
            <IdentityScreen onEnterRole={enterRole} />
          ) : (
            <>
              <WorkspaceHeader role={role} onBack={leaveRole} modules={modulesByRole[role]} activeView={activeView} onChangeView={setActiveView} />
              {renderWorkspace()}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function IdentityScreen({ onEnterRole }: { onEnterRole: (role: Role) => void }) {
  return (
    <View style={screen.stack}>
      <View style={screen.identityHero}>
        <View style={screen.appIcon}>
          <Icon name="happy" color={colors.surface} size={28} />
        </View>
        <Text style={screen.identityTitle}>开心学</Text>
        <Text style={screen.identitySub}>先选择身份，再进入对应工作台</Text>
      </View>

      <View style={screen.stack}>
        {roleOptions.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={`进入${option.label}`}
            onPress={() => onEnterRole(option.value)}
            style={({ pressed }) => [pressed && uiStyles.pressed]}
          >
            <Card>
              <View style={screen.actionRow}>
                <View style={[screen.symbol, { backgroundColor: `${typeColor[option.value]}18` }]}>
                  <Icon name={option.icon} color={typeColor[option.value]} />
                </View>
                <View style={screen.fill}>
                  <Text style={screen.cardTitle}>{option.label}</Text>
                  <Text style={screen.subText}>{option.detail}</Text>
                </View>
                <Icon name="chevron-forward" color={colors.faint} />
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function WorkspaceHeader({
  role,
  modules,
  activeView,
  onBack,
  onChangeView,
}: {
  role: Role;
  modules: Module[];
  activeView: ViewKey;
  onBack: () => void;
  onChangeView: (view: ViewKey) => void;
}) {
  const title = {
    student: '我的课程',
    parent: '孩子与课表',
    teacher: '课程经营',
  }[role];
  const subtitle = {
    student: '按课程查看安排、资料和任务',
    parent: '先看所有孩子，再进入单个孩子详情',
    teacher: '按课程处理排课和课前课后事项',
  }[role];

  return (
    <View style={screen.header}>
      <View style={screen.navRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="返回身份选择" onPress={onBack} style={screen.backButton}>
          <Icon name="chevron-back" color={colors.blue} />
          <Text style={screen.backText}>身份</Text>
        </Pressable>
        <Pill color={typeColor[role]}>{roleName(role)}</Pill>
      </View>
      <View>
        <Text style={screen.pageTitle}>{title}</Text>
        <Text style={screen.pageSub}>{subtitle}</Text>
      </View>
      <View style={screen.moduleRow}>
        {modules.map((item) => {
          const active = item.key === activeView;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => onChangeView(item.key)}
              style={({ pressed }) => [
                screen.modulePill,
                active && { backgroundColor: typeColor[role], borderColor: typeColor[role] },
                pressed && uiStyles.pressed,
              ]}
            >
              <Icon name={item.icon} color={active ? colors.surface : typeColor[role]} size={16} />
              <Text style={[screen.modulePillText, active && { color: colors.surface }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function StudentWorkspace({
  view,
  student,
  courses,
  allCourses,
  enrollments,
  institutions,
  selectedCourseId,
  onSelectCourse,
  report,
  answers,
  onAnswer,
}: {
  view: ViewKey;
  student: StudentProfile;
  courses: Course[];
  allCourses: Course[];
  enrollments: CourseEnrollment[];
  institutions: Institution[];
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  report: ReturnType<typeof buildDiagnostic>;
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
}) {
  const selectedCourse = courses.find((item) => item.id === selectedCourseId) ?? courses[0];
  if (view === 'tasks') {
    return <StudentTaskView student={student} courses={courses} enrollments={enrollments} report={report} answers={answers} onAnswer={onAnswer} />;
  }
  if (view === 'profile') {
    return <StudentProfileView student={student} courses={courses} institutions={institutions} allCourses={allCourses} />;
  }
  return (
    <View style={screen.stack}>
      <SectionTitle eyebrow="Courses" title={`${student.name} 报名的课程`} />
      <View style={screen.metricsGrid}>
        <Metric label="报名课程" value={`${courses.length}`} icon="albums" color={colors.blue} />
        <Metric label="涉及机构" value={`${new Set(courses.map((item) => item.institutionId)).size}`} icon="business" color={colors.green} />
        <Metric label="下一节课" value={courses[0]?.date ?? '-'} icon="calendar" color={colors.gold} />
      </View>

      <View style={screen.stack}>
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            institution={findInstitution(institutions, course)}
            active={course.id === selectedCourse.id}
            enrollment={enrollmentFor(student.id, course.id, enrollments)}
            onPress={() => onSelectCourse(course.id)}
          />
        ))}
      </View>

      <CourseDetailForStudent course={selectedCourse} institution={findInstitution(institutions, selectedCourse)} enrollment={enrollmentFor(student.id, selectedCourse.id, enrollments)} />
    </View>
  );
}

function CourseCard({
  course,
  institution,
  enrollment,
  active,
  onPress,
}: {
  course: Course;
  institution: Institution;
  enrollment?: CourseEnrollment;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={course.name} onPress={onPress} style={({ pressed }) => [pressed && uiStyles.pressed]}>
      <Card style={active ? { borderColor: colors.blue, borderWidth: 2 } : undefined}>
        <View style={screen.cardHeader}>
          <View style={screen.fill}>
            <Text style={screen.cardTitle}>{course.name}</Text>
            <Text style={screen.subText}>{institution.name} · {course.teacher}</Text>
          </View>
          <Pill color={course.mode === 'online' ? colors.blue : colors.green}>{course.mode === 'online' ? '线上' : '线下'}</Pill>
        </View>
        <View style={screen.infoGrid}>
          <InfoLine icon="time" text={course.time} />
          <InfoLine icon="location" text={course.location} />
          <InfoLine icon="people" text={`${course.enrolled}/${course.capacity} 人`} />
        </View>
        {enrollment ? (
          <View style={screen.stackSmall}>
            <ProgressBar value={enrollment.progress} target={100} color={colors.blue} />
            <Text style={screen.caption}>下一步：{enrollment.nextTask}</Text>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

function CourseDetailForStudent({
  course,
  institution,
  enrollment,
}: {
  course: Course;
  institution: Institution;
  enrollment?: CourseEnrollment;
}) {
  return (
    <View style={screen.stack}>
      <SectionTitle eyebrow="Course Detail" title="课程详情" />
      <Card tone="blue">
        <Text style={screen.largeTitle}>{course.nextLesson}</Text>
        <Text style={screen.subText}>{institution.address}</Text>
      </Card>
      <View style={screen.stack}>
        <TaskRow icon="book" title="课前预习" detail={course.prep} done={Boolean(enrollment)} />
        <TaskRow icon="create" title="课后作业" detail={course.homework} done={false} />
        <TaskRow icon="refresh" title="复习资料" detail={course.review} done={false} />
      </View>
    </View>
  );
}

function StudentTaskView({
  student,
  courses,
  enrollments,
  report,
  answers,
  onAnswer,
}: {
  student: StudentProfile;
  courses: Course[];
  enrollments: CourseEnrollment[];
  report: ReturnType<typeof buildDiagnostic>;
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
}) {
  return (
    <View style={screen.stack}>
      <SectionTitle eyebrow="Tasks" title="今天要完成" />
      {courses.map((course) => {
        const enrollment = enrollmentFor(student.id, course.id, enrollments);
        return (
          <Card key={course.id}>
            <View style={screen.cardHeader}>
              <Text style={screen.cardTitle}>{course.name}</Text>
              <Text style={screen.caption}>{course.date}</Text>
            </View>
            <TaskRow icon="checkmark-circle" title="当前任务" detail={enrollment?.nextTask ?? course.prep} done={false} />
            <TaskRow icon="document-text" title="复习资料" detail={course.review} done={false} />
          </Card>
        );
      })}

      <SectionTitle eyebrow="Practice" title="针对性强化" />
      {report.practice.map((question, index) => {
        const selected = answers[question.id];
        return (
          <Card key={question.id}>
            <Pill color={colors.gold}>第 {index + 1} 题 · {question.subject}</Pill>
            <Text style={screen.cardTitle}>{question.stem}</Text>
            <View style={screen.stackSmall}>
              {question.options.map((option) => {
                const active = selected === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => onAnswer(question.id, option)}
                    style={({ pressed }) => [
                      screen.option,
                      active && { borderColor: option === question.answer ? colors.green : colors.rose, backgroundColor: option === question.answer ? '#F0FFF5' : '#FFF4F4' },
                      pressed && uiStyles.pressed,
                    ]}
                  >
                    <Text style={screen.optionText}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
            {selected ? <Text style={screen.caption}>{selected === question.answer ? '答对了' : `正确答案：${question.answer}`} · {question.explanation}</Text> : null}
          </Card>
        );
      })}
    </View>
  );
}

function StudentProfileView({
  student,
  courses,
  allCourses,
  institutions,
}: {
  student: StudentProfile;
  courses: Course[];
  allCourses: Course[];
  institutions: Institution[];
}) {
  const gap = getHighestGap(student);
  return (
    <View style={screen.stack}>
      <SectionTitle eyebrow="Profile" title="我的学习档案" />
      <Card>
        <View style={screen.actionRow}>
          <View style={screen.avatar}><Text style={screen.avatarText}>{student.avatar}</Text></View>
          <View style={screen.fill}>
            <Text style={screen.largeTitle}>{student.name}</Text>
            <Text style={screen.subText}>{student.grade} · {courses.length} 门课程 · {new Set(courses.map((item) => item.institutionId)).size} 家机构</Text>
          </View>
        </View>
        <Text style={screen.bodyText}>{student.summary}</Text>
      </Card>
      <Card tone="gold">
        <Text style={screen.cardTitle}>优先补强</Text>
        <Text style={screen.bodyText}>{gap.name} · {gap.focus}</Text>
      </Card>
      {courses.map((course) => (
        <Card key={course.id}>
          <Text style={screen.cardTitle}>{course.name}</Text>
          <Text style={screen.subText}>{findInstitution(institutions, course).name}</Text>
          <Text style={screen.caption}>{course.time} · {course.location}</Text>
        </Card>
      ))}
    </View>
  );
}

function ParentWorkspace({
  view,
  students,
  selectedStudent,
  courses,
  enrollments,
  institutions,
  onSelectStudent,
  report,
}: {
  view: ViewKey;
  students: StudentProfile[];
  selectedStudent: StudentProfile;
  courses: Course[];
  enrollments: CourseEnrollment[];
  institutions: Institution[];
  onSelectStudent: (studentId: string) => void;
  report: ReturnType<typeof buildDiagnostic>;
}) {
  const selectedCourses = getStudentCourses(selectedStudent.id, courses, enrollments);
  if (view === 'schedule') {
    return <ParentScheduleView students={students} courses={courses} enrollments={enrollments} institutions={institutions} onSelectStudent={onSelectStudent} />;
  }
  if (view === 'detail') {
    return <ParentChildDetail student={selectedStudent} courses={selectedCourses} institutions={institutions} report={report} />;
  }
  return (
    <View style={screen.stack}>
      <SectionTitle eyebrow="Children" title="我的孩子" />
      <View style={screen.metricsGrid}>
        <Metric label="孩子" value={`${students.length}`} icon="people" color={colors.green} />
        <Metric label="总课程" value={`${enrollments.length}`} icon="albums" color={colors.blue} />
        <Metric label="本周课次" value={`${courses.length}`} icon="calendar" color={colors.gold} />
      </View>
      {students.map((student) => {
        const childCourses = getStudentCourses(student.id, courses, enrollments);
        return (
          <Pressable key={student.id} onPress={() => onSelectStudent(student.id)} style={({ pressed }) => [pressed && uiStyles.pressed]}>
            <Card style={student.id === selectedStudent.id ? { borderColor: colors.green, borderWidth: 2 } : undefined}>
              <View style={screen.actionRow}>
                <View style={screen.avatar}><Text style={screen.avatarText}>{student.avatar}</Text></View>
                <View style={screen.fill}>
                  <Text style={screen.cardTitle}>{student.name}</Text>
                  <Text style={screen.subText}>{student.grade} · {childCourses.length} 门课程 · {new Set(childCourses.map((item) => item.institutionId)).size} 家机构</Text>
                </View>
                <Icon name="chevron-forward" color={colors.faint} />
              </View>
              <Text style={screen.caption}>下一节：{childCourses[0]?.name ?? '暂无'} · {childCourses[0]?.time ?? '-'}</Text>
            </Card>
          </Pressable>
        );
      })}
      <ParentChildDetail student={selectedStudent} courses={selectedCourses} institutions={institutions} report={report} compact />
    </View>
  );
}

function ParentScheduleView({
  students,
  courses,
  enrollments,
  institutions,
  onSelectStudent,
}: {
  students: StudentProfile[];
  courses: Course[];
  enrollments: CourseEnrollment[];
  institutions: Institution[];
  onSelectStudent: (studentId: string) => void;
}) {
  const items = enrollments
    .map((enrollment) => {
      const course = courses.find((item) => item.id === enrollment.courseId);
      const student = students.find((item) => item.id === enrollment.studentId);
      return course && student ? { enrollment, course, student } : null;
    })
    .filter(Boolean) as Array<{ enrollment: CourseEnrollment; course: Course; student: StudentProfile }>;

  return (
    <View style={screen.stack}>
      <SectionTitle eyebrow="Schedule" title="所有孩子的课程安排" />
      {items.map(({ course, student, enrollment }) => (
        <Pressable key={`${student.id}-${course.id}`} onPress={() => onSelectStudent(student.id)} style={({ pressed }) => [pressed && uiStyles.pressed]}>
          <Card>
            <View style={screen.cardHeader}>
              <View style={screen.fill}>
                <Text style={screen.cardTitle}>{student.name} · {course.name}</Text>
                <Text style={screen.subText}>{findInstitution(institutions, course).name}</Text>
              </View>
              <Pill color={enrollment.status === 'trial' ? colors.gold : colors.green}>{enrollment.status === 'trial' ? '试听' : '在读'}</Pill>
            </View>
            <View style={screen.infoGrid}>
              <InfoLine icon="time" text={course.time} />
              <InfoLine icon="location" text={course.location} />
              <InfoLine icon="person" text={course.teacher} />
            </View>
          </Card>
        </Pressable>
      ))}
    </View>
  );
}

function ParentChildDetail({
  student,
  courses,
  institutions,
  report,
  compact,
}: {
  student: StudentProfile;
  courses: Course[];
  institutions: Institution[];
  report: ReturnType<typeof buildDiagnostic>;
  compact?: boolean;
}) {
  return (
    <View style={screen.stack}>
      <SectionTitle eyebrow="Child Detail" title={`${student.name} 的详情`} />
      <Card tone="mint">
        <Text style={screen.largeTitle}>{student.name}</Text>
        <Text style={screen.bodyText}>{student.summary}</Text>
        <Text style={screen.caption}>家庭重点：{report.parentPlan[0].detail}</Text>
      </Card>
      {!compact ? (
        <View style={screen.metricsGrid}>
          <Metric label="综合均分" value={`${averageScore(student)}`} icon="pulse" color={colors.green} />
          <Metric label="课程数" value={`${courses.length}`} icon="albums" color={colors.blue} />
          <Metric label="资料更新" value={`${student.notes.length}`} icon="layers" color={colors.gold} />
        </View>
      ) : null}
      {courses.map((course) => (
        <Card key={course.id}>
          <Text style={screen.cardTitle}>{course.name}</Text>
          <Text style={screen.subText}>{findInstitution(institutions, course).name} · {course.teacher}</Text>
          <Text style={screen.caption}>{course.time} · {course.location}</Text>
          <Text style={screen.bodyText}>课后作业：{course.homework}</Text>
        </Card>
      ))}
    </View>
  );
}

function TeacherWorkspace({
  view,
  students,
  courses,
  institutions,
  selectedCourse,
  onSelectCourse,
  resources,
  teacherAssets,
  teachingRooms,
  report,
}: {
  view: ViewKey;
  students: StudentProfile[];
  courses: Course[];
  institutions: Institution[];
  selectedCourse: Course;
  onSelectCourse: (courseId: string) => void;
  resources: typeof seedResources;
  teacherAssets: typeof seedTeacherAssets;
  teachingRooms: typeof seedTeachingRooms;
  report: ReturnType<typeof buildDiagnostic>;
}) {
  if (view === 'automation') {
    return <TeacherAutomationView course={selectedCourse} students={students} onSelectCourse={onSelectCourse} courses={courses} institutions={institutions} />;
  }
  if (view === 'resources') {
    return <TeacherResourcesView resources={resources} teacherAssets={teacherAssets} teachingRooms={teachingRooms} />;
  }
  if (view === 'ai') {
    return <TeacherAiView course={selectedCourse} report={report} resources={resources} />;
  }
  return (
    <View style={screen.stack}>
      <SectionTitle eyebrow="Courses" title="课程安排" />
      <View style={screen.metricsGrid}>
        <Metric label="开设课程" value={`${courses.length}`} icon="calendar" color={colors.blue} />
        <Metric label="今日学生" value={`${courses.reduce((sum, item) => sum + item.enrolled, 0)}`} icon="people" color={colors.green} />
        <Metric label="事项完成" value={`${completionOf(courses.flatMap((item) => item.automations))}%`} icon="flash" color={colors.gold} />
      </View>
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          institution={findInstitution(institutions, course)}
          active={course.id === selectedCourse.id}
          onPress={() => onSelectCourse(course.id)}
        />
      ))}
      <TeacherCourseDetail course={selectedCourse} students={students} institutions={institutions} />
    </View>
  );
}

function TeacherCourseDetail({ course, students, institutions }: { course: Course; students: StudentProfile[]; institutions: Institution[] }) {
  const institution = findInstitution(institutions, course);
  return (
    <View style={screen.stack}>
      <SectionTitle eyebrow="Selected Course" title="课程详情" />
      <Card tone="blue">
        <Text style={screen.largeTitle}>{course.name}</Text>
        <Text style={screen.subText}>{institution.name} · {course.teacher}</Text>
        <View style={screen.infoGrid}>
          <InfoLine icon="time" text={course.time} />
          <InfoLine icon="location" text={course.location} />
          <InfoLine icon="people" text={`${course.enrolled}/${course.capacity} 人`} />
        </View>
      </Card>
      <Card>
        <Text style={screen.cardTitle}>本节课重点</Text>
        <Text style={screen.bodyText}>{course.nextLesson}</Text>
      </Card>
      <Card>
        <Text style={screen.cardTitle}>学生名单</Text>
        {course.studentIds.map((studentId) => {
          const student = students.find((item) => item.id === studentId);
          const feedback = course.feedback.find((item) => item.studentId === studentId);
          return student ? (
            <View key={student.id} style={screen.listLine}>
              <Text style={screen.bodyText}>{student.name}</Text>
              <Pill color={feedback?.status === 'done' ? colors.green : feedback?.status === 'draft' ? colors.gold : colors.rose}>
                {feedback?.status === 'done' ? '反馈完成' : feedback?.status === 'draft' ? '草稿' : '待反馈'}
              </Pill>
            </View>
          ) : null;
        })}
      </Card>
    </View>
  );
}

function TeacherAutomationView({
  course,
  courses,
  institutions,
  students,
  onSelectCourse,
}: {
  course: Course;
  courses: Course[];
  institutions: Institution[];
  students: StudentProfile[];
  onSelectCourse: (courseId: string) => void;
}) {
  return (
    <View style={screen.stack}>
      <SectionTitle eyebrow="Automation" title="课前课后事项" />
      <View style={screen.stack}>
        {courses.map((item) => (
          <CourseCard key={item.id} course={item} institution={findInstitution(institutions, item)} active={item.id === course.id} onPress={() => onSelectCourse(item.id)} />
        ))}
      </View>
      <SectionTitle eyebrow="Pre Class" title="课前事项" />
      {course.automations.filter((item) => item.timing === 'pre-class').map((item) => (
        <AutomationRow key={item.key} item={item} />
      ))}
      <SectionTitle eyebrow="Post Class" title="课后事项" />
      {course.automations.filter((item) => item.timing === 'post-class').map((item) => (
        <AutomationRow key={item.key} item={item} />
      ))}
      <SectionTitle eyebrow="Feedback" title="学生课后反馈" />
      {course.feedback.map((item) => {
        const student = students.find((target) => target.id === item.studentId);
        return student ? (
          <Card key={item.studentId}>
            <View style={screen.cardHeader}>
              <Text style={screen.cardTitle}>{student.name}</Text>
              <Pill color={item.status === 'done' ? colors.green : item.status === 'draft' ? colors.gold : colors.rose}>
                {item.status === 'done' ? '完成' : item.status === 'draft' ? '草稿' : '待完成'}
              </Pill>
            </View>
            <Text style={screen.bodyText}>{item.note}</Text>
          </Card>
        ) : null;
      })}
    </View>
  );
}

function AutomationRow({ item }: { item: CourseAutomationItem }) {
  const percent = Math.round((item.done / item.total) * 100);
  return (
    <Card>
      <View style={screen.cardHeader}>
        <View style={screen.fill}>
          <Text style={screen.cardTitle}>{item.title}</Text>
          <Text style={screen.subText}>{item.owner === 'system' ? '系统自动发送' : '老师确认'} · {item.done}/{item.total}</Text>
        </View>
        <Pill color={percent === 100 ? colors.green : percent >= 70 ? colors.blue : colors.gold}>{percent}%</Pill>
      </View>
      <ProgressBar value={item.done} target={item.total} color={percent === 100 ? colors.green : colors.blue} />
    </Card>
  );
}

function TeacherResourcesView({
  resources,
  teacherAssets,
  teachingRooms,
}: {
  resources: typeof seedResources;
  teacherAssets: typeof seedTeacherAssets;
  teachingRooms: typeof seedTeachingRooms;
}) {
  return (
    <View style={screen.stack}>
      <SectionTitle eyebrow="Resources" title="课程与教室资源" />
      <View style={screen.metricsGrid}>
        <Metric label="课程资料" value={`${teacherAssets.length}`} icon="library" color={colors.blue} />
        <Metric label="教室" value={`${teachingRooms.length}`} icon="business" color={colors.green} />
        <Metric label="题库" value={`${resources.length}`} icon="folder-open" color={colors.gold} />
      </View>
      <SectionTitle eyebrow="Assets" title="课程资料" />
      {teacherAssets.map((item) => (
        <Card key={item.id}>
          <View style={screen.cardHeader}>
            <Text style={screen.cardTitle}>{item.title}</Text>
            <Pill color={item.status === 'ready' ? colors.green : item.status === 'review' ? colors.gold : colors.faint}>
              {item.status === 'ready' ? '可用' : item.status === 'review' ? '复核' : '草稿'}
            </Pill>
          </View>
          <Text style={screen.caption}>{item.nextAction}</Text>
        </Card>
      ))}
      <SectionTitle eyebrow="Rooms" title="教室资源" />
      {teachingRooms.map((room) => (
        <Card key={room.id}>
          <View style={screen.cardHeader}>
            <View>
              <Text style={screen.cardTitle}>{room.name}</Text>
              <Text style={screen.subText}>{room.type === 'online' ? '线上' : '线下'} · {room.occupancy}/{room.capacity} 人</Text>
            </View>
            <Pill color={room.status === 'available' ? colors.green : colors.blue}>{room.status === 'available' ? '可预约' : '已占用'}</Pill>
          </View>
          <Text style={screen.bodyText}>{room.schedule}</Text>
        </Card>
      ))}
    </View>
  );
}

function TeacherAiView({ course, report, resources }: { course: Course; report: ReturnType<typeof buildDiagnostic>; resources: typeof seedResources }) {
  return (
    <View style={screen.stack}>
      <SectionTitle eyebrow="AI" title="按课程生成教学支持" />
      <Card tone="blue">
        <Text style={screen.largeTitle}>{course.name}</Text>
        <Text style={screen.bodyText}>{report.headline}</Text>
        <Text style={screen.caption}>可引用资料：{resources.filter((item) => item.subject === course.subject).length} 份</Text>
      </Card>
      {report.teacherPlan.map((item) => (
        <Card key={item.title}>
          <View style={screen.cardHeader}>
            <Text style={screen.cardTitle}>{item.title}</Text>
            <Text style={screen.caption}>{item.cadence}</Text>
          </View>
          <Text style={screen.bodyText}>{item.detail}</Text>
        </Card>
      ))}
    </View>
  );
}

function TaskRow({ icon, title, detail, done }: { icon: React.ComponentProps<typeof Icon>['name']; title: string; detail: string; done: boolean }) {
  return (
    <View style={screen.taskRow}>
      <Icon name={done ? 'checkmark-circle' : icon} color={done ? colors.green : colors.blue} />
      <View style={screen.fill}>
        <Text style={screen.cardTitle}>{title}</Text>
        <Text style={screen.subText}>{detail}</Text>
      </View>
    </View>
  );
}

function InfoLine({ icon, text }: { icon: React.ComponentProps<typeof Icon>['name']; text: string }) {
  return (
    <View style={screen.infoLine}>
      <Icon name={icon} color={colors.faint} size={15} />
      <Text style={screen.caption}>{text}</Text>
    </View>
  );
}

const screen = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.grouped,
    alignItems: 'center',
  },
  shell: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.grouped,
  },
  content: {
    padding: 16,
    paddingBottom: 34,
  },
  header: {
    gap: 14,
    marginBottom: 8,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    color: colors.blue,
    fontSize: 16,
    fontWeight: '700',
  },
  pageTitle: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  pageSub: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  identityHero: {
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: 10,
  },
  appIcon: {
    width: 54,
    height: 54,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
  },
  identityTitle: {
    color: colors.ink,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
  },
  identitySub: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  moduleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modulePill: {
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: colors.surface,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modulePillText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stack: {
    gap: 10,
  },
  stackSmall: {
    gap: 7,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fill: {
    flex: 1,
  },
  symbol: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },
  largeTitle: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '900',
  },
  bodyText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  subText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  caption: {
    color: colors.faint,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  infoGrid: {
    gap: 6,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    paddingVertical: 4,
  },
  option: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: colors.secondary,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  optionText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
  },
  avatarText: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '900',
  },
  listLine: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
});
