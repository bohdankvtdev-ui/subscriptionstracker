import activity from "@/assets/icons/activity.png";
import add from "@/assets/icons/add.png";
import adobe from "@/assets/icons/adobe.png";
import back from "@/assets/icons/back.png";
import canva from "@/assets/icons/canva.png";
import claude from "@/assets/icons/claude.png";
import dropbox from "@/assets/icons/dropbox.png";
import figma from "@/assets/icons/figma.png";
import github from "@/assets/icons/github.png";
import home from "@/assets/icons/home.png";
import medium from "@/assets/icons/medium.png";
import menu from "@/assets/icons/menu.png";
import notion from "@/assets/icons/notion.png";
import openai from "@/assets/icons/openai.png";
import plus from "@/assets/icons/plus.png";
import setting from "@/assets/icons/setting.png";
import spotify from "@/assets/icons/spotify.png";
import wallet from "@/assets/icons/wallet.png";
import type { ImageSourcePropType } from "react-native";

export const imageIcons = {
    home,
    wallet,
    setting,
    activity,
    add,
    back,
    menu,
    plus,
    notion,
    dropbox,
    openai,
    adobe,
    medium,
    figma,
    spotify,
    github,
    claude,
    canva,
} as const;

export const icons = imageIcons;

export type ImageIconKey = keyof typeof imageIcons;

type BaseIconOption = {
    key: string;
    label: string;
    tags: readonly string[];
};

type ImageIconOption = BaseIconOption & {
    type: "image";
};

type MaterialIconOption = BaseIconOption & {
    type: "material";
    name: string;
};

export type SubscriptionIconOption = ImageIconOption | MaterialIconOption;

export const SUBSCRIPTION_ICON_OPTIONS = [
    { key: "spotify", type: "image", label: "Spotify", tags: ["music", "audio", "streaming"] },
    { key: "notion", type: "image", label: "Notion", tags: ["notes", "productivity", "workspace"] },
    { key: "github", type: "image", label: "GitHub", tags: ["code", "developer", "git"] },
    { key: "figma", type: "image", label: "Figma", tags: ["design", "ui", "prototype"] },
    { key: "openai", type: "image", label: "OpenAI", tags: ["ai", "chatgpt", "assistant"] },
    { key: "claude", type: "image", label: "Claude", tags: ["ai", "assistant", "anthropic"] },
    { key: "canva", type: "image", label: "Canva", tags: ["design", "creative", "marketing"] },
    { key: "dropbox", type: "image", label: "Dropbox", tags: ["storage", "files", "cloud"] },
    { key: "adobe", type: "image", label: "Adobe", tags: ["design", "creative", "photo"] },
    { key: "medium", type: "image", label: "Medium", tags: ["reading", "writing", "publication"] },
    { key: "wallet", type: "image", label: "Wallet", tags: ["finance", "generic", "payment"] },
    { key: "netflix", type: "material", name: "netflix", label: "Netflix", tags: ["movies", "tv", "streaming"] },
    { key: "youtube", type: "material", name: "youtube", label: "YouTube", tags: ["video", "creator", "streaming"] },
    { key: "twitch", type: "material", name: "twitch", label: "Twitch", tags: ["streaming", "gaming", "video"] },
    { key: "patreon", type: "material", name: "patreon", label: "Patreon", tags: ["creator", "membership", "subscription"] },
    { key: "reddit", type: "material", name: "reddit", label: "Reddit", tags: ["community", "social", "media"] },
    { key: "linkedin", type: "material", name: "linkedin", label: "LinkedIn", tags: ["work", "career", "social"] },
    { key: "instagram", type: "material", name: "instagram", label: "Instagram", tags: ["social", "photo", "creator"] },
    { key: "disney", type: "material", name: "movie-open-star", label: "Disney+", tags: ["movies", "tv", "streaming"] },
    { key: "hulu", type: "material", name: "television-classic", label: "Hulu", tags: ["movies", "tv", "streaming"] },
    { key: "prime-video", type: "material", name: "play-box", label: "Prime Video", tags: ["movies", "tv", "streaming"] },
    { key: "apple-tv", type: "material", name: "apple", label: "Apple TV", tags: ["apple", "movies", "streaming"] },
    { key: "soundcloud", type: "material", name: "soundcloud", label: "SoundCloud", tags: ["music", "audio", "creator"] },
    { key: "music", type: "material", name: "music-circle", label: "Music", tags: ["music", "audio", "generic"] },
    { key: "podcast", type: "material", name: "podcast", label: "Podcast", tags: ["audio", "learning", "media"] },
    { key: "headphones", type: "material", name: "headphones", label: "Audio", tags: ["music", "audio", "headphones"] },
    { key: "slack", type: "material", name: "slack", label: "Slack", tags: ["work", "chat", "team"] },
    { key: "discord", type: "material", name: "discord", label: "Discord", tags: ["chat", "community", "gaming"] },
    { key: "telegram", type: "material", name: "send", label: "Telegram", tags: ["chat", "communication", "community"] },
    { key: "whatsapp", type: "material", name: "whatsapp", label: "WhatsApp", tags: ["chat", "communication", "phone"] },
    { key: "zoom", type: "material", name: "video", label: "Zoom", tags: ["meetings", "video", "work"] },
    { key: "microsoft", type: "material", name: "microsoft", label: "Microsoft", tags: ["office", "work", "productivity"] },
    { key: "google", type: "material", name: "google", label: "Google", tags: ["workspace", "cloud", "productivity"] },
    { key: "trello", type: "material", name: "trello", label: "Trello", tags: ["project", "work", "kanban"] },
    { key: "jira", type: "material", name: "jira", label: "Jira", tags: ["project", "developer", "work"] },
    { key: "asana", type: "material", name: "clipboard-check", label: "Asana", tags: ["tasks", "project", "work"] },
    { key: "linear", type: "material", name: "format-list-checks", label: "Linear", tags: ["issues", "developer", "project"] },
    { key: "monday", type: "material", name: "calendar-check", label: "Monday", tags: ["project", "planning", "work"] },
    { key: "crm", type: "material", name: "account-group", label: "CRM", tags: ["sales", "customers", "work"] },
    { key: "drive", type: "material", name: "google-drive", label: "Google Drive", tags: ["storage", "files", "cloud"] },
    { key: "icloud", type: "material", name: "cloud", label: "iCloud", tags: ["storage", "apple", "cloud"] },
    { key: "calendar", type: "material", name: "calendar-month", label: "Calendar", tags: ["schedule", "planning", "productivity"] },
    { key: "email", type: "material", name: "email", label: "Email", tags: ["mail", "work", "communication"] },
    { key: "vpn", type: "material", name: "vpn", label: "VPN", tags: ["security", "privacy", "utility"] },
    { key: "password", type: "material", name: "form-textbox-password", label: "Password Manager", tags: ["security", "password", "privacy"] },
    { key: "antivirus", type: "material", name: "shield-check", label: "Antivirus", tags: ["security", "privacy", "protection"] },
    { key: "identity", type: "material", name: "badge-account", label: "Identity", tags: ["security", "login", "account"] },
    { key: "database", type: "material", name: "database", label: "Database", tags: ["developer", "data", "cloud"] },
    { key: "server", type: "material", name: "server", label: "Server", tags: ["developer", "hosting", "cloud"] },
    { key: "cloud", type: "material", name: "cloud-outline", label: "Cloud", tags: ["hosting", "storage", "infrastructure"] },
    { key: "aws", type: "material", name: "aws", label: "AWS", tags: ["cloud", "developer", "hosting"] },
    { key: "azure", type: "material", name: "microsoft-azure", label: "Azure", tags: ["cloud", "developer", "hosting"] },
    { key: "cloudflare", type: "material", name: "cloud", label: "Cloudflare", tags: ["cloud", "security", "hosting"] },
    { key: "vercel", type: "material", name: "triangle", label: "Vercel", tags: ["hosting", "frontend", "developer"] },
    { key: "terminal", type: "material", name: "console", label: "Terminal", tags: ["developer", "code", "tools"] },
    { key: "api", type: "material", name: "api", label: "API", tags: ["developer", "integration", "tools"] },
    { key: "code", type: "material", name: "code-tags", label: "Code", tags: ["developer", "programming", "tools"] },
    { key: "npm", type: "material", name: "npm", label: "npm", tags: ["developer", "package", "code"] },
    { key: "docker", type: "material", name: "docker", label: "Docker", tags: ["developer", "container", "cloud"] },
    { key: "kubernetes", type: "material", name: "kubernetes", label: "Kubernetes", tags: ["developer", "cloud", "container"] },
    { key: "wordpress", type: "material", name: "wordpress", label: "WordPress", tags: ["website", "cms", "hosting"] },
    { key: "shopify", type: "material", name: "shopping-outline", label: "Shopify", tags: ["commerce", "store", "business"] },
    { key: "analytics", type: "material", name: "chart-line", label: "Analytics", tags: ["analytics", "data", "tracking"] },
    { key: "design", type: "material", name: "palette", label: "Design Tool", tags: ["design", "creative", "ui"] },
    { key: "photo", type: "material", name: "image", label: "Photo", tags: ["photo", "creative", "editing"] },
    { key: "video-edit", type: "material", name: "movie-edit", label: "Video Editor", tags: ["video", "creative", "editing"] },
    { key: "writing", type: "material", name: "pencil", label: "Writing", tags: ["writing", "notes", "content"] },
    { key: "book", type: "material", name: "book-open-page-variant", label: "Reading", tags: ["book", "reading", "learning"] },
    { key: "learning", type: "material", name: "school", label: "Learning", tags: ["education", "course", "school"] },
    { key: "language", type: "material", name: "translate", label: "Language", tags: ["learning", "translation", "education"] },
    { key: "fitness", type: "material", name: "dumbbell", label: "Fitness", tags: ["health", "workout", "wellness"] },
    { key: "health", type: "material", name: "heart-pulse", label: "Health", tags: ["health", "medical", "wellness"] },
    { key: "meditation", type: "material", name: "meditation", label: "Meditation", tags: ["health", "wellness", "mindfulness"] },
    { key: "meal", type: "material", name: "food-fork-drink", label: "Food", tags: ["meal", "delivery", "food"] },
    { key: "coffee", type: "material", name: "coffee", label: "Coffee", tags: ["coffee", "food", "delivery"] },
    { key: "shopping", type: "material", name: "shopping", label: "Shopping", tags: ["commerce", "store", "delivery"] },
    { key: "delivery", type: "material", name: "truck-delivery", label: "Delivery", tags: ["shipping", "food", "commerce"] },
    { key: "travel", type: "material", name: "airplane", label: "Travel", tags: ["travel", "flight", "trip"] },
    { key: "transport", type: "material", name: "train-car", label: "Transport", tags: ["transport", "commute", "travel"] },
    { key: "car", type: "material", name: "car", label: "Car", tags: ["car", "transport", "service"] },
    { key: "news", type: "material", name: "newspaper-variant", label: "News", tags: ["reading", "publication", "media"] },
    { key: "finance", type: "material", name: "finance", label: "Finance", tags: ["money", "budget", "bank"] },
    { key: "bank", type: "material", name: "bank", label: "Banking", tags: ["finance", "money", "bank"] },
    { key: "card", type: "material", name: "credit-card", label: "Credit Card", tags: ["payment", "card", "finance"] },
    { key: "receipt", type: "material", name: "receipt", label: "Receipt", tags: ["billing", "invoice", "finance"] },
    { key: "tax", type: "material", name: "calculator", label: "Tax", tags: ["finance", "tax", "accounting"] },
    { key: "investment", type: "material", name: "trending-up", label: "Investing", tags: ["finance", "stocks", "money"] },
    { key: "ai", type: "material", name: "robot-outline", label: "AI Tool", tags: ["ai", "assistant", "automation"] },
    { key: "automation", type: "material", name: "auto-fix", label: "Automation", tags: ["ai", "workflow", "productivity"] },
    { key: "game", type: "material", name: "gamepad-variant", label: "Gaming", tags: ["game", "entertainment", "console"] },
    { key: "xbox", type: "material", name: "microsoft-xbox", label: "Xbox", tags: ["game", "entertainment", "console"] },
    { key: "playstation", type: "material", name: "sony-playstation", label: "PlayStation", tags: ["game", "entertainment", "console"] },
    { key: "steam", type: "material", name: "steam", label: "Steam", tags: ["game", "gaming", "store"] },
    { key: "home-service", type: "material", name: "home-variant", label: "Home Service", tags: ["home", "utility", "service"] },
    { key: "pet", type: "material", name: "paw", label: "Pet", tags: ["pet", "dog", "cat"] },
    { key: "family", type: "material", name: "human-male-female-child", label: "Family", tags: ["family", "kids", "home"] },
    { key: "phone", type: "material", name: "cellphone", label: "Mobile", tags: ["phone", "carrier", "device"] },
    { key: "internet", type: "material", name: "wifi", label: "Internet", tags: ["wifi", "network", "utility"] },
    { key: "user", type: "material", name: "account-circle", label: "User", tags: ["account", "profile", "person"] },
] as const satisfies readonly SubscriptionIconOption[];

export type IconKey = (typeof SUBSCRIPTION_ICON_OPTIONS)[number]["key"];

/** Icons shown in “add subscription” (excludes nav / generic UI glyphs). */
export const SUBSCRIPTION_PICKER_ICONS: IconKey[] = SUBSCRIPTION_ICON_OPTIONS.map(
    (option) => option.key,
).filter(
    (key) => !["activity", "setting", "user"].includes(key),
);

const ICON_COLORS: Record<string, string> = {
    netflix: "#e50914",
    youtube: "#ff0033",
    spotify: "#1db954",
    music: "#8b5cf6",
    podcast: "#f97316",
    github: "#111827",
    figma: "#a855f7",
    openai: "#10a37f",
    claude: "#d97757",
    notion: "#111827",
    canva: "#00c4cc",
    adobe: "#fa0f00",
    dropbox: "#0061ff",
    slack: "#611f69",
    discord: "#5865f2",
    telegram: "#229ed9",
    whatsapp: "#25d366",
    zoom: "#2d8cff",
    microsoft: "#00a4ef",
    google: "#4285f4",
    trello: "#0079bf",
    jira: "#0052cc",
    asana: "#f06a6a",
    linear: "#5e6ad2",
    drive: "#0f9d58",
    icloud: "#38bdf8",
    vpn: "#0f766e",
    password: "#dc2626",
    database: "#7c3aed",
    server: "#475569",
    cloud: "#0ea5e9",
    aws: "#ff9900",
    azure: "#0078d4",
    cloudflare: "#f38020",
    vercel: "#111827",
    terminal: "#16a34a",
    api: "#0891b2",
    code: "#2563eb",
    npm: "#cb3837",
    docker: "#2496ed",
    kubernetes: "#326ce5",
    design: "#ec4899",
    photo: "#14b8a6",
    "video-edit": "#f59e0b",
    writing: "#0f766e",
    book: "#7c2d12",
    learning: "#2563eb",
    fitness: "#dc2626",
    meal: "#ea580c",
    coffee: "#92400e",
    shopping: "#db2777",
    delivery: "#ca8a04",
    news: "#334155",
    finance: "#16a34a",
    bank: "#0f766e",
    card: "#6366f1",
    receipt: "#64748b",
    ai: "#9333ea",
    automation: "#0891b2",
    game: "#7c3aed",
    xbox: "#107c10",
    playstation: "#003791",
    "home-service": "#0f766e",
    phone: "#0284c7",
    internet: "#2563eb",
    wallet: "#0f766e",
    medium: "#111827",
    user: "#0f766e",
    twitch: "#9146ff",
    patreon: "#ff424d",
    reddit: "#ff4500",
    linkedin: "#0a66c2",
    instagram: "#d946ef",
    headphones: "#7c3aed",
    monday: "#f59e0b",
    crm: "#2563eb",
    antivirus: "#16a34a",
    identity: "#0f766e",
    wordpress: "#21759b",
    shopify: "#7ab55c",
    analytics: "#0ea5e9",
    language: "#6366f1",
    health: "#dc2626",
    meditation: "#8b5cf6",
    travel: "#0284c7",
    transport: "#2563eb",
    car: "#334155",
    tax: "#0f766e",
    investment: "#16a34a",
    steam: "#171a21",
    pet: "#ca8a04",
    family: "#db2777",
};

const ICON_BACKGROUNDS: Record<string, string> = {
    spotify: "#dcfce7",
    notion: "#f8fafc",
    github: "#e5e7eb",
    figma: "#f3e8ff",
    openai: "#d1fae5",
    claude: "#ffedd5",
    canva: "#ccfbf1",
    dropbox: "#dbeafe",
    adobe: "#fee2e2",
    medium: "#f3f4f6",
    wallet: "#ccfbf1",
    netflix: "#fee2e2",
    youtube: "#ffe4e6",
    twitch: "#ede9fe",
    patreon: "#ffe4e6",
    reddit: "#ffedd5",
    linkedin: "#dbeafe",
    instagram: "#fae8ff",
    icloud: "#e0f2fe",
    cloud: "#e0f2fe",
    cloudflare: "#ffedd5",
    aws: "#fef3c7",
    azure: "#dbeafe",
    vercel: "#f3f4f6",
    bank: "#ccfbf1",
    finance: "#dcfce7",
    tax: "#d1fae5",
    investment: "#dcfce7",
    ai: "#f3e8ff",
    automation: "#cffafe",
    design: "#fce7f3",
    photo: "#ccfbf1",
    "video-edit": "#fef3c7",
    game: "#ede9fe",
    steam: "#e5e7eb",
    health: "#fee2e2",
    fitness: "#fee2e2",
    meditation: "#ede9fe",
    meal: "#ffedd5",
    coffee: "#fef3c7",
    shopping: "#fce7f3",
    delivery: "#fef3c7",
};

const BRAND_ICON_PRIORITY: IconKey[] = [
    "spotify",
    "notion",
    "github",
    "figma",
    "openai",
    "claude",
    "canva",
    "dropbox",
    "adobe",
    "medium",
    "netflix",
    "youtube",
    "icloud",
    "slack",
    "google",
    "microsoft",
];

export function getIconColor(key: string | null | undefined) {
    return key ? ICON_COLORS[key] ?? "#0f766e" : "#0f766e";
}

export function getIconBackgroundColor(key: string | null | undefined) {
    return key ? ICON_BACKGROUNDS[key] ?? "#e0f2fe" : "#e0f2fe";
}

export function getSubscriptionIconOption(
    key: string | null | undefined,
): SubscriptionIconOption {
    return (
        SUBSCRIPTION_ICON_OPTIONS.find((option) => option.key === key) ??
        SUBSCRIPTION_ICON_OPTIONS.find((option) => option.key === "wallet") ??
        SUBSCRIPTION_ICON_OPTIONS[0]
    );
}

export function getIconImageSource(key: string | null | undefined): ImageSourcePropType {
    return key && key in imageIcons
        ? imageIcons[key as ImageIconKey]
        : imageIcons.wallet;
}

export function isSubscriptionIconKey(key: string | null | undefined): key is IconKey {
    return SUBSCRIPTION_ICON_OPTIONS.some((option) => option.key === key);
}

export function searchSubscriptionIcons(query: string) {
    const normalized = query.trim().toLowerCase();
    const options: readonly SubscriptionIconOption[] = SUBSCRIPTION_ICON_OPTIONS.filter((option) =>
        SUBSCRIPTION_PICKER_ICONS.includes(option.key),
    );
    if (!normalized) {
        const priorityOptions = BRAND_ICON_PRIORITY.flatMap((key) => {
            const option = options.find((item) => item.key === key);
            return option ? [option] : [];
        });

        return [
            ...priorityOptions,
            ...options.filter(
                (option) => !BRAND_ICON_PRIORITY.includes(option.key as IconKey),
            ),
        ];
    }

    return options.filter((option) => {
        const haystack = [option.key, option.label, ...option.tags]
            .join(" ")
            .toLowerCase();
        return haystack.includes(normalized);
    });
}

export function getIconLabel(key: string | null | undefined) {
    return getSubscriptionIconOption(key).label;
}

export function getIconAssetIfImage(key: string | null | undefined) {
    return key && key in imageIcons ? imageIcons[key as ImageIconKey] : null;
}

export function getIconFallbackImage(): ImageSourcePropType {
    return imageIcons.wallet;
}

export function isImageIcon(key: string | null | undefined): key is ImageIconKey {
    return Boolean(key && key in imageIcons);
}

export function getIconOptionForName(name: string) {
    const normalized = name.trim().toLowerCase();
    if (!normalized) return null;
    return (
        SUBSCRIPTION_ICON_OPTIONS.find((option) =>
            [option.key, option.label, ...option.tags]
                .join(" ")
                .toLowerCase()
                .includes(normalized),
        ) ?? null
    );
}

export const SUBSCRIPTION_ICON_SEARCH_HINTS = [
    "netflix",
    "cloud",
    "ai",
    "music",
    "bank",
    "fitness",
    "vpn",
];