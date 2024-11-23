import { useState } from "react";

export default function useApiStatus() {
  const defaultApiStatus = {
    isLoading: false,
    isSuccess: false,
    isError: false,
  };

  const [apiStatus, setApiStatus] = useState(defaultApiStatus);
  return { apiStatus, setApiStatus };
}
