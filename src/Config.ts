import * as path from 'path';

// electron: __dirname is path to dist
export const APP_ROOT = path.resolve(__dirname, "..");

export const CACHE_DIR = path.join(APP_ROOT, "cache");

export const DEBUG = false;

export const APP_HOST = DEBUG ? "http://127.0.0.1:8080" : path.join(APP_ROOT, "index.html");