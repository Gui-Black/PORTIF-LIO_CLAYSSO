import { useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { AuthForm } from './AuthForm'
import { useAdminSession } from './useAdminSession'
import { WorkManager } from '../work-management/WorkManager'
import './auth.css'

function SessionContent({
  client,
  route,
}: {
  client: SupabaseClient
  route: string
}) {
  const auth = useAdminSession(client)
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState('')
  const [workLocked, setWorkLocked] = useState(false)
  const leavingRef = useRef(false)
  async function leave() {
    if (leavingRef.current) return
    leavingRef.current = true
    setLeaving(true)
    setError('')
    try {
      const result = await client.auth.signOut({ scope: 'local' })
      if (result.error) throw result.error
      window.location.replace('/?acesso=entrar')
    } catch {
      setError('Não foi possível sair. Tente novamente.')
      leavingRef.current = false
      setLeaving(false)
    }
  }

  let content
  if (!auth.ready) content = <p role="status">Verificando sua sessão…</p>
  else if (route === 'recuperar')
    content = (
      <>
        <p>Informe seu e-mail para receber um link de recuperação.</p>
        <AuthForm client={client} mode="recover" />
      </>
    )
  else if (route === 'nova-senha')
    content =
      auth.recovery && auth.session ? (
        <>
          <p>Escolha uma senha com pelo menos 12 caracteres.</p>
          <AuthForm client={client} mode="password" />
        </>
      ) : (
        <>
          <p role="alert">
            Abra um link válido de recuperação neste mesmo navegador. Se o link
            expirou ou a página foi recarregada, solicite um novo.
          </p>
          <a href="/?acesso=recuperar">Solicitar novo link</a>
        </>
      )
  else if (auth.status === 'signed-out')
    content = (
      <>
        {auth.error ? (
          <p role="alert">
            Não foi possível restaurar a sessão. Entre novamente.
          </p>
        ) : null}
        {new URLSearchParams(window.location.search).get('senha') ===
        'atualizada' ? (
          <p role="status">Senha atualizada. Entre com sua nova senha.</p>
        ) : null}
        <AuthForm client={client} mode="login" />
        <a href="/?acesso=recuperar">Esqueci minha senha</a>
      </>
    )
  else if (auth.status === 'loading' && !auth.hasVerifiedAccess)
    content = <p role="status">Confirmando permissão de acesso…</p>
  else if (auth.status === 'error')
    content = (
      <>
        <p role="alert">
          Não foi possível confirmar sua permissão. Verifique a conexão e tente
          novamente.
        </p>
        <button type="button" onClick={auth.retry}>
          Tentar novamente
        </button>
      </>
    )
  else if (auth.status === 'denied')
    content = (
      <p role="alert">
        Sua conta está autenticada, mas não tem acesso à administração. Solicite
        a liberação ao responsável pelo site.
      </p>
    )
  else
    content = (
      <>
        <p className="auth-badge">Acesso administrativo confirmado</p>
        <p>Você está conectado como {auth.session?.user.email}.</p>
        <WorkManager
          client={client}
          disabled={auth.status === 'loading'}
          onLockChange={setWorkLocked}
        />
      </>
    )

  return (
    <>
      {content}
      {auth.session ? (
        <button
          className="auth-signout"
          type="button"
          disabled={leaving || workLocked}
          onClick={() => void leave()}
        >
          {leaving ? 'Saindo…' : 'Sair da conta'}
        </button>
      ) : null}
      <p role="alert" className="auth-error">
        {error}
      </p>
      <a className="auth-back" href="/?acesso=entrar">
        Voltar ao acesso
      </a>
    </>
  )
}

export default function AuthPage({ route }: { route: string }) {
  const title =
    route === 'recuperar'
      ? 'Recuperar acesso'
      : route === 'nova-senha'
        ? 'Uma nova senha'
        : 'Seu olhar, seu espaço'
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    document.title = `${title} | Click’s do Morty`
    heading.current?.focus()
  }, [title])
  return (
    <main className="auth-page" id="conteudo">
      <aside className="auth-story">
        <a href="/">Click’s do Morty</a>
        <p>
          Histórias merecem
          <br />
          um lugar para ficar.
        </p>
        <span>Seu espaço para cuidar de cada registro.</span>
      </aside>
      <section className="auth-card" aria-labelledby="auth-title">
        <a href="/" className="auth-back">
          ← Voltar ao portfólio
        </a>
        <p className="auth-eyebrow">Área do fotógrafo</p>
        <h1 id="auth-title" ref={heading} tabIndex={-1}>
          {title}
        </h1>
        {supabase ? (
          <SessionContent client={supabase} route={route} />
        ) : (
          <p role="status">
            O acesso administrativo ainda não foi configurado. O portfólio
            continua disponível.
          </p>
        )}
      </section>
    </main>
  )
}
