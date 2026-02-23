import Navbar from "@/components/navbar";
import Hero from "@/components/sections/hero";
import Problem from "@/components/sections/problem";
import Pillars from "@/components/sections/pillars";
import Flywheel from "@/components/sections/flywheel";
import Moats from "@/components/sections/moats";
import CTA from "@/components/sections/cta";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Pillars />
        <Flywheel />
        <Moats />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
