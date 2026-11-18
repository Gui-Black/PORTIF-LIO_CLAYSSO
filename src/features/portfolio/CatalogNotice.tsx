export type CatalogState = {
  status: 'loading' | 'ready' | 'error'
  demo: boolean
  retry: () => void
  incomplete?: boolean
}

export function CatalogNotice({
  status,
  demo,
  retry,
  incomplete = false,
}: CatalogState) {
  if (status === 'ready' && !incomplete)
    return demo ? (
      <p className="catalog-notice">
        Galeria demonstrativa: estas seleções locais ilustram o protótipo.
      </p>
    ) : null
  return (
    <div className="catalog-notice">
      <p role={status === 'error' ? 'alert' : 'status'}>
        {incomplete
          ? 'Algumas fotografias estão temporariamente indisponíveis. Você pode explorar as seleções disponíveis ou tentar novamente.'
          : status === 'error'
            ? 'Não foi possível carregar as fotos agora. Você ainda pode conhecer o trabalho e entrar em contato.'
            : 'Carregando as seleções de fotos…'}
      </p>
      {status === 'error' || incomplete ? (
        <button className="button" type="button" onClick={retry}>
          Tentar carregar as fotos
        </button>
      ) : null}
    </div>
  )
}
