import { useState } from "react";

export default function RegisterPage() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    async function register(ev) {
        ev.preventDefault();
        const response = await fetch('http://localhost:4000/register', {
            method: 'POST',
            body: JSON.stringify({userName, password}),
            headers: {'Content-Type':'application/json'},
        })
        if (response.status !== 200) {
            alert('Registration failed');
        } else {
            alert('Registration successful');
        }
    }
    return(
        <form className="register" onSubmit={register}>
            <h1>Register</h1>
            <input type="username" 
                placeholder="username"
                value={userName}
                onChange={ev => setUserName(ev.target.value)} />
            <input type="password" 
                placeholder="password"
                value={password}
                onChange={ev => setPassword(ev.target.value)} />
            <button>Register</button>
        </form>
    );
}