# Gemini CLI Tools Analysis

This document provides an analysis of the available Gemini CLI tools, explaining
their activation context, purpose, triggers, and execution methods.

## 1. Activate Skill (`activate_skill`)

- **When it is going to be activated**: When a task involves a specialized,
  predefined workflow (e.g., creating a PR, writing documentation, reviewing
  code, or creating a new skill).
- **Why it is going to be activated**: To load expert instructions and resources
  tailored to a complex workflow, ensuring the task adheres strictly to
  established best practices and project standards.
- **What makes it activated**: The agent recognizes that the user's specific
  request maps directly to the description of one of the available skills (e.g.,
  `skill-creator`, `pr-creator`, `docs-writer`).
- **How it is going to do the task**: It executes the `activate_skill` tool with
  the appropriate skill name. This returns a specialized set of instructions
  wrapped in `<activated_skill>` tags, which the agent then follows for
  subsequent actions.

## 2. Ask User (`ask_user`)

- **When it is going to be activated**: When a user's request is ambiguous, when
  multiple valid implementation paths exist requiring a decision, or when
  explicit confirmation is needed before a potentially destructive action.
- **Why it is going to be activated**: To prevent incorrect assumptions, ensure
  strict alignment with the user's actual intent, and avoid executing unwanted
  modifications without clear consent.
- **What makes it activated**: The agent encounters missing context, an
  underspecified directive, or a need to clarify preferences that cannot be
  safely inferred from the codebase.
- **How it is going to do the task**: It generates an interactive CLI prompt
  (such as multiple-choice options, a text input field, or a yes/no
  confirmation) that pauses agent execution until the user provides a response.

## 3. CLI Help Agent (`cli_help`)

- **When it is going to be activated**: When the user asks questions
  specifically about how to use the Gemini CLI itself, its built-in features, or
  its runtime configuration.
- **Why it is going to be activated**: To provide accurate, specialized
  assistance regarding the tool's own capabilities without confusing the query
  with the user's local project codebase.
- **What makes it activated**: The user explicitly asks for help with the agent
  (e.g., "How do I configure DevTools?", "What features do you have?", or
  general usage questions).
- **How it is going to do the task**: It delegates the user's question to the
  `cli_help` sub-agent, which is specifically equipped with knowledge about the
  Gemini CLI's documentation and internal configuration.

## 4. Codebase Investigator Agent (`codebase_investigator`)

- **When it is going to be activated**: When dealing with vague requests, deep
  bug root-cause analysis, complex refactoring, or comprehensive feature
  implementations that span multiple systems.
- **Why it is going to be activated**: To systematically map out the codebase,
  analyze architectural dependencies, and gather a structured report of
  actionable insights before making widespread changes.
- **What makes it activated**: A user request that is broad in scope, requires
  significant architectural understanding, or asks high-level questions about
  the codebase structure.
- **How it is going to do the task**: It delegates the objective to the
  `codebase_investigator` sub-agent, which performs deep, autonomous analysis
  across the project and returns a structured report highlighting key file paths
  and insights.

## 5. Edit (`replace`)

- **When it is going to be activated**: When a specific, targeted modification
  needs to be made to an existing file, particularly for large files where
  rewriting the entire content is inefficient or risks losing context.
- **Why it is going to be activated**: To surgically alter code or text without
  losing surrounding context, ensuring precise, idiomatic changes while
  maintaining optimal context efficiency.
- **What makes it activated**: The agent has identified the exact location of
  the code to change and has formulated a concrete, verified plan for the new
  code block.
- **How it is going to do the task**: It takes an exact, literal block of
  `old_string`, matches it precisely within the target file, and replaces it
  with the provided `new_string`, using instructions to ensure semantic
  correctness.

## 6. Enter Plan Mode (`enter_plan_mode`)

- **When it is going to be activated**: Before beginning complex, multi-step
  changes, building entire new applications from scratch, or executing
  significant architectural refactoring.
- **Why it is going to be activated**: To safely research, design, and plan a
  comprehensive approach using exclusively read-only tools, securing user
  approval on the strategy before applying any edits.
- **What makes it activated**: The user requests a substantial new feature, a
  full application prototype, or a complex multi-file task that mandates upfront
  architectural planning according to system guidelines.
- **How it is going to do the task**: It switches the agent's state to "Plan
  Mode," restricting it to read-only operations to draft a detailed design
  document. Execution only resumes once the plan is approved.

## 7. FindFiles (`glob`)

- **When it is going to be activated**: When searching for specific files by
  their name, extension, or structural path across the workspace.
- **Why it is going to be activated**: To quickly locate relevant files based on
  patterns (e.g., finding all TypeScript files or all test files) without the
  overhead of searching their contents.
- **What makes it activated**: The agent needs to find where certain types of
  code reside or verify the existence of specific files within the project
  hierarchy.
- **How it is going to do the task**: It uses fast, glob-based pattern matching
  (e.g., `src/**/*.ts`) to return a list of absolute file paths, typically
  sorted by modification time.

## 8. GoogleSearch (`google_web_search`)

- **When it is going to be activated**: When the agent requires up-to-date
  information, API documentation, or technical solutions from the internet that
  are not present in the local codebase context.
- **Why it is going to be activated**: To resolve obscure errors, look up modern
  or updated framework documentation, or research broad technical topics
  necessary to complete a task.
- **What makes it activated**: The agent encounters a missing dependency, an
  unfamiliar API, or a complex error message that requires external knowledge to
  resolve effectively.
- **How it is going to do the task**: It performs a grounded Google Search query
  and returns synthesized answers that include citations and source URIs for
  further validation.

## 9. ReadFile (`read_file`)

- **When it is going to be activated**: When the exact contents of a specific
  file are required to understand logic, analyze bugs, or prepare for targeted
  edits.
- **Why it is going to be activated**: To empirically validate assumptions about
  code behavior, review surrounding context, or extract information from
  supported file types (text, images, audio, PDFs).
- **What makes it activated**: The agent needs to know exactly what is written
  inside a file to proceed accurately with a user's inquiry or directive.
- **How it is going to do the task**: It accesses the specified file path and
  reads its content. For large files, it utilizes `start_line` and `end_line`
  parameters to read specific chunks, optimizing context usage.

## 10. ReadFolder (`list_directory`)

- **When it is going to be activated**: When exploring and mapping the directory
  structure of the project.
- **Why it is going to be activated**: To discover what subdirectories and files
  exist within a specific path, aiding in navigation and understanding the
  project's architecture.
- **What makes it activated**: The agent needs to understand the layout of a
  specific folder to locate relevant files or decide the correct placement for
  new files.
- **How it is going to do the task**: It lists the names of files and
  subdirectories directly within the specified directory path, optionally
  applying filters from `.gitignore` or `.geminiignore`.

## 11. SaveMemory (`save_memory`)

- **When it is going to be activated**: When the user explicitly states a global
  preference, a recurring workflow instruction, or a personal fact that should
  persist across all future interactions.
- **Why it is going to be activated**: To persist high-level, session-agnostic
  context (like preferred coding styles or tool aliases) so the user doesn't
  have to repeat themselves in future workspaces.
- **What makes it activated**: The user makes a declarative statement regarding
  preferences, such as "I prefer using tabs" or "Always write tests in Vitest."
- **How it is going to do the task**: It appends a concise, generalized fact to
  a global memory file that is automatically loaded into the context of every
  workspace the CLI operates in.

## 12. SearchText (`grep_search`)

- **When it is going to be activated**: When searching for specific variables,
  function names, error messages, or exact code patterns across the contents of
  multiple files.
- **Why it is going to be activated**: To locate all usages of a specific code
  element, find the origin of thrown errors, or understand how functions are
  invoked throughout the codebase.
- **What makes it activated**: The agent needs to find the specific location of
  logic or text but does not know exactly which file it resides in.
- **How it is going to do the task**: It utilizes a highly optimized,
  ripgrep-powered regular expression search to scan file contents rapidly,
  returning matching lines and their locations, often enriched with surrounding
  context lines (`before`, `after`).

## 13. Shell (`run_shell_command`)

- **When it is going to be activated**: When interacting with the underlying
  system environment, such as running tests, executing build scripts, installing
  dependencies, or performing git operations.
- **Why it is going to be activated**: To validate code correctness (e.g.,
  running `npm run test`), manage version control, or perform tasks that rely
  heavily on external CLI tools.
- **What makes it activated**: The agent needs to execute an action requiring
  standard terminal capabilities, typically during the validation phase of the
  Execution cycle or during deep research.
- **How it is going to do the task**: It executes the exact provided bash
  command as a subprocess (`bash -c <command>`), capturing and returning the
  combined stdout/stderr output and the exit code.

## 14. WebFetch (`web_fetch`)

- **When it is going to be activated**: When specific, detailed information
  needs to be extracted from a known, provided URL, such as raw code from GitHub
  or a specific documentation page.
- **Why it is going to be activated**: To read and analyze raw external content
  directly and precisely, avoiding the noise and generalization of a broad web
  search.
- **What makes it activated**: A search result from `google_web_search` requires
  deeper, targeted analysis, or the user provides a direct URL for the agent to
  read.
- **How it is going to do the task**: It fetches the content from up to 20
  provided HTTP/HTTPS URLs and extracts the requested information based on
  highly specific instructions provided in the agent's prompt.

## 15. WriteFile (`write_file`)

- **When it is going to be activated**: When creating a brand new file from
  scratch or completely rewriting the entire contents of a small existing file.
- **Why it is going to be activated**: To scaffold new components, create test
  files, or output generated content where surgical replacements (`replace`
  tool) are not applicable or efficient.
- **What makes it activated**: The agent has finalized the entire content for a
  file that needs to be created or wholly overwritten based on the
  implementation plan.
- **How it is going to do the task**: It takes the complete string content and
  writes it directly to the specified file path, automatically creating any
  missing parent directories in the process.
