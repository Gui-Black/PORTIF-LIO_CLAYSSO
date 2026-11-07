import { useRef, useState, type FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

type Mode = 'login' | 'recover' | 'password'

export function AuthForm({
  client,
  mode,
}: {
  client: SupabaseClient
  mode: Mode
}) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const [done, setDone] = useState(false)
  const submitting = useRef(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    setMessage('')
    setFailed(false)
    if (
      mode === 'password' &&
      (password.length < 12 || password !== data.get('confirmation'))
    ) {
      setFailed(true)
      setMessage(
        'Use pelo menos 12 caracteres e repita a mesma senha nos dois campos.',
      )
      return
    }
    submitting.current = true
    setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else if (mode === 'recover') {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/?acesso=nova-senha`,
        })
        if (error) throw error
        setMessage(
          'Se houver uma conta para esse e-mail, você receberá um link. Abra-o neste mesmo navegador.',
        )
        setDone(true)
      } else {
        const { error } = await client.auth.updateUser({ password })
        if (error) throw error
        form.reset()
        setDone(true)
        // Encerra esta sessão após a troca. Tokens já emitidos podem durar até expirar.
        const { error: signOutError } = await client.auth.signOut({
          scope: 'local',
        })
        if (signOutError) {
          setMessage(
            'Senha atualizada. A sessão não pôde ser encerrada; use Sair da conta.',
          )
        } else {
          window.location.replace('/?acesso=entrar&senha=atualizada')
        }
      }
    } catch {
      setFailed(true)
      setMessage(
        mode === 'login'
          ? 'Não foi possível entrar. Confira e-mail e senha e tente novamente.'
          : mode === 'recover'
            ? 'Não foi possível solicitar o link agora. Aguarde um pouco e tente novamente.'
            : 'Não foi possível atualizar a senha. O link pode ter expirado; solicite um novo link.',
      )
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit} aria-busy={busy}>
      <fieldset disabled={busy || done}>
        <legend className="auth-sr-only">
          {mode === 'login'
            ? 'Entrar na conta'
            : mode === 'recover'
              ? 'Recuperar acesso'
              : 'Criar nova senha'}
        </legend>
        {mode !== 'password' ? (
          <label htmlFor="auth-email">
            E-mail
            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
            />
          </label>
        ) : null}
        {mode !== 'recover' ? (
          <label htmlFor="auth-password">
            {mode === 'password' ? 'Nova senha' : 'Senha'}
            <input
              id="auth-password"
              name="password"
              type="password"
              autoComplete={
                mode === 'password' ? 'new-password' : 'current-password'
              }
              required
              minLength={mode === 'password' ? 12 : undefined}
              maxLength={128}
            />
          </label>
        ) : null}
        {mode === 'password' ? (
          <label htmlFor="auth-confirmation">
            Repita a nova senha
            <input
              id="auth-confirmation"
              name="confirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
            />
          </label>
        ) : null}
        <button className="auth-primary" type="submit">
          {busy
            ? 'Aguarde…'
            : mode === 'login'
              ? 'Entrar'
              : mode === 'recover'
                ? 'Enviar link de recuperação'
                : 'Salvar nova senha'}
        </button>
      </fieldset>
      <p
        className={failed ? 'auth-error' : 'auth-message'}
        role={failed ? 'alert' : 'status'}
      >
        {message}
      </p>
    </form>
  )
}
