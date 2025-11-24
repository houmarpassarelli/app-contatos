<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ViaCepService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller de Endereços
 *
 * Proxy para a API do ViaCEP, permitindo buscas de endereço.
 * O frontend não acessa diretamente o ViaCEP, passando pelo backend.
 */
class AddressController extends Controller
{
    /**
     * Service de ViaCEP
     *
     * @var ViaCepService
     */
    protected ViaCepService $viaCepService;

    /**
     * Construtor do controller
     */
    public function __construct(ViaCepService $viaCepService)
    {
        $this->viaCepService = $viaCepService;
    }

    /**
     * Busca endereço por CEP
     *
     * @param string $cep CEP a ser consultado
     * @return JsonResponse
     */
    public function getByCep(string $cep): JsonResponse
    {
        $address = $this->viaCepService->getAddressByCep($cep);

        if (!$address) {
            return response()->json([
                'message' => 'CEP não encontrado ou inválido.',
            ], 404);
        }

        return response()->json([
            'address' => $address,
        ]);
    }

    /**
     * Busca endereços por UF, cidade e logradouro (busca reversa)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'uf' => ['required', 'string', 'size:2'],
            'city' => ['required', 'string', 'min:3'],
            'street' => ['required', 'string', 'min:3'],
        ], [
            'uf.required' => 'O UF é obrigatório.',
            'uf.size' => 'O UF deve ter 2 caracteres.',
            'city.required' => 'A cidade é obrigatória.',
            'city.min' => 'A cidade deve ter no mínimo 3 caracteres.',
            'street.required' => 'O logradouro é obrigatório.',
            'street.min' => 'O logradouro deve ter no mínimo 3 caracteres.',
        ]);

        $addresses = $this->viaCepService->searchAddress(
            $validated['uf'],
            $validated['city'],
            $validated['street']
        );

        if (empty($addresses)) {
            return response()->json([
                'message' => 'Nenhum endereço encontrado.',
                'addresses' => [],
            ]);
        }

        return response()->json([
            'addresses' => $addresses,
        ]);
    }
}
