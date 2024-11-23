import React, { useState } from "react";
import LoadingSpinner from "../assets/loading-spinner.svg?react";
import useApiStatus from "../hooks/useApiStatus";
import axios from "axios";

const firebaseEndpoint = import.meta.env.VITE_FIREBASE_ENDPOINT;

type Status = "approved" | "rejected" | "review-pending";
type User = {
  id: string;
  firstName: string;
  status: Status;
};

function GateKeepersTable({ gateKeepers }: { gateKeepers: Array<User> }) {
  const { apiStatus, setApiStatus } = useApiStatus();
  const handleStatusActions = async (id: string, newStatus: Status) => {
    try {
      setApiStatus((prev) => ({ ...prev, isLoading: true }));
      await axios.post(
        `${firebaseEndpoint}/changeGateKeeperStatus`,
        {
          id,
          newStatus,
        },
        {
          headers: {
            "x-api-key": import.meta.env.VITE_CLIENT_APP_API_KEY,
          },
        }
      );

      setApiStatus((prev) => ({ ...prev, isSuccess: true }));
    } catch (e) {
      console.log({ e });
      setApiStatus((prev) => ({ ...prev, isError: true }));
    } finally {
      setApiStatus((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <section>
      <h1>Gatekeepers</h1>
      <table>
        <thead>
          <tr>
            <th>Full name</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {gateKeepers.map((gateKeeper) => {
            return (
              <tr key={gateKeeper.id}>
                <td>{gateKeeper.firstName}</td>
                <td>{gateKeeper.status}</td>
                <td
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <button
                    onClick={() =>
                      handleStatusActions(gateKeeper.id, "approved")
                    }
                    className="btn-neumorphic"
                    style={{ marginBottom: "4px" }}
                  >
                    Approve
                    {apiStatus.isLoading ? <LoadingSpinner /> : null}
                  </button>
                  <button
                    onClick={() =>
                      handleStatusActions(gateKeeper.id, "rejected")
                    }
                    className="btn-neumorphic"
                    style={{ marginBottom: "4px" }}
                  >
                    Reject
                    {apiStatus.isLoading ? <LoadingSpinner /> : null}
                  </button>
                  <button
                    onClick={() =>
                      handleStatusActions(gateKeeper.id, "review-pending")
                    }
                    className="btn-neumorphic"
                    style={{ marginBottom: "4px" }}
                  >
                    InReview
                    {apiStatus.isLoading ? <LoadingSpinner /> : null}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function PinForm({
  setGateKeepers,
}: {
  setGateKeepers: React.Dispatch<React.SetStateAction<User[]>>;
}) {
  const [pin, setPin] = useState<number>(0);
  const { apiStatus, setApiStatus } = useApiStatus();

  const handleSubmit = async () => {
    try {
      setApiStatus((prev) => ({ ...prev, isLoading: true }));
      const res = await axios.post(
        `${firebaseEndpoint}/getAllGateKeepers`,
        {
          pin: `${pin}`,
        },
        {
          headers: {
            "x-api-key": import.meta.env.VITE_CLIENT_APP_API_KEY,
          },
        }
      );
      if (res.data?.data && res.data?.data?.length > 0) {
        setGateKeepers(res.data.data as Array<User>);
      }
      setApiStatus((prev) => ({ ...prev, isSuccess: true }));
    } catch (e) {
      console.log({ e });
      setApiStatus((prev) => ({ ...prev, isError: true }));
    } finally {
      setApiStatus((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <section>
      <input
        type="number"
        className="pin-input"
        placeholder="Enter PIN"
        onChange={(e) => {
          setPin(Number(e.target.value));
        }}
      />
      <button onClick={handleSubmit} className="btn-neumorphic">
        Submit
        {apiStatus.isLoading ? <LoadingSpinner /> : null}
      </button>
    </section>
  );
}

function Admin() {
  const [gateKeepers, setGateKeepers] = useState<Array<User>>([]);

  return (
    <div>
      {gateKeepers.length > 0 ? (
        <GateKeepersTable gateKeepers={gateKeepers} />
      ) : (
        <PinForm setGateKeepers={setGateKeepers} />
      )}
    </div>
  );
}

export default Admin;
