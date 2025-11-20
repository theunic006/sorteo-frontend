export default function AdminSidebar() {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-white text-xl font-bold">Admin Panel</span>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            <p className="text-gray-400 text-sm px-3">Menú en desarrollo</p>
          </nav>
        </div>
      </div>
    </div>
  );
}
