/*
 * Public course catalog shown on the landing page.
 *
 * Static for now (there's no public courses endpoint yet). When one
 * exists, replace this with an API call — the landing page only needs
 * these fields: slug, emoji, hue, title, description, lessons.
 *
 * `hue` names one of the --mx-c-* colour tokens in styles/theme/tokens.css.
 */
export const COURSES = [
  { slug: "dotnet-adventure-land", emoji: "🟢", hue: "net", category: "Web Development", title: ".NET Adventure Land", description: "Meet C# and ASP.NET Core through toy-shop examples, with a live terminal and real code.", lessons: 25 },
  { slug: "react-quest", emoji: "⚛️", hue: "web", category: "Web Development", title: "React Quest", description: "Build components, hooks and state through live, running React demos.", lessons: 24 },
  { slug: "web-quest", emoji: "🕷️", hue: "net", category: "Web Development", title: "Web Quest", description: "HTML structure and CSS styling — live box models, real flexbox/grid, and genuine :hover states.", lessons: 25 },
  { slug: "script-quest", emoji: "🦎", hue: "blocks", category: "Web Development", title: "Script Quest", description: "JavaScript fundamentals with real array methods, closures, and live DOM manipulation.", lessons: 25 },
  { slug: "code-quest", emoji: "🤖", hue: "blocks", category: "Programming & CS", title: "Code Quest", description: "Learn programming fundamentals — loops, data structures, algorithms — in plain language.", lessons: 24 },
  { slug: "class-quest", emoji: "🐘", hue: "net", category: "Programming & CS", title: "Class Quest", description: "PHP and object-oriented programming, with a real hand-built PHP interpreter running your code.", lessons: 25 },
  { slug: "query-quest", emoji: "🦉", hue: "pro", category: "Data & Databases", title: "Query Quest", description: "Write and run real SQL against a toy-shop database, right in your browser.", lessons: 24 },
  { slug: "data-quest", emoji: "🦔", hue: "pro", category: "Data & Databases", title: "Data Quest", description: "Descriptive statistics, probability and inference — the numbers behind data-driven decisions.", lessons: 24 },
  { slug: "cluster-quest", emoji: "🦒", hue: "back", category: "Infrastructure & DevOps", title: "Cluster Quest", description: "Run pods, deployments and a working kubectl terminal to learn Kubernetes hands-on.", lessons: 25 },
  { slug: "branch-quest", emoji: "🐙", hue: "final", category: "Infrastructure & DevOps", title: "Branch Quest", description: "Practice Git and GitHub with a real terminal, pull requests, and code review.", lessons: 24 },
  { slug: "packet-quest", emoji: "🕊️", hue: "extra", category: "Infrastructure & DevOps", title: "Packet Quest", description: "Explore IP addresses, DNS, routing and more through visual, interactive demos.", lessons: 22 },
  { slug: "queue-quest", emoji: "🐝", hue: "blocks", category: "Infrastructure & DevOps", title: "Queue Quest", description: "Azure Service Bus: queues, topics, sessions and the messaging patterns behind reliable systems.", lessons: 25 },
  { slug: "pipeline-quest", emoji: "🦫", hue: "back", category: "Infrastructure & DevOps", title: "Pipeline Quest", description: "Azure Boards, Repos and Pipelines — Agile planning through to a working CI/CD release.", lessons: 25 },
  { slug: "math-quest", emoji: "🦊", hue: "net", category: "Math & Science", title: "Math Quest", description: "Algebra, functions, geometry and trig — made visual, interactive, and genuinely clickable.", lessons: 25 },
  { slug: "word-quest", emoji: "🦜", hue: "final", category: "Language Arts", title: "Word Quest", description: "Intermediate English grammar, tenses and vocabulary, with matching, fill-ins and live examples.", lessons: 25 },
  { slug: "engineer-quest", emoji: "🐜", hue: "back", category: "Business & Professional", title: "Engineer Quest", description: "SDLC, Agile, SOLID principles and the whole craft of professional software engineering.", lessons: 25 },
  { slug: "ledger-quest", emoji: "🐿️", hue: "pro", category: "Business & Professional", title: "Ledger Quest", description: "Accounting fundamentals — the accounting equation, T-accounts, and all three financial statements.", lessons: 25 },
];

export const TOTAL_LESSONS = COURSES.reduce((sum, course) => sum + course.lessons, 0);
