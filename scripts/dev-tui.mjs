import { spawn } from 'child_process';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// ANSI Colors
const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
};

const SERVICES = [
    {
        id: 'app',
        name: 'QuizCreator',
        cwd: ROOT,
        command: 'bun',
        args: ['run', 'next', 'dev', '--turbo'],
        port: 3000,
    },
    {
        id: 'admin',
        name: 'Admin Portal',
        cwd: path.join(ROOT, 'admin-portal'),
        command: 'bun',
        args: ['run', 'next', 'dev', '--turbo', '--port', '3002'],
        port: 3002,
    },
];

const state = {
    services: SERVICES.map(s => ({
        ...s,
        status: 'stopped', // stopped, starting, running, error, building
        process: null,
        logs: [],
        mode: 'dev', // 'dev' | 'prod'
    })),
    cursor: 0,
};

function log(serviceIndex, data) {
    const service = state.services[serviceIndex];
    const lines = data.toString().split('\n').filter(l => l.trim());
    service.logs.push(...lines);
    if (service.logs.length > 100) service.logs.shift();

    const lowerData = data.toString().toLowerCase();

    if (lowerData.includes('creating an optimized production build') || lowerData.includes('creating an optimized build')) {
        service.status = 'building';
    } else if (lowerData.includes('ready') ||
        lowerData.includes('started') ||
        lowerData.includes('compiled successfully') ||
        lowerData.includes('listening on port')) {
        service.status = 'running';
    }
}

function startService(index, mode = 'dev') {
    const service = state.services[index];
    if (service.process) return;

    service.mode = mode;
    service.status = 'starting';

    // Construct command based on mode
    let cmd = service.command;
    let args = [];

    if (mode === 'prod') {
        service.logs = [`${C.magenta}Starting ${service.name} in PRODUCTION mode (Build + Start)...${C.reset}`];
        // For prod, we chain build && start. 
        // Note: This relies on the shell correctly interpreting '&&'.
        // We use 'bun run build' inside the service cwd, then 'bun run next start ...'
        // But spawned process is one command. We'll use shell: true.

        const buildCmd = `bun run build`;
        // Check if original dev args had --port. If so, preserve it for start.
        const portArg = service.args.indexOf('--port');
        const portVal = portArg !== -1 ? service.args[portArg + 1] : service.port;

        const startCmd = `bun run next start --port ${portVal}`;

        // We run it as a single shell command string to allow chaining
        cmd = `${buildCmd} && ${startCmd}`;
        // When cmd is a string and shell: true, args are ignored or treated differently.
        // spawn(cmd, { shell: true }) works best.
        args = [];

    } else {
        service.logs = [`${C.cyan}Starting ${service.name} in DEV mode...${C.reset}`];
        cmd = service.command; // 'bun'
        args = service.args;
    }

    // Special handling for spawn when command is a complex shell string
    const finalCmd = mode === 'prod' ? cmd : service.command;
    const finalArgs = mode === 'prod' ? [] : service.args;

    // If prod, we spawn the shell directly with the command string
    const child = mode === 'prod'
        ? spawn(cmd, {
            cwd: service.cwd,
            shell: true,
            env: { ...process.env, PORT: service.port.toString() }
        })
        : spawn(finalCmd, finalArgs, {
            cwd: service.cwd,
            shell: true,
            env: {
                ...process.env,
                PORT: service.port.toString(),
                NODE_OPTIONS: '--max-old-space-size=1024',
                NEXT_TELEMETRY_DISABLED: '1',
                WATCHPACK_WATCHER_LIMIT: '1000'
            }
        });

    child.stdout.on('data', (data) => log(index, data));
    child.stderr.on('data', (data) => log(index, data));

    child.on('close', (code) => {
        service.status = 'stopped';
        service.process = null;
        service.logs.push(`${C.red}Process exited with code ${code}${C.reset}`);
        render();
    });

    service.process = child;
    render();
}

function stopService(index) {
    const service = state.services[index];
    if (!service.process) return;

    service.status = 'stopped';
    if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', service.process.pid, '/f', '/t']);
    } else {
        service.process.kill();
    }
    service.process = null;
    render();
}

function restartService(index) {
    stopService(index);
    // Restart in the same mode it was in
    setTimeout(() => startService(index, state.services[index].mode), 1000);
}

function render() {
    console.clear();
    console.log(`${C.bold}${C.cyan}╔════════════════════════════════════════════════════════════════════╗${C.reset}`);
    console.log(`${C.bold}${C.cyan}║                     🚀 QUIZCREATOR DEV DASHBOARD                    ║${C.reset}`);
    console.log(`${C.bold}${C.cyan}╚════════════════════════════════════════════════════════════════════╝${C.reset}`);
    console.log('');

    state.services.forEach((s, i) => {
        let statusColor = C.red;
        if (s.status === 'running') statusColor = C.green;
        if (s.status === 'starting') statusColor = C.yellow;
        if (s.status === 'building') statusColor = C.magenta;

        const statusIcon = s.status === 'running' ? '●' : s.status === 'starting' ? '○' : s.status === 'building' ? '⚙' : '✖';
        const modeLabel = s.mode === 'prod' ? `${C.magenta}[PROD]${C.reset}` : `${C.blue}[DEV]${C.reset}`;

        console.log(`${C.bold}${i + 1}. ${s.name.padEnd(15)}${C.reset} ${modeLabel} [${statusColor}${s.status.toUpperCase().padEnd(8)}${C.reset}] Port: ${C.cyan}${s.port}${C.reset} ${statusIcon}`);

        // Show last 3 lines of logs
        const recentLogs = s.logs.slice(-3);
        recentLogs.forEach(line => {
            console.log(`   ${C.dim}${line.substring(0, 80)}${C.reset}`);
        });
        console.log('');
    });

    console.log(`${C.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
    console.log(`${C.bold}Commands:${C.reset}`);
    console.log(`  [1-2] Dev Mode (Toggle)   |  [Shift + 1-2] Prod Mode (Build & Start)`);
    console.log(`  [r] Restart All           |  [s] Start All (Dev)  |  [k] Kill All  |  [q] Quit`);
    console.log('');
}

// Input handling
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') process.exit();

    if (key.name === 'q') {
        state.services.forEach((_, i) => stopService(i));
        process.exit();
    }

    // Toggle Dev Mode (1, 2, 3)
    if (key.name === '1') state.services[0].process ? stopService(0) : startService(0, 'dev');
    if (key.name === '2') state.services[1].process ? stopService(1) : startService(1, 'dev');
    if (key.name === '3') state.services[2].process ? stopService(2) : startService(2, 'dev');

    // Switch to Prod Mode (!, @, #) - Shift+Number usually returns these chars
    if (key.sequence === '!') { if (state.services[0].process) stopService(0); setTimeout(() => startService(0, 'prod'), 500); }
    if (key.sequence === '@') { if (state.services[1].process) stopService(1); setTimeout(() => startService(1, 'prod'), 500); }
    if (key.sequence === '#') { if (state.services[2].process) stopService(2); setTimeout(() => startService(2, 'prod'), 500); }

    if (key.name === 'r') state.services.forEach((_, i) => restartService(i));
    if (key.name === 's') state.services.forEach((_, i) => startService(i, 'dev'));
    if (key.name === 'k') state.services.forEach((_, i) => stopService(i));

    render();
});

// Initial start
console.log(`${C.yellow}Waking up the fleet...${C.reset}`);
// state.services.forEach((_, i) => startService(i)); // Let user start them manually or start all by default? 
// The user said "fire up dev servers", so I'll start them by default.
state.services.forEach((_, i) => startService(i));

// Re-render periodically to update "running" status if needed
setInterval(render, 2000);
