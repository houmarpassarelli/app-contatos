<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executa as migrations.
     * Cria a tabela de contatos com todos os campos necessários incluindo endereço completo
     * e coordenadas geográficas para integração com Google Maps.
     */
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();

            // Relacionamento com usuário
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade') // Quando usuário é excluído, seus contatos também são
                ->comment('ID do usuário proprietário do contato');

            // Dados pessoais
            $table->string('name')->comment('Nome completo do contato');
            $table->string('cpf', 14)->comment('CPF do contato (formato: 000.000.000-00)');
            $table->string('phone', 20)->comment('Telefone do contato');

            // Endereço completo
            $table->string('street')->comment('Logradouro (rua, avenida, etc)');
            $table->string('number', 20)->comment('Número do endereço');
            $table->string('complement')->nullable()->comment('Complemento do endereço (opcional)');
            $table->string('neighborhood')->comment('Bairro');
            $table->string('city')->comment('Cidade');
            $table->string('state', 2)->comment('Estado (UF - 2 caracteres)');
            $table->string('zip_code', 10)->comment('CEP (formato: 00000-000)');

            // Coordenadas geográficas para Google Maps
            $table->decimal('latitude', 10, 8)->comment('Latitude para localização no mapa');
            $table->decimal('longitude', 11, 8)->comment('Longitude para localização no mapa');

            $table->timestamps();

            // Índices para otimização de consultas
            $table->index('user_id', 'idx_contacts_user_id');
            $table->unique(['user_id', 'cpf'], 'unique_user_cpf'); // CPF único por usuário
            $table->index('name', 'idx_contacts_name'); // Para buscas por nome
            $table->index('cpf', 'idx_contacts_cpf'); // Para buscas por CPF
        });
    }

    /**
     * Reverte as migrations.
     * Remove a tabela de contatos do banco de dados.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
