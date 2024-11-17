/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { defineString } from "firebase-functions/params";
import { https } from "firebase-functions/v2";
import type { HttpsFunction } from "firebase-functions/v2/https";
import cors from "cors";

const corsMiddleware = cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4000",
    "https://ring-doorbell.netlify.app", // Removed trailing slash
  ],
  credentials: true,
});

const corsHandler = (
  handler: (req: https.Request, res: any) => Promise<void>
): HttpsFunction => {
  return https.onRequest((request, response) => {
    return corsMiddleware(request, response, () => handler(request, response));
  });
};

const gateKeeperStatus = {
  approved: "approved",
  rejected: "rejected",
  reviewPending: "review-pending",
};

const checkApiKey = (request: any) => {
  const clientApiKey = defineString("CLIENT_API_KEY");
  const hasValidApiKey = request.headers["x-api-key"] === clientApiKey.value();

  return hasValidApiKey;
};

initializeApp();

export const healthCheck = corsHandler(
  async (request: https.Request, response: any) => {
    switch (request.method) {
      case "GET":
        response.status(200).json({ data: "GET method" });
        break;
      case "POST":
        response.status(200).json({ data: "POST method" });
        break;
      default:
        response.status(200).json({ data: "default method" });
        break;
    }
    return;
  }
);

export const visit = corsHandler(async (request, response) => {
  // START API KEY check
  const hasValidApiKey = checkApiKey(request);
  if (!hasValidApiKey) {
    response.status(401).json({ error: "Request not authenticated" });
    return;
  }
  // STOP API KEY check

  if (request.method === "POST") {
    try {
      // Get Firestore instance
      const db = getFirestore();

      // Get tokens for all gatekeepers
      const getGateKeepersSnapshots = async () =>
        await db.collection("gate-keepers").get();

      // Add document to 'visits' collection
      const addRecordToVisits = async () =>
        await db.collection("visits").add({
          answeredBy: null,
          time: new Date().toUTCString(),
        });

      const promises = [getGateKeepersSnapshots(), addRecordToVisits()];
      const responses = await Promise.all(promises);

      if ("docs" in responses[0]) {
        const gateKeepersFcmTokens = responses[0].docs.map(
          (doc) => doc.data().token
        );

        // Send notifications to the devices
        await admin.messaging().sendEachForMulticast({
          tokens: gateKeepersFcmTokens,
          notification: {
            title: "Ding dong!",
            body: "Someone's at the door...",
          },
        });
      }

      response.status(200).json({ success: true });
      return;
    } catch (error) {
      logger.error("Error adding document: ", error);
      response.status(500).json({ error: "Failed to add visit" });
      return;
    }
  } else {
    // Handle other methods or send error
    response.status(405).send("Method not allowed");
    return;
  }
});

export const applyAsGateKeeper = corsHandler(async (request, response) => {
  // START API KEY check
  const hasValidApiKey = checkApiKey(request);
  if (!hasValidApiKey) {
    response.status(401).json({ error: "Request not allowed" });
    return;
  }
  // STOP API KEY check

  if (request.method === "POST") {
    try {
      const db = getFirestore();

      // validate first name and last name
      if (!request.body.firstName) {
        response.status(400).json({ error: "Missing first name or last name" });
        return;
      } else if (request.body.firstName.length < 2) {
        response
          .status(400)
          .json({ error: "First name must be at least 2 characters long" });
        return;
      } else {
        // Add document to gate-keepers collection
        const result = await db.collection("gate-keepers").add({
          firstName: request.body.firstName,
          lastName:
            request.body.lastName.length > 0 ? request.body.lastName : ".",
          token: request.body.token,
          status: "review-pending",
          time: new Date().toUTCString(),
        });
        response.status(200).json({ success: true, id: result.id });
        return;
      }
    } catch (error) {
      logger.error("Error adding document: ", error);
      response.status(500).json({ error: "Failed to add gatekeeper" });
      return;
    }
  }
});

export const getGateKeeperDetailsById = corsHandler(
  async (request, response) => {
    // START API KEY check
    const hasValidApiKey = checkApiKey(request);
    if (!hasValidApiKey) {
      response.status(401).json({ error: "Request not allowed" });
      return;
    }
    // STOP API KEY check

    if (request.method === "GET") {
      try {
        const db = getFirestore();

        if (request.query.id !== undefined) {
          // get user by document id
          const gateKeeper = await db
            .collection("gate-keepers")
            .doc(request.query.id as string)
            .get();

          if (!gateKeeper.exists) {
            response.status(404).json({ error: "Gatekeeper not found" });
            return;
          } else {
            response
              .status(200)
              .json({ success: true, data: gateKeeper.data() });
            return;
          }
        } else {
          response.status(400).json({ error: "Missing id" });
          return;
        }
      } catch (error) {
        logger.error("Error adding document: ", error);
        response
          .status(500)
          .json({ error: "Failed to get gatekeeper details" });
        return;
      }
    }
  }
);

export const answerVisit = corsHandler(async (request, response) => {
  // START API KEY check
  const hasValidApiKey = checkApiKey(request);
  if (!hasValidApiKey) {
    response.status(401).json({ error: "Request not allowed" });
    return;
  }
  // STOP API KEY check

  if (request.method === "POST") {
    try {
      const db = getFirestore();

      // get user by document id
      const gateKeeper = await db
        .collection("gate-keepers")
        .doc(request.body.id)
        .get();
      if (!gateKeeper.exists) {
        response.status(404).json({ error: "Gatekeeper not found" });
        return;
      } else {
        if (gateKeeper?.data()?.status !== gateKeeperStatus.approved) {
          response.status(403).json({ error: "Gatekeeper not approved" });
          return;
        } else {
          // get latest visit from all visits
          const visits = await db
            .collection("visits")
            .orderBy("time", "desc")
            .limit(1)
            .get();
          if (visits.empty) {
            response.status(404).json({ error: "No visits found" });
            return;
          } else {
            const visit = visits.docs[0];
            if (
              new Date().getTime() - new Date(visit.data().time).getTime() <
              15 * 60 * 1000
            ) {
              // visit is not older than 15 mins
              if (visit.data()["answeredBy"] === null) {
                // visit is not answered yet
                await db
                  .collection("visits")
                  .doc(visit.id)
                  .update({ answeredBy: request.body.id });
                response
                  .status(200)
                  .json({ success: true, data: visit.data() });
                return;
              } else {
                response.status(409).json({ error: "Visit already answered" });
                return;
              }
            } else {
              response.status(410).json({ error: "Visit too old" });
              return;
            }
          }
        }
      }
    } catch (error) {
      logger.error("Error adding document: ", error);
      response.status(500).json({ error: "Failed to answer visit" });
      return;
    }
  }
});
