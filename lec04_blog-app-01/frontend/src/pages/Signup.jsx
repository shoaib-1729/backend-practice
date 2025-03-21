
import { useState } from 'react';

function Signup ()  {
    
    // State to store form input values
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
    });

   // Function to handle input changes and update state
   const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevInput) => ({
        ...prevInput,
        [name]: value,
    }));
};

// function to upload data to backend
async function handleSubmit(e){
    e.preventDefault(); 
    try {
        const res  = await fetch("http://localhost:3000/api/v1/users", {
            method: "POST",
            body:  JSON.stringify(userData), // Sending form data as JSON
            headers:{
                "Content-Type":"application/json"
            }
        });

        const data = await res.json();
        // console.log("Status:",res.status);
        // user created -> store it in local storage
        if(res.status === 200){
            localStorage.setItem("user", JSON.stringify(data.user))
        }
        // console.log("Response from Backend:", data);
        alert(data.message)
    } catch (error) {
        console.error("Error submitting form:", error);
    }
};
    return (
        <div>
        <h1>Sign up</h1>
    <form onSubmit={handleSubmit}>
            {/* Name Input */}
            <input
                type="text"
                id="name"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter Name"
            />
            <br /><br />

            {/* Email Input */}
            <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter Email"
            />
            <br /><br />

            {/* Password Input */}
            <input
                type="password"
                id="password"
                name="password"
                value={userData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter Password"
            />
            <br /><br />

            {/* Submit Button */}
            <button type="submit">Submit</button>
    </form>  
        </div>
    )
}

export default Signup;