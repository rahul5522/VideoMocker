import VideoGeneratorForm from "../components/videoGeneratorForm";
import { ThemeToggle } from "../components/themeToggle";

const Home = () => {
  return (
    <>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div>
        <VideoGeneratorForm />
      </div>
    </>
  );
};

export default Home;
