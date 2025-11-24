<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model de Contato
 *
 * Representa um contato cadastrado por um usuário.
 * Contém informações pessoais, endereço completo e coordenadas geográficas.
 */
class Contact extends Model
{
    use HasFactory;

    /**
     * Os atributos que podem ser atribuídos em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'cpf',
        'phone',
        'street',
        'number',
        'complement',
        'neighborhood',
        'city',
        'state',
        'zip_code',
        'latitude',
        'longitude',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    /**
     * Relacionamento com usuário
     *
     * Cada contato pertence a um usuário.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Retorna o CPF formatado
     *
     * @return string CPF no formato 000.000.000-00
     */
    public function getFormattedCpfAttribute(): string
    {
        $cpf = preg_replace('/\D/', '', $this->cpf);
        return preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $cpf);
    }

    /**
     * Retorna o CEP formatado
     *
     * @return string CEP no formato 00000-000
     */
    public function getFormattedZipCodeAttribute(): string
    {
        $zipCode = preg_replace('/\D/', '', $this->zip_code);
        return preg_replace('/(\d{5})(\d{3})/', '$1-$2', $zipCode);
    }

    /**
     * Retorna o endereço completo formatado
     *
     * @return string Endereço completo
     */
    public function getFullAddressAttribute(): string
    {
        $address = "{$this->street}, {$this->number}";

        if ($this->complement) {
            $address .= " - {$this->complement}";
        }

        $address .= ", {$this->neighborhood}, {$this->city}/{$this->state} - CEP: {$this->formatted_zip_code}";

        return $address;
    }

    /**
     * Scope para filtrar contatos por nome ou CPF
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $search Termo de busca
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('cpf', 'like', "%{$search}%");
        });
    }

    /**
     * Scope para ordenar contatos alfabeticamente
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $direction Direção da ordenação (asc ou desc)
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAlphabetical($query, $direction = 'asc')
    {
        return $query->orderBy('name', $direction);
    }
}
