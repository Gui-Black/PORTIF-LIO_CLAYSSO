import assert from 'node:assert/strict'
import test from 'node:test'
import {
  imageExtension,
  sendPhoto,
} from '../src/features/work-management/upload.ts'
import {
  filterWorks,
  findWork,
} from '../src/features/portfolio/portfolio-data.ts'

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
