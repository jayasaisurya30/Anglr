import Image from "next/image";

/**
 * Static aerial-ocean photograph used as the landing-page backdrop.
 * Source asset is 3840x2415 (lanczos3 upscale + edge sharpen via `sharp`),
 * served at the highest quality next/image will produce. A subtle CSS pass
 * restores contrast/saturation that JPEG compression and the vignette eat.
 */
export function OceanBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <Image
        src="/landing/ocean.jpg"
        alt=""
        fill
        priority
        quality={100}
        sizes="(min-width: 2560px) 3840px, 100vw"
        className="select-none object-cover object-center"
        style={{
          filter: "contrast(1.05) saturate(1.06)",
          imageRendering: "auto",
        }}
      />
    </div>
  );
}
