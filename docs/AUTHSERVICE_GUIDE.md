# 📖 authService.js 使用指南

## 📄 文件信息

**路径**: `src/services/authService.js`  
**大小**: 184 行  
**类型**: JavaScript ES6 类  
**模式**: 单例模式

---

## 🎯 核心作用

`authService.js` 是 Flora Veiling 前端应用中的 **认证服务层**，负责处理所有与用户身份验证相关的操作。

### 主要职责

1. **前后端通信桥梁** - 封装所有与后端 API 的认证相关请求
2. **Token 管理** - 自动处理 JWT Token 的存储、获取和使用
3. **用户状态管理** - 管理用户登录状态和信息
4. **统一错误处理** - 提供一致的错误处理机制

---

## 🏗️ 架构设计

### 设计模式

```
┌─────────────────┐
│  React 组件层   │  (Register.js, Login.js)
└────────┬────────┘
         │ 调用
         ▼
┌─────────────────┐
│ authService.js  │  ← 本文件
│   (服务层)      │
└────────┬────────┘
         │ HTTP 请求
         ▼
┌─────────────────┐
│   后端 API      │  (C# ASP.NET Core)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   数据库        │  (SQLite)
└─────────────────┘
```

### 为什么需要服务层？

#### ❌ 没有服务层（不推荐）

```javascript
// Register.js - 组件中直接写 API 调用
const handleSubmit = async () => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  // 每个组件都要写一遍！
};
```

**问题**:
- 代码重复
- 难以维护
- API 变更需要修改多处
- 没有统一的错误处理

#### ✅ 有服务层（推荐）

```javascript
// Register.js - 简洁明了
const handleSubmit = async () => {
  const result = await authService.register(formData);
  if (result.success) {
    // 处理成功逻辑
  }
};
```

**优点**:
- 代码复用
- 集中管理
- 易于维护
- 统一错误处理

---

## 📚 API 参考

### 配置

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

| 环境 | API 地址示例 |
|------|-------------|
| 本地开发 | `http://localhost:5000/api` |
| 局域网 | `http://192.168.1.100:5000/api` |
| 生产环境 | `https://api.floraveiling.com/api` |

---

### 方法列表

#### 1. register(registerData)

**用途**: 用户注册

**参数**:
```javascript
{
  accountType: 'Koper' | 'Aanvoerder' | 'Veilingmeester',
  email: string,              // Koper/Aanvoerder 必填
  bedrijfsnaam: string,       // Koper/Aanvoerder 必填
  kvkNummer: string,          // Koper/Aanvoerder 必填
  bedrijfsadres: string,      // Koper/Aanvoerder 必填
  iban: string,               // Aanvoerder 必填
  gebruikersnaam: string,     // Veilingmeester 必填
  wachtwoord: string,         // 所有角色必填
  bevestigWachtwoord: string  // 所有角色必填
}
```

**返回值**:
```javascript
{
  success: boolean,
  message: string,
  token?: string,
  user?: {
    id: number,
    accountType: string,
    bedrijfsnaam: string,
    email: string,
    gebruikersnaam: string,
    isEmailVerified: boolean
  }
}
```

**示例**:
```javascript
const result = await authService.register({
  accountType: 'Koper',
  email: 'buyer@example.com',
  bedrijfsnaam: 'Bloemen BV',
  kvkNummer: '12345678',
  bedrijfsadres: 'Amsterdam, NL',
  wachtwoord: 'secure123',
  bevestigWachtwoord: 'secure123'
});

if (result.success) {
  console.log('注册成功！用户ID:', result.user.id);
  // Token 和用户信息已自动保存到 localStorage
}
```

---

#### 2. login(emailOrUsername, password)

**用途**: 用户登录

**参数**:
- `emailOrUsername` (string): 邮箱或用户名
- `password` (string): 密码

**返回值**: 同 `register()`

**示例**:
```javascript
const result = await authService.login('buyer@example.com', 'secure123');

if (result.success) {
  console.log('登录成功！Token:', result.token);
  // 自动跳转或更新 UI
}
```

---

#### 3. logout()

**用途**: 用户登出

**参数**: 无

**返回值**: 无

**功能**:
- 清除 localStorage 中的 token
- 清除 localStorage 中的 user
- 跳转到首页 (#home)

**示例**:
```javascript
authService.logout();
// 用户已登出，页面跳转到首页
```

---

#### 4. userExists(emailOrUsername)

**用途**: 检查用户是否已存在（用于注册前验证）

**参数**:
- `emailOrUsername` (string): 要检查的邮箱或用户名

**返回值**: `Promise<boolean>`

**示例**:
```javascript
const exists = await authService.userExists('test@example.com');

if (exists) {
  alert('该邮箱已被注册');
} else {
  // 可以继续注册
}
```

---

#### 5. getCurrentUser()

**用途**: 获取当前登录用户的信息

**参数**: 无

**返回值**: `Object | null`

**返回对象**:
```javascript
{
  id: 1,
  accountType: 'Koper',
  bedrijfsnaam: 'Bloemen BV',
  email: 'buyer@example.com',
  gebruikersnaam: null,
  isEmailVerified: false
}
```

**示例**:
```javascript
const user = authService.getCurrentUser();

if (user) {
  console.log(`欢迎，${user.bedrijfsnaam}！`);
  console.log(`您的角色是：${user.accountType}`);
} else {
  console.log('用户未登录');
}
```

---

#### 6. isAuthenticated()

**用途**: 检查用户是否已登录

**参数**: 无

**返回值**: `boolean`

**示例**:
```javascript
if (authService.isAuthenticated()) {
  // 显示用户菜单
  showUserMenu();
} else {
  // 显示登录按钮
  showLoginButton();
}
```

---

#### 7. getToken()

**用途**: 获取当前的 JWT Token

**参数**: 无

**返回值**: `string | null`

**示例**:
```javascript
const token = authService.getToken();
console.log('当前 Token:', token);
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### 8. setToken(token)

**用途**: 手动设置 JWT Token（通常不需要直接调用）

**参数**:
- `token` (string): JWT Token 字符串

**返回值**: 无

---

#### 9. setUser(user)

**用途**: 手动设置用户信息（通常不需要直接调用）

**参数**:
- `user` (Object): 用户信息对象

**返回值**: 无

---

#### 10. fetchWithAuth(url, options)

**用途**: 发送需要身份验证的 HTTP 请求（自动添加 Token）

**参数**:
- `url` (string): API 路径（不包含基础 URL）
- `options` (Object): fetch 选项（可选）

**返回值**: `Promise<Response>`

**示例**:
```javascript
// 调用需要认证的 API
const response = await authService.fetchWithAuth('/auction/place-bid', {
  method: 'POST',
  body: JSON.stringify({ auctionId: 123, amount: 50.00 })
});

const data = await response.json();
console.log('出价结果:', data);
```

**自动添加的请求头**:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

---

## 💾 数据存储

### localStorage 使用

`authService` 使用浏览器的 `localStorage` 存储数据：

| Key | 内容 | 示例 |
|-----|------|------|
| `token` | JWT Token 字符串 | `eyJhbGciOiJIUzI1Ni...` |
| `user` | 用户信息（JSON 字符串） | `{"id":1,"email":"test@example.com"...}` |

### 查看存储的数据

**方法 1: 浏览器开发工具**
1. 按 F12 打开开发工具
2. 切换到 `Application` 标签
3. 左侧选择 `Local Storage` → `http://localhost:3000`
4. 查看 `token` 和 `user`

**方法 2: JavaScript 控制台**
```javascript
// 查看 Token
console.log(localStorage.getItem('token'));

// 查看用户信息
console.log(JSON.parse(localStorage.getItem('user')));
```

---

## 🔄 完整工作流程

### 用户注册流程

```
1. 用户在 Register.js 填写表单
          ↓
2. 点击"Aanmelden"按钮
          ↓
3. 调用 authService.register(formData)
          ↓
4. authService 发送 POST 请求到后端
   URL: http://localhost:5000/api/auth/register
          ↓
5. 后端验证数据并创建用户
          ↓
6. 后端返回 JWT Token 和用户信息
          ↓
7. authService 自动保存 Token 和用户信息到 localStorage
          ↓
8. 返回结果给 Register.js 组件
          ↓
9. 组件显示成功消息并跳转到首页
```

### 用户登录流程

```
1. 用户在 Login.js 输入邮箱/用户名和密码
          ↓
2. 点击"Inloggen"按钮
          ↓
3. 调用 authService.login(email, password)
          ↓
4. authService 发送 POST 请求到后端
   URL: http://localhost:5000/api/auth/login
          ↓
5. 后端验证用户凭证
          ↓
6. 后端返回 JWT Token 和用户信息
          ↓
7. authService 自动保存 Token 和用户信息
          ↓
8. 返回结果给 Login.js 组件
          ↓
9. 组件显示成功消息并跳转到首页
```

---

## 📝 实际使用示例

### 示例 1: 在 Register.js 中使用

```javascript
import authService from '../services/authService';

function Register() {
  const [formData, setFormData] = useState({...});
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 调用注册服务
    const result = await authService.register(formData);
    
    if (result.success) {
      alert('注册成功！');
      window.location.href = '#home';
    } else {
      setError(result.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
      {error && <div className="error">{error}</div>}
      <button type="submit">注册</button>
    </form>
  );
}
```

### 示例 2: 在 Navbar.js 中检查登录状态

```javascript
import authService from '../services/authService';

function Navbar() {
  const isLoggedIn = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  const handleLogout = () => {
    authService.logout();
  };
  
  return (
    <nav>
      {isLoggedIn ? (
        <>
          <span>欢迎，{currentUser.bedrijfsnaam}</span>
          <button onClick={handleLogout}>登出</button>
        </>
      ) : (
        <>
          <a href="#login">登录</a>
          <a href="#register">注册</a>
        </>
      )}
    </nav>
  );
}
```

### 示例 3: 保护路由（需要登录才能访问）

```javascript
import authService from '../services/authService';

function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    // 未登录，跳转到登录页
    window.location.href = '#login';
    return null;
  }
  
  // 已登录，显示内容
  return children;
}

// 使用
<ProtectedRoute>
  <AuctionPage />
</ProtectedRoute>
```

### 示例 4: 调用需要认证的 API

```javascript
import authService from '../services/authService';

async function placeBid(auctionId, amount) {
  try {
    const response = await authService.fetchWithAuth('/auction/bid', {
      method: 'POST',
      body: JSON.stringify({ auctionId, amount })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('出价成功！');
    } else {
      alert('出价失败：' + result.message);
    }
  } catch (error) {
    console.error('出价错误:', error);
    alert('网络错误，请重试');
  }
}
```

---

## 🔐 安全性说明

### Token 安全

1. **存储位置**: localStorage
   - 优点：简单、持久化
   - 缺点：容易受 XSS 攻击

2. **Token 过期**: 24 小时（后端配置）
   - Token 过期后需要重新登录

3. **Token 格式**: JWT (JSON Web Token)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
   eyJzdWIiOiIxIiwiYWNjb3VudFR5cGUiOiJLb3BlciIsImlhdCI6MTcwMDAwMDAwMH0.
   signature_here
   ```

### 最佳实践

✅ **推荐**:
- 使用 HTTPS（生产环境）
- 定期刷新 Token
- 实施 Token 过期机制
- 敏感操作二次验证

❌ **避免**:
- 在 URL 中传递 Token
- 在日志中打印 Token
- 长期有效的 Token

---

## 🐛 错误处理

### 网络错误

```javascript
try {
  const result = await authService.login(email, password);
} catch (error) {
  // authService 已经处理了错误
  // 返回统一的错误响应
  console.log(result.message); // "Netwerkfout, probeer het later opnieuw"
}
```

### 常见错误

| 错误类型 | 原因 | 解决方案 |
|---------|------|---------|
| 网络错误 | 后端未启动 | 启动后端服务 |
| 401 Unauthorized | Token 无效或过期 | 重新登录 |
| 400 Bad Request | 请求数据格式错误 | 检查输入数据 |
| 500 Server Error | 后端服务器错误 | 检查后端日志 |

---

## 🔧 配置和自定义

### 更改 API 地址

```javascript
// src/services/authService.js 第 2 行
const API_BASE_URL = 'https://your-api-domain.com/api';
```

### 添加自定义方法

```javascript
class AuthService {
  // 现有方法...
  
  // 添加新方法：修改密码
  async changePassword(oldPassword, newPassword) {
    return await this.fetchWithAuth('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  }
  
  // 添加新方法：发送验证邮件
  async sendVerificationEmail() {
    return await this.fetchWithAuth('/auth/send-verification');
  }
}
```

---

## 📊 性能考虑

### 优化建议

1. **Token 缓存**: Token 已存储在内存中，避免频繁读取 localStorage
2. **请求合并**: 避免短时间内多次调用同一 API
3. **错误重试**: 网络错误时可以实施重试机制

### 示例：添加请求缓存

```javascript
class AuthService {
  constructor() {
    this._cachedUser = null;
  }
  
  getCurrentUser() {
    // 优化：使用缓存
    if (this._cachedUser) {
      return this._cachedUser;
    }
    
    const userJson = localStorage.getItem('user');
    this._cachedUser = userJson ? JSON.parse(userJson) : null;
    return this._cachedUser;
  }
  
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    this._cachedUser = user; // 更新缓存
  }
}
```

---

## 🧪 测试

### 单元测试示例

```javascript
// authService.test.js
import authService from './authService';

describe('AuthService', () => {
  test('getCurrentUser 应该返回存储的用户', () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    const user = authService.getCurrentUser();
    expect(user).toEqual(mockUser);
  });
  
  test('isAuthenticated 应该在有 token 时返回 true', () => {
    localStorage.setItem('token', 'mock-token');
    expect(authService.isAuthenticated()).toBe(true);
  });
  
  test('logout 应该清除所有数据', () => {
    authService.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
```

---

## 🆘 常见问题

### Q: Token 存储在 localStorage 安全吗？

**A**: 
- 对于大多数应用足够安全
- 生产环境建议使用 HTTPS
- 可以考虑改用 httpOnly Cookie（需要后端支持）

### Q: 如何刷新 Token？

**A**: 
- 当前实现：Token 过期后需要重新登录
- 改进方案：实施 Refresh Token 机制

### Q: 为什么使用单例模式？

**A**: 
- 确保整个应用共享同一个实例
- 避免重复创建对象
- 统一管理状态

### Q: 可以在多个标签页之间共享登录状态吗？

**A**: 
- 可以，因为使用了 localStorage
- 多个标签页自动共享相同的存储
- 可以监听 storage 事件实现实时同步

---

## 📚 相关文档

- [SETUP.md](../SETUP.md) - 项目安装指南
- [QUICK_START.md](../QUICK_START.md) - 快速开始
- [DEPLOYMENT.md](../DEPLOYMENT.md) - 部署指南
- [backend/README.md](../backend/README.md) - 后端 API 文档

---

## 📝 总结

`authService.js` 是 Flora Veiling 应用的**核心认证服务**：

✅ 封装所有认证相关的 API 调用  
✅ 自动管理 JWT Token  
✅ 提供统一的错误处理  
✅ 简化组件代码  
✅ 易于维护和扩展  

这是 React 应用开发的**最佳实践**，将业务逻辑与 UI 层分离，使代码更加专业和可维护。

---

**最后更新**: 2025-10-28  
**版本**: 1.0.0  
**作者**: Flora Veiling Development Team

