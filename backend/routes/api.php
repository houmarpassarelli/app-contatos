<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aqui estão registradas as rotas da API para o sistema de contatos.
| Rotas públicas não requerem autenticação, rotas protegidas requerem
| token de autenticação via Laravel Sanctum.
|
*/

/*
|--------------------------------------------------------------------------
| Rotas Públicas (Sem Autenticação)
|--------------------------------------------------------------------------
*/

// Health Check (para monitoramento e Docker health check)
Route::get('/health', [HealthController::class, 'check'])->name('health.check');

// Autenticação
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('auth.forgot-password');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('auth.reset-password');
});

/*
|--------------------------------------------------------------------------
| Rotas Protegidas (Requerem Autenticação)
|--------------------------------------------------------------------------
|
| Todas as rotas abaixo requerem autenticação via token Sanctum.
| O middleware 'auth:sanctum' valida o token e disponibiliza o usuário
| autenticado via $request->user().
|
*/

Route::middleware('auth:sanctum')->group(function () {

    // Autenticação (rotas protegidas)
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
    });

    // Contatos (CRUD completo)
    Route::apiResource('contacts', ContactController::class);

    // Endereços (Proxy ViaCEP)
    Route::prefix('addresses')->group(function () {
        Route::get('/search', [AddressController::class, 'search'])->name('addresses.search');
        Route::get('/{cep}', [AddressController::class, 'getByCep'])->name('addresses.get-by-cep');
    });

    // Gerenciamento de Conta
    Route::prefix('account')->group(function () {
        Route::delete('/', [UserController::class, 'deleteAccount'])->name('account.delete');
    });
});
