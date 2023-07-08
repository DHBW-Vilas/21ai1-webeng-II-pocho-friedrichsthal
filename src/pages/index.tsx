import { type NextPage } from "next";
import Image from "next/image";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const Home: NextPage = () => {
  return (
    <>
      <main className="flex flex-col justify-center">
        <div id="image-carusel" className="flex justify-center">
          <Image
            className="justify-center align-middle"
            src="/PoCho_Logo.png"
            width={700}
            height={700}
            alt="Logo"
          />
        </div>
        <div className="sticky top-0">
          <Navbar />
        </div>
        <div>
          <h1 className="text-center text-4xl">Herzlich Willkommen</h1>
          <p className="text-center">
            auf der Website des Posaunenchor Friedrichsthal
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Home;
