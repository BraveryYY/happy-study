# 开心学

面向 K12 教培场景的 Expo / React Native iOS App 原型。老师、家长、学生使用同一个 App，一级页面只做身份选择，进入后打开各自独立的二级工作台。

## 已覆盖能力

- 一级身份选择页：老师、家长、学生分别进入独立二级页面
- 学生视角以课程为主线：一个学生可报名多门课，课程可来自不同培训机构
- 家长视角以孩子为主线：支持多个孩子、全家总课表、单个孩子详情页
- 老师视角以课程为主线：按课程查看时间、地点、人数和课前/课后自动化事项
- 课程自动化事项：家长提醒、学生提醒、课前预习、课后作业、复习资料、逐个学生课后反馈
- 独立老师资源管理：课程/讲义/测评/服务包、线上/线下教室、公共资料库统一管理
- 学生个人资料库：基础画像、目标、习惯、三方观察、自定义字段共同维护
- 老师公共资料库：按学科维护概念、题组、试卷和标签
- AI 接入配置：Provider、Model、Endpoint、个人资料库/公共资料库开关、本地优先/云端增强模式
- AI 学情诊断：基于学生资料库和公共资料库生成查漏补缺优先级
- 三方提升计划书：分别给学生、家长、老师生成行动计划
- 针对性强化训练：根据诊断卡点出题，答题结果回写资料库
- 班级互动：老师创建班级、学生/家长加入班级、打卡、徽章、学习气氛榜、互动墙

## 本地运行

```bash
npm install
npm run ios
```

Web 预览：

```bash
npm run web
```

线上预览：

[https://braveryyy.github.io/happy-study/](https://braveryyy.github.io/happy-study/)

GitHub Pages 已配置为通过 GitHub Actions 自动发布。当前分支 `codex/k12-ios-app` 推送后，会自动执行类型检查、导出 Web 静态产物，并部署最新页面；这套 workflow 合入 `main` 后，`main` 的后续推送也会自动更新 Pages。

静态构建与预览：

```bash
npm run build:web
npm run preview
```

打开 `http://localhost:4173`。

## 质量检查

```bash
npm run typecheck
```

## 代码结构

- `App.tsx`：角色流、页面模块和交互状态
- `src/domain.ts`：学生资料、公共资料库、班级数据模型和 AI 诊断生成逻辑
- `src/ui.tsx`：移动端通用 UI 组件与设计令牌

当前 AI 能力为本地模拟诊断逻辑，已预留自定义 Provider / Model / Endpoint 配置位，后续可替换 `src/domain.ts` 中的 `buildDiagnostic` 为真实 API 调用。
