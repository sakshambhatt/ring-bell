import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 3000;

const supabaseUrl = process.env.SUPABASE_ENDPOINT;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

app.get("/", (req, res) => {
  res.send("Ring bell server is working!");
});

app.post("/ring-bell", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("visitations")
      .insert({ guestIdentity: "A guest" })
      .select("*");

    if (error) {
      console.error("Error inserting data: ", error);
      res.status(500).json({
        status: "error",
        message: "Failure while ringing bell!",
        err: JSON.stringify(error),
      });
      return;
    }

    // TODO: call FCM for push notification
    // TODO: SEND status to client when both supabase & FCM calls are successful
    res.status(200).json({ status: "success", data });
  } catch (err) {
    console.log("DEBUG ring-bell", err);
    res.status(500).json({
      status: "error",
      message: "Failure while ringing bell!",
      err: JSON.stringify(err),
    });
  }
});

app.post("/visitor-history", (req, res) => {
  // TODO: get list of all visitors and return that JSON
});

app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
