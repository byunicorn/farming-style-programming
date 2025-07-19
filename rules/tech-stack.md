# 开发准则
## 1. 代码块格式规范
✅ **格式要求**：文件路径注释（//开头）+ 代码内容
✅ **type类型**：create、edit、delete、depInfo、plain、aipa-db-collection
✅ **基础文件**：必须包含 /App.tsx 和 /index.tsx
✅ **文件路径**：去掉"//"前缀和空格后就是实际路径
✅ **单文件原则**：一个代码块只能描述一个文件

## 2. 依赖管理 (depInfo.json)
✅ **必须声明所有依赖**：一个都不能少，包括子路径
✅ **路由库**：必须使用 HashRouter，不用 BrowserRouter
✅ **推荐库**：
   - 图表：recharts
   - 动画：framer-motion ≥11.9
   - 图标：lucide-react@0.294.0 或 react-icons@4.11.0
   - 工具函数：lodash-es（非lodash）
   - 3D：three（不用react-three系列）
   - 状态管理：原生hook或jotai
   - toast：react-hot-toast
✅ **黑名单**：@react-three/fiber、@heroicons/react、shadcn相关、formily相关、@douyinfe/semi-illustration
✅ **版本锁定**：react-confetti@^5.1.0

## 3. 服务端开发规范
✅ **技术栈**：Hono + TypeScript
✅ **路由前缀**：所有路由必须加 `/api` 前缀
✅ **客户端请求**：使用 `${process.env.API_DOMAIN}/api/xxx`，不加协议前缀
✅ **全局变量**：可直接使用 db、mongo、fetch，不能import mongodb
✅ **依赖限制**：只能使用 hono、@hono/zod-validator、zod
✅ **入口文件**：/api/health 健康检查，导出 rootApp
✅ **MongoDB版本**：v3.6 API规范
✅ **表名规则**：代码中使用 rawName（带 6cc43af3_ 前缀）

## 4. 数据库设计规范
✅ **表设计**：必须用 db-collection 代码块预先声明
✅ **默认字段**：_id、createdAt、updatedAt 自动包含
✅ **关联表**：association=true 的外部表不可随意修改
✅ **安全性**：避免SQL注入、死循环、信息泄露
✅ **错误处理**：必须返回 error.message 给前端

## 5. 组件架构要求
✅ **模块化结构**：每个组件一个文件夹
✅ **文件职责**：
   - index.tsx：UI渲染和交互触发
   - xxxState{Feature}.ts：状态管理逻辑
   - xxxRequest{Feature}.ts：副作用逻辑
   - xxxUtilities{Feature}.ts：工具函数
✅ **生成顺序**：子文件 → 主文件
✅ **全局状态**：使用 jotai，避免 props drilling
✅ **代码限制**：单文件不超过300行

## 6. UI样式规范
✅ **CSS方案**：优先 Tailwind CSS，不用 @apply、@tailwind 指令
✅ **布局限制**：不使用 grid 布局（如 grid-cols）
✅ **动画要求**：丝滑流畅的过渡动画
✅ **组件库支持**：
   - antd@5.10.0
   - nextui@2.4.8：用onPress替代onClick，用具名导入
   - 默认：@headlessui/react
✅ **设计稿还原**：不遗漏任何UI元素，完整还原所有数据

## 7. 开发偏好与限制
✅ **useEffect限制**：尽量避免，用事件回调替代
✅ **状态管理**：大量使用 jotai atom
✅ **Modal策略**：列表场景用全局Modal
✅ **import限制**：禁止动态import，只用静态import
✅ **App.tsx**：必须存在的入口文件
✅ **增量更新**：用注释表示已有代码，最小化改动

## 8. 错误处理与FAQ
✅ **依赖错误**：检查depInfo中是否缺少声明
✅ **JSX错误**：检查标签闭合和文件后缀
✅ **MongoDB错误**：移除mongo变量import
✅ **React错误**：更换第三方库或自行实现
✅ **前端交互**：使用SWR缓存和Optimistic UI

## 9. 特殊规则
✅ **文件完整性**：不出现找不到文件的import
✅ **现有功能检查**：已实现的功能直接告知，不重复实现
✅ **目录结构**：严格遵循用户指定的结构
✅ **主题配色**：通过 window.tailwind 声明防止不生效
