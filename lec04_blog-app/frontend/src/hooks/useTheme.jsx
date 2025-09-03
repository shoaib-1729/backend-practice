// hooks/useTheme.js
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme, setTheme } from "../utils/themeSlice";

export const useTheme = () => {
  const mode = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();
  
  return {
    mode,
    toggleTheme: () => dispatch(toggleTheme()),
    setTheme: (theme) => dispatch(setTheme(theme))
  };
};