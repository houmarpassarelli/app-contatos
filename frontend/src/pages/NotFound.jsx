export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-4 text-xl">Página não encontrada</p>
        <a href="/dashboard" className="btn btn-primary mt-6 inline-block">Voltar ao Dashboard</a>
      </div>
    </div>
  )
}
