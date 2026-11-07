import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { listManagement, managementError } from './work-service'
import { WorkEditor } from './WorkEditor'
import './management.css'

export function WorkManager({
  client,
  disabled,
  onLockChange,
}: {
  client: SupabaseClient
  disabled: boolean
  onLockChange: (locked: boolean) => void
}) {
  const [catalog, setCatalog] = useState<Awaited<
    ReturnType<typeof listManagement>
  > | null>(null)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const lock = useRef(false)
  const creation = useRef<{ work: string; version: string } | null>(null)
  useEffect(() => {
    let active = true
    void listManagement(client)
      .then((data) => {
        if (active) {
          setCatalog(data)
          setError('')
        }
      })
      .catch(() => {
        if (active)
          setError('Não foi possível carregar os trabalhos. Tente novamente.')
      })
    return () => {
      active = false
    }
  }, [client, reload])
  useEffect(() => {
    onLockChange(busy || dirty)
    return () => onLockChange(false)
  }, [onLockChange, busy, dirty])
  useEffect(() => {
    if (!dirty && !busy) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, busy])

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current || disabled) return
    lock.current = true
    setBusy(true)
    setError('')
    const form = event.currentTarget
    const fields = new FormData(form)
    creation.current ??= {
      work: crypto.randomUUID(),
      version: crypto.randomUUID(),
    }
    try {
      const result = await client.rpc('create_work_draft', {
        p_work_id: creation.current.work,
        p_version_id: creation.current.version,
        p_slug: String(fields.get('slug')).trim(),
        p_title: String(fields.get('title')).trim(),
        p_category_id: fields.get('category'),
        p_description: '',
      })
      if (result.error) throw result.error
      setSelected(creation.current.version)
      creation.current = null
      setDirty(false)
      form.reset()
    } catch (failure) {
      setError(managementError(failure))
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  if (selected && catalog)
    return (
      <WorkEditor
        key={selected}
        client={client}
        versionId={selected}
        categories={catalog.categories}
        disabled={disabled}
        onLockChange={onLockChange}
        onBack={() => {
          setSelected(null)
          setReload((value) => value + 1)
        }}
      />
    )
  return (
    <section className="work-management" aria-labelledby="manager-title">
      <h2 id="manager-title">Seus trabalhos</h2>
      <p>
        Continue um trabalho abaixo ou abra “Criar novo trabalho”. Rascunhos
        ficam privados até você publicar.
      </p>
      {catalog ? (
        <div className="management-overview">
          <span>
            <strong>
              {
                catalog.works.filter((work) => !work.published_version_id)
                  .length
              }
            </strong>{' '}
            em rascunho
          </span>
          <span>
            <strong>
              {catalog.works.filter((work) => work.published_version_id).length}
            </strong>{' '}
            publicados
          </span>
        </div>
      ) : null}
      {disabled ? <p role="status">Revalidando acesso…</p> : null}
      {error ? (
        <p role="alert">
          {error}{' '}
          <button type="button" onClick={() => setReload((value) => value + 1)}>
            Recarregar lista
          </button>
        </p>
      ) : null}
      {!catalog ? (
        <p role="status">Carregando trabalhos…</p>
      ) : (
        <>
          <fieldset disabled={disabled || busy}>
            <legend>Trabalhos cadastrados</legend>
            <ul className="management-list">
              {catalog.works.map((work) => {
                const draft = catalog.versions.find(
                  (version) =>
                    version.work_id === work.id && !version.sealed_at,
                )
                const published = catalog.versions.find(
                  (version) => version.id === work.published_version_id,
                )
                return (
                  <li key={work.id}>
                    <strong>
                      {draft?.title || published?.title || work.slug}
                    </strong>
                    <span className="management-status">
                      {work.published_version_id ? 'Publicado' : 'Rascunho'}
                    </span>
                    {draft ? (
                      <button
                        type="button"
                        disabled={dirty}
                        onClick={() => setSelected(draft.id)}
                      >
                        Continuar edição
                      </button>
                    ) : (
                      <p>
                        A edição de uma nova versão será disponibilizada na
                        próxima etapa.
                      </p>
                    )}
                    {published ? (
                      <a
                        href={`/?trabalho=${encodeURIComponent(work.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver publicação
                      </a>
                    ) : null}
                  </li>
                )
              })}
            </ul>
            {!catalog.works.length ? (
              <p>Seu primeiro trabalho começa aqui.</p>
            ) : null}
          </fieldset>
          <details className="new-work" open={dirty || undefined}>
            <summary>
              Criar novo trabalho <span>Comece pelo nome e pela categoria</span>
            </summary>
            <form
              onSubmit={create}
              onChange={() => setDirty(true)}
              className="management-form"
            >
              <fieldset disabled={disabled || busy}>
                <legend>Novo trabalho</legend>
                <label>
                  Título
                  <input
                    name="title"
                    required
                    maxLength={140}
                    placeholder="Ex.: Casamento da Ana e do João"
                    onChange={(event) => {
                      const slug =
                        event.currentTarget.form?.elements.namedItem('slug')
                      if (
                        slug instanceof HTMLInputElement &&
                        !slug.dataset.edited
                      ) {
                        slug.value = event.currentTarget.value
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, '')
                          .slice(0, 120)
                          .replace(/-$/g, '')
                      }
                    }}
                  />
                </label>
                <label>
                  Endereço do trabalho
                  <input
                    name="slug"
                    required
                    maxLength={120}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    placeholder="ensaio-no-jardim"
                    aria-describedby="slug-help"
                    onInput={(event) => {
                      event.currentTarget.dataset.edited = 'true'
                    }}
                  />
                </label>
                <small id="slug-help">
                  Preenchido a partir do título. Você pode ajustar usando letras
                  sem acentos, números e hífens. Este será o endereço do
                  trabalho no site.
                </small>
                <label>
                  Categoria
                  <select name="category" required defaultValue="">
                    <option value="" disabled>
                      Selecione
                    </option>
                    {catalog.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={(event) => {
                    if (
                      !dirty ||
                      window.confirm(
                        'Limpar as informações deste novo trabalho?',
                      )
                    ) {
                      event.currentTarget.form?.reset()
                      const slug =
                        event.currentTarget.form?.elements.namedItem('slug')
                      if (slug instanceof HTMLInputElement)
                        delete slug.dataset.edited
                      creation.current = null
                      setDirty(false)
                      setReload((value) => value + 1)
                    }
                  }}
                >
                  Limpar formulário
                </button>
                <button type="submit" className="auth-primary">
                  {busy ? 'Criando…' : 'Criar rascunho'}
                </button>
              </fieldset>
            </form>
          </details>
        </>
      )}
    </section>
  )
}
