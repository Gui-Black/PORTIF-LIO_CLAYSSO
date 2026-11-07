export const networkName = 'clicks-do-morty-local'
const bindingOption = 'com.docker.network.bridge.host_binding_ipv4'

function isLocalEndpoint(endpoint) {
  return (
    endpoint.startsWith('unix:///') || endpoint.startsWith('npipe:////./pipe/')
  )
}

export function checkLocalDocker(runDocker, environment = process.env) {
  if (environment.DOCKER_HOST && !isLocalEndpoint(environment.DOCKER_HOST)) {
    throw new Error(
      'DOCKER_HOST deve apontar para o Docker local deste computador.',
    )
  }

  const endpoint = runDocker([
    'context',
    'inspect',
    '--format',
    '{{.Endpoints.docker.Host}}',
  ]).trim()

  if (!isLocalEndpoint(endpoint)) {
    throw new Error(
      'Selecione um contexto Docker local; destinos remotos não são aceitos.',
    )
  }

  const operatingSystem = runDocker(['info', '--format', '{{.OSType}}']).trim()
  if (operatingSystem !== 'linux') {
    throw new Error(
      'Configure o Docker Desktop para executar containers Linux.',
    )
  }
}

export function ensureLocalNetwork(runDocker) {
  const existing = runDocker([
    'network',
    'ls',
    '--filter',
    `name=^${networkName}$`,
    '--format',
    '{{.Name}}',
  ]).trim()

  if (!existing) {
    runDocker([
      'network',
      'create',
      '--driver',
      'bridge',
      '--opt',
      `${bindingOption}=127.0.0.1`,
      networkName,
    ])
  }

  const [network] = JSON.parse(runDocker(['network', 'inspect', networkName]))
  if (
    network?.Driver !== 'bridge' ||
    network?.Options?.[bindingOption] !== '127.0.0.1'
  ) {
    throw new Error(
      `A rede ${networkName} precisa usar bridge e publicar portas em 127.0.0.1. Revise sua configuração antes de iniciar.`,
    )
  }
}
