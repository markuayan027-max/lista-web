import { motion } from "framer-motion";
import OptimizedImage from "@/components/optimized-image";
import { PARTNER_LOGOS_MARQUEE } from "@/lib/image-assets";

const marqueeItems = [...PARTNER_LOGOS_MARQUEE, ...PARTNER_LOGOS_MARQUEE];

export default function TrustMarquee() {
  return (
    <div className="w-full bg-white py-12 border-b border-slate-100 overflow-hidden relative">
      <div className="container mx-auto px-4 mb-8 flex flex-col items-center">
        <span className="text-[10px] font-black text-primary-indigo uppercase tracking-[0.4em] mb-2">
          Our Partners
        </span>
        <h3 className="text-xl font-bold text-slate-900 text-center">
          Trusted by National & Local Institutions
        </h3>
      </div>

      <div className="flex w-full relative">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: [0, -1035] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {marqueeItems.map((partner, idx) => (
            <div
              key={`${partner.label}-${idx}`}
              className="inline-flex flex-col items-center justify-center mx-12 group cursor-pointer"
            >
              <div className="h-16 md:h-20 flex items-center justify-center grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                <OptimizedImage
                  src={partner.src}
                  alt={partner.alt}
                  imgClassName="max-h-full w-auto object-contain transform group-hover:scale-110"
                  objectFit="contain"
                />
              </div>
              <span className="mt-3 text-[10px] font-bold text-slate-600 uppercase tracking-wide text-center max-w-[120px] leading-tight">
                {partner.label}
              </span>
            </div>
          ))}
        </motion.div>

        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
      </div>
    </div>
  );
}
