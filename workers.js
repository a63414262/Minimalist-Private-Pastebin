// ==================== 基础配置 ====================
// 是否开启“访问必须输入密码”功能？(true: 开启私有模式, false: 关闭)
const ENABLE_PASSWORD_PROTECTION = true; 

// 你的专属访问和管理密钥 (保持硬编码)
const ADMIN_TOKEN = "xiaok_secret_token_2026"; 
// ==================================================

// 生成随机的短链接 ID
function generateRandomId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 1. 主页 HTML 模板 (包含创建界面的“复制链接”功能)
const indexHtmlPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>极简剪贴板</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem 1rem; background: #f9fafb; color: #111827; }
    #login-section { text-align: center; margin-top: 15vh; }
    #login-section input { padding: 0.75rem; width: 100%; max-width: 300px; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-bottom: 1rem; font-size: 1rem; text-align: center; }
    #login-section button { padding: 0.75rem 2rem; background: #1f2937; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 1rem; font-weight: bold; }
    #login-section button:hover { background: #111827; }
    #app-section { display: none; }
    textarea { width: 100%; height: 300px; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; margin-bottom: 1rem; font-family: monospace; resize: vertical; box-sizing: border-box; }
    .controls { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: center; }
    .controls input, .controls select, .controls button { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
    .controls button { background: #3b82f6; color: white; border: none; cursor: pointer; font-weight: 600; }
    .controls button:hover { background: #2563eb; }
    #result { margin-top: 1rem; padding: 1rem; background: #d1fae5; border-radius: 0.5rem; display: none; word-break: break-all; }
    .copy-btn { padding: 0.25rem 0.5rem; background: #10b981; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.85rem; margin-left: 10px; }
    .copy-btn:hover { background: #059669; }
  </style>
</head>
<body>
  <div id="login-section">
    <h2>🔒 剪贴板控制台</h2>
    <p style="color: #6b7280; margin-bottom: 2rem;">请输入验证密码以继续</p>
    <input type="password" id="access-password" placeholder="输入密码" onkeypress="if(event.key === 'Enter') enterApp()" />
    <br><button onclick="enterApp()">进 入</button>
  </div>

  <div id="app-section">
    <h1>📝 极简剪贴板</h1>
    <p>粘贴你的文本，生成链接分享给他人。</p>
    <textarea id="content" placeholder="在此处粘贴你的文本或代码..."></textarea>
    <div class="controls">
      <select id="urlType" onchange="toggleCustomInput()">
        <option value="short">短随机链接 (6位)</option>
        <option value="long">长随机链接 (22位)</option>
        <option value="custom">自定义后缀</option>
      </select>
      <input type="text" id="customAlias" placeholder="输入自定义后缀" style="display: none;" />
      <select id="expiration">
        <option value="never">永久保存</option>
        <option value="60">1 分钟后删除</option>
        <option value="3600">1 小时后删除</option>
        <option value="86400">1 天后删除</option>
        <option value="604800">1 周后删除</option>
      </select>
      <button onclick="submitPaste()">生成分享链接</button>
    </div>
    <div id="result"></div>
  </div>

  <script>
    const isPasswordRequired = ${ENABLE_PASSWORD_PROTECTION};
    let sessionPassword = "";

    window.onload = function() {
      if (!isPasswordRequired) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('app-section').style.display = 'block';
      }
    };

    function enterApp() {
      const pwdInput = document.getElementById('access-password').value;
      if (!pwdInput) { alert("请输入密码！"); return; }
      sessionPassword = pwdInput;
      document.getElementById('login-section').style.display = 'none';
      document.getElementById('app-section').style.display = 'block';
    }

    function toggleCustomInput() {
      const type = document.getElementById('urlType').value;
      document.getElementById('customAlias').style.display = type === 'custom' ? 'inline-block' : 'none';
    }

    function copyUrl(url) {
      navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById('copyUrlBtn');
        btn.innerText = '✅ 已复制';
        setTimeout(() => btn.innerText = '📋 复制链接', 2000);
      });
    }

    async function submitPaste() {
      const content = document.getElementById('content').value;
      const urlType = document.getElementById('urlType').value;
      const customAlias = document.getElementById('customAlias').value;
      const expiration = document.getElementById('expiration').value;
      const resultDiv = document.getElementById('result');

      if (!content.trim()) { alert('请输入内容！'); return; }
      if (urlType === 'custom' && !customAlias.trim()) { alert('请输入自定义后缀！'); return; }

      resultDiv.style.display = 'block';
      resultDiv.innerHTML = '正在上传...';

      const requestHeaders = { 'Content-Type': 'application/json' };
      if (isPasswordRequired) requestHeaders['Authorization'] = sessionPassword;

      try {
        const response = await fetch('/api/create', {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify({ content, urlType, customAlias, expiration })
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
             resultDiv.innerHTML = '❌ 错误: 密码验证失败，请刷新重新输入。';
             return;
        }

        if (data.success) {
          const url = window.location.origin + '/' + data.id;
          resultDiv.innerHTML = \`
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <span>✅ 创建成功！链接：<a href="\${url}" target="_blank">\${url}</a></span>
              <button id="copyUrlBtn" class="copy-btn" onclick="copyUrl('\${url}')">📋 复制链接</button>
            </div>
          \`;
        } else {
          resultDiv.innerHTML = '❌ 错误: ' + data.error;
        }
      } catch (err) {
        resultDiv.innerHTML = '❌ 网络请求失败';
      }
    }
  </script>
</body>
</html>
`;


export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (!env.PASTEBIN_KV) return new Response("系统配置错误：未绑定 PASTEBIN_KV", { status: 500 });

    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(indexHtmlPage, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    if (request.method === 'POST' && url.pathname === '/api/create') {
      try {
        if (ENABLE_PASSWORD_PROTECTION) {
            const clientToken = request.headers.get('Authorization');
            if (clientToken !== ADMIN_TOKEN) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { content, urlType, customAlias, expiration } = body;

        if (!content) return Response.json({ success: false, error: '内容不能为空' }, { status: 400 });

        let id = '';
        if (urlType === 'custom' && customAlias) {
          id = customAlias.trim();
          const existing = await env.PASTEBIN_KV.get(id);
          if (existing !== null) return Response.json({ success: false, error: '该自定义后缀已被占用' }, { status: 409 });
        } else if (urlType === 'long') {
          id = generateRandomId(22); 
        } else {
          id = generateRandomId(6);  
        }

        const putOptions = {};
        if (expiration !== 'never') putOptions.expirationTtl = parseInt(expiration, 10);

        await env.PASTEBIN_KV.put(id, content, putOptions);
        return Response.json({ success: true, id: id });
      } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
      }
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/api/delete/')) {
       const providedToken = request.headers.get('Authorization');
       if (providedToken !== ADMIN_TOKEN) return new Response("Unauthorized", { status: 401 });
       
       const idToDelete = url.pathname.replace('/api/delete/', '');
       await env.PASTEBIN_KV.delete(idToDelete);
       return new Response("Deleted", { status: 200 });
    }

    // ==================== 恢复为纯文本输出 ====================
    if (request.method === 'GET' && url.pathname !== '/') {
      const id = url.pathname.slice(1);
      const content = await env.PASTEBIN_KV.get(id);
      
      if (content !== null) {
        // 强制指定返回类型为 text/plain，浏览器会自动将其作为纯文本渲染
        return new Response(content, {
          headers: { 
              'Content-Type': 'text/plain;charset=UTF-8', 
              'Cache-Control': 'no-cache' 
          }
        });
      } else {
        return new Response('404 Not Found - 文本不存在或已自动销毁。', { status: 404 });
      }
    }

    return new Response('Method Not Allowed', { status: 405 });
  }
};
