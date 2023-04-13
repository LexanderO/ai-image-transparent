import ImageGenerator from "./components/ImageGenerator";
import Footer from "./components/footer";
import ParticlesBg from "particles-bg";

const App = () => {
  return (
    <>
      <div className="bg-[#494d5fb3] h-screen">
        <ParticlesBg type="cobweb" bg={true} />
        <ImageGenerator />
      </div>
      <div className="bg-black bottom-[0px] fixed min-w-full">
        <Footer />
      </div>
    </>
  );
};

export default App;
