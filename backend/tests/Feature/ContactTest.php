<?php

namespace Tests\Feature;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testes de Feature para Contatos
 */
class ContactTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Testa listagem de contatos
     */
    public function test_usuario_pode_listar_seus_contatos(): void
    {
        $user = User::factory()->create();
        Contact::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->getJson('/api/contacts');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /**
     * Testa criação de contato
     */
    public function test_usuario_pode_criar_contato(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/contacts', [
            'name' => 'João Silva',
            'cpf' => '11144477735',
            'phone' => '11999999999',
            'street' => 'Rua Teste',
            'number' => '123',
            'neighborhood' => 'Centro',
            'city' => 'São Paulo',
            'state' => 'SP',
            'zip_code' => '01000000',
            'latitude' => -23.550520,
            'longitude' => -46.633308,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['contact' => ['id', 'name', 'cpf']]);

        $this->assertDatabaseHas('contacts', [
            'name' => 'João Silva',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Testa que usuário não pode ver contatos de outros
     */
    public function test_usuario_nao_pode_ver_contatos_de_outros(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $contact = Contact::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user1)->getJson("/api/contacts/{$contact->id}");

        $response->assertStatus(403);
    }

    /**
     * Testa exclusão de contato
     */
    public function test_usuario_pode_excluir_seu_contato(): void
    {
        $user = User::factory()->create();
        $contact = Contact::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->deleteJson("/api/contacts/{$contact->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('contacts', ['id' => $contact->id]);
    }
}
