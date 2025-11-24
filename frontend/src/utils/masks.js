// Definições de máscaras para campos do formulário

export const masks = {
  cpf: {
    mask: '000.000.000-00',
    lazy: false,
  },
  phone: {
    mask: '(00) 00000-0000',
    lazy: false,
  },
  cep: {
    mask: '00000000',
    lazy: false,
  }
}

// Remove caracteres não numéricos
export function unmask(value) {
  if (!value) return ''
  return value.replace(/\D/g, '')
}

// Aplica máscara de CPF
export function maskCPF(value) {
  if (!value) return ''
  const numbers = unmask(value).slice(0, 11)
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

// Aplica máscara de telefone
export function maskPhone(value) {
  if (!value) return ''
  const numbers = unmask(value).slice(0, 11)
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}
