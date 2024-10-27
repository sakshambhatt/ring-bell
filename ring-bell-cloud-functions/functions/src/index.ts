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

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp();

export const visit = onRequest(async (request, response) => {
  // Check HTTP method
  if (request.method === "POST") {
    try {
      // Get Firestore instance
      const db = getFirestore();

      // Add document to 'visits' collection
      const result = await db.collection("visits").add({
        "answered-by": null,
        time: new Date(),
      });

      response.status(200).json({ success: true, id: result.id });
    } catch (error) {
      logger.error("Error adding document: ", error);
      response.status(500).json({ error: "Failed to add visit" });
    }
  } else {
    // Handle other methods or send error
    response.status(405).send("Method not allowed");
  }
});
