import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/themeContext";

export const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="cursor-pointer"
        >
            {theme === "dark" ? <Sun /> : <Moon />}
        </div>
    );
};
