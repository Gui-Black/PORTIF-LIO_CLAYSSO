import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { delimiter, dirname, isAbsolute } from 'node:path'
import { describeDockerError, resolveDockerCommand } from './docker-command.mjs'
import { verifyLocalServices } from './verify-local-services.mjs'
import {
  checkLocalDocker,
  ensureLocalNetwork,
  networkName,
} from './local-docker.mjs'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const cliPath = fileURLToPath(
  new URL('../node_modules/supabase/dist/supabase.js', import.meta.url),
)
const runtimePath = fileURLToPath(
  new URL('../.supabase/runtime', import.meta.url),
)
const [command, ...extraArguments] = process.argv.slice(2)
const dockerCommand = resolveDockerCommand()
const commandEnvironment = { ...process.env }
if (isAbsolute(dockerCommand)) {
  commandEnvironment.PATH = `${dirname(dockerCommand)}${delimiter}${process.env.PATH ?? ''}`
}

function runDocker(argumentsList) {
  try {
    return execFileSync(dockerCommand, argumentsList, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30_000,
      windowsHide: true,
      env: commandEnvironment,
    })
  } catch (error) {
    throw new Error(describeDockerError(error), { cause: error })
  }
}

function readLocalStatus(environment) {
  try {
    const output = execFileSync(
      process.execPath,
      [cliPath, 'status', '-o', 'json'],
      {
        cwd: projectRoot,
        env: environment,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 30_000,
        windowsHide: true,
      },
    )
    return JSON.parse(output)
  } catch {
    // Status contém segredos. Não imprimir stdout, stderr ou o erro da CLI.
    throw new Error(
      'Não foi possível consultar o status local em JSON. Aguarde supabase:start terminar; se falhou, envie somente a mensagem de erro da inicialização.',
    )
  }
}

try {
  if (
    !['check', 'start', 'stop', 'status', 'verify'].includes(command) ||
    extraArguments.length
  ) {
    throw new Error(
      'Use supabase:check, supabase:start, supabase:stop, supabase:status ou supabase:verify, sem argumentos adicionais.',
    )
  }

  checkLocalDocker(runDocker)
  if (command === 'start') ensureLocalNetwork(runDocker)

  const argumentsList = command === 'check' ? ['--version'] : [command]
  if (command === 'start') argumentsList.push('--network-id', networkName)

  const cliEnvironment = {
    ...commandEnvironment,
    SUPABASE_HOME: runtimePath,
    SUPABASE_NO_UPDATE_NOTIFIER: '1',
  }
  if (command === 'verify') {
    await verifyLocalServices(readLocalStatus(cliEnvironment))
  } else {
    const result = spawnSync(process.execPath, [cliPath, ...argumentsList], {
      cwd: projectRoot,
      stdio: 'inherit',
      windowsHide: true,
      env: cliEnvironment,
    })

    if (result.error)
      throw new Error(
        'Não foi possível executar a CLI. Execute npm ci e tente novamente.',
      )
    process.exitCode = result.status ?? 1
    if (command === 'check' && process.exitCode === 0) {
      console.log(
        'Docker local com containers Linux e CLI disponíveis. Os serviços ainda precisam ser iniciados.',
      )
    }
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
