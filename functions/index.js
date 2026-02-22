import { onRequest, HttpsError } from "firebase-functions/v1/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { onSchedule } from "firebase-functions/v2/scheduler";

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();
const adminAuth = getAuth();

/**
 * HTTP function to submit a new app.
 * Usage: POST https://us-central1-findyoursecondbrain.cloudfunctions.net/submitApp
 * Headers: Authorization: Bearer <firebase-id-token>
 * Body: JSON with name, description, etc.
 */
export const submitApp = onRequest(async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Get the authorization token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const { name, description, websiteUrl, tags, category, pricing } = req.body;

    // Validation
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'App name is required.' });
      return;
    }
    if (!description || !description.trim()) {
      res.status(400).json({ error: 'App description is required.' });
      return;
    }

    const appData = {
      name: name.trim(),
      description: description.trim(),
      websiteUrl: (websiteUrl || "").trim(),
      tags: Array.isArray(tags) ? tags : [],
      category: category || "Other",
      pricing: pricing || "Free",
      ratingSum: 0,
      ratingCount: 0,
      commentCount: 0,
      active: true,
      submittedBy: decodedToken.uid,
      submittedByName: decodedToken.name || "Anonymous",
      submittedByPhoto: decodedToken.picture || "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("apps").add(appData);

    res.status(200).json({
      success: true,
      id: docRef.id,
      message: "App submitted successfully!",
    });
  } catch (error) {
    console.error("Error submitting app:", error);
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
      res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
    } else {
      res.status(500).json({ error: 'An error occurred while submitting the app.' });
    }
  }
});

/**
 * HTTP function to fetch all submitted apps.
 * Usage: GET https://us-central1-findyoursecondbrain.cloudfunctions.net/getApps
 * No authentication required - accessible to all users
 */
export const getApps = onRequest(async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Query all apps from Firestore, ordered by creation date (newest first)
    const appsSnapshot = await db.collection("apps")
      .orderBy("createdAt", "desc")
      .get();

    const apps = [];
    appsSnapshot.forEach((doc) => {
      apps.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      apps: apps,
      total: apps.length
    });
  } catch (error) {
    console.error("Error fetching apps:", error);
    res.status(500).json({ error: 'An error occurred while fetching apps.' });
  }
});

/**
 * Scheduled function to check URL activity daily.
 * Runs every day at 2 AM UTC.
 */
export const checkUrlActivity = onSchedule("0 2 * * *", async (event) => {
  console.log("Starting daily URL activity check");

  try {
    // Query all apps with websiteUrl
    const appsSnapshot = await db.collection("apps")
      .where("websiteUrl", "!=", "")
      .get();

    const updates = [];

    for (const doc of appsSnapshot.docs) {
      const app = doc.data();
      const url = app.websiteUrl;

      if (!url) continue;

      try {
        // Check if URL is active
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          method: 'HEAD', // Use HEAD to avoid downloading content
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const isActive = response.ok; // status 200-299

        // If the app is currently active but URL is not, mark as inactive
        // If URL is active, ensure app is marked active
        if (app.active !== isActive) {
          updates.push({
            docRef: doc.ref,
            active: isActive,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      } catch (error) {
        console.log(`Error checking URL ${url}:`, error.message);
        // If fetch fails, mark as inactive
        if (app.active !== false) {
          updates.push({
            docRef: doc.ref,
            active: false,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }

    // Batch update all changes
    if (updates.length > 0) {
      const batch = db.batch();
      updates.forEach(({ docRef, active, updatedAt }) => {
        batch.update(docRef, { active, updatedAt });
      });
      await batch.commit();
      console.log(`Updated ${updates.length} apps`);
    } else {
      console.log("No updates needed");
    }

  } catch (error) {
    console.error("Error in checkUrlActivity:", error);
  }
});
