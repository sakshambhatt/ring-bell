import { useState, useEffect } from "react";
import axios from "axios";
import LoadingSpinner from "./assets/loading-spinner.svg?react";
import "./App.css";
const firebaseEndpoint = import.meta.env.VITE_FIREBASE_ENDPOINT;

function App() {
  const defaultBellStatus = {
    isLoading: false,
    isSuccess: false,
    isError: false,
  };

  const [bellStatus, setBellStatus] = useState(defaultBellStatus);

  const handleBellPress = async () => {
    try {
      setBellStatus((prev) => ({ ...prev, isLoading: true }));

      await axios.post(
        `${firebaseEndpoint}/visit`,
        {},
        {
          headers: {
            "x-api-key": import.meta.env.VITE_CLIENT_APP_API_KEY,
          },
        }
      );

      setBellStatus((prev) => ({
        ...prev,
        isSuccess: true,
        isError: false,
      }));
    } catch (error) {
      setBellStatus((prev) => ({
        ...prev,
        isSuccess: false,
        isError: true,
      }));
    } finally {
      setBellStatus((prev) => ({
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
        {bellStatus.isSuccess ? "Ding dong! Door will open soon..." : null}
        {bellStatus.isError
          ? "Bell failed! Please press button again to ring bell..."
          : null}
      </p>

      <button onClick={handleBellPress} className="btn-neumorphic">
        <p style={{ fontSize: "2em" }}>🔔</p>
        {bellStatus.isLoading ? <LoadingSpinner /> : null}
      </button>
    </>
  );
}

export default App;
