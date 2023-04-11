import ImageGenerator from "./components/ImageGenerator";
import Footer from "./components/footer";

const App = () => {
  return (
    <>
      <div className="bg-[#494D5F] h-screen">
        <ImageGenerator />
      </div>
      <div className="bg-black bottom-[0px] fixed min-w-full">
        <Footer />
      </div>
    </>
  );
};

export default App;
