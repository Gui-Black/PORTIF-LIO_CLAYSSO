export type CatalogState = {
  status: 'loading' | 'ready' | 'error'
  demo: boolean
  retry: () => void
}

export function CatalogNotice({ status, demo, retry }: CatalogState) {
  if (status === 'ready')
    return demo ? (
      <p className="catalog-notice">
        Galeria demonstrativa: estas seleções locais ilustram o protótipo.
      </p>
    ) : null
  return (
    <div className="catalog-notice">
      <p role={status === 'error' ? 'alert' : 'status'}>
        {status === 'error'
          ? 'Não foi possível carregar as fotos agora. Você ainda pode conhecer o trabalho e entrar em contato.'
          : 'Carregando as seleções de fotos…'}
      </p>
      {status === 'error' ? (
        <button className="button" type="button" onClick={retry}>
          Tentar carregar as fotos
        </button>
      ) : null}
    </div>
  )
}
