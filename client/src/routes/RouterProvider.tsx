import {
  RouterProvider as Router,
  createBrowserRouter,
} from "react-router-dom";
import { routes } from "./config";

const router = createBrowserRouter(routes);

export default function RouterProvider() {
  return <Router router={router} />;
}
