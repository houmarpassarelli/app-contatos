<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service de Integração com API ViaCEP
 *
 * Realiza consultas à API pública do ViaCEP para buscar endereços por CEP
 * ou buscar CEPs por endereço (busca reversa).
 */
class ViaCepService
{
    /**
     * URL base da API ViaCEP
     *
     * @var string
     */
    private string $baseUrl;

    /**
     * Construtor do service
     */
    public function __construct()
    {
        $this->baseUrl = config('services.viacep.url', 'https://viacep.com.br/ws');
    }

    /**
     * Busca endereço por CEP
     *
     * Consulta a API ViaCEP para obter informações completas de um endereço
     * a partir do CEP fornecido.
     *
     * @param string $cep CEP a ser consultado (com ou sem formatação)
     * @return array|null Dados do endereço ou null se não encontrado
     */
    public function getAddressByCep(string $cep): ?array
    {
        try {
            // Remove caracteres não numéricos
            $cep = preg_replace('/\D/', '', $cep);

            // Valida o formato do CEP
            if (strlen($cep) !== 8) {
                Log::warning('CEP inválido fornecido', ['cep' => $cep]);
                return null;
            }

            // Faz a requisição para a API
            $response = Http::timeout(10)
                ->get("{$this->baseUrl}/{$cep}/json");

            if (!$response->successful()) {
                Log::error('Erro ao consultar ViaCEP', [
                    'cep' => $cep,
                    'status' => $response->status()
                ]);
                return null;
            }

            $data = $response->json();

            // Verifica se o CEP foi encontrado
            if (isset($data['erro']) && $data['erro'] === true) {
                Log::info('CEP não encontrado', ['cep' => $cep]);
                return null;
            }

            return [
                'cep' => $data['cep'] ?? null,
                'logradouro' => $data['logradouro'] ?? '',
                'complemento' => $data['complemento'] ?? '',
                'bairro' => $data['bairro'] ?? '',
                'localidade' => $data['localidade'] ?? '',
                'uf' => $data['uf'] ?? '',
                'ibge' => $data['ibge'] ?? null,
                'gia' => $data['gia'] ?? null,
                'ddd' => $data['ddd'] ?? null,
                'siafi' => $data['siafi'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('Exceção ao consultar ViaCEP', [
                'cep' => $cep,
                'message' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Busca CEPs por endereço (busca reversa)
     *
     * Consulta a API ViaCEP para encontrar possíveis CEPs a partir de
     * informações parciais do endereço (UF, cidade e logradouro).
     *
     * @param string $uf Sigla do estado (UF)
     * @param string $city Nome da cidade
     * @param string $street Trecho do logradouro
     * @return array Lista de endereços encontrados
     */
    public function searchAddress(string $uf, string $city, string $street): array
    {
        try {
            // Valida os parâmetros
            if (strlen($uf) !== 2 || empty($city) || strlen($street) < 3) {
                Log::warning('Parâmetros inválidos para busca de endereço', [
                    'uf' => $uf,
                    'city' => $city,
                    'street' => $street
                ]);
                return [];
            }

            // Monta a URL de busca
            $url = "{$this->baseUrl}/{$uf}/{$city}/{$street}/json";

            // Faz a requisição para a API
            $response = Http::timeout(10)->get($url);

            if (!$response->successful()) {
                Log::error('Erro ao buscar endereços no ViaCEP', [
                    'uf' => $uf,
                    'city' => $city,
                    'street' => $street,
                    'status' => $response->status()
                ]);
                return [];
            }

            $data = $response->json();

            // Verifica se houve erro ou se não encontrou resultados
            if (isset($data['erro']) && $data['erro'] === true) {
                return [];
            }

            // Se não for array, retorna vazio
            if (!is_array($data)) {
                return [];
            }

            // Formata os resultados
            return array_map(function ($item) {
                return [
                    'cep' => $item['cep'] ?? null,
                    'logradouro' => $item['logradouro'] ?? '',
                    'complemento' => $item['complemento'] ?? '',
                    'bairro' => $item['bairro'] ?? '',
                    'localidade' => $item['localidade'] ?? '',
                    'uf' => $item['uf'] ?? '',
                    'ibge' => $item['ibge'] ?? null,
                ];
            }, $data);
        } catch (\Exception $e) {
            Log::error('Exceção ao buscar endereços no ViaCEP', [
                'uf' => $uf,
                'city' => $city,
                'street' => $street,
                'message' => $e->getMessage()
            ]);
            return [];
        }
    }
}
