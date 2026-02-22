import { onRequest, HttpsError } from "firebase-functions/v1/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

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
