const cp = require('node:child_process');
const path = require('node:path');
const assert = require('node:assert/strict');

const php = process.env.PHP_BIN || 'C:/xampp/php/php.exe';
const root = path.resolve(__dirname, '..');

// Helper to run PHP code that requires rate-limit.php
function phpEval(code, env = {}) {
  const fullCode = `
    require '${root.replace(/\\/g, '/')}/modules/groups/rate-limit.php';
    ${code}
  `;
  const res = cp.spawnSync(php, ['-r', fullCode], {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    windowsHide: true
  });
  if (res.status !== 0) {
    throw new Error('PHP Error: ' + res.stderr);
  }
  return res.stdout.trim();
}

console.log('Running rate limit tests...');

// A) REMOTE_ADDR normal sin proxy: usa REMOTE_ADDR
const ipA = phpEval('echo clientIp();', {
  REMOTE_ADDR: '198.51.100.5'
});
assert.equal(ipA, '198.51.100.5', 'A: REMOTE_ADDR normal sin proxy');

// B) REMOTE_ADDR = 127.0.0.1 con X-Forwarded-For válido: usa primera IP de XFF
const ipB = phpEval('echo clientIp();', {
  REMOTE_ADDR: '127.0.0.1',
  HTTP_X_FORWARDED_FOR: '203.0.113.10, 10.0.0.1'
});
assert.equal(ipB, '203.0.113.10', 'B: REMOTE_ADDR loopback 127.0.0.1 con XFF');

const ipBv6 = phpEval('echo clientIp();', {
  REMOTE_ADDR: '::1',
  HTTP_X_FORWARDED_FOR: '203.0.113.20'
});
assert.equal(ipBv6, '203.0.113.20', 'B: REMOTE_ADDR loopback ::1 con XFF');

// C) REMOTE_ADDR = 127.0.0.1 con XFF inválido: fallback seguro
const ipC = phpEval('echo clientIp();', {
  REMOTE_ADDR: '127.0.0.1',
  HTTP_X_FORWARDED_FOR: 'invalid-ip-string, 127.0.0.1'
});
assert.equal(ipC, '127.0.0.1', 'C: Fallback seguro si XFF es invalido');

// D) REMOTE_ADDR externo + XFF falsificado: IGNORA XFF
const ipD = phpEval('echo clientIp();', {
  REMOTE_ADDR: '198.51.100.5',
  HTTP_X_FORWARDED_FOR: '203.0.113.10'
});
assert.equal(ipD, '198.51.100.5', 'D: REMOTE_ADDR externo ignora XFF');

// E) dos emails distintos desde misma IP: NO comparten bucket de login
const bucketE1 = phpEval('echo rateLimitBucket("login", hash("sha256", "pc02@example.test"));', {
  REMOTE_ADDR: '127.0.0.1',
  HTTP_X_FORWARDED_FOR: '203.0.113.50'
});
const bucketE2 = phpEval('echo rateLimitBucket("login", hash("sha256", "pc03@example.test"));', {
  REMOTE_ADDR: '127.0.0.1',
  HTTP_X_FORWARDED_FOR: '203.0.113.50'
});
assert.notEqual(bucketE1, bucketE2, 'E: Dos emails distintos no comparten bucket de login');

// F) mismo email + misma IP: SI comparte bucket
const bucketF1 = phpEval('echo rateLimitBucket("login", hash("sha256", trim(strtolower("pc02@example.test"))));', {
  REMOTE_ADDR: '127.0.0.1',
  HTTP_X_FORWARDED_FOR: '203.0.113.50'
});
const upperEmail = '  ' + 'pc02@example.test'.toUpperCase() + '  ';
const bucketF2 = phpEval('echo rateLimitBucket("login", hash("sha256", trim(strtolower("' + upperEmail + '"))));', {
  REMOTE_ADDR: '127.0.0.1',
  HTTP_X_FORWARDED_FOR: '203.0.113.50'
});
assert.equal(bucketF1, bucketF2, 'F: Mismo email normalizado comparte bucket');

// G & H) Integración HTTP contra servidor local (puerto 8770)
(async () => {
  const httpPort = Number(process.env.SIM_TEST_HTTP_PORT || 8770);
  const baseUrl = `http://127.0.0.1:${httpPort}/modules/groups/api.php`;

  async function apiLogin(email, password, xff = '') {
    // 1. Session to get CSRF
    const sessRes = await fetch(`${baseUrl}?action=session`);
    const sessData = await sessRes.json();
    const cookie = sessRes.headers.get('set-cookie')?.split(';')[0] || '';
    const csrf = sessData.csrf || '';

    // 2. POST login
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf,
      Cookie: cookie
    };
    if (xff) headers['X-Forwarded-For'] = xff;

    const res = await fetch(`${baseUrl}?action=login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password })
    });
    const body = await res.json();
    return { status: res.status, body, headers: res.headers };
  }

  // G) 10 fallos consecutivos alcanzan el límite (429)
  const targetFailEmail = `test_limit_${Date.now()}@example.test`;
  for (let i = 0; i < 10; i++) {
    const r = await apiLogin(targetFailEmail, 'badpassword123', '198.51.100.99');
    assert.equal(r.status, 401, `Intento fallido ${i + 1} debe dar 401`);
  }
  const blocked = await apiLogin(targetFailEmail, 'badpassword123', '198.51.100.99');
  assert.equal(blocked.status, 429, 'G: 11vo intento debe ser bloqueado con 429');
  assert.ok(Number(blocked.headers.get('retry-after')) > 0, 'G: Retry-After header presente');

  // Verificar que otro usuario desde la misma IP NO está bloqueado
  const otherEmail = `test_other_${Date.now()}@example.test`;
  const otherRes = await apiLogin(otherEmail, 'badpassword123', '198.51.100.99');
  assert.equal(otherRes.status, 401, 'E: Otra cuenta desde la misma IP no fue bloqueada por los 10 fallos de la anterior');

  // H) Logins exitosos NO incrementan contador de fallos
  for (let i = 0; i < 12; i++) {
    const successRes = await apiLogin('pc02@example.test', '12345', '203.0.113.102');
    assert.equal(successRes.status, 200, `H: Login exitoso #${i + 1} debe ser 200`);
    assert.equal(successRes.body.ok, true);
  }

  // Comprobar pc20 y pc40
  const r20 = await apiLogin('pc20@example.test', '12345', '203.0.113.120');
  assert.equal(r20.status, 200, 'Login pc20 exitoso');

  const r40 = await apiLogin('pc40@example.test', '12345', '203.0.113.140');
  assert.equal(r40.status, 200, 'Login pc40 exitoso');

  console.log('PASS: rate-limit A-H: clientIp, trusted proxy, account bucket isolation, 10-fail limit and successful login tolerance.');
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
