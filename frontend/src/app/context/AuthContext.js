"use client";

import { createContext, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const login = async (username, password) => {
    try {
      // Use application/x-www-form-urlencoded body (not FormData)
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const loginResponse = await axios.post(
        "http://localhost:8000/auth/login",
        params.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      // Stocker le token et le définir par défaut dans les headers
      if (loginResponse?.data?.access_token) {
        localStorage.setItem("token", loginResponse.data.access_token);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${loginResponse.data.access_token}`;
      } else {
        throw new Error("No access_token returned from login");
      }

      // ÉTAPE DE CORRECTION :
      // Après avoir obtenu le token, on fait une nouvelle requête pour obtenir les informations de l'utilisateur.
      const userResponse = await axios.get("http://localhost:8000/users/me");
      setUser(userResponse.data); // On met à jour l'état avec les informations complètes de l'utilisateur

      router.push("/");
    } catch (error) {
      console.error("Login Failed: ", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token"); // Il est préférable de supprimer le token de localStorage à la déconnexion
    delete axios.defaults.headers.common["Authorization"];
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
