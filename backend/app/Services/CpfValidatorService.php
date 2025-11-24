<?php

namespace App\Services;

/**
 * Service de Validação de CPF
 *
 * Implementa o algoritmo oficial de validação de CPF do Brasil.
 * Verifica se um CPF é válido de acordo com os dígitos verificadores.
 */
class CpfValidatorService
{
    /**
     * Valida um CPF utilizando o algoritmo oficial
     *
     * Remove caracteres não numéricos e verifica se o CPF:
     * - Tem 11 dígitos
     * - Não é uma sequência de números iguais (000.000.000-00, 111.111.111-11, etc)
     * - Os dígitos verificadores estão corretos
     *
     * @param string $cpf CPF a ser validado (com ou sem formatação)
     * @return bool True se o CPF é válido, False caso contrário
     */
    public function validate(string $cpf): bool
    {
        // Remove caracteres não numéricos
        $cpf = preg_replace('/\D/', '', $cpf);

        // Verifica se tem 11 dígitos
        if (strlen($cpf) != 11) {
            return false;
        }

        // Verifica se todos os dígitos são iguais (CPF inválido)
        if (preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }

        // Validação do primeiro dígito verificador
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += intval($cpf[$i]) * (10 - $i);
        }
        $remainder = $sum % 11;
        $digit1 = $remainder < 2 ? 0 : 11 - $remainder;

        if (intval($cpf[9]) !== $digit1) {
            return false;
        }

        // Validação do segundo dígito verificador
        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += intval($cpf[$i]) * (11 - $i);
        }
        $remainder = $sum % 11;
        $digit2 = $remainder < 2 ? 0 : 11 - $remainder;

        if (intval($cpf[10]) !== $digit2) {
            return false;
        }

        return true;
    }

    /**
     * Formata um CPF para o padrão 000.000.000-00
     *
     * @param string $cpf CPF sem formatação (apenas números)
     * @return string CPF formatado ou string vazia se inválido
     */
    public function format(string $cpf): string
    {
        $cpf = preg_replace('/\D/', '', $cpf);

        if (strlen($cpf) != 11) {
            return '';
        }

        return preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $cpf);
    }

    /**
     * Remove a formatação do CPF, deixando apenas os números
     *
     * @param string $cpf CPF formatado
     * @return string CPF sem formatação (apenas números)
     */
    public function unformat(string $cpf): string
    {
        return preg_replace('/\D/', '', $cpf);
    }
}
