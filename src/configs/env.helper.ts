export function getCurrentEnv(): string {
  return process.env.NODE_ENV || 'prod';
}

export function isProd(): boolean {
  return getCurrentEnv() === 'prod';
}

export function isDev(): boolean {
  return getCurrentEnv() === 'dev';
}

export function isTest(): boolean {
  return getCurrentEnv() === 'test';
}

export function isDevOrTest(): boolean {
  return isDev() || isTest();
}
