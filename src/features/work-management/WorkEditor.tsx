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
import { PhotoCollection } from './PhotoCollection'
import { UploadFailure } from './upload'

export function WorkEditor({
  client,
  versionId,
  categories,
  disabled,
  isPublished,
  onLockChange,
  onBack,
}: {
  client: SupabaseClient
  versionId: string
  categories: Category[]
  disabled: boolean
  isPublished: boolean
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
      if (alive.current) {
        setMessage('')
        setError(
          failure instanceof UploadFailure
            ? failure.message
            : managementError(failure),
        )
      }
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
          throw new UploadFailure(
            failure instanceof Error ? failure.message : 'Arquivo inválido.',
          )
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
      {isPublished && !data?.version.sealed_at ? (
        <p className="management-notice">
          Você está editando uma cópia. A versão atual continua na galeria até
          você publicar estas alterações.
        </p>
      ) : null}
      <h2 id="editor-title">
        {data?.version.sealed_at
          ? 'Trabalho publicado'
          : form?.title || 'Preparar trabalho'}
      </h2>
      <div className="editor-feedback" aria-live="polite">
        <p className="management-status">
          {busy
            ? 'Salvando ou enviando. Aguarde…'
            : failedUpload
              ? 'Envio pendente — retome na etapa 2'
              : dirty
                ? 'Você tem alterações para salvar'
                : data?.version.sealed_at
                  ? 'Visível na galeria'
                  : 'Rascunho — ainda não aparece na galeria'}
        </p>
        {message ? <p role="status">{message}</p> : null}
        {error ? (
          <p role="alert" className="auth-error">
            {error}
          </p>
        ) : null}
        {disabled ? (
          <p>Confirmando seu acesso. Aguarde para continuar.</p>
        ) : null}
      </div>
      <details className="management-tools">
        <summary>Precisa atualizar os dados desta tela?</summary>
        <p>
          Use se você alterou este trabalho em outra aba. Um envio pendente será
          preservado.
        </p>
        <button type="button" disabled={busy} onClick={refresh}>
          Recarregar rascunho
        </button>
      </details>
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
              <legend>1. Sobre o trabalho</legend>
              <p>
                Dê um nome à seleção e conte um pouco sobre ela. Salve antes de
                adicionar fotos.
              </p>
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
                Descrição (opcional)
                <textarea
                  maxLength={5000}
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    change({ description: event.target.value })
                  }
                />
              </label>
              <button type="submit" className="auth-primary" disabled={!dirty}>
                {dirty ? 'Salvar informações' : 'Informações salvas'}
              </button>
            </fieldset>
          </form>
          <h3>2. Fotos e capa</h3>
          <p>
            Adicione uma foto por vez. Depois, escolha a imagem que vai
            representar este trabalho na galeria.
          </p>
          {dirty ? (
            <p className="management-notice">
              Salve as informações na etapa 1 para continuar com as fotos.
            </p>
          ) : null}
          {failedUpload ? (
            <p className="management-notice">
              Há um envio pendente. Use “Retomar envio pendente” abaixo para
              concluir antes de editar ou publicar.
            </p>
          ) : null}
          <p className="management-status">
            {data.photos.length} foto(s) adicionada(s)
          </p>
          {!data.photos.length ? (
            <p className="management-empty">
              Sua seleção começa com a primeira foto. Use o formulário abaixo.
            </p>
          ) : null}
          <PhotoCollection
            client={client}
            draft={form}
            photos={data.photos}
            removedPhotos={data.removedPhotos}
            disabled={disabled || busy || dirty || failedUpload}
            perform={perform}
          />
          <p>
            JPEG, PNG ou WebP, até 10 MiB e 40 megapixels. A ordem segue os
            envios; use Mover antes ou Mover depois para organizar.
          </p>
          <form
            onSubmit={(event) => void upload(event)}
            className="management-form"
          >
            <fieldset disabled={disabled || busy || dirty}>
              <legend>Adicionar uma fotografia</legend>
              {failedUpload && error ? (
                <p className="auth-error">{error}</p>
              ) : null}
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
                O que aparece nesta foto?
                <input
                  name="alt"
                  maxLength={500}
                  required={!failedUpload}
                  disabled={failedUpload}
                  placeholder="Descreva o que aparece na fotografia"
                  aria-describedby="photo-description-help"
                />
              </label>
              <small id="photo-description-help">
                Exemplo: casal abraçado em um jardim. Essa descrição ajuda quem
                usa leitor de tela.
              </small>
              <button type="submit" className="auth-primary">
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
            <legend>3. Publicar na galeria</legend>
            <ul className="publication-checklist">
              <li>
                {dirty
                  ? '○ Salve as informações do trabalho'
                  : '✓ Informações salvas'}
              </li>
              <li>
                {data.photos.length
                  ? '✓ Fotos adicionadas'
                  : '○ Adicione pelo menos uma foto'}
              </li>
              <li>
                {form.cover_photo_id
                  ? '✓ Capa escolhida'
                  : '○ Escolha a capa na etapa 2'}
              </li>
              {failedUpload ? (
                <li>○ Conclua o envio pendente na etapa 2</li>
              ) : null}
            </ul>
            <p>
              As fotos só aparecem para visitantes depois de publicar. Confira
              sua seleção e confirme que tem autorização para exibi-la. Se este
              trabalho já está publicado, esta seleção substituirá a versão
              atual.
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
