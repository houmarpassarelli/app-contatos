<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Controller de Usuário
 *
 * Gerencia operações relacionadas à conta do usuário autenticado,
 * como exclusão de conta.
 */
class UserController extends Controller
{
    /**
     * Exclui a conta do usuário autenticado
     *
     * Remove o usuário e todos os seus dados associados (contatos).
     * Requer confirmação de senha para segurança.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'password' => ['required', 'string'],
            ], [
                'password.required' => 'A senha é obrigatória para confirmar a exclusão.',
            ]);

            $user = $request->user();

            // Verifica se a senha está correta
            if (!Hash::check($validated['password'], $user->password)) {
                throw ValidationException::withMessages([
                    'password' => ['A senha fornecida está incorreta.'],
                ]);
            }

            // Remove todos os tokens de acesso
            $user->tokens()->delete();

            // Remove o usuário (os contatos serão removidos em cascata)
            $user->delete();

            return response()->json([
                'message' => 'Conta excluída com sucesso.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação.',
                'errors' => $e->errors(),
            ], 422);
        }
    }
}
