"use client";
import CardSwap, { Card } from '../src/blocks/Components/CardSwap/CardSwap';

const FeatureInteractive = () => {
  return (
    <section className="py-16 bg-white px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
        
        {/* Teks Fitur */}
        <div className="flex-1 text-left">
          <h2 className="text-4xl font-bold text-[#00acee] font-poppins mb-4">
            Fitur Interaktif
          </h2>
          <p className="text-gray-600 text-lg font-poppins">
            Belajar lebih seru dengan animasi, latihan, dan tantangan yang menyenangkan.
          </p>
        </div>

        {/* CardSwap */}
        <div className="flex-1" style={{ maxWidth: '500px', height: '400px', position: 'relative' }}>
          <CardSwap
            cardDistance={60}
            verticalDistance={70}
            delay={5000}
            pauseOnHover={true}
          >
            <Card>
              <h3 className="text-xl mb-2 text-white"> 🎨 Belajar Mudah</h3>
              <div className="w-full h-full">
                <img
                  src="/img/preview/1.png"
                  alt="Preview interaksi"
                  className="w-full h-full object-cover rounded"
                />
              </div>
            </Card>
            <Card>
              <h3 className="text-xl mb-2 text-white"> 📚 Latihan Interaktif</h3>
              <div className="w-full h-full">
                <img
                  src="/img/preview/2.png"
                  alt="Preview interaksi"
                  className="w-full h-full object-cover rounded"
                />
              </div>
            </Card>
            <Card>
              <h3 className="text-xl mb-2 text-white"> 🎯 Tantangan Seru</h3>
              <div className="w-full h-full">
                <img
                  src="/img/preview/5.png"
                  alt="Preview interaksi"
                  className="w-full h-full object-cover rounded"
                />
              </div>
            </Card>
          </CardSwap>
        </div>
      </div>
    </section>
  );
};

export default FeatureInteractive;
