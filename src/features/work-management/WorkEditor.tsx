import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  loadDraft,
  managementError,
  publishDraft,
  saveDraft,
  type Category,
  type Draft,
} from './work-service'
import { prepareUpload, sendPhoto, type UploadJob } from './upload'
import { DraftPhoto } from './DraftPhoto'

export function WorkEditor({
  client,
  versionId,
  categories,
  disabled,
  onLockChange,
  onBack,
}: {
  client: SupabaseClient
  versionId: string
  categories: Category[]
  disabled: boolean
  onLockChange: (locked: boolean) => void
  onBack: () => void
}) {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof loadDraft>
  > | null>(null)
  const [form, setForm] = useState<Draft | null>(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [failedUpload, setFailedUpload] = useState(false)
  const job = useRef<UploadJob | null>(null)
  const lock = useRef(false)
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])
  useEffect(() => {
    let active = true
    void loadDraft(client, versionId)
      .then((value) => {
        if (active) {
          setData(value)
          setForm(value.version)
          setDirty(false)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar o rascunho.')
      })
    return () => {
      active = false
    }
  }, [client, versionId, reload])
  useEffect(() => {
    onLockChange(dirty || busy || failedUpload)
    return () => onLockChange(false)
  }, [onLockChange, dirty, busy, failedUpload])
  useEffect(() => {
    if (!dirty && !busy && !failedUpload) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, busy, failedUpload])

  async function perform(action: () => Promise<void>, success: string) {
    if (lock.current || disabled) return
    lock.current = true
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await action()
      const fresh = await loadDraft(client, versionId)
      if (alive.current) {
        setData(fresh)
        setForm(fresh.version)
        setDirty(false)
        setMessage(success)
      }
    } catch (failure) {
      if (alive.current) setError(managementError(failure))
    } finally {
      lock.current = false
      if (alive.current) setBusy(false)
    }
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form || lock.current || disabled || dirty) return
    const element = event.currentTarget
    const fields = new FormData(element)
    await perform(async () => {
      if (!job.current) {
        const file = fields.get('photo')
        if (!(file instanceof File)) throw new Error('Fotografia ausente')
        try {
          job.current = await prepareUpload(
            file,
            String(fields.get('alt') ?? ''),
            versionId,
          )
        } catch (failure) {
          setMessage(
            failure instanceof Error ? failure.message : 'Arquivo inválido.',
          )
          throw failure
        }
      }
      try {
        await sendPhoto(
          client,
          job.current,
          versionId,
          form.revision,
          (progress) => {
            if (alive.current) setMessage(progress)
          },
        )
        job.current = null
        setFailedUpload(false)
        element.reset()
      } catch (failure) {
        setFailedUpload(true)
        throw failure
      }
    }, 'Fotografia adicionada. Escolha a capa e salve antes de publicar.')
  }

  const confirmDiscard = () =>
    !(dirty || failedUpload) ||
    window.confirm(
      'Há alterações ou um envio pendente. Deseja continuar e descartar o estado desta tela?',
    )
  const refresh = () => {
    if (
      !dirty ||
      window.confirm(
        'Descartar as alterações não salvas e recarregar? A tentativa de envio será preservada.',
      )
    ) {
      setDirty(false)
      setReload((value) => value + 1)
    }
  }
  const change = (values: Partial<Draft>) => {
    if (form) {
      setForm({ ...form, ...values })
      setDirty(true)
    }
  }
  return (
    <section className="work-management" aria-labelledby="editor-title">
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (confirmDiscard()) onBack()
        }}
      >
        Voltar aos trabalhos
      </button>
      <h2 id="editor-title">
        {data?.version.sealed_at ? 'Trabalho publicado' : 'Preparar seleção'}
      </h2>
      <p role="status">{message}</p>
      {error ? <p role="alert">{error}</p> : null}
      <button type="button" disabled={busy} onClick={refresh}>
        Recarregar rascunho
      </button>
      {!data || !form ? (
        <p role="status">Carregando…</p>
      ) : data.version.sealed_at ? (
        <p>
          A publicação foi confirmada. Volte à lista para abrir o endereço
          público.
        </p>
      ) : (
        <>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void perform(() => saveDraft(client, form), 'Alterações salvas.')
            }}
            className="management-form"
          >
            <fieldset disabled={disabled || busy || failedUpload}>
              <legend>
                Informações e capa {dirty ? '— alterações não salvas' : ''}
              </legend>
              <label>
                Título
                <input
                  required
                  maxLength={140}
                  value={form.title}
                  onChange={(event) => change({ title: event.target.value })}
                />
              </label>
              <label>
                Categoria
                <select
                  required
                  value={form.category_id}
                  onChange={(event) =>
                    change({ category_id: event.target.value })
                  }
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Descrição
                <textarea
                  maxLength={5000}
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    change({ description: event.target.value })
                  }
                />
              </label>
              <label>
                Capa
                <select
                  value={form.cover_photo_id ?? ''}
                  onChange={(event) =>
                    change({ cover_photo_id: event.target.value || null })
                  }
                >
                  <option value="">Selecione após enviar uma foto</option>
                  {data.photos.map((photo, index) => (
                    <option key={photo.id} value={photo.id}>
                      {index + 1}. {photo.alt_text}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" disabled={!dirty}>
                Salvar alterações
              </button>
            </fieldset>
          </form>
          <h3>Fotografias ({data.photos.length})</h3>
          <ol className="draft-photos">
            {data.photos.map((photo) => (
              <li key={photo.id}>
                <DraftPhoto client={client} photo={photo} />
                <p>
                  {photo.alt_text}
                  {photo.id === form.cover_photo_id ? ' — capa' : ''}
                </p>
              </li>
            ))}
          </ol>
          <p>
            JPEG, PNG ou WebP, até 10 MiB e 40 megapixels. A ordem segue os
            envios.
          </p>
          <form
            onSubmit={(event) => void upload(event)}
            className="management-form"
          >
            <fieldset disabled={disabled || busy || dirty}>
              <legend>Adicionar uma fotografia</legend>
              <label>
                Arquivo
                <input
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required={!failedUpload}
                  disabled={failedUpload}
                />
              </label>
              <label>
                Descrição acessível
                <input
                  name="alt"
                  maxLength={500}
                  required={!failedUpload}
                  disabled={failedUpload}
                  placeholder="Descreva o que aparece na fotografia"
                />
              </label>
              <button type="submit">
                {failedUpload
                  ? 'Retomar envio pendente'
                  : busy
                    ? 'Aguarde…'
                    : 'Enviar fotografia'}
              </button>
              {failedUpload ? (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Descartar a tentativa? Um arquivo já enviado pode ficar aguardando limpeza.',
                      )
                    ) {
                      job.current = null
                      setFailedUpload(false)
                      setMessage(
                        'Tentativa descartada. Recarregue antes de enviar outra foto.',
                      )
                    }
                  }}
                >
                  Descartar tentativa
                </button>
              ) : null}
            </fieldset>
          </form>
          <fieldset
            disabled={
              disabled ||
              busy ||
              dirty ||
              failedUpload ||
              !data.photos.length ||
              !form.cover_photo_id
            }
          >
            <legend>Revisar e publicar</legend>
            <p>
              A publicação torna esta seleção acessível na galeria. Confirme que
              as fotos podem ser exibidas publicamente.
            </p>
            <button
              className="auth-primary"
              type="button"
              onClick={() => {
                if (window.confirm('Publicar esta seleção na galeria?'))
                  void perform(
                    () => publishDraft(client, form),
                    'Publicação confirmada.',
                  )
              }}
            >
              Publicar trabalho
            </button>
          </fieldset>
          {dirty ? (
            <p>Salve as informações antes de enviar fotos ou publicar.</p>
          ) : null}
        </>
      )}
    </section>
  )
}
