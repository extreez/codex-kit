#!/usr/bin/env python3
"""Проверяет доступ AI-краулеров в robots.txt. Часть technical score блока
geo-optimize (15% composite). Собственная реализация, не порт стороннего
кода - список user-agent общеизвестный, логика разбора robots.txt тривиальна.
Только stdlib, без сторонних пакетов.

Использование:
    python check-robots-ai-crawlers.py https://example.com
    python check-robots-ai-crawlers.py ./public/robots.txt
"""
import argparse
import json
import sys
from urllib.parse import urljoin
from urllib.request import Request, urlopen

AI_CRAWLERS = {
    "GPTBot": "OpenAI, обучение моделей",
    "ChatGPT-User": "OpenAI, live-браузинг по запросу пользователя ChatGPT",
    "OAI-SearchBot": "OpenAI, поиск",
    "ClaudeBot": "Anthropic, обучение",
    "Claude-Web": "Anthropic, live-браузинг",
    "anthropic-ai": "Anthropic, live-браузинг",
    "PerplexityBot": "Perplexity, индексация для ответов",
    "Perplexity-User": "Perplexity, live-браузинг по запросу",
    "Google-Extended": "Google, разрешение на использование в Gemini/AI Overview",
    "CCBot": "Common Crawl, датасет для обучения многих моделей",
    "Bytespider": "ByteDance/TikTok",
    "Applebot-Extended": "Apple Intelligence",
    "Amazonbot": "Amazon (Alexa/поиск)",
}

MAIN_CRAWLERS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]


def fetch_robots(source: str) -> str:
    if source.startswith("http://") or source.startswith("https://"):
        url = urljoin(source, "/robots.txt")
        req = Request(url, headers={"User-Agent": "geo-optimize-robots-check/1.0"})
        with urlopen(req, timeout=10) as resp:
            return resp.read().decode("utf-8", errors="replace")
    with open(source, "r", encoding="utf-8") as f:
        return f.read()


def parse_robots(text: str) -> dict:
    """{user-agent в нижнем регистре: [disallow-паттерны]}."""
    groups: dict[str, list[str]] = {}
    current_agents: list[str] = []
    for raw_line in text.splitlines():
        line = raw_line.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip().lower()
        value = value.strip()
        if key == "user-agent":
            agent = value.lower()
            groups.setdefault(agent, [])
            current_agents = [agent]
        elif key == "disallow" and current_agents:
            for agent in current_agents:
                groups[agent].append(value)
    return groups


def status_for(agent: str, groups: dict) -> tuple[str, list[str]]:
    agent_l = agent.lower()
    if agent_l in groups:
        rules = groups[agent_l]
    elif "*" in groups:
        rules = groups["*"]
    else:
        return "не указан", []
    if any(rule == "/" for rule in rules):
        return "заблокирован", ["/"]
    blocked = [rule for rule in rules if rule]
    if blocked:
        return "частично", blocked
    return "разрешён", []


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")  # вывод кириллицы корректен независимо от кодовой страницы консоли
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", help="URL сайта (https://example.com) или путь к локальному robots.txt")
    args = parser.parse_args()

    groups = parse_robots(fetch_robots(args.source))

    crawlers = []
    findings = []
    allowed_main = 0
    for agent, owner in AI_CRAWLERS.items():
        status, blocked = status_for(agent, groups)
        crawlers.append({"agent": agent, "status": status, "owner": owner})
        if agent in MAIN_CRAWLERS and status == "разрешён":
            allowed_main += 1
        if status in ("заблокирован", "частично"):
            reason = "полностью" if status == "заблокирован" else "частично"
            findings.append({
                "agent": agent,
                "issue": f"{reason} заблокирован: {', '.join(blocked)}",
                "fix_hint": "убрать или сузить правило Disallow для этого user-agent, если блокировка не осознанная",
            })

    result = {
        "technical_crawler_score": round(allowed_main / len(MAIN_CRAWLERS) * 100),
        "crawlers": crawlers,
        "findings": findings,
        "not_checked": (
            "динамический robots.txt по домену/региону, кэширующие CDN перед "
            "источником, user-agent за пределами списка скрипта (проверять "
            "вручную по geo-crawler-check.md, если найден)"
        ),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

