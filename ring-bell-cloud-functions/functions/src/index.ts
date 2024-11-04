/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

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

export const visit = onRequest(async (request, response) => {
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

      // Add document to 'visits' collection
      const result = await db.collection("visits").add({
        answeredBy: null,
        time: new Date().toUTCString(),
      });

      response.status(200).json({ success: true, id: result.id });
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

export const applyAsGateKeeper = onRequest(async (request, response) => {
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

export const getGateKeeperDetailsById = onRequest(async (request, response) => {
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
          response.status(200).json({ success: true, data: gateKeeper.data() });
          return;
        }
      } else {
        response.status(400).json({ error: "Missing id" });
        return;
      }
    } catch (error) {
      logger.error("Error adding document: ", error);
      response.status(500).json({ error: "Failed to get gatekeeper details" });
      return;
    }
  }
});

export const answerVisit = onRequest(async (request, response) => {
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
