<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\User;

/**
 * Policy de Autorização para Contatos
 *
 * Define as regras de autorização para operações em contatos.
 * Garante que usuários só possam acessar seus próprios contatos.
 */
class ContactPolicy
{
    /**
     * Determina se o usuário pode visualizar o contato
     *
     * @param User $user
     * @param Contact $contact
     * @return bool
     */
    public function view(User $user, Contact $contact): bool
    {
        return $user->id === $contact->user_id;
    }

    /**
     * Determina se o usuário pode atualizar o contato
     *
     * @param User $user
     * @param Contact $contact
     * @return bool
     */
    public function update(User $user, Contact $contact): bool
    {
        return $user->id === $contact->user_id;
    }

    /**
     * Determina se o usuário pode excluir o contato
     *
     * @param User $user
     * @param Contact $contact
     * @return bool
     */
    public function delete(User $user, Contact $contact): bool
    {
        return $user->id === $contact->user_id;
    }
}
