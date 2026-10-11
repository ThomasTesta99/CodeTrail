export const QUESTIONS_PER_PAGE = 12;

export const sidebarLinks = [
    {
        imgUrl: '/assets/icons/dashboardIcon.svg',
        route: '/',
        label: 'Dashboard'
    },
    {
        imgUrl: '/assets/icons/listIcon.svg',
        route: '/all-questions',
        label: 'All Questions'
    },
    {
        imgUrl: '/assets/icons/plusIcon.svg',
        route: '/add-question',
        label: 'Add Question'
    },
    {
        imgUrl: '/assets/icons/settings.svg',
        route: '/settings',
        label: 'Settings'
    },
]

export const LANGUAGE_OPTIONS = [
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  { label: "Python", value: "python" },
  { label: "Python3", value: "python3" }, // Sometimes Python and Python3 are treated separately
  { label: "C", value: "c" },
  { label: "C#", value: "csharp" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Go", value: "go" },
  { label: "Ruby", value: "ruby" },
  { label: "Swift", value: "swift" },
  { label: "Kotlin", value: "kotlin" },
  { label: "Rust", value: "rust" },
  { label: "Scala", value: "scala" },
  { label: "PHP", value: "php" },
  { label: "SQL", value: "sql" },
  { label: "Bash", value: "bash" },
  { label: "Racket", value: "racket" },
  { label: "Erlang", value: "erlang" },
  { label: "Elixir", value: "elixir" },
];


// AI Feedback

export const MAX_REQUEST_BYTES = 1024;
export const MAX_CODE_LENGTH = 20_000;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 10_000;
export const MAX_NOTES_LENGTH = 2_000;
export const MAX_LANGUAGE_LENGTH = 50;
export const MAX_ATTEMPTS = 5;
export const MAX_PROMPT_LENGTH = 50_000;
export const MAX_AI_OUTPUT_TOKENS = 1500;
export const MAX_LABEL_LENGTH = 100;
export const MAX_LINK_LENGTH = 2_000;

export const AI_DAILY_MAX = 10;
export const AI_DAILY_WINDOW = '24h';

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MIN_PASSWORD_LENGTH = 10;

export const ATTEMPT_BATCH_SIZE = 10;
