export const instagramUrl = 'https://www.instagram.com/clicksmortyofc/'

export function whatsappContact(number: unknown) {
  if (typeof number !== 'string' || !/^[1-9][0-9]{9,14}$/.test(number))
    return null
  const message =
    'Olá! Gostaria de conversar sobre uma sessão de fotos. Tipo de fotografia: / Data: / Local:'
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export const whatsappUrl = whatsappContact(
  import.meta.env?.VITE_WHATSAPP_NUMBER,
)
export const contactUrl = whatsappUrl ?? instagramUrl
export const contactChannel = whatsappUrl ? 'WhatsApp' : 'Instagram'
