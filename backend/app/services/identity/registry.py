"""Fixed provider registry. URLs are constructed only from known templates."""
from dataclasses import dataclass
from urllib.parse import quote

@dataclass(frozen=True)
class Provider:
    key: str
    name: str
    template: str
    kind: str = "profile"
    category: str = "social"

# Candidate links only. Do not interpret a URL response or username match as identity proof.
PROVIDERS: dict[str, Provider] = {
    "instagram": Provider("instagram", "Instagram", "https://www.instagram.com/{username}/"),
    "threads": Provider("threads", "Threads", "https://www.threads.net/@{username}"),
    "tiktok": Provider("tiktok", "TikTok", "https://www.tiktok.com/@{username}"),
    "youtube": Provider("youtube", "YouTube", "https://www.youtube.com/@{username}", category="creator"),
    "x": Provider("x", "X", "https://x.com/{username}"),
    "reddit": Provider("reddit", "Reddit", "https://www.reddit.com/user/{username}/"),
    "github": Provider("github", "GitHub", "https://github.com/{username}", category="developer"),
    "gitlab": Provider("gitlab", "GitLab", "https://gitlab.com/{username}", category="developer"),
    "twitch": Provider("twitch", "Twitch", "https://www.twitch.tv/{username}", category="creator"),
    "pinterest": Provider("pinterest", "Pinterest", "https://www.pinterest.com/{username}/", category="creator"),
    "medium": Provider("medium", "Medium", "https://medium.com/@{username}", category="creator"),
    "devto": Provider("devto", "DEV Community", "https://dev.to/{username}", category="developer"),
    "telegram": Provider("telegram", "Telegram public page", "https://t.me/{username}"),
    "facebook": Provider("facebook", "Facebook public page", "https://www.facebook.com/{username}"),
    "linkedin": Provider("linkedin", "LinkedIn public profile", "https://www.linkedin.com/in/{username}/", category="professional"),
    "snapchat": Provider("snapchat", "Snapchat public profile", "https://www.snapchat.com/add/{username}"),
    "behance": Provider("behance", "Behance", "https://www.behance.net/{username}", category="creator"),
    "vimeo": Provider("vimeo", "Vimeo", "https://vimeo.com/{username}", category="creator"),
    "keybase": Provider("keybase", "Keybase", "https://keybase.io/{username}", category="developer"),
    "mastodon": Provider("mastodon", "Mastodon", "", "manual_search", "social"),
    "bluesky": Provider("bluesky", "Bluesky", "https://bsky.app/profile/{username}.bsky.social", category="social"),
}

def find_candidates(username: str, platform_keys: list[str] | None = None) -> list[dict]:
    keys = list(PROVIDERS.keys()) if platform_keys is None else platform_keys
    if not keys:
        raise ValueError("Select at least one platform.")
    unknown = [key for key in keys if key not in PROVIDERS]
    if unknown:
        raise ValueError(f"Unsupported platform key(s): {', '.join(unknown)}")
    safe_username = quote(username, safe="._-")
    results = []
    for key in keys:
        provider = PROVIDERS[key]
        url = provider.template.format(username=safe_username) if provider.template else None
        results.append({
            "platform": provider.key,
            "platform_name": provider.name,
            "url": url,
            "status": "not_checked",
            "result_type": provider.kind,
            "category": provider.category,
            "note": (
                "Search manually on a chosen Mastodon instance."
                if provider.kind == "manual_search"
                else "Candidate URL only. Account existence and ownership have not been verified."
            ),
        })
    return results
