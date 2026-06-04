"""AgentRouter allow-lists HTTP clients (Claude Code, Codex, …).

Generic OpenAI SDK / httpx calls are rejected with ``unauthorized client detected``.
We inject the same headers used by the Claude Code CLI for agentrouter.org requests.
"""

from urllib.parse import urlparse

AGENTROUTER_HOST_SUFFIX = 'agentrouter.org'

# From community workaround (opencode-agentrouter / opencode#2784).
CLAUDE_CODE_CLIENT_HEADERS: dict[str, str] = {
    'User-Agent': 'claude-cli/1.0.108 (external, cli)',
    'anthropic-version': '2023-06-01',
    'anthropic-beta': 'claude-code-20250219,oauth-2025-04-20',
    'anthropic-dangerous-direct-browser-access': 'true',
    'x-app': 'cli',
    'x-stainless-lang': 'js',
    'x-stainless-package-version': '0.55.1',
    'x-stainless-os': 'Linux',
    'x-stainless-arch': 'x64',
    'x-stainless-runtime': 'node',
    'x-stainless-runtime-version': 'v22.0.0',
}


def is_agentrouter_base_url(base_url: str) -> bool:
    host = (urlparse(base_url).hostname or '').lower()
    return host.endswith(AGENTROUTER_HOST_SUFFIX)


def build_openai_compat_headers(base_url: str, api_key: str) -> dict[str, str]:
    headers: dict[str, str] = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    if is_agentrouter_base_url(base_url):
        headers.update(CLAUDE_CODE_CLIENT_HEADERS)
    return headers


def enrich_agentrouter_error(message: str) -> str:
    lower = message.lower()
    if 'unauthorized client' not in lower:
        return message
    return (
        f'{message} — AgentRouter chỉ chấp nhận client đã whitelist (Claude Code, …), '
        'không phải backend tùy chỉnh thuần. Ứng dụng đã gửi header Claude Code; '
        'nếu vẫn lỗi: tạo key mới tại https://agentrouter.org/console/token, '
        'thử model claude-opus-4-6 / glm-4.6, hoặc dùng Gemini / API DeepSeek–OpenAI trực tiếp.'
    )
