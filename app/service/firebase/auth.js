import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import app from "../initFirebase";

const provider = new GoogleAuthProvider();
export const auth = getAuth(app);

export const signInWithGoogle =async()=> {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
    //signInWithPopup(auth, provider).then(result=> {
    //    const credential = GoogleAuthProvider.credentialFromResult(result);
    //    const token = credential.accessToken;
    //    const user = result.user;
    //}).catch(error=> {
    //    const errCode = error.code;
    //    const errMsg = error.message;
    //    const email = error.customData.email;
    //    const credential = GoogleAuthProvider.credentialFromError(error);

    //    console.log("Sign in error-> ", {msg: "Sign in failed", values: [errCode, errMsg, email, credential]})
    //})
}

export const signOutUser =async()=> {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
    //signOut(auth).then(()=> {
    //    alert("Waiting for you to come back soon! Ciao")
    //}).catch((err)=> console.log("Sign out error-> ", err));
}