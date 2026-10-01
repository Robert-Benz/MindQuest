import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

const TemaContext = createContext();

export function ThemeProvider({ children }) {
  const [temaAtivo, setTemaAtivo] = useState("tema_padrao");

  // Função para aplicar instantaneamente na DOM
  const aplicarTema = (nomeTema) => {
    const tema = nomeTema || "tema_padrao";
    setTemaAtivo(tema);
    document.documentElement.setAttribute("data-theme", tema);
  };

  useEffect(() => {
    let unsubFirestore = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Limpa listener do usuário anterior, se existir
      unsubFirestore();

      if (user) {
        // Usuário LOGADO: escuta em tempo real o Firestore
        const userRef = doc(db, "usuarios", user.uid);
        
        unsubFirestore = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Aceita tanto 'tema' quanto 'temaAtivo' gravados no Firestore
            const temaSalvo = data.temaAtivo || data.tema || "tema_padrao";
            aplicarTema(temaSalvo);
          } else {
            aplicarTema("tema_padrao");
          }
        }, (err) => {
          console.warn("Erro ao carregar tema do usuário:", err);
          aplicarTema("tema_padrao");
        });
      } else {
        // Usuário DESLOGADO / Páginas Públicas (Home, Login, Cadastro):
        // Força sempre o tema padrão pêssego
        aplicarTema("tema_padrao");
      }
    });

    return () => {
      unsubFirestore();
      unsubscribeAuth();
    };
  }, []);

  return (
    <TemaContext.Provider value={{ temaAtivo, aplicarTema }}>
      {children}
    </TemaContext.Provider>
  );
}

export const useTheme = () => useContext(TemaContext);