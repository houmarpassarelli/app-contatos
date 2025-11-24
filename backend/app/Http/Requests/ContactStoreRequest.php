<?php

namespace App\Http\Requests;

use App\Services\CpfValidatorService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * Form Request para criação de contatos
 *
 * Valida todos os dados necessários para criar um novo contato,
 * incluindo validação de CPF e unicidade por usuário.
 */
class ContactStoreRequest extends FormRequest
{
    /**
     * Determina se o usuário está autorizado a fazer esta requisição
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true; // Autorização já é feita pelo middleware auth:sanctum
    }

    /**
     * Regras de validação para a requisição
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Dados pessoais
            'name' => ['required', 'string', 'max:255'],
            'cpf' => ['required', 'string', 'size:11'], // CPF sem formatação (apenas números)
            'phone' => ['required', 'string', 'max:20'],

            // Endereço
            'street' => ['required', 'string', 'max:255'],
            'number' => ['required', 'string', 'max:20'],
            'complement' => ['nullable', 'string', 'max:255'],
            'neighborhood' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'size:2'],
            'zip_code' => ['required', 'string', 'size:8'], // CEP sem formatação (apenas números)

            // Coordenadas (opcionais, serão obtidas via Google Maps se não fornecidas)
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }

    /**
     * Mensagens de validação personalizadas
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // Dados pessoais
            'name.required' => 'O nome é obrigatório.',
            'name.max' => 'O nome não pode ter mais de 255 caracteres.',
            'cpf.required' => 'O CPF é obrigatório.',
            'cpf.size' => 'O CPF deve estar no formato 000.000.000-00.',
            'phone.required' => 'O telefone é obrigatório.',
            'phone.max' => 'O telefone não pode ter mais de 20 caracteres.',

            // Endereço
            'street.required' => 'O logradouro é obrigatório.',
            'street.max' => 'O logradouro não pode ter mais de 255 caracteres.',
            'number.required' => 'O número é obrigatório.',
            'number.max' => 'O número não pode ter mais de 20 caracteres.',
            'complement.max' => 'O complemento não pode ter mais de 255 caracteres.',
            'neighborhood.required' => 'O bairro é obrigatório.',
            'neighborhood.max' => 'O bairro não pode ter mais de 255 caracteres.',
            'city.required' => 'A cidade é obrigatória.',
            'city.max' => 'A cidade não pode ter mais de 255 caracteres.',
            'state.required' => 'O estado (UF) é obrigatório.',
            'state.size' => 'O estado deve ter 2 caracteres.',
            'zip_code.required' => 'O CEP é obrigatório.',
            'zip_code.size' => 'O CEP deve estar no formato 00000-000.',

            // Coordenadas
            'latitude.numeric' => 'A latitude deve ser um número.',
            'latitude.between' => 'A latitude deve estar entre -90 e 90.',
            'longitude.numeric' => 'A longitude deve ser um número.',
            'longitude.between' => 'A longitude deve estar entre -180 e 180.',
        ];
    }

    /**
     * Validação adicional após as regras padrão
     *
     * @param Validator $validator
     * @return void
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            // Valida o CPF usando o algoritmo oficial
            $cpfValidator = new CpfValidatorService();
            $cpf = $this->input('cpf');

            if ($cpf && !$cpfValidator->validate($cpf)) {
                $validator->errors()->add('cpf', 'O CPF informado é inválido.');
            }

            // Verifica se o CPF já está cadastrado para este usuário
            if ($cpf) {
                $cpfUnformatted = $cpfValidator->unformat($cpf);
                $exists = $this->user()->contacts()
                    ->where('cpf', $cpfUnformatted)
                    ->exists();

                if ($exists) {
                    $validator->errors()->add('cpf', 'Você já possui um contato com este CPF.');
                }
            }
        });
    }

    /**
     * Prepara os dados para validação
     *
     * Remove formatação do CPF e CEP antes de validar
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        $cpfValidator = new CpfValidatorService();

        // Remove formatação do CPF
        if ($this->cpf) {
            $this->merge([
                'cpf' => $cpfValidator->unformat($this->cpf),
            ]);
        }

        // Remove formatação do CEP
        if ($this->zip_code) {
            $this->merge([
                'zip_code' => preg_replace('/\D/', '', $this->zip_code),
            ]);
        }

        // Normaliza o estado para maiúsculo
        if ($this->state) {
            $this->merge([
                'state' => strtoupper($this->state),
            ]);
        }
    }
}
