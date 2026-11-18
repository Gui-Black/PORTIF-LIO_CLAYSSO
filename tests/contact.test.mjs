import assert from 'node:assert/strict'
import test from 'node:test'
import {
  whatsappContact,
  contactUrl,
  instagramUrl,
} from '../src/lib/contact.ts'

test('WhatsApp exige número confirmado válido e codifica a mensagem; ausência usa Instagram', () => {
  for (const value of [
    null,
    undefined,
    '',
    '+55 (11) 99999-9999',
    'javascript:alert(1)',
    '123',
  ]) {
    assert.equal(whatsappContact(value), null)
  }
  const url = new URL(whatsappContact('5511999999999'))
  assert.equal(url.origin, 'https://wa.me')
  assert.equal(url.pathname, '/5511999999999')
  assert.match(url.searchParams.get('text'), /Tipo de fotografia/)
  assert.equal(contactUrl, instagramUrl)
})
