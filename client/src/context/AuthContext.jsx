import { createContext, useState, useEffect } from "react";
export const AuthContext = createContext(null);
export const AuthProvider = ({children}) =>{
    const [user, setUser] = useState(() => {
        // Check localStorage on initial load
        const savedUser = localStorage.getItem('student_profile_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        setLoading(false);
    },[]);

    const login = (userData) =>{
        setUser(userData);
        localStorage.setItem('student_profile_user', JSON.stringify(userData)); // Save to browser
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('student_profile_user'); // Remove from browser
    };

return (
    <AuthContext.Provider value={{user, loading , login , logout}}>
        {children}
    </AuthContext.Provider>
);
};


