/*
 * Linux pretend terminal: a small file system in memory and the
 * commands beginners learn first. Error messages follow bash.
 *
 * Starting files come from the teacher, one path per line,
 * relative to the home folder:
 *
 *   notes.txt = Remember to practise!
 *   projects/
 *   projects/app.py = print("hi")
 *
 * (a trailing / makes a folder; "= text" gives a file content)
 */
import { line, splitArgs } from "./shared";

const dir = () => ({ type: "dir", children: {} });
const file = (content = "") => ({ type: "file", content });

/* Deep copy, so every command returns a new state. */
const clone = (node) =>
  node.type === "dir"
    ? { type: "dir", children: Object.fromEntries(Object.entries(node.children).map(([name, child]) => [name, clone(child)])) }
    : { ...node };

const VALID_NAME = /^[^/\0]+$/;

export function createLinuxState(data) {
  const user = /^[a-z_][a-z0-9_-]*$/i.test(String(data?.username ?? "").trim())
    ? String(data.username).trim()
    : "student";

  const root = dir();
  root.children.home = dir();
  root.children.home.children[user] = dir();
  const home = ["home", user];

  // Build the teacher's starting files inside the home folder.
  String(data?.start_files ?? "")
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const [rawPath, ...rest] = entry.split(" = ");
      const isFolder = rawPath.trim().endsWith("/");
      const parts = rawPath.trim().split("/").filter(Boolean);
      if (parts.length === 0 || parts.some((part) => part === "." || part === "..")) return;

      let node = root.children.home.children[user];
      parts.forEach((part, index) => {
        const last = index === parts.length - 1;
        if (last && !isFolder) {
          if (!node.children[part]) node.children[part] = file(rest.join(" = "));
        } else {
          if (!node.children[part] || node.children[part].type !== "dir") node.children[part] = dir();
          node = node.children[part];
        }
      });
    });

  return { root, user, home, cwd: [...home], previous: null };
}

/* ---------- paths ---------- */

function resolve(state, rawPath) {
  const text = String(rawPath ?? "");
  let parts;

  if (text === "" || text === "~") return [...state.home];
  if (text.startsWith("~/")) parts = [...state.home, ...text.slice(2).split("/")];
  else if (text.startsWith("/")) parts = text.split("/");
  else parts = [...state.cwd, ...text.split("/")];

  const result = [];
  parts.forEach((part) => {
    if (part === "" || part === ".") return;
    if (part === "..") result.pop();
    else result.push(part);
  });
  return result;
}

const getNode = (root, parts) => parts.reduce((node, part) => (node?.type === "dir" ? node.children[part] : undefined), root);

/* "~/docs" style path for the prompt and pwd. */
function displayPath(state, parts) {
  const home = state.home.join("/");
  const path = parts.join("/");
  if (path === home) return "~";
  if (path.startsWith(`${home}/`)) return `~/${path.slice(home.length + 1)}`;
  return `/${path}`;
}

const absolute = (parts) => `/${parts.join("/")}`;

/* ---------- commands ---------- */

const HELP =
  "pwd · ls [-a] [-l] [path] · cd [path] · mkdir [-p] name · touch name · cat file · echo text [> file | >> file] · rm [-r] path · rmdir folder · cp [-r] from to · mv from to · tree · whoami · clear";

const flagsOf = (args) => new Set(args.filter((arg) => arg.startsWith("-") && arg.length > 1).flatMap((arg) => arg.slice(1).split("")));
const operandsOf = (args) => args.filter((arg) => !(arg.startsWith("-") && arg.length > 1));

function treeLines(node, prefix = "") {
  const entries = Object.entries(node.children).sort(([a], [b]) => a.localeCompare(b));
  return entries.flatMap(([name, child], index) => {
    const last = index === entries.length - 1;
    const here = line(child.type === "dir" ? "dir" : "", `${prefix}${last ? "└── " : "├── "}${name}${child.type === "dir" ? "/" : ""}`);
    return child.type === "dir" ? [here, ...treeLines(child, `${prefix}${last ? "    " : "│   "}`)] : [here];
  });
}

export function runLinux(previousState, input) {
  const text = String(input ?? "").trim();
  if (!text) return { state: previousState, lines: [], ok: true };

  const echo = line("cmd", text.replace(/\s+/g, " "));
  const args = splitArgs(text);
  const [command, ...rest] = args;

  // Work on a copy; only kept if the command succeeds.
  const state = { ...previousState, root: clone(previousState.root), cwd: [...previousState.cwd] };
  const fail = (...messages) => ({ state: previousState, lines: [echo, ...messages.map((message) => line("bad", message))], ok: false });
  const done = (lines = [], nextState = state) => ({ state: nextState, lines: [echo, ...lines], ok: true });

  switch (command) {
    case "clear":
      return { state: previousState, lines: [], clear: true, ok: true };

    case "help":
      return done([line("dim", "Try: ", HELP)], previousState);

    case "whoami":
      return done([line("", state.user)], previousState);

    case "pwd":
      return done([line("", absolute(state.cwd))], previousState);

    case "ls": {
      const flags = flagsOf(rest);
      const targets = operandsOf(rest);
      const paths = targets.length ? targets : ["."];
      const lines = [];

      for (const target of paths) {
        const node = getNode(state.root, resolve(state, target));
        if (!node) return fail(`ls: cannot access '${target}': No such file or directory`);
        if (paths.length > 1) lines.push(line("dim", `${target}:`));

        if (node.type === "file") {
          lines.push(line("", target));
          continue;
        }

        let names = Object.keys(node.children).sort((a, b) => a.localeCompare(b));
        if (!flags.has("a")) names = names.filter((name) => !name.startsWith("."));
        if (flags.has("a")) names = [".", "..", ...names];

        if (flags.has("l")) {
          names.forEach((name) => {
            const child = name === "." || name === ".." ? dir() : node.children[name];
            const isDir = child.type === "dir";
            const size = isDir ? 4096 : child.content.length;
            lines.push(line(isDir ? "dir" : "", `${isDir ? "d" : "-"}rw-r--r-- 1 ${state.user} ${state.user} ${String(size).padStart(5)} ${name}`));
          });
        } else if (names.length) {
          lines.push(
            line(
              "",
              ...names.flatMap((name, index) => {
                const isDir = name === "." || name === ".." || node.children[name]?.type === "dir";
                const label = isDir ? { b: `${name}/` } : name;
                return index ? ["   ", label] : [label];
              })
            )
          );
        }
      }
      return done(lines, previousState);
    }

    case "cd": {
      const target = operandsOf(rest)[0];
      if (target === "-") {
        if (!state.previous) return fail("cd: OLDPWD not set");
        return done([line("", displayPath(state, state.previous))], { ...state, cwd: state.previous, previous: state.cwd });
      }
      const parts = resolve(state, target);
      const node = getNode(state.root, parts);
      if (!node) return fail(`cd: ${target}: No such file or directory`);
      if (node.type !== "dir") return fail(`cd: ${target}: Not a directory`);
      return done([], { ...previousState, cwd: parts, previous: previousState.cwd });
    }

    case "mkdir": {
      const flags = flagsOf(rest);
      const names = operandsOf(rest);
      if (!names.length) return fail("mkdir: missing operand");

      for (const name of names) {
        const parts = resolve(state, name);
        if (getNode(state.root, parts)) {
          if (flags.has("p")) continue;
          return fail(`mkdir: cannot create directory '${name}': File exists`);
        }
        let node = state.root;
        for (let index = 0; index < parts.length; index += 1) {
          const part = parts[index];
          const last = index === parts.length - 1;
          if (!VALID_NAME.test(part)) return fail(`mkdir: cannot create directory '${name}': Invalid name`);
          if (!node.children[part]) {
            if (!last && !flags.has("p")) return fail(`mkdir: cannot create directory '${name}': No such file or directory`);
            node.children[part] = dir();
          } else if (node.children[part].type !== "dir") {
            return fail(`mkdir: cannot create directory '${name}': Not a directory`);
          }
          node = node.children[part];
        }
      }
      return done();
    }

    case "touch": {
      const names = operandsOf(rest);
      if (!names.length) return fail("touch: missing file operand");
      for (const name of names) {
        const parts = resolve(state, name);
        const parent = getNode(state.root, parts.slice(0, -1));
        if (!parent || parent.type !== "dir") return fail(`touch: cannot touch '${name}': No such file or directory`);
        const base = parts[parts.length - 1];
        if (!parent.children[base]) parent.children[base] = file("");
      }
      return done();
    }

    case "cat": {
      const names = operandsOf(rest);
      if (!names.length) return fail("cat: missing file operand");
      const lines = [];
      for (const name of names) {
        const node = getNode(state.root, resolve(state, name));
        if (!node) return fail(`cat: ${name}: No such file or directory`);
        if (node.type === "dir") return fail(`cat: ${name}: Is a directory`);
        if (node.content) node.content.split("\n").forEach((part) => lines.push(line("", part)));
      }
      return done(lines, previousState);
    }

    case "echo": {
      const redirect = rest.findIndex((arg) => arg === ">" || arg === ">>");
      const words = redirect === -1 ? rest : rest.slice(0, redirect);
      const output = words.join(" ");

      if (redirect === -1) return done([line("", output)], previousState);

      const target = rest[redirect + 1];
      if (!target) return fail("bash: syntax error near unexpected token `newline'");
      const parts = resolve(state, target);
      const parent = getNode(state.root, parts.slice(0, -1));
      if (!parent || parent.type !== "dir") return fail(`bash: ${target}: No such file or directory`);
      const base = parts[parts.length - 1];
      const existing = parent.children[base];
      if (existing?.type === "dir") return fail(`bash: ${target}: Is a directory`);

      const append = rest[redirect] === ">>" && existing;
      parent.children[base] = file(append ? `${existing.content}${existing.content ? "\n" : ""}${output}` : output);
      return done();
    }

    case "rm": {
      const flags = flagsOf(rest);
      const names = operandsOf(rest);
      if (!names.length) return fail("rm: missing operand");
      for (const name of names) {
        const parts = resolve(state, name);
        const node = getNode(state.root, parts);
        if (!node) return fail(`rm: cannot remove '${name}': No such file or directory`);
        if (node.type === "dir" && !flags.has("r")) return fail(`rm: cannot remove '${name}': Is a directory`);
        // Removing the folder you're in (or one above it) would leave you nowhere.
        if (parts.every((part, index) => state.cwd[index] === part)) {
          return fail(`rm: refusing to remove '${name}': you are inside it`);
        }
        delete getNode(state.root, parts.slice(0, -1)).children[parts[parts.length - 1]];
      }
      return done();
    }

    case "rmdir": {
      const names = operandsOf(rest);
      if (!names.length) return fail("rmdir: missing operand");
      for (const name of names) {
        const parts = resolve(state, name);
        const node = getNode(state.root, parts);
        if (!node) return fail(`rmdir: failed to remove '${name}': No such file or directory`);
        if (node.type !== "dir") return fail(`rmdir: failed to remove '${name}': Not a directory`);
        if (Object.keys(node.children).length) return fail(`rmdir: failed to remove '${name}': Directory not empty`);
        delete getNode(state.root, parts.slice(0, -1)).children[parts[parts.length - 1]];
      }
      return done();
    }

    case "cp":
    case "mv": {
      const flags = flagsOf(rest);
      const [from, to] = operandsOf(rest);
      if (!from || !to) return fail(`${command}: missing file operand`);

      const fromParts = resolve(state, from);
      const source = getNode(state.root, fromParts);
      if (!source) return fail(`${command}: cannot stat '${from}': No such file or directory`);
      if (command === "cp" && source.type === "dir" && !flags.has("r")) return fail(`cp: -r not specified; omitting directory '${from}'`);

      let toParts = resolve(state, to);
      const destination = getNode(state.root, toParts);
      if (destination?.type === "dir") toParts = [...toParts, fromParts[fromParts.length - 1]];

      if (toParts.join("/").startsWith(`${fromParts.join("/")}/`)) {
        return fail(`${command}: cannot ${command === "cp" ? "copy" : "move"} '${from}' into itself`);
      }

      const parent = getNode(state.root, toParts.slice(0, -1));
      if (!parent || parent.type !== "dir") return fail(`${command}: cannot create '${to}': No such file or directory`);

      parent.children[toParts[toParts.length - 1]] = clone(source);
      if (command === "mv") delete getNode(state.root, fromParts.slice(0, -1)).children[fromParts[fromParts.length - 1]];
      return done();
    }

    case "tree": {
      const target = operandsOf(rest)[0];
      const node = getNode(state.root, resolve(state, target));
      if (!node || node.type !== "dir") return fail(`tree: ${target || "."}: No such directory`);
      return done([line("dir", target || "."), ...treeLines(node)], previousState);
    }

    default:
      return fail(`${command}: command not found`);
  }
}

export const linuxPrompt = (state) => `${state.user}@mentorxn:${displayPath(state, state.cwd)}`;

/* The home folder as a tree, for the side panel. */
export function homeTree(state) {
  const home = getNode(state.root, state.home);
  const cwd = state.cwd.join("/");

  const walk = (node, parts) =>
    Object.entries(node.children)
      .sort(([a, x], [b, y]) => (x.type === y.type ? a.localeCompare(b) : x.type === "dir" ? -1 : 1))
      .map(([name, child]) => {
        const path = [...parts, name];
        return {
          name,
          isDir: child.type === "dir",
          isCurrent: path.join("/") === cwd,
          children: child.type === "dir" ? walk(child, path) : [],
        };
      });

  return { isCurrent: state.home.join("/") === cwd, items: walk(home, state.home) };
}
