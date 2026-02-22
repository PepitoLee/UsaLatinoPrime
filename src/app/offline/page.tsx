"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-[#002855] flex items-center justify-center mb-6">
        <span className="text-[#F2A900] font-bold text-4xl font-serif">U</span>
      </div>

      <h1 className="text-2xl font-bold text-[#002855] mb-2">
        UsaLatinoPrime
      </h1>

      <div className="w-16 h-1 bg-[#F2A900] rounded-full mb-8" />

      <h2 className="text-xl font-semibold text-[#002855] mb-3">
        Sin conexión a internet
      </h2>

      <p className="text-gray-600 mb-8 max-w-sm">
        Verifique su conexión a internet e intente nuevamente.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="px-8 py-3 bg-[#002855] text-white font-semibold rounded-lg hover:bg-[#001a3a] transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}
