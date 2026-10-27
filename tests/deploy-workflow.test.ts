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
  assert.equal(selectJobs(workflows, pushMain).some((item) => item.workflowPath === 'publish-editorial-article.yml' && item.job.id === 'publish'), true)
  assert.equal(jobUsesProductionSecrets(deploy.job), true)
  assert.equal(selected.some((item) => item.workflowPath === 'ci.yml' && item.job.id === 'ci'), false)
})

test('el job deploy declara environment production y no pasa CLOUDFLARE_D1_DATABASE_ID', () => {
  const deploy = workflows.find((workflow) => workflow.path === 'deploy.yml')
  assert.ok(deploy)
  assert.equal(deploy.triggers.pullRequest, false)
  assert.equal(deploy.triggers.pullRequestTarget, false)
  assert.deepEqual(deploy.triggers.pushBranches, ['main'])
  const job = deploy.jobs.find((item) => item.id === 'deploy')
  assert.ok(job)
  assert.equal(job.environment, 'production')
  const deployStep = job.steps.find((step) => /wrangler pages deploy\b/.test(step.run ?? ''))
  assert.ok(deployStep)
  assert.equal(Object.hasOwn(deployStep.env, 'CLOUDFLARE_D1_DATABASE_ID'), false)
  assert.equal(deploy.source.includes('CLOUDFLARE_D1_DATABASE_ID'), false)
  assert.match(deployStep.env.CLOUDFLARE_API_TOKEN ?? '', /secrets\.CLOUDFLARE_API_TOKEN/)
  assert.match(deployStep.env.CLOUDFLARE_ACCOUNT_ID ?? '', /secrets\.CLOUDFLARE_ACCOUNT_ID/)
  assert.equal(deployStep.run, 'npx wrangler pages deploy .vercel/output/static --project-name=trendiverse')
})

test('ci no referencia secretos de Cloudflare ni publica', () => {
  const ci = workflows.find((workflow) => workflow.path === 'ci.yml')
  assert.ok(ci)
  assert.equal(ci.triggers.pullRequest, true)
  assert.equal(ci.triggers.pushBranches, null)
  assert.equal(ci.source.includes('secrets.'), false)
  assert.equal(/wrangler pages deploy\b/.test(ci.source), false)
  assert.equal(ci.source.includes('CLOUDFLARE_'), false)
  assert.equal(ci.jobs.every((job) => job.environment === null), true)
})

test('un push a otra rama no selecciona ningún job', () => {
  assert.deepEqual(selectJobs(workflows, pushOther), [])
})

test('solo los publicadores editoriales aprobados permiten dispatch manual; no se habilitan otros disparadores', () => {
  const dispatch = selectJobs(workflows, { type: 'workflow_dispatch' })
  assert.deepEqual(dispatch.map((item) => `${item.workflowPath}:${item.job.id}`), [
    'publish-editorial-article.yml:publish',
    'publish-supplements-batch.yml:publish',
    'publish-supplements-prewritten-batch.yml:publish',
  ])
  assert.equal(dispatch.every((item) => jobUsesProductionSecrets(item.job)), true)
  assert.equal(dispatch.some((item) => jobDeploysPages(item.job)), false)

  for (const event of [
    { type: 'pull_request_target', baseBranch: 'main' },
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
