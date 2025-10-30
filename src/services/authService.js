// Flora Veiling API 服务
const API_BASE_URL = 'http://localhost:5000/api';

class AuthService {
  /**
   * 用户注册
   * @param {Object} registerData - 注册数据
   * @returns {Promise<Object>} - 注册结果
   */
  async register(registerData) {
    try {
      console.log('📤 发送注册请求:', registerData);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountType: registerData.accountType,
          email: registerData.email || '',
          bedrijfsnaam: registerData.bedrijfsnaam || '',
          kvkNummer: registerData.kvkNummer || '',
          bedrijfsadres: registerData.bedrijfsadres || '',
          iban: registerData.iban || '',
          gebruikersnaam: registerData.gebruikersnaam || '',
          wachtwoord: registerData.wachtwoord,
          bevestigWachtwoord: registerData.bevestigWachtwoord,
        }),
      });

      console.log('📥 响应状态:', response.status, response.statusText);
      
      // 无论状态码如何，都尝试解析 JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON解析失败:', jsonError);
        return {
          success: false,
          message: 'Server antwoordde met ongeldig formaat',
        };
      }

      console.log('📥 响应数据:', data);

      // 检查HTTP状态码
      if (!response.ok) {
        // HTTP 错误（4xx, 5xx）
        return {
          success: false,
          message: data.message || `HTTP Fout ${response.status}: ${response.statusText}`,
        };
      }

      // 检查业务逻辑是否成功
      if (data.success) {
        // 保存 token 到 localStorage
        this.setToken(data.token);
        // 保存用户信息
        this.setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error(' Registratiefout:', error);
      return {
        success: false,
        message: 'Netwerkfout, probeer het later opnieuw',
      };
    }
  }

  /**
   * 用户登录
   * @param {string} emailOrUsername - 邮箱或用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} - 登录结果
   */
  async login(emailOrUsername, password) {
    try {
      console.log('📤 发送登录请求:', { emailOrUsername });
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername: emailOrUsername,
          password: password,
        }),
      });

      console.log('📥 响应状态:', response.status, response.statusText);

      // 无论状态码如何，都尝试解析 JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON解析失败:', jsonError);
        return {
          success: false,
          message: 'Server antwoordde met ongeldig formaat',
        };
      }

      console.log('📥 响应数据:', data);

      // 检查HTTP状态码
      if (!response.ok) {
        // HTTP 错误（4xx, 5xx）
        return {
          success: false,
          message: data.message || `HTTP Fout ${response.status}: ${response.statusText}`,
        };
      }

      // 检查业务逻辑是否成功
      if (data.success) {
        // 保存 token 到 localStorage
        this.setToken(data.token);
        // 保存用户信息
        this.setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error(' Inlogfout:', error);
      return {
        success: false,
        message: 'Netwerkfout, probeer het later opnieuw',
      };
    }
  }

  /**
   * 用户登出
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '#home';
  }

  /**
   * 检查用户是否存在
   * @param {string} emailOrUsername - 邮箱或用户名
   * @returns {Promise<boolean>} - 是否存在
   */
  async userExists(emailOrUsername) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/exists?emailOrUsername=${encodeURIComponent(emailOrUsername)}`
      );
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Controleer gebruiker fout:', error);
      return false;
    }
  }

  /**
   * 获取当前用户信息
   * @returns {Object|null} - 用户信息
   */
  getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * 检查是否已登录
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * 获取 Token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * 保存 Token
   * @param {string} token
   */
  setToken(token) {
    localStorage.setItem('token', token);
  }

  /**
   * 保存用户信息
   * @param {Object} user
   */
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * 发送带认证的请求
   * @param {string} url - 请求地址
   * @param {Object} options - fetch 选项
   * @returns {Promise<Response>}
   */
  async fetchWithAuth(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('Niet ingelogd');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    return fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });
  }
}

// 导出单例
export default new AuthService();

