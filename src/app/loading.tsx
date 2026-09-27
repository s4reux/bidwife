export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded-xl mb-6"></div>
      <div className="flex gap-2 mb-5">
        {[1,2,3,4].map(i => <div key={i} className="h-8 w-24 bg-gray-200 rounded-full"></div>)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="bg-white rounded-xl border overflow-hidden">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}