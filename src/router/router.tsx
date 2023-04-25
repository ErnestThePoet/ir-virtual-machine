import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";

const customRouter = createBrowserRouter(
    [
        {
            path: "/",
            element: <Home />
        }
    ],
    { basename: "/ir-virtual-machine" }
);

export default customRouter;
