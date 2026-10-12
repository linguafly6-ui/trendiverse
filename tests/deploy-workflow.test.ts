import assert from 'node:assert/strict'
import test from 'node:test'
import path from 'node:path'
import {
  deployStepFollowsChecks,
  jobDeploysPages,
  jobUsesProductionSecrets,
  loadWorkflows,
  parseWorkflow,
  selectJobs,
  type GithubEvent,
} from './github-workflow-selection'

const workflows = loadWorkflows(path.join(process.cwd(), '.github/workflows'))

const pullRequest: GithubEvent = { type: 'pull_request', baseBranch: 'main', headBranch: 'cursor/example-53d6' }
const pushMain: GithubEvent = { type: 'push', branch: 'main' }
const pushOther: GithubEvent = { type: 'push', branch: 'cursor/example-53d6' }

test('un pull_request no selecciona despliegue ni secretos de producción', () => {
  const selected = selectJobs(workflows, pullRequest)
  assert.deepEqual(selected.map((item) => `${item.workflowPath}:${item.job.id}`), ['ci.yml:ci'])
  assert.equal(selected.some((item) => jobDeploysPages(item.job)), false)
  assert.equal(selected.some((item) => jobUsesProductionSecrets(item.job)), false)
  for (const workflow of workflows.filter((item) => item.triggers.pullRequest || item.triggers.pullRequestTarget)) {
    assert.equal(workflow.source.includes('secrets.'), false, workflow.path)
    assert.equal(/wrangler pages deploy\b/.test(workflow.source), false, workflow.path)
  }
})

test('un push a main selecciona el despliegue después de lint, tests y build', () => {
  const selected = selectJobs(workflows, pushMain)
  const deploy = selected.find((item) => jobDeploysPages(item.job))
  assert.ok(deploy)
  assert.equal(deploy.workflowPath, 'deploy.yml')
  assert.equal(deploy.job.id, 'deploy')
  assert.equal(deployStepFollowsChecks(deploy.job), true)
  assert.equal(jobUsesProductionSecrets(deploy.job), true)
  assert.equal(selected.some((item) => item.workflowPath === 'ci.yml' && item.job.id === 'ci'), true)
})

test('un push a otra rama no selecciona ningún job', () => {
  assert.deepEqual(selectJobs(workflows, pushOther), [])
})

test('pull_request_target, workflow_dispatch, workflow_run y schedule no están habilitados', () => {
  for (const event of [
    { type: 'pull_request_target', baseBranch: 'main' },
    { type: 'workflow_dispatch' },
    { type: 'workflow_run', triggeringEvent: 'pull_request', headBranch: 'cursor/example-53d6', conclusion: 'success' },
    { type: 'workflow_run', triggeringEvent: 'push', headBranch: 'main', conclusion: 'success' },
    { type: 'schedule' },
  ] as const) {
    assert.deepEqual(selectJobs(workflows, event), [], event.type)
  }
})

test('el selector detecta un workflow de PR que sí desplegaría', () => {
  const unsafe = parseWorkflow(`
name: Unsafe
on:
  pull_request:
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint
      - run: npm test
      - run: npm run pages:build
      - name: Deploy to Cloudflare Pages
        run: npx wrangler pages deploy .vercel/output/static --project-name=trendiverse
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
`, 'unsafe.yml')
  const selected = selectJobs([unsafe], pullRequest)
  assert.equal(selected.length, 1)
  assert.equal(jobDeploysPages(selected[0].job), true)
  assert.equal(jobUsesProductionSecrets(selected[0].job), true)
})

test('el selector no trata un push ajeno como producción', () => {
  const deploy = workflows.find((workflow) => workflow.path === 'deploy.yml')
  assert.ok(deploy)
  assert.deepEqual(selectJobs([deploy], pushOther), [])
  assert.equal(selectJobs([deploy], pushMain).length, 1)
})
