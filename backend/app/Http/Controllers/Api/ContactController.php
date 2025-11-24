<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactStoreRequest;
use App\Http\Requests\ContactUpdateRequest;
use App\Models\Contact;
use App\Services\GoogleMapsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller de Contatos
 *
 * Gerencia o CRUD completo de contatos do usuário autenticado.
 * Inclui filtros, ordenação, paginação e integração com Google Maps para geocoding.
 */
class ContactController extends Controller
{
    /**
     * Service de Google Maps
     *
     * @var GoogleMapsService
     */
    protected GoogleMapsService $googleMapsService;

    /**
     * Construtor do controller
     */
    public function __construct(GoogleMapsService $googleMapsService)
    {
        $this->googleMapsService = $googleMapsService;
    }

    /**
     * Lista os contatos do usuário autenticado
     *
     * Suporta filtro por nome ou CPF, ordenação alfabética e paginação.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        $sortDirection = $request->input('sort', 'asc');

        $query = $request->user()->contacts();

        // Aplica filtro de busca se fornecido
        if ($search) {
            $query->search($search);
        }

        // Aplica ordenação alfabética
        $query->alphabetical($sortDirection);

        $contacts = $query->paginate($perPage);

        return response()->json($contacts);
    }

    /**
     * Cria um novo contato
     *
     * Valida os dados, obtém coordenadas geográficas e salva o contato.
     *
     * @param ContactStoreRequest $request
     * @return JsonResponse
     */
    public function store(ContactStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Se não foram fornecidas coordenadas, busca no Google Maps
        if (empty($validated['latitude']) || empty($validated['longitude'])) {
            $coordinates = $this->googleMapsService->getCoordinates([
                'street' => $validated['street'],
                'number' => $validated['number'],
                'neighborhood' => $validated['neighborhood'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'zip_code' => $validated['zip_code'],
            ]);

            if ($coordinates) {
                $validated['latitude'] = $coordinates['latitude'];
                $validated['longitude'] = $coordinates['longitude'];
            } else {
                return response()->json([
                    'message' => 'Não foi possível obter as coordenadas geográficas do endereço.',
                    'error' => 'Verifique se o endereço está correto.',
                ], 422);
            }
        }

        // Cria o contato associado ao usuário autenticado
        $contact = $request->user()->contacts()->create($validated);

        return response()->json([
            'message' => 'Contato criado com sucesso.',
            'contact' => $contact,
        ], 201);
    }

    /**
     * Exibe um contato específico
     *
     * @param Contact $contact
     * @return JsonResponse
     */
    public function show(Contact $contact): JsonResponse
    {
        // Verifica se o contato pertence ao usuário autenticado
        $this->authorize('view', $contact);

        return response()->json([
            'contact' => $contact,
        ]);
    }

    /**
     * Atualiza um contato existente
     *
     * @param ContactUpdateRequest $request
     * @param Contact $contact
     * @return JsonResponse
     */
    public function update(ContactUpdateRequest $request, Contact $contact): JsonResponse
    {
        // Verifica se o contato pertence ao usuário autenticado
        $this->authorize('update', $contact);

        $validated = $request->validated();

        // Se o endereço foi alterado, atualiza as coordenadas
        $addressChanged = $this->hasAddressChanged($contact, $validated);

        if ($addressChanged) {
            $coordinates = $this->googleMapsService->getCoordinates([
                'street' => $validated['street'] ?? $contact->street,
                'number' => $validated['number'] ?? $contact->number,
                'neighborhood' => $validated['neighborhood'] ?? $contact->neighborhood,
                'city' => $validated['city'] ?? $contact->city,
                'state' => $validated['state'] ?? $contact->state,
                'zip_code' => $validated['zip_code'] ?? $contact->zip_code,
            ]);

            if ($coordinates) {
                $validated['latitude'] = $coordinates['latitude'];
                $validated['longitude'] = $coordinates['longitude'];
            }
        }

        $contact->update($validated);

        return response()->json([
            'message' => 'Contato atualizado com sucesso.',
            'contact' => $contact->fresh(),
        ]);
    }

    /**
     * Remove um contato
     *
     * @param Contact $contact
     * @return JsonResponse
     */
    public function destroy(Contact $contact): JsonResponse
    {
        // Verifica se o contato pertence ao usuário autenticado
        $this->authorize('delete', $contact);

        $contact->delete();

        return response()->json([
            'message' => 'Contato excluído com sucesso.',
        ]);
    }

    /**
     * Verifica se o endereço foi alterado
     *
     * @param Contact $contact
     * @param array $newData
     * @return bool
     */
    private function hasAddressChanged(Contact $contact, array $newData): bool
    {
        $addressFields = ['street', 'number', 'neighborhood', 'city', 'state', 'zip_code'];

        foreach ($addressFields as $field) {
            if (isset($newData[$field]) && $newData[$field] !== $contact->$field) {
                return true;
            }
        }

        return false;
    }
}
