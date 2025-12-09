import Aurora from "./Aurora";

export const Home = () => {
  return (
    <>
      {/* Aurora Background */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <Aurora
          colorStops={["#22c55e", "#a855f7", "#22c55e"]}
          blend={0.8}
          amplitude={1.2}
          speed={0.3}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 text-white">
          <h1 className="text-5xl font-bold">مرحباً بكم</h1>
        </section>

      </div>
    </>
  );
};