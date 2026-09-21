
import { html } from "hono/html";

export const renderDashboardHtml = (origin: string) => html`<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VeroDesk 1min Gateway</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class', theme: { extend: { colors: { gray: { 750: '#2d333b', 850: '#1f242c', 950: '#0d1117' }, primary: { 400: '#58a6ff', 500: '#1f6feb', 600: '#0969da' } } } } }
  </script>
</head>
<body class="bg-gray-950 text-gray-200 min-h-screen flex items-center justify-center p-4 antialiased">
  <div id="app" class="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden p-8">
    
    <div id="login-view" class="space-y-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">VeroDesk Gateway</h1>
        <p class="text-gray-400 mt-2">Login with your AUTH_TOKEN to configure the gateway.</p>
      </div>
      <form id="login-form" class="space-y-4">
        <div>
          <input type="password" id="auth-token-input" placeholder="Enter AUTH_TOKEN (default: admin)" class="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition">
        </div>
        <button type="submit" class="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-md transition shadow-lg shadow-primary-500/20">Access Dashboard</button>
        <p id="login-error" class="text-red-400 text-sm font-medium text-center hidden"></p>
      </form>
    </div>

    <div id="dashboard-view" class="hidden space-y-6">
      <div class="flex justify-between items-center pb-4 border-b border-gray-800">
        <h1 class="text-2xl font-bold text-white">Gateway Configuration</h1>
        <button id="logout-btn" class="text-gray-400 hover:text-white text-sm font-medium transition">Logout</button>
      </div>
      
      <div class="space-y-4">
        <p class="text-sm text-gray-400">Settings saved here persist in the KV store across GitHub redeploys.</p>
        
        <form id="config-form" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Upstream 1min.ai API Key</label>
            <input type="password" id="cfg-api-key" placeholder="sk-..." class="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition">
            <p class="text-xs text-gray-500 mt-1">Your billing key from 1min.ai.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Master AUTH_TOKEN</label>
            <input type="password" id="cfg-auth-token" placeholder="Change master password..." class="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition">
            <p class="text-xs text-gray-500 mt-1">Leave empty to keep current password. Defines the token needed to use this gateway or login to this panel.</p>
          </div>
          <div>
            <button type="submit" class="bg-primary-600 hover:bg-primary-500 text-white font-medium px-4 py-2 rounded-md transition shadow-sm">Save Configuration</button>
            <span id="save-msg" class="ml-3 text-sm hidden font-medium"></span>
          </div>
        </form>
      </div>

      <div class="pt-6 border-t border-gray-800">
        <h2 class="text-lg font-semibold text-white mb-3">Available Endpoints</h2>
        <div class="bg-gray-800 rounded-lg p-4 font-mono text-xs text-primary-400 space-y-2 overflow-x-auto">
          <div>POST ${origin}/v1/chat/completions</div>
          <div>POST ${origin}/v1/responses</div>
          <div>POST ${origin}/v1/images/generations</div>
          <div>POST ${origin}/v1/audio/speech</div>
          <div>POST ${origin}/v1/audio/transcriptions</div>
          <div>POST ${origin}/v1/audio/translations</div>
          <div>GET  ${origin}/v1/models</div>
        </div>
      </div>
    </div>
    
  </div>

  <script>
    const baseUrl = window.location.origin;
    let savedToken = localStorage.getItem('vd_auth_token') || '';
    
    const ui = {
      login: document.getElementById('login-view'),
      dash: document.getElementById('dashboard-view'),
      loginForm: document.getElementById('login-form'),
      tokenInput: document.getElementById('auth-token-input'),
      loginErr: document.getElementById('login-error'),
      logoutBtn: document.getElementById('logout-btn'),
      configForm: document.getElementById('config-form'),
      cfgApi: document.getElementById('cfg-api-key'),
      cfgAuth: document.getElementById('cfg-auth-token'),
      saveMsg: document.getElementById('save-msg')
    };

    function showMsg(el, text, isError = false) {
      el.textContent = text;
      el.className = 'ml-3 text-sm font-medium ' + (isError ? 'text-red-400' : 'text-green-400');
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 3000);
    }

    async function loadConfig() {
      try {
        const res = await fetch(baseUrl + '/admin/config', {
          headers: { 'Authorization': 'Bearer ' + savedToken }
        });
        if (res.ok) {
          ui.login.classList.add('hidden');
          ui.dash.classList.remove('hidden');
        } else {
          logout();
        }
      } catch (e) {
        logout();
      }
    }

    function logout() {
      savedToken = '';
      localStorage.removeItem('vd_auth_token');
      ui.dash.classList.add('hidden');
      ui.login.classList.remove('hidden');
      ui.tokenInput.value = '';
    }

    ui.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = ui.tokenInput.value.trim();
      if (!val) return;
      const res = await fetch(baseUrl + '/admin/config', { headers: { 'Authorization': 'Bearer ' + val } });
      if (res.ok) {
        savedToken = val;
        localStorage.setItem('vd_auth_token', val);
        ui.loginErr.classList.add('hidden');
        ui.login.classList.add('hidden');
        ui.dash.classList.remove('hidden');
      } else {
        ui.loginErr.textContent = 'Invalid AUTH_TOKEN';
        ui.loginErr.classList.remove('hidden');
      }
    });

    ui.logoutBtn.addEventListener('click', logout);

    ui.configForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {};
      const apiVal = ui.cfgApi.value.trim();
      const authVal = ui.cfgAuth.value.trim();
      if (apiVal) payload.oneMinApiKey = apiVal;
      if (authVal && authVal.length >= 4) {
        payload.authToken = authVal;
      }
      
      try {
        const res = await fetch(baseUrl + '/admin/config', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + savedToken, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showMsg(ui.saveMsg, 'Settings saved to KV!');
          ui.cfgApi.value = '';
          ui.cfgAuth.value = '';
          if (payload.authToken) {
            savedToken = payload.authToken;
            localStorage.setItem('vd_auth_token', savedToken);
          }
        } else {
          showMsg(ui.saveMsg, 'Failed to save', true);
        }
      } catch (e) {
        showMsg(ui.saveMsg, 'Error connecting', true);
      }
    });

    if (savedToken) loadConfig();
  </script>
</body>
</html>`;
