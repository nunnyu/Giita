import type { PropsWithChildren } from "react";

function HomeLayout({ children }: PropsWithChildren) {
  return (
    <div className="w-full h-full relative m-0 p-0">
      {/* Blurred background layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url(/images/vanhalen.webp)",
          filter: "blur(5px)",
        }}
      />
      {/* Gradient overlay - fades background from top to bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-990/95 via-dark-990/60 to-dark-990/95" />
      {/* Page */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

function FindSongLayout({ children }: PropsWithChildren) {
  return (
    <div className="w-full h-full relative m-0 p-0">
      {/* Blurred background layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url(/images/uechan.avif)",
          filter: "blur(5px)",
        }}
      />
      {/* Gradient overlay - fades background from top to bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-990/95 via-dark-990/60 to-dark-990/95" />
      {/* Page */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export { HomeLayout, FindSongLayout };
