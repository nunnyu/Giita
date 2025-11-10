import type { PropsWithChildren } from "react";

function HomeLayout({ children }: PropsWithChildren) {
  return (
    <div className="relative h-screen overflow-hidden m-0 p-0">
      {/* Blurred background layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url(/images/vanhalen.webp)",
          filter: "blur(5px)",
        }}
      />
      {/* Gradient overlay - fades background from top to bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-990/60 to-dark-990/95" />
      {/* Page */}
      {children}
    </div>
  );
}

function FindSongLayout({ children }: PropsWithChildren) {
  return (
    <div className="relative h-screen overflow-hidden m-0 p-0">
      {/* Blurred background layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url(/images/layne.png)",
          filter: "blur(5px)",
        }}
      />
      {/* Gradient overlay - fades background from top to bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-990/60 to-dark-990/95" />
      {/* Page */}
      {children}
    </div>
  );
}

export { HomeLayout, FindSongLayout };