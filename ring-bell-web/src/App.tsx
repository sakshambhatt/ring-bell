import { useEffect } from "react";
import axios from "axios";
import LoadingSpinner from "./assets/loading-spinner.svg?react";
import "./App.css";
import useApiStatus from "./hooks/useApiStatus";
const firebaseEndpoint = import.meta.env.VITE_FIREBASE_ENDPOINT;

function App() {
  const { apiStatus, setApiStatus } = useApiStatus();

  const handleBellPress = async () => {
    try {
      setApiStatus((prev) => ({ ...prev, isLoading: true }));

      await axios.post(
        `${firebaseEndpoint}/visit`,
        {},
        {
          headers: {
            "x-api-key": import.meta.env.VITE_CLIENT_APP_API_KEY,
          },
        }
      );

      setApiStatus((prev) => ({
        ...prev,
        isSuccess: true,
        isError: false,
      }));
    } catch (error) {
      setApiStatus((prev) => ({
        ...prev,
        isSuccess: false,
        isError: true,
      }));
    } finally {
      setApiStatus((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  useEffect(() => {
    let ignore = false;

    const getApiStatus = async () => {
      try {
        const res = await axios.get(`${firebaseEndpoint}/healthCheck`);
        console.log({ res });
      } catch (e) {
        console.error({ e });
      }
    };

    if (!ignore) {
      getApiStatus();
    }

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <h1>Press to ring bell</h1>

      <p>
        {apiStatus.isSuccess ? "Ding dong! Door will open soon..." : null}
        {apiStatus.isError
          ? "Bell failed! Please press button again to ring bell..."
          : null}
      </p>

      <button
        onClick={handleBellPress}
        className="btn-neumorphic btn-neumorphic--vertical btn-neumorphic--extra-padding"
        disabled={apiStatus.isLoading}
      >
        <p style={{ fontSize: "2em" }}>🔔</p>
        {apiStatus.isLoading ? <LoadingSpinner /> : null}
      </button>
    </>
  );
}

export default App;
