// utils.ts
import { load as loadYaml } from 'js-yaml';

export interface Env {
  SECRET: string;
  ORG_CONFIG: string;
  REPO_CONFIG: string;
  HEADERS: string;
}

export interface SingleHook {
  name?: string;
  url: string;
  headers?: Record<string, string | null>;
}

// 超级详细调试版 send_request
export async function send_request(
  rawHook: SingleHook | string,
  payload: string,
  baseHeaders: Headers
) {
  // 1. 解析 hook
  const hook = typeof rawHook === 'string' ? { url: rawHook } : rawHook;
  const name = hook.name || new URL(hook.url).hostname;

  console.log(`Preparing to send webhook → ${name}`);
  console.log(`Target URL: ${hook.url}`);

  // 2. 克隆一份 headers，防止污染
  const headers = new Headers(baseHeaders);

  // 3. 应用 hook 自己的 headers
  const hookHeaders = hook.headers || {};
  console.log(`Hook-specific headers count: ${Object.keys(hookHeaders).length}`);
  for (const [k, v] of Object.entries(hookHeaders)) {
    if (v === null) {
      headers.delete(k);
      console.log(`[Hook] DELETE header: ${k}`);
    } else {
      headers.set(k, v);
      console.log(`[Hook] SET header: ${k} = ${v.substring(0, 100)}${v.length > 100 ? '...' : ''}`);
    }
  }

  // 4. 确保 Content-Type
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 5. 最终打印所有要发送的 headers（关键信息
  console.log(`Final headers count: ${headers.keys.length}`);
  let totalSize = 0;
  const headerLines: string[] = [];
  for (const [k, v] of headers.entries()) {
    const line = `${k}: ${v}`;
    totalSize += line.length + 2; // +2 for \r\n
    headerLines.push(line);
  }
  console.log(`Estimated headers size: ~${totalSize} bytes`);
  console.log('=== ALL HEADERS TO BE SENT ===');
  headerLines.forEach(line => console.log(line));
  console.log('=============================');

  if (totalSize > 7000) {
    console.warn('WARNING: Headers 可能过大，Discord 通常 8KB 以内才安全');
  }

  try {
    const response = await fetch(hook.url, {
      method: 'POST',
      headers,
      body: payload,
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    // 把响应体也打出来（Discord 错误信息很有用）
    const respText = await response.text();
    if (respText) {
      console.log(`Response body (${respText.length} chars):`);
      console.log(respText.substring(0, 1000));
      if (respText.length > 1000) console.log('... (truncated)');
    }

    if (!response.ok) {
      throw `HTTP ${response.status} ${response.statusText}`;
    }

    return response.status;
  } catch (err) {
    console.error(`Fetch failed: ${err}`);
    throw err;
  }
}

export async function parse_config(text: string) {
  try {
    return loadYaml(text);
  } catch (e) {
    console.warn('YAML parse failed, fallback to JSON');
    return JSON.parse(text);
  }
}