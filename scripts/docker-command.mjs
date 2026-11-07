import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { delimiter, join } from 'node:path'

export function resolveDockerCommand() {
  if (process.platform !== 'win32') return 'docker'

  const searchDirectories = [
    ...(process.env.PATH ?? '').split(delimiter).filter(Boolean),
    join(
      homedir(),
      'AppData',
      'Local',
      'Programs',
      'DockerDesktop',
      'resources',
      'bin',
    ),
    join(
      process.env.ProgramFiles ?? 'C:\\Program Files',
      'Docker',
      'Docker',
      'resources',
      'bin',
    ),
  ]

  return (
    searchDirectories
      .map((directory) => join(directory, 'docker.exe'))
      .find(existsSync) ?? 'docker'
  )
}

export function describeDockerError(error) {
  const details = String(error.stderr ?? '')
  if (error.code === 'ENOENT') {
    return 'Docker não encontrado. Instale o Docker Desktop e abra um novo terminal. Consulte docs/ambiente-local.md.'
  }
  if (
    ['EACCES', 'EPERM'].includes(error.code) ||
    /permission denied|access (?:is )?denied|acesso negado/i.test(details)
  ) {
    return 'Docker encontrado, mas esta sessão não tem permissão para acessá-lo. Execute npm run supabase:check em um PowerShell aberto por você. Não é necessário reinstalar o Docker. Consulte docs/ambiente-local.md.'
  }
  if (
    /cannot connect|is the docker daemon running|system cannot find the file|no such file or directory|connection refused/i.test(
      details,
    )
  ) {
    return 'O motor Docker não está acessível. Abra o Docker Desktop, aguarde o motor Linux iniciar e tente novamente.'
  }
  if (error.code === 'ETIMEDOUT') {
    return 'A consulta ao Docker excedeu 30 segundos. Confira o estado do Docker Desktop e tente novamente.'
  }
  return 'O comando Docker falhou. Confira o Docker Desktop e execute docker info no seu terminal para diagnosticar. Consulte docs/ambiente-local.md.'
}
