<?php

namespace Tests\Unit;

use App\Services\CpfValidatorService;
use PHPUnit\Framework\TestCase;

/**
 * Testes para o Service de Validação de CPF
 */
class CpfValidatorServiceTest extends TestCase
{
    private CpfValidatorService $cpfValidator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->cpfValidator = new CpfValidatorService();
    }

    /**
     * Testa validação de CPF válido
     */
    public function test_valida_cpf_valido(): void
    {
        $this->assertTrue($this->cpfValidator->validate('111.444.777-35'));
        $this->assertTrue($this->cpfValidator->validate('11144477735'));
    }

    /**
     * Testa validação de CPF inválido
     */
    public function test_invalida_cpf_invalido(): void
    {
        $this->assertFalse($this->cpfValidator->validate('111.444.777-36'));
        $this->assertFalse($this->cpfValidator->validate('000.000.000-00'));
        $this->assertFalse($this->cpfValidator->validate('111.111.111-11'));
    }

    /**
     * Testa formatação de CPF
     */
    public function test_formata_cpf(): void
    {
        $this->assertEquals('111.444.777-35', $this->cpfValidator->format('11144477735'));
    }

    /**
     * Testa remoção de formatação
     */
    public function test_remove_formatacao(): void
    {
        $this->assertEquals('11144477735', $this->cpfValidator->unformat('111.444.777-35'));
    }
}
