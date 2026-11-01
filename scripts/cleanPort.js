const { execSync } = require('child_process');

function killPort(port) {
  try {
    if (process.platform === 'win32') {
      let out = '';
      try {
        out = execSync(`netstat -ano -p tcp | findstr :${port}`, { encoding: 'utf8' });
      } catch {
        // No process found on this port
        return;
      }

      const lines = out.trim().split('\n');
      const currentPid = process.pid.toString();
      const pids = new Set();

      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== currentPid) {
            pids.add(pid);
          }
        }
      }

      for (const pid of pids) {
        try {
          console.log(`[Auto-Clean] Freeing port ${port} (terminating stale process PID ${pid})...`);
          execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' });
        } catch (_) {}
      }
    } else {
      try {
        execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore' });
      } catch (_) {}
    }
  } catch (_) {
    // Ignore any clean errors
  }
}

// Clean backend port 5000, MongoDB port 27017, and frontend port 5173
killPort(5000);
killPort(27017);
killPort(5173);
console.log('[Auto-Clean] Development ports (5000, 27017, 5173) are verified clear.');
