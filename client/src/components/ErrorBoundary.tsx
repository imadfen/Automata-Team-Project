import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { paths } from "@/routes/paths";

export default function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center space-y-6 p-8">
            <h1 className="text-4xl font-bold text-gray-900">Page not found</h1>
            <p className="text-lg text-gray-600">
              Sorry, we couldn't find the page you're looking for.
            </p>
            <div className="space-x-4">
              <Button onClick={() => window.history.back()}>Go Back</Button>
              <Button variant="outline" asChild>
                <Link to={paths.dashboard.root}>Go Home</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="text-lg text-gray-600">
          An unexpected error has occurred.
        </p>
        <div className="space-x-4">
          <Button onClick={() => window.history.back()}>Go Back</Button>
          <Button variant="outline" asChild>
            <Link to={paths.dashboard.root}>Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
