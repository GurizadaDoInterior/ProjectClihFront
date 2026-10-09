import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const apiUrl = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1')
  .replace(/\/+$/, '')
  .replace(/(?:\/api\/v1)?$/, '/api/v1');
try {
  const response = await fetch(`${apiUrl}/today`, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`A API respondeu HTTP ${response.status}.`);
  const data = await response.json();
  if (!Array.isArray(data.habits) || !data.progress)
    throw new Error('Resposta incompatível com a API Clih.');
  console.log(`Backend conectado: ${new URL(apiUrl).origin}. Iniciando o front com dados reais.`);
  const child = spawn(
    process.execPath,
    ['node_modules/expo/bin/cli', 'start', '--web', '--port', '8081', ...process.argv.slice(2)],
    {
      cwd: fileURLToPath(new URL('../', import.meta.url)),
      env: { ...process.env, EXPO_PUBLIC_API_URL: apiUrl },
      stdio: 'inherit',
    },
  );
  child.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  child.on('exit', (code) => {
    process.exitCode = code ?? 1;
  });
} catch (error) {
  console.error(`Não foi possível conectar ao backend: ${error.message}`);
  console.error(
    'Inicie o backend no perfil local antes de executar npm run web:api. Consulte docs/backend-integration.md.',
  );
  process.exitCode = 1;
}
