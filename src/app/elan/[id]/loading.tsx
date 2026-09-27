export default function Loading() {
  return (
    <div className="animate-pulse grid md:grid-cols-2 gap-8">
      <div className="aspect-square bg-gray-200 rounded-2xl"></div>
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}