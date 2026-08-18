import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import app from "../initFirebase";

export const db = getFirestore(app);

/**
 * Ensures user document exists and logs session metadata on login
 */
export const syncUserAndLogSession = async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user?.uid);
  const userSnap = await getDoc(userRef);

  //Initialize user document if fresh signin
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user?.email,
      displayName: user?.displayName || "",
      photoURL: user?.photoURL || "",
      createdAt: serverTimestamp(),
      tier: "free",
      usage: {
        weeklyCallCount: 0,
        windowStartTimestamp: serverTimestamp(),
        lastCallTimestamp: null,
      },
    });
  }

  //Log basic session info for analytics in subcollection
  try {
    const sessionsRef = collection(db, "users", user?.uid, "sessions");
    await addDoc(sessionsRef, {
      loggedInAt: serverTimestamp(),
      userAgent: typeof window !== "undefined" ? navigator.userAgent : "unknown",
    });
  } catch (err) {
    console.error("Error logging session:", err);
  }
};

/**
 * Checks and increments call count inside a client-side Firestore Transaction
 */
export const checkAndIncrementCallLimit = async (uid) => {
  const userRef = doc(db, "users", uid);

  return await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists()) {
      throw new Error("User profile not found in database.");
    }

    const data = userDoc.data();
    console.log(data)

    //Check if tier type is another one
    const tier = data?.tier || "free";
    let callLimit = 3;
    
    if(tier === "paid") {
        callLimit = 6;
    }
    
    //Fallback to current date if `createdAt` timestamp is still committing
    const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
    const now = new Date();
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    //Calculate elapsed time(weeks) since account creation
    const currentWeekIndex = Math.floor((now - createdAt) / ONE_WEEK_MS);
    const lastWindowStart = data.usage?.windowStartTimestamp
      ? data.usage.windowStartTimestamp.toDate()
      : createdAt;
    const lastWeekIndex = Math.floor((lastWindowStart - createdAt) / ONE_WEEK_MS);

    let currentCount = data.usage?.weeklyCallCount || 0;

    //Reset counter if we've entered a new 7-day period relative to creation
    if (currentWeekIndex > lastWeekIndex) {
      currentCount = 0;
    }

    //Check limit against tier-based `callLimit`
    if (currentCount >= callLimit) {
      return { 
        allowed: false, 
        remainingCalls: 0, 
        tier 
      };
    }

    //Atomically update usage inside the transaction
    const newCount = currentCount + 1;
    transaction.update(userRef, {
      "usage.weeklyCallCount": newCount,
      "usage.lastCallTimestamp": serverTimestamp(),
      "usage.windowStartTimestamp":
        currentWeekIndex > lastWeekIndex ? serverTimestamp() : (data.usage?.windowStartTimestamp || serverTimestamp()),
    });
    
    return { allowed: true, remainingCalls: callLimit - newCount, tier: tier, data: data.usage};
  });
};