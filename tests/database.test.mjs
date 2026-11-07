import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { PGlite } from '@electric-sql/pglite'

const adminId = '00000000-0000-4000-8000-000000000001'
const memberId = '00000000-0000-4000-8000-000000000002'
const categoryId = '10000000-0000-4000-8000-000000000001'
let db

before(async () => {
  db = await PGlite.create()
  await db.exec(
    await readFile(
      new URL('./fixtures/supabase-contract.sql', import.meta.url),
      'utf8',
    ),
  )
  const directory = new URL('../supabase/migrations/', import.meta.url)
  for (const file of (await readdir(directory))
    .filter((name) => name.endsWith('.sql'))
    .sort()) {
    await db.exec(await readFile(new URL(file, directory), 'utf8'))
  }
  const seed = await readFile(
    new URL('../supabase/seed.sql', import.meta.url),
    'utf8',
  )
  await db.exec(seed)
  await db.exec(seed)
  await db.query('insert into auth.users(id) values ($1), ($2)', [
    adminId,
    memberId,
  ])
  await db.query('insert into private.administrators(user_id) values ($1)', [
    adminId,
  ])
})

after(async () => {
  await db?.close()
})

async function isolated(run) {
  await db.exec('begin')
  try {
    await run()
  } finally {
    await db.exec('rollback')
  }
}

async function asRole(role, userId = '') {
  assert.ok(['anon', 'authenticated', 'postgres'].includes(role))
  await db.exec(`set local role ${role}`)
  await db.query("select set_config('request.jwt.claim.sub', $1, true)", [
    userId,
  ])
}

async function fails(sql, parameters = [], code = '42501') {
  await db.exec('savepoint expected_failure')
  try {
    await assert.rejects(db.query(sql, parameters), (error) => {
      assert.equal(error.code, code, error.message)
      return true
    })
  } finally {
    await db.exec(
      'rollback to savepoint expected_failure; release savepoint expected_failure',
    )
  }
}

async function count(table) {
  // Nomes de tabelas são constantes dos testes, nunca entrada externa.
  return Number(
    (await db.query(`select count(*) as total from ${table}`)).rows[0].total,
  )
}

async function draft(workId = randomUUID()) {
  await db.query(
    'insert into public.works(id, slug) values ($1, $2) on conflict (id) do nothing',
    [workId, `teste-${workId}`],
  )
  const versionId = randomUUID()
  await db.query(
    'insert into public.work_versions(id, work_id, category_id, title) values ($1, $2, $3, $4)',
    [versionId, workId, categoryId, 'Seleção fictícia'],
  )
  return { workId, versionId }
}

async function photo(
  versionId,
  { ready = true, upload = true, position = 0 } = {},
) {
  const id = randomUUID()
  const path = `${randomUUID()}/${randomUUID()}.webp`
  if (upload)
    await db.query(
      "insert into storage.objects(bucket_id, name, metadata) values ('portfolio', $1, $2)",
      [path, { size: 2048, mimetype: 'image/webp' }],
    )
  await db.query(
    'insert into public.photos(id, version_id, storage_path, alt_text, width, height, upload_state, sort_order) values ($1,$2,$3,$4,800,600,$5,$6)',
    [
      id,
      versionId,
      path,
      'Imagem fictícia para teste',
      ready ? 'ready' : 'pending',
      position,
    ],
  )
  return { id, path }
}

async function readyDraft(workId) {
  const work = await draft(workId)
  const cover = await photo(work.versionId)
  await db.query(
    'update public.work_versions set cover_photo_id = $1 where id = $2',
    [cover.id, work.versionId],
  )
  return { ...work, cover }
}

async function revision(versionId) {
  return (
    await db.query('select revision from public.work_versions where id = $1', [
      versionId,
    ])
  ).rows[0].revision
}

async function publish(work) {
  const expected = await revision(work.versionId)
  await db.query('select public.publish_work($1,$2,$3)', [
    work.workId,
    work.versionId,
    expected,
  ])
  return expected
}

test('migrações e seed repetível criam catálogo e rascunho privado', () =>
  isolated(async () => {
    await asRole('anon')
    assert.equal(await count('public.categories'), 5)
    assert.equal(await count('public.site_settings'), 1)
    assert.equal(await count('public.works'), 0)
    assert.equal(await count('public.work_versions'), 0)
    assert.equal(await count('public.photos'), 0)
    assert.equal(await count('storage.objects'), 0)
    await fails('select * from private.administrators')
  }))

test('visitante e conta comum não editam, publicam ou concedem acesso administrativo', () =>
  isolated(async () => {
    for (const [role, uid] of [
      ['anon', ''],
      ['authenticated', memberId],
    ]) {
      await asRole(role, uid)
      await fails(
        "insert into public.categories(slug,name) values ('invasao','Não permitido')",
      )
      await fails('insert into private.administrators(user_id) values ($1)', [
        memberId,
      ])
      await fails('select public.publish_work($1,$2,0)', [
        randomUUID(),
        randomUUID(),
      ])
      await fails('select public.unpublish_work($1,$2)', [
        randomUUID(),
        randomUUID(),
      ])
      await fails(
        "insert into storage.objects(bucket_id,name) values ('portfolio',$1)",
        [`${randomUUID()}/${randomUUID()}.jpg`],
      )
    }
    await asRole('authenticated', memberId)
    assert.equal(
      (await db.query("update public.site_settings set brand_name='Ataque'"))
        .affectedRows,
      0,
    )
    assert.equal(
      (await db.query('delete from public.categories')).affectedRows,
      0,
    )
  }))

test('admin gerencia rascunho mas não se autopromove nem altera colunas de publicação', () =>
  isolated(async () => {
    await asRole('authenticated', adminId)
    const work = await draft()
    await fails('insert into private.administrators(user_id) values ($1)', [
      memberId,
    ])
    await fails('update public.works set published_version_id=$1 where id=$2', [
      work.versionId,
      work.workId,
    ])
    await fails('update public.work_versions set sealed_at=now() where id=$1', [
      work.versionId,
    ])
    await fails('update public.work_versions set revision=999 where id=$1', [
      work.versionId,
    ])
    await fails('select private.guard_photo()')
  }))

test('capa e publicação não podem pertencer a outro trabalho', () =>
  isolated(async () => {
    await asRole('authenticated', adminId)
    const first = await readyDraft()
    const second = await readyDraft()
    await fails(
      'update public.work_versions set cover_photo_id=$1 where id=$2',
      [second.cover.id, first.versionId],
      '23503',
    )
    await asRole('postgres')
    await fails(
      'update public.works set published_version_id=$1 where id=$2',
      [second.versionId, first.workId],
      '23503',
    )
    await db.query(
      'update public.works set published_version_id=$1 where id=$2',
      [first.versionId, first.workId],
    )
    await fails(
      'set constraints validate_publication_pointer immediate',
      [],
      '23514',
    )
  }))

test('um rascunho por trabalho, ordem única e categoria referenciada protegida', () =>
  isolated(async () => {
    await asRole('authenticated', adminId)
    const work = await readyDraft()
    await fails(
      'insert into public.work_versions(work_id,category_id) values ($1,$2)',
      [work.workId, categoryId],
      '23505',
    )
    await fails(
      'insert into public.photos(version_id,storage_path,sort_order) values ($1,$2,0)',
      [work.versionId, `${randomUUID()}/${randomUUID()}.jpg`],
      '23505',
    )
    await fails(
      'delete from public.categories where id=$1',
      [categoryId],
      '23001',
    )
    await fails(
      'update public.photos set focal_x=2 where id=$1',
      [work.cover.id],
      '23514',
    )
    await fails(
      "update public.photos set alt_text='' where id=$1",
      [work.cover.id],
      '23514',
    )
  }))

test('publicação incompleta falha sem expor o rascunho', () =>
  isolated(async () => {
    await asRole('authenticated', adminId)
    const work = await draft()
    await fails(
      'select public.publish_work($1,$2,$3)',
      [work.workId, work.versionId, await revision(work.versionId)],
      '23514',
    )
    const pending = await photo(work.versionId, { ready: false })
    await db.query(
      'update public.work_versions set cover_photo_id=$1 where id=$2',
      [pending.id, work.versionId],
    )
    await fails(
      'select public.publish_work($1,$2,$3)',
      [work.workId, work.versionId, await revision(work.versionId)],
      '23514',
    )
    await db.query(
      "update public.photos set upload_state='ready' where id=$1",
      [pending.id],
    )
    await db.query("update public.work_versions set title='   ' where id=$1", [
      work.versionId,
    ])
    await fails(
      'select public.publish_work($1,$2,$3)',
      [work.workId, work.versionId, await revision(work.versionId)],
      '23514',
    )
    await asRole('anon')
    assert.equal(await count('public.works'), 0)
    assert.equal(await count('storage.objects'), 0)
  }))

test('ready sem arquivo existente não pode publicar', () =>
  isolated(async () => {
    await asRole('authenticated', adminId)
    const work = await draft()
    const missing = await photo(work.versionId, { upload: false })
    await db.query(
      'update public.work_versions set cover_photo_id=$1 where id=$2',
      [missing.id, work.versionId],
    )
    await fails(
      'select public.publish_work($1,$2,$3)',
      [work.workId, work.versionId, await revision(work.versionId)],
      '23514',
    )
    assert.equal(
      (
        await db.query(
          'select sealed_at from public.work_versions where id=$1',
          [work.versionId],
        )
      ).rows[0].sealed_at,
      null,
    )
  }))

test('metadados do arquivo são validados antes de publicar', () =>
  isolated(async () => {
    await asRole('authenticated', adminId)
    const work = await readyDraft()
    for (const metadata of [
      { size: 0, mimetype: 'image/jpeg' },
      { size: 10485761, mimetype: 'image/webp' },
      { size: 1024, mimetype: 'text/html' },
    ]) {
      await asRole('postgres')
      await db.query('update storage.objects set metadata=$1 where name=$2', [
        metadata,
        work.cover.path,
      ])
      await asRole('authenticated', adminId)
      await fails(
        'select public.publish_work($1,$2,$3)',
        [work.workId, work.versionId, await revision(work.versionId)],
        '23514',
      )
    }
  }))

test('alterações de fotos invalidam revisão antiga e publicar é idempotente', () =>
  isolated(async () => {
    await asRole('authenticated', adminId)
    const work = await readyDraft()
    const oldRevision = await revision(work.versionId)
    await db.query(
      "update public.photos set alt_text='Descrição revisada' where id=$1",
      [work.cover.id],
    )
    assert.ok(Number(await revision(work.versionId)) > Number(oldRevision))
    await fails(
      'select public.publish_work($1,$2,$3)',
      [work.workId, work.versionId, oldRevision],
      '40001',
    )
    const publishedRevision = await publish(work)
    const afterPublish = await revision(work.versionId)
    await db.query('select public.publish_work($1,$2,$3)', [
      work.workId,
      work.versionId,
      publishedRevision,
    ])
    assert.equal(await revision(work.versionId), afterPublish)
    await fails(
      "update public.work_versions set title='Alteração indevida' where id=$1",
      [work.versionId],
      '23514',
    )
    await fails(
      'delete from public.photos where id=$1',
      [work.cover.id],
      '23514',
    )
    await fails(
      'delete from public.work_versions where id=$1',
      [work.versionId],
      '23514',
    )
  }))

test('nova edição mantém a versão anterior pública até a troca atômica', () =>
  isolated(async () => {
    await asRole('authenticated', adminId)
    const first = await readyDraft()
    await publish(first)
    const second = await readyDraft(first.workId)
    await asRole('anon')
    assert.equal(await count('public.works'), 1)
    assert.deepEqual(
      (await db.query('select id from public.work_versions')).rows.map(
        (row) => row.id,
      ),
      [first.versionId],
    )
    assert.deepEqual(
      (await db.query('select name from storage.objects')).rows.map(
        (row) => row.name,
      ),
      [first.cover.path],
    )
    await asRole('authenticated', memberId)
    assert.equal(await count('public.photos'), 1)
    await asRole('authenticated', adminId)
    await publish(second)
    await fails(
      'select public.unpublish_work($1,$2)',
      [first.workId, first.versionId],
      '40001',
    )
    await asRole('anon')
    assert.deepEqual(
      (await db.query('select id from public.work_versions')).rows.map(
        (row) => row.id,
      ),
      [second.versionId],
    )
    assert.deepEqual(
      (await db.query('select name from storage.objects')).rows.map(
        (row) => row.name,
      ),
      [second.cover.path],
    )
    await asRole('authenticated', adminId)
    await db.query('select public.unpublish_work($1,$2)', [
      second.workId,
      second.versionId,
    ])
    await db.query('select public.unpublish_work($1,$2)', [
      second.workId,
      second.versionId,
    ])
    await asRole('anon')
    assert.equal(await count('public.works'), 0)
    assert.equal(await count('public.photos'), 0)
    assert.equal(await count('storage.objects'), 0)
  }))

test('falha ao publicar uma revisão preserva a publicação anterior', () =>
  isolated(async () => {
    await asRole('authenticated', adminId)
    const original = await readyDraft()
    await publish(original)
    const replacement = await readyDraft(original.workId)
    await db.query(
      "update public.photos set upload_state='pending' where id=$1",
      [replacement.cover.id],
    )
    await fails(
      'select public.publish_work($1,$2,$3)',
      [
        replacement.workId,
        replacement.versionId,
        await revision(replacement.versionId),
      ],
      '23514',
    )
    assert.equal(
      (
        await db.query(
          'select sealed_at from public.work_versions where id=$1',
          [replacement.versionId],
        )
      ).rows[0].sealed_at,
      null,
    )
    await fails(
      'insert into public.photos(version_id,storage_path,sort_order) values ($1,$2,1)',
      [original.versionId, `${randomUUID()}/${randomUUID()}.jpg`],
      '23514',
    )
    await asRole('anon')
    assert.deepEqual(
      (await db.query('select id from public.work_versions')).rows.map(
        (row) => row.id,
      ),
      [original.versionId],
    )
  }))

test('reordenação transacional preserva posições únicas e aumenta a revisão', () =>
  isolated(async () => {
    await asRole('authenticated', adminId)
    const work = await readyDraft()
    const second = await photo(work.versionId, { position: 1 })
    const oldRevision = await revision(work.versionId)
    await db.exec('set constraints photo_order_unique deferred')
    await db.query('update public.photos set sort_order=1 where id=$1', [
      work.cover.id,
    ])
    await db.query('update public.photos set sort_order=0 where id=$1', [
      second.id,
    ])
    await db.exec('set constraints photo_order_unique immediate')
    assert.deepEqual(
      (
        await db.query(
          'select id from public.photos where version_id=$1 order by sort_order',
          [work.versionId],
        )
      ).rows.map((row) => row.id),
      [second.id, work.cover.id],
    )
    assert.ok(Number(await revision(work.versionId)) > Number(oldRevision))
  }))

test('permissões de tabela não permitem contornar RLS por TRUNCATE', () =>
  isolated(async () => {
    await asRole('authenticated', adminId)
    await fails('truncate public.works cascade')
    await fails('truncate public.categories cascade')
    await fails('truncate private.administrators')
  }))

test('fotos institucionais têm publicação explícita e não expõem o resto do arquivo', () =>
  isolated(async () => {
    await asRole('authenticated', adminId)
    const work = await readyDraft()
    await photo(work.versionId, { position: 1 })
    await fails(
      'update public.site_settings set hero_photo_id=$1',
      [work.cover.id],
      '23514',
    )
    await publish(work)
    await db.query('update public.site_settings set hero_photo_id=$1', [
      work.cover.id,
    ])
    await db.query('select public.unpublish_work($1,$2)', [
      work.workId,
      work.versionId,
    ])
    await asRole('anon')
    assert.equal(await count('public.work_versions'), 0)
    assert.equal(await count('public.photos'), 1)
    assert.equal(await count('storage.objects'), 1)
    await asRole('authenticated', adminId)
    await db.query('update public.site_settings set hero_photo_id=null')
    await asRole('anon')
    assert.equal(await count('storage.objects'), 0)
  }))

test('Storage privado resiste a política permissiva e bloqueia sobrescrita e exclusão', () =>
  isolated(async () => {
    await db.exec(
      'create policy overly_broad_test_policy on storage.objects for all to anon, authenticated using (true) with check (true)',
    )
    await asRole('authenticated', adminId)
    const work = await readyDraft()
    assert.equal(
      (
        await db.query('update storage.objects set metadata=$1 where name=$2', [
          {},
          work.cover.path,
        ])
      ).affectedRows,
      0,
    )
    assert.equal(
      (
        await db.query('delete from storage.objects where name=$1', [
          work.cover.path,
        ])
      ).affectedRows,
      0,
    )
    await fails(
      "insert into storage.objects(bucket_id,name) values ('portfolio','../../arquivo.html')",
    )
    await asRole('anon')
    assert.equal(await count('storage.objects'), 0)
    await fails(
      "insert into storage.objects(bucket_id,name) values ('portfolio',$1)",
      [`${randomUUID()}/${randomUUID()}.jpg`],
    )
    await asRole('postgres')
    assert.equal(
      (
        await db.query(
          "select public from storage.buckets where id='portfolio'",
        )
      ).rows[0].public,
      false,
    )
  }))

test('consulta de administrador retorna apenas o acesso da sessão e não aceita visitantes', () =>
  isolated(async () => {
    await asRole('anon')
    await fails('select public.current_user_is_administrator()')
    await asRole('authenticated', memberId)
    assert.equal(
      (
        await db.query(
          'select public.current_user_is_administrator() as allowed',
        )
      ).rows[0].allowed,
      false,
    )
    await asRole('authenticated', adminId)
    assert.equal(
      (
        await db.query(
          'select public.current_user_is_administrator() as allowed',
        )
      ).rows[0].allowed,
      true,
    )
    await fails('select * from private.administrators')
    await asRole('postgres')
    await db.query('delete from private.administrators where user_id = $1', [
      adminId,
    ])
    await asRole('authenticated', adminId)
    assert.equal(
      (
        await db.query(
          'select public.current_user_is_administrator() as allowed',
        )
      ).rows[0].allowed,
      false,
    )
  }))

test('criação pelo painel é atômica, idempotente e restrita à administração', () =>
  isolated(async () => {
    const work = randomUUID(),
      version = randomUUID()
    const sql = 'select public.create_work_draft($1,$2,$3,$4,$5,$6)'
    const args = [
      work,
      version,
      'novo-trabalho',
      'Novo trabalho',
      categoryId,
      'Descrição',
    ]
    await asRole('anon')
    await fails(sql, args)
    await asRole('authenticated', memberId)
    await fails(sql, args)
    await asRole('authenticated', adminId)
    await fails(sql, [...args.slice(0, 4), randomUUID(), 'Descrição'], '23503')
    assert.equal(
      (await db.query('select id from public.works where id=$1', [work])).rows
        .length,
      0,
    )
    await db.query(sql, args)
    await db.query(sql, args)
    assert.equal(
      (
        await db.query('select id from public.work_versions where work_id=$1', [
          work,
        ])
      ).rows.length,
      1,
    )
    await fails(
      sql,
      [work, version, 'outro-endereco', 'Novo', categoryId, ''],
      '23514',
    )
  }))

test('salvamento do painel rejeita revisão antiga e capa de outra versão', () =>
  isolated(async () => {
    const work = await draft(),
      other = await readyDraft()
    await asRole('authenticated', adminId)
    const sql = 'select public.save_work_draft($1,$2,$3,$4,$5,$6)'
    const initial = await revision(work.versionId)
    await fails(
      sql,
      [work.versionId, initial, 'Título', categoryId, '', other.cover.id],
      '23503',
    )
    await db.query(sql, [
      work.versionId,
      initial,
      'Título salvo',
      categoryId,
      'Descrição',
      null,
    ])
    await fails(
      sql,
      [work.versionId, initial, 'Sobrescrita', categoryId, '', null],
      '40001',
    )
    assert.equal(
      (
        await db.query('select title from public.work_versions where id=$1', [
          work.versionId,
        ])
      ).rows[0].title,
      'Título salvo',
    )
  }))

test('foto exige Storage confirmado, permite retomada sem duplicar e publica pelo fluxo do painel', () =>
  isolated(async () => {
    const work = await draft(),
      photoId = randomUUID()
    const path = `${work.versionId}/${photoId}.jpg`
    const sql = 'select public.attach_work_photo($1,$2,$3,$4,$5,$6,$7)'
    const args = [
      work.versionId,
      await revision(work.versionId),
      photoId,
      path,
      'Foto de teste',
      800,
      600,
    ]
    await asRole('authenticated', memberId)
    await fails(sql, args)
    await asRole('authenticated', adminId)
    await fails(sql, args, '23514')
    await asRole('postgres')
    await db.query(
      "insert into storage.objects(bucket_id,name,metadata) values('portfolio',$1,$2)",
      [path, JSON.stringify({ mimetype: 'image/jpeg', size: 3000 })],
    )
    await asRole('authenticated', adminId)
    await db.query(sql, args)
    const afterPhoto = await revision(work.versionId)
    await db.query(sql, args)
    assert.equal(await revision(work.versionId), afterPhoto)
    assert.equal(
      (
        await db.query('select id from public.photos where version_id=$1', [
          work.versionId,
        ])
      ).rows.length,
      1,
    )
    await db.query('select public.save_work_draft($1,$2,$3,$4,$5,$6)', [
      work.versionId,
      afterPhoto,
      'Pronto',
      categoryId,
      '',
      photoId,
    ])
    await publish(work)
    await fails(
      'select public.save_work_draft($1,$2,$3,$4,$5,$6)',
      [
        work.versionId,
        await revision(work.versionId),
        'Alterar',
        categoryId,
        '',
        photoId,
      ],
      '23514',
    )
    await asRole('anon')
    assert.equal(
      (await db.query('select id from public.works where id=$1', [work.workId]))
        .rows.length,
      1,
    )
    assert.equal(
      (await db.query('select id from storage.objects where name=$1', [path]))
        .rows.length,
      1,
    )
  }))

test('todas as tabelas da aplicação usam RLS e funções privilegiadas fixam search_path', () =>
  isolated(async () => {
    const tables = await db.query(
      "select c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private') and c.relkind='r'",
    )
    assert.equal(tables.rows.length, 6)
    assert.ok(tables.rows.every((table) => table.relrowsecurity))
    const functions = await db.query(
      "select p.proname,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private') and p.prosecdef",
    )
    assert.ok(functions.rows.length > 0)
    assert.ok(
      functions.rows.every((fn) =>
        fn.proconfig.some((setting) => setting === 'search_path=""'),
      ),
    )
  }))
