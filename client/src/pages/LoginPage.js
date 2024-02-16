import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function LoginPage() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);
    const {setUserInfo} = useContext(UserContext);

    async function login(ev) {
        ev.preventDefault();
        try {
            const response = await fetch('http://localhost:4000/login', {
            method: 'POST',
            body: JSON.stringify({userName, password}),
            headers: {'Content-Type':'application/json'},
            credentials: 'include',
            });
            if(response.ok) {
                response.json().then(userInfo => {
                    setUserInfo(userInfo);
                    setRedirect(true);
                })
            }else {
                alert('Wrong credentials');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login. Please try again later.')
            
        }
    }
    if(redirect) {
        return <Navigate to={'/'} />
    }
    return(
        <form className="login" onSubmit={login}>
            <h1>Login</h1>
            <input type="username" 
                placeholder="username"
                value={userName}
                onChange={ev => setUserName(ev.target.value)} />
            <input type="password" 
                placeholder="password"
                value={password}
                onChange={ev => setPassword(ev.target.value)} />
            <button>Login</button>
        </form>
    );
}