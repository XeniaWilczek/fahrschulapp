import { useRouteError, type ErrorResponse } from "react-router-dom";

function ErrorPage() {
  const error: ErrorResponse = useRouteError() as ErrorResponse;
  return (
    <div>
      <h1>Hoppla!</h1>
      <p>Es ist ein unerwarteter Fehler aufgetreten.</p>
      <p>
        <i>{error.statusText}</i>
      </p>
    </div>
  );
}
export default ErrorPage;
