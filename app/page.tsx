import ImageUploader from './components/ImageUploader';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">
            Image Resizer
          </h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto">
            Upload your image and get it automatically resized to multiple dimensions for your advertising needs.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <ImageUploader />
        </div>
      </div>
    </main>
  );
}