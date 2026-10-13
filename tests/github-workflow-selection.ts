import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

export interface WorkflowStep {
  run: string | null
  env: Record<string, string>
}

export interface WorkflowJob {
  id: string
  ifExpression: string | null
  steps: WorkflowStep[]
}

export interface WorkflowFile {
  path: string
  name: string
  triggers: WorkflowTriggers
  jobs: WorkflowJob[]
  source: string
}

export interface WorkflowTriggers {
  pullRequest: boolean
  pullRequestTarget: boolean
  workflowDispatch: boolean
  workflowRun: boolean
  schedule: boolean
  pushBranches: string[] | null
  other: string[]
}

export type GithubEvent =
  | { type: 'pull_request', baseBranch: string, headBranch: string }
  | { type: 'push', branch: string }
  | { type: 'pull_request_target', baseBranch: string }
  | { type: 'workflow_dispatch' }
  | { type: 'workflow_run', triggeringEvent: string, headBranch: string, conclusion: string }
  | { type: 'schedule' }

export interface SelectedJob {
  workflowPath: string
  workflowName: string
  job: WorkflowJob
}

const SECRET_PATTERN = /\$\{\{\s*secrets\./
const DEPLOY_PATTERN = /wrangler pages deploy\b/

export function loadWorkflows(directory: string): WorkflowFile[] {
  return readdirSync(directory)
    .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
    .sort()
    .map((name) => parseWorkflow(readFileSync(path.join(directory, name), 'utf8'), name))
}

export function parseWorkflow(source: string, filePath: string): WorkflowFile {
  const lines = source.split(/\r?\n/)
  const name = topLevelScalar(lines, 'name') ?? filePath
  const onBlock = blockLines(lines, 'on')
  const jobsBlock = blockLines(lines, 'jobs')
  return {
    path: filePath,
    name,
    triggers: parseTriggers(onBlock),
    jobs: parseJobs(jobsBlock),
    source,
  }
}

export function selectJobs(workflows: readonly WorkflowFile[], event: GithubEvent): SelectedJob[] {
  const selected: SelectedJob[] = []
  for (const workflow of workflows) {
    if (!workflowMatches(workflow, event)) continue
    for (const job of workflow.jobs) {
      if (!jobMatches(job, event)) continue
      selected.push({ workflowPath: workflow.path, workflowName: workflow.name, job })
    }
  }
  return selected
}

export function jobUsesProductionSecrets(job: WorkflowJob): boolean {
  return job.steps.some((step) => SECRET_PATTERN.test(step.run ?? '') || Object.values(step.env).some((value) => SECRET_PATTERN.test(value)))
}

export function jobDeploysPages(job: WorkflowJob): boolean {
  return job.steps.some((step) => DEPLOY_PATTERN.test(step.run ?? ''))
}

export function deployStepFollowsChecks(job: WorkflowJob): boolean {
  const commands = job.steps.map((step) => step.run ?? '')
  const deployAt = commands.findIndex((command) => DEPLOY_PATTERN.test(command))
  if (deployAt < 0) return false
  const before = commands.slice(0, deployAt)
  return before.some((command) => command.trim() === 'npm run lint')
    && before.some((command) => command.trim() === 'npm test')
    && before.some((command) => command.trim() === 'npm run pages:build')
}

function workflowMatches(workflow: WorkflowFile, event: GithubEvent): boolean {
  const triggers = workflow.triggers
  if (event.type === 'pull_request') return triggers.pullRequest
  if (event.type === 'pull_request_target') return triggers.pullRequestTarget
  if (event.type === 'workflow_dispatch') return triggers.workflowDispatch
  if (event.type === 'schedule') return triggers.schedule
  if (event.type === 'workflow_run') return triggers.workflowRun
  if (triggers.pushBranches === null) return false
  return triggers.pushBranches.includes(event.branch)
}

function jobMatches(job: WorkflowJob, event: GithubEvent): boolean {
  if (job.ifExpression === null) return true
  return evaluateIf(job.ifExpression, event)
}

function evaluateIf(expression: string, event: GithubEvent): boolean {
  const normalized = expression.replace(/\s+/g, ' ').trim()
  const pushMain = "github.event_name == 'push' && github.ref == 'refs/heads/main'"
  const workflowRunPushMain = "github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.event == 'push' && github.event.workflow_run.head_branch == 'main'"
  if (normalized === pushMain) return event.type === 'push' && event.branch === 'main'
  if (normalized === workflowRunPushMain) {
    return event.type === 'workflow_run'
      && event.conclusion === 'success'
      && event.triggeringEvent === 'push'
      && event.headBranch === 'main'
  }
  throw new Error(`Expresión if no reconocida: ${expression}`)
}

function parseTriggers(lines: string[]): WorkflowTriggers {
  const triggers: WorkflowTriggers = {
    pullRequest: false,
    pullRequestTarget: false,
    workflowDispatch: false,
    workflowRun: false,
    schedule: false,
    pushBranches: null,
    other: [],
  }
  if (lines.length === 0) return triggers
  const events = childBlocks(lines)
  for (const event of events) {
    if (event.key === 'pull_request') triggers.pullRequest = true
    else if (event.key === 'pull_request_target') triggers.pullRequestTarget = true
    else if (event.key === 'workflow_dispatch') triggers.workflowDispatch = true
    else if (event.key === 'workflow_run') triggers.workflowRun = true
    else if (event.key === 'schedule') triggers.schedule = true
    else if (event.key === 'push') triggers.pushBranches = branchList(event.lines)
    else triggers.other.push(event.key)
  }
  return triggers
}

function branchList(lines: string[]): string[] {
  const branches = childBlocks(lines).find((child) => child.key === 'branches')
  if (!branches) return []
  return listItems(branches.lines.length > 0 ? branches.lines : [branches.inline])
}

function parseJobs(lines: string[]): WorkflowJob[] {
  return childBlocks(lines).map((job) => {
    const ifBlock = childBlocks(job.lines).find((child) => child.key === 'if')
    const steps = childBlocks(job.lines).find((child) => child.key === 'steps')
    return {
      id: job.key,
      ifExpression: ifBlock ? (ifBlock.inline || joinFolded(ifBlock.lines)) : null,
      steps: steps ? parseSteps(steps.lines) : [],
    }
  })
}

function parseSteps(lines: string[]): WorkflowStep[] {
  const items: string[][] = []
  let current: string[] | null = null
  for (const line of lines) {
    if (/^\s*-\s+/.test(line)) {
      if (current) items.push(current)
      current = [line.replace(/^(\s*)-\s+/, '$1  ')]
    } else if (current && line.trim() !== '') {
      current.push(line)
    }
  }
  if (current) items.push(current)
  return items.map(parseStep)
}

function parseStep(lines: string[]): WorkflowStep {
  const indent = Math.min(...lines.filter((line) => line.trim() !== '').map(leadingSpaces))
  const normalized = lines.map((line) => (line.trim() === '' ? line : line.slice(indent)))
  const children = childBlocks(normalized)
  const run = children.find((child) => child.key === 'run')
  const env = children.find((child) => child.key === 'env')
  const values: Record<string, string> = {}
  if (env) {
    for (const entry of childBlocks(env.lines)) {
      values[entry.key] = unquote(entry.inline)
    }
  }
  return { run: run ? unquote(run.inline) : null, env: values }
}

function topLevelScalar(lines: string[], key: string): string | null {
  const match = lines.find((line) => line.startsWith(`${key}:`))
  if (!match) return null
  return unquote(match.slice(key.length + 1).trim())
}

function blockLines(lines: string[], key: string): string[] {
  const start = lines.findIndex((line) => line.startsWith(`${key}:`))
  if (start < 0) return []
  const body: string[] = []
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index]
    if (line.trim() === '') {
      body.push(line)
      continue
    }
    if (!line.startsWith(' ')) break
    body.push(line)
  }
  return body
}

interface ChildBlock {
  key: string
  inline: string
  lines: string[]
}

function childBlocks(lines: string[]): ChildBlock[] {
  const blocks: ChildBlock[] = []
  const content = lines.filter((line) => line.trim() !== '')
  if (content.length === 0) return blocks
  const indent = content.reduce((min, line) => Math.min(min, leadingSpaces(line)), Number.POSITIVE_INFINITY)
  let current: ChildBlock | null = null
  for (const line of lines) {
    if (line.trim() === '') continue
    const spaces = leadingSpaces(line)
    if (spaces === indent) {
      const trimmed = line.trim()
      const text = trimmed.startsWith('- ') ? trimmed.slice(2) : trimmed
      const separator = text.indexOf(':')
      const key = separator === -1 ? text : text.slice(0, separator).trim()
      const inline = separator === -1 ? '' : text.slice(separator + 1).trim()
      current = { key, inline, lines: [] }
      blocks.push(current)
    } else if (current && spaces > indent) {
      current.lines.push(line)
    }
  }
  return blocks
}

function listItems(lines: string[]): string[] {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => unquote(line.slice(2).trim()))
}

function joinFolded(lines: string[]): string {
  return lines.map((line) => line.trim()).filter(Boolean).join(' ')
}

function leadingSpaces(line: string): number {
  return line.match(/^ */)?.[0].length ?? 0
}

function unquote(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}
