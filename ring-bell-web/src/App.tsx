import { useState } from "react";
import axios from "axios";
import LoadingSpinner from "./assets/loading-spinner.svg?react";
import "./App.css";

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

      const firebaseEndpoint = import.meta.env.VITE_FIREBASE_ENDPOINT;
      const res = await axios.post(`${firebaseEndpoint}/visit`);

      setBellStatus((prev) => ({
        ...prev,
        isSuccess: true,
        isError: false,
      }));
      console.log(res);
    } catch (error) {
      console.log({ error });
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

  return (
    <>
      <h1>Press to ring bell</h1>

      <p>
        {bellStatus.isSuccess ? "Ding dong! Door will open soon..." : null}
        {bellStatus.isError
          ? "Bell failed! Please press button again to ring bell..."
          : null}
      </p>

      <button onClick={handleBellPress}>
        Press me {bellStatus.isLoading ? <LoadingSpinner /> : null}
      </button>
    </>
  );
}

export default App;
