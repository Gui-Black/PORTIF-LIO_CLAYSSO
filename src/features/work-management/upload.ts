import type { SupabaseClient } from '@supabase/supabase-js'
export type UploadStage = 'check' | 'storage' | 'database'

export class UploadFailure extends Error {}

export function describeUploadFailure(error: unknown, stage: UploadStage) {
  const details = error && typeof error === 'object' ? error : {}
  const code = 'code' in details ? String(details.code) : ''
  const status = 'statusCode' in details ? String(details.statusCode) : ''
  const name = 'name' in details ? String(details.name) : ''
  if (code === 'PGRST202' || code === '42883')
    return 'A função de associar a foto não está disponível no banco. Execute npm run supabase:migrate no terminal do projeto e retome este envio.'
  if (code === '40001')
    return 'O rascunho foi alterado. Clique em Recarregar rascunho e depois em Retomar envio pendente.'
  if (code === '42501' || status === '403' || status === '401')
    return 'O envio foi recusado por falta de autorização. Confira a sessão e a permissão administrativa no Supabase.'
  if (status === '413')
    return 'O Storage recusou o tamanho do arquivo. Use uma foto de até 10 MiB.'
  if (status === '409')
    return 'Já existe um arquivo para esta tentativa. Clique em Retomar envio pendente para conferir o arquivo e concluir a associação.'
  const operation = {
    check: 'conferir o arquivo da tentativa anterior',
    storage: 'enviar o arquivo ao Storage',
    database: 'associar a fotografia ao trabalho',
  }[stage]
  if (name === 'TimeoutError' || name === 'AbortError')
    return `O tempo de espera terminou ao ${operation}. Confira se o Supabase local está respondendo e retome o envio.`
  if (stage === 'database')
    return 'O arquivo está no Storage, mas não foi possível confirmar sua associação ao trabalho. Confira as migrações, recarregue o rascunho e retome o envio.'
  return `Não foi possível ${operation}. Confira a conexão e o serviço Storage do Supabase local antes de retomar o envio.`
}

export function imageExtension(type: string, bytes: Uint8Array) {
  if (
    type === 'image/jpeg' &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  )
    return 'jpg'
  if (
    type === 'image/png' &&
    [137, 80, 78, 71, 13, 10, 26, 10].every(
      (value, index) => bytes[index] === value,
    )
  )
    return 'png'
  if (
    type === 'image/webp' &&
    new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
    new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP'
  )
    return 'webp'
  throw new Error('Selecione uma fotografia JPEG, PNG ou WebP válida.')
}

export type UploadJob = {
  id: string
  path: string
  file: File
  alt: string
  width: number
  height: number
  attempted: boolean
}

export async function prepareUpload(
  file: File,
  alt: string,
  versionId: string,
): Promise<UploadJob> {
  if (file.size <= 0 || file.size > 10 * 1024 * 1024)
    throw new Error('A fotografia deve ter até 10 MiB.')
  if (!alt.trim() || alt.trim().length > 500)
    throw new Error('Descreva a fotografia em até 500 caracteres.')
  const extension = imageExtension(
    file.type,
    new Uint8Array(await file.slice(0, 12).arrayBuffer()),
  )
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('Não foi possível ler essa imagem.')
  }
  const { width, height } = bitmap
  bitmap.close()
  if (width > 20000 || height > 20000 || width * height > 40_000_000)
    throw new Error(
      'Use uma fotografia com até 40 megapixels e 20 mil pixels por lado.',
    )
  const id = crypto.randomUUID()
  return {
    id,
    path: `${versionId}/${id}.${extension}`,
    file,
    alt: alt.trim(),
    width,
    height,
    attempted: false,
  }
}

export async function sendPhoto(
  client: SupabaseClient,
  job: UploadJob,
  versionId: string,
  revision: number,
  report: (message: string) => void,
) {
  const bucket = client.storage.from('portfolio')
  let stage: UploadStage = job.attempted ? 'check' : 'storage'
  try {
    let alreadyUploaded = false
    if (job.attempted) {
      report('Conferindo tentativa anterior…')
      const previous = await bucket.download(job.path)
      if (
        previous.error &&
        !['404', '400'].includes(String(previous.error.statusCode))
      )
        throw previous.error
      if (previous.data) {
        const digests = await Promise.all(
          [previous.data, job.file].map(
            async (blob) =>
              new Uint8Array(
                await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()),
              ),
          ),
        )
        if (!digests[0]!.every((byte, index) => byte === digests[1]![index]))
          throw new Error(
            'O arquivo existente não corresponde a esta tentativa.',
          )
        alreadyUploaded = true
      }
    }
    job.attempted = true
    if (!alreadyUploaded) {
      stage = 'storage'
      report('Enviando fotografia…')
      const result = await bucket.upload(job.path, job.file, {
        contentType: job.file.type,
        upsert: false,
      })
      if (result.error) throw result.error
    }
    report('Confirmando fotografia no trabalho…')
    stage = 'database'
    const result = await client.rpc('attach_work_photo', {
      // O arquivo já foi confirmado; esta chamada associa os metadados.
      p_version_id: versionId,
      p_expected_revision: revision,
      p_photo_id: job.id,
      p_path: job.path,
      p_alt: job.alt,
      p_width: job.width,
      p_height: job.height,
    })
    if (result.error) throw result.error
  } catch (error) {
    throw new UploadFailure(describeUploadFailure(error, stage), {
      cause: error,
    })
  }
}
