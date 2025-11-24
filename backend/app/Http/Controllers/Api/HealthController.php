<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Controller para verificação de health check da aplicação.
 * Utilizado para monitoramento e validação de disponibilidade.
 */
class HealthController extends Controller
{
    /**
     * Verifica o status da aplicação e suas dependências.
     *
     * Retorna informações sobre:
     * - Status geral da aplicação
     * - Conexão com banco de dados
     * - Ambiente de execução
     *
     * @return JsonResponse
     */
    public function check(): JsonResponse
    {
        $health = [
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'environment' => config('app.env'),
            'services' => [
                'database' => $this->checkDatabase(),
            ],
        ];

        // Se algum serviço estiver com problema, retorna status 503
        $allHealthy = collect($health['services'])->every(fn($service) => $service['status'] === 'up');

        return response()->json($health, $allHealthy ? 200 : 503);
    }

    /**
     * Verifica a conexão com o banco de dados.
     *
     * @return array
     */
    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            DB::connection()->getDatabaseName();

            return [
                'status' => 'up',
                'database' => DB::connection()->getDatabaseName(),
            ];
        } catch (Throwable $e) {
            return [
                'status' => 'down',
                'error' => 'Database connection failed',
            ];
        }
    }
}
