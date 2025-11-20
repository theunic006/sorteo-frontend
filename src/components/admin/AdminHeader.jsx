export default function AdminHeader({ user }) {
  return (
    <div className="sticky top-0 z-10 bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Panel Administrativo</h2>
          </div>
          <div className="flex items-center">
            {user && (
              <span className="text-gray-700">Bienvenido, {user.name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
