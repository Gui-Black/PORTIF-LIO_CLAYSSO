import assert from 'node:assert/strict'
import test from 'node:test'
import {
  imageExtension,
  sendPhoto,
  describeUploadFailure,
} from '../src/features/work-management/upload.ts'
import {
  filterWorks,
  findWork,
} from '../src/features/portfolio/portfolio-data.ts'

test('falhas de envio distinguem migração, revisão e Storage sem expor resposta interna', () => {
  assert.match(
    describeUploadFailure({ code: 'PGRST202' }, 'database'),
    /supabase:migrate/,
  )
  assert.match(
    describeUploadFailure({ code: '40001' }, 'database'),
    /Recarregar rascunho/,
  )
  assert.match(
    describeUploadFailure({ statusCode: '403' }, 'storage'),
    /autorização/,
  )
  assert.match(
    describeUploadFailure({ name: 'TimeoutError' }, 'storage'),
    /tempo de espera/,
  )
  assert.doesNotMatch(
    describeUploadFailure({ message: 'token-secreto' }, 'storage'),
    /token-secreto/,
  )
})

test('falha ao conferir tentativa anterior não dispara outro upload', async () => {
  const client = {
    storage: {
      from: () => ({
        download: async () => ({ error: { statusCode: '503' }, data: null }),
        upload: async () => assert.fail('não deve reenviar sem conferir'),
      }),
    },
    rpc: async () => assert.fail('não deve associar arquivo não confirmado'),
  }
  await assert.rejects(
    sendPhoto(
      client,
      { attempted: true, path: 'version/id.jpg' },
      'version',
      0,
      () => {},
    ),
    /conferir o arquivo/,
  )
})

test('arquivo enviado com RPC ausente orienta migração e preserva tentativa', async () => {
  const client = {
    storage: { from: () => ({ upload: async () => ({ error: null }) }) },
    rpc: async () => ({ error: { code: 'PGRST202' } }),
  }
  const job = {
    attempted: false,
    path: 'version/id.jpg',
    file: new File(['foto'], 'foto.jpg', { type: 'image/jpeg' }),
  }
  await assert.rejects(
    sendPhoto(client, job, 'version', 0, () => {}),
    /supabase:migrate/,
  )
  assert.equal(job.attempted, true)
})

test('tipo declarado deve corresponder à assinatura básica do arquivo', () => {
  assert.equal(
    imageExtension('image/jpeg', new Uint8Array([255, 216, 255])),
    'jpg',
  )
  assert.equal(
    imageExtension(
      'image/png',
      new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    ),
    'png',
  )
  assert.equal(
    imageExtension('image/webp', new TextEncoder().encode('RIFFxxxxWEBP')),
    'webp',
  )
  assert.throws(() =>
    imageExtension('image/jpeg', new TextEncoder().encode('<svg/>')),
  )
  assert.throws(() =>
    imageExtension('image/svg+xml', new Uint8Array([255, 216, 255])),
  )
})

test('retomada após falha de metadados reutiliza o objeto sem sobrescrever ou duplicar', async () => {
  const file = new File([new Uint8Array([255, 216, 255])], 'foto.jpg', {
    type: 'image/jpeg',
  })
  const job = {
    id: 'id',
    path: 'version/id.jpg',
    file,
    alt: 'Descrição',
    width: 800,
    height: 600,
    attempted: false,
  }
  let uploads = 0,
    attempts = 0
  const client = {
    storage: {
      from: () => ({
        upload: async (_path, _file, options) => {
          uploads++
          assert.equal(options.upsert, false)
          return { error: null }
        },
        download: async () => ({ data: file, error: null }),
      }),
    },
    rpc: async (_name, args) => {
      attempts++
      assert.equal(args.p_photo_id, 'id')
      return { error: attempts === 1 ? new Error('rede') : null }
    },
  }
  await assert.rejects(sendPhoto(client, job, 'version', 0, () => {}))
  await sendPhoto(client, job, 'version', 0, () => {})
  assert.equal(uploads, 1)
  assert.equal(attempts, 2)
})

test('catálogo vazio configurado não exibe os trabalhos de demonstração', () => {
  assert.deepEqual(filterWorks('todos', []), [])
  assert.equal(findWork('entre-lacos-e-abracos', []), undefined)
})
