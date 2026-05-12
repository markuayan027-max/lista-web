import { motion } from "framer-motion";
import { withBase } from "@/lib/with-base";

const partners = [
  { src: '/TESDA_Logo_official-removebg-preview.png', alt: 'TESDA Logo', label: 'TESDA' },
  { src: '/DepEd logo.png', alt: 'DepEd Logo', label: 'DepEd' },
  { src: '/ATI (Agricultural Training Institute) LOGO.png', alt: 'ATI Logo', label: 'ATI' },
  { src: '/NVTC (National Vocational Training Council) is INTERNATIONAL LOGO.webp.png', alt: 'NVTC Logo', label: 'NVTC' },
  { src: '/logo.png', alt: 'LTO Logo', label: 'LTO' },
];

// Double the partners to create a seamless loop
const marqueeItems = [...partners, ...partners];

export default function TrustMarquee() {
  return (
    <div className="w-full bg-white py-12 border-b border-slate-100 overflow-hidden relative">
      <div className="container mx-auto px-4 mb-8 flex flex-col items-center">
         <span className="text-[10px] font-black text-primary-indigo uppercase tracking-[0.4em] mb-2">Our Partners</span>
         <h3 className="text-xl font-bold text-slate-900 text-center">Trusted by National & Local Institutions</h3>
      </div>
      
      <div className="flex w-full relative">
        <motion.div 
          className="flex whitespace-nowrap"
          animate={{
            x: [0, -1035], // Adjust based on item width * count
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {marqueeItems.map((partner, idx) => (
            <div 
              key={`${partner.label}-${idx}`} 
              className="inline-flex flex-col items-center justify-center mx-12 group cursor-pointer"
            >
              <div className="h-16 md:h-20 flex items-center justify-center grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                <img 
                  src={withBase(partner.src)} 
                  alt={partner.alt} 
                  className="max-h-full w-auto object-contain transform group-hover:scale-110" 
                />
              </div>
              <span className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                {partner.label}
              </span>
            </div>
          ))}
        </motion.div>
        
        {/* Faders for smooth edges */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
      </div>
    </div>
  );
}
