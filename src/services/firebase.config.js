import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    // Cole aqui as credenciais do app do projeto criado no Firebase.
    // apiKey: "Sua_apiKey",
    // authDomain: "Sua_authDomain",
    // projectId: "Sua_projectId",
    // storageBucket: "Sua_storageBucket",
    // messagingSenderId: "Sua_messagingSenderId",
    // appId: "Sua_appId",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage();