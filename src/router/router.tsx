import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";

const customRouter = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    }
]);

export default customRouter;
