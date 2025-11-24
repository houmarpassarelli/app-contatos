import axios from 'axios'

const viacepApi = axios.create({
  baseURL: 'https://viacep.com.br/ws',
  timeout: 5000,
})

/**
 * Busca endereço pelo CEP usando a API do ViaCEP
 * @param {string} cep - CEP com 8 dígitos (apenas números)
 * @returns {Promise<Object>} Dados do endereço
 */
export async function fetchAddressByCEP(cep) {
  try {
    // Remove caracteres não numéricos
    const cleanCEP = cep.replace(/\D/g, '')

    // Valida se tem 8 dígitos
    if (cleanCEP.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos')
    }

    const { data } = await viacepApi.get(`/${cleanCEP}/json/`)

    // ViaCEP retorna { erro: true } quando CEP não existe
    if (data.erro) {
      throw new Error('CEP não encontrado')
    }

    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      complement: data.complemento || '',
    }
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error('CEP inválido')
    }
    throw error
  }
}

export default {
  fetchAddressByCEP,
}
