<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service de Integração com Google Maps Geocoding API
 *
 * Realiza conversão de endereços em coordenadas geográficas (latitude e longitude)
 * utilizando a API de Geocoding do Google Maps.
 */
class GoogleMapsService
{
    /**
     * URL da API de Geocoding do Google Maps
     *
     * @var string
     */
    private string $geocodingUrl;

    /**
     * Chave de API do Google Maps
     *
     * @var string|null
     */
    private ?string $apiKey;

    /**
     * Construtor do service
     */
    public function __construct()
    {
        $this->geocodingUrl = config('services.google_maps.geocoding_url');
        $this->apiKey = config('services.google_maps.api_key');
    }

    /**
     * Obtém as coordenadas geográficas de um endereço
     *
     * Utiliza a API de Geocoding do Google Maps para converter um endereço
     * completo em latitude e longitude.
     *
     * @param array $address Array com componentes do endereço
     * @return array|null Array com latitude e longitude ou null se não encontrado
     */
    public function getCoordinates(array $address): ?array
    {
        try {
            // Verifica se a API key está configurada
            if (empty($this->apiKey)) {
                Log::warning('Google Maps API key não configurada');
                return null;
            }

            // Monta o endereço completo
            $fullAddress = $this->buildFullAddress($address);

            if (empty($fullAddress)) {
                Log::warning('Endereço vazio fornecido para geocoding');
                return null;
            }

            // Faz a requisição para a API
            $response = Http::timeout(10)->get($this->geocodingUrl, [
                'address' => $fullAddress,
                'key' => $this->apiKey,
                'region' => 'br', // Prioriza resultados do Brasil
            ]);

            if (!$response->successful()) {
                Log::error('Erro ao consultar Google Maps Geocoding API', [
                    'address' => $fullAddress,
                    'status' => $response->status()
                ]);
                return null;
            }

            $data = $response->json();

            // Verifica o status da resposta
            if ($data['status'] !== 'OK') {
                Log::info('Google Maps não encontrou o endereço', [
                    'address' => $fullAddress,
                    'status' => $data['status']
                ]);
                return null;
            }

            // Verifica se há resultados
            if (empty($data['results'])) {
                return null;
            }

            // Obtém as coordenadas do primeiro resultado
            $location = $data['results'][0]['geometry']['location'];

            return [
                'latitude' => $location['lat'],
                'longitude' => $location['lng'],
                'formatted_address' => $data['results'][0]['formatted_address'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('Exceção ao consultar Google Maps Geocoding API', [
                'address' => $fullAddress ?? 'unknown',
                'message' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Monta um endereço completo a partir dos componentes
     *
     * @param array $address Componentes do endereço
     * @return string Endereço formatado
     */
    private function buildFullAddress(array $address): string
    {
        $parts = [];

        // Logradouro e número
        if (!empty($address['street'])) {
            $street = $address['street'];
            if (!empty($address['number'])) {
                $street .= ', ' . $address['number'];
            }
            $parts[] = $street;
        }

        // Bairro
        if (!empty($address['neighborhood'])) {
            $parts[] = $address['neighborhood'];
        }

        // Cidade
        if (!empty($address['city'])) {
            $parts[] = $address['city'];
        }

        // Estado
        if (!empty($address['state'])) {
            $parts[] = $address['state'];
        }

        // CEP
        if (!empty($address['zip_code'])) {
            $parts[] = $address['zip_code'];
        }

        // País (sempre Brasil)
        $parts[] = 'Brasil';

        return implode(', ', array_filter($parts));
    }

    /**
     * Obtém coordenadas a partir de um endereço em string
     *
     * Método simplificado para quando já se tem o endereço como string.
     *
     * @param string $address Endereço completo como string
     * @return array|null Array com latitude e longitude ou null se não encontrado
     */
    public function getCoordinatesByString(string $address): ?array
    {
        try {
            if (empty($this->apiKey)) {
                Log::warning('Google Maps API key não configurada');
                return null;
            }

            if (empty($address)) {
                return null;
            }

            $response = Http::timeout(10)->get($this->geocodingUrl, [
                'address' => $address . ', Brasil',
                'key' => $this->apiKey,
                'region' => 'br',
            ]);

            if (!$response->successful()) {
                return null;
            }

            $data = $response->json();

            if ($data['status'] !== 'OK' || empty($data['results'])) {
                return null;
            }

            $location = $data['results'][0]['geometry']['location'];

            return [
                'latitude' => $location['lat'],
                'longitude' => $location['lng'],
                'formatted_address' => $data['results'][0]['formatted_address'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('Exceção ao geocodificar endereço', [
                'address' => $address,
                'message' => $e->getMessage()
            ]);
            return null;
        }
    }
}
