import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { env } from './env'

const firebaseApp = initializeApp({
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  ...(env.firebaseAppId ? { appId: env.firebaseAppId } : {}),
})

const auth = getAuth(firebaseApp)
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export async function signInWithGoogleAndGetIdToken(): Promise<string> {
  const credential = await signInWithPopup(auth, googleProvider)
  return credential.user.getIdToken(true)
}
