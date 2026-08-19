"use client";

import { useEffect } from "react";
import app from "../service/initFirebase";
import { getAnalytics, isSupported } from "firebase/analytics";

export default function FireAnalytics() {
  useEffect(() => {
    const initAnalytics = async () => {
      //Ensure firebase runs on client and analytics is supported by browser environment
      const supported = await isSupported();
      if (!supported) return;
      
      //Initialize Analytics; this automatically starts recording sessions and page views
      getAnalytics(app);
    };
    
    initAnalytics().then(()=> console.log("Analytics started"));
  }, []);

  return null;  //Doesn't render any visible UI element
}
