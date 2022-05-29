import React, { useContext, useEffect, useState } from 'react'
import {auth} from '../firebaseConfig'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail,
   signOut, updatePassword, updateEmail } from "firebase/auth";
import { getDefaultNormalizer } from '@testing-library/react';


const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider ({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(false);

  function signup (email, password) {
    try {
      const user = createUserWithEmailAndPassword (auth, email, password);
      console.log (user.email);
      return user;
    // .then((userCredential) => {
    //   // Signed in 
    //   const user = userCredential.user;
    //   console.log (userCredential);
    //   // ...
    // })
    // .catch((error) => {
    //   console.log (error);
    //   const errorCode = error.code;
    //   const errorMessage = error.message;
    //   console.log (errorCode + " " + errorMessage)
    //   // ..
    // });
  
    } catch (e) {console.log (e.message)}
  }

  function login (email, password) {
    try {
      // return signInWithEmailAndPassword (auth, email, password)
      return signInWithEmailAndPassword (auth, email, password)
    } catch (e) {console.log (e)}
  }

  function logout () {
    try {
      // return signInWithEmailAndPassword (auth, email, password)
      const stat = signOut (auth);
      setAdmin (false);
      return stat;

    } catch (e) {console.log (e)}
  }
  
  function resetPassword (email) {
    return sendPasswordResetEmail (auth,email);
  }

  function updateEmail_ (email) {
    return updateEmail(currentUser, email);
  }

  function updatePass (password) {
    return updatePassword(currentUser, password);
  }

  // onAuthStateChanged(auth, (user) => {
  auth.onAuthStateChanged(user => {
    setCurrentUser(user);
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      // ...
    } else {
      // User is signed out
      // ...
    }
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    if (user) console.log(user.email);
      if (user && (user.email === 'eli.shagam@gmail.com' 
      || user.email === 'j321111@gmail.com' 
      || user.email === 'dina146@bezeqint.net')) {
        setAdmin(true)
        console.log ('setAdmin', ) 
      }
      // else
      //   setAdmin(false)

      setLoading(false)
    })
    return unsubscribe;
  }, [currentUser]);


  const value = {
    currentUser,
    admin,
    signup,
    login,
    logout,
    resetPassword,
    updateEmail_,
    updatePass
  }
  return (
    <AuthContext.Provider value={value}>
      { ! loading && children }

    </AuthContext.Provider>
  )
}
