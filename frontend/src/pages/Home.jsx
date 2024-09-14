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
      <div className="absolute bottom-0 left-0 right-0 flex justify-center py-2">
        <p className="text-sm text-muted-foreground"><a href="https://x.com/RahulWa06202555" target="_blank" >✨ Rahul</a> </p>
      </div>
    </>
  );
};

export default Home;
