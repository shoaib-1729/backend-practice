import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CreateBlog () {
    // Token
        // token -> allow to access create-blog, otherwise early return
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token || null;
        
        // State to store form input values
        const [blogData, setBlogData] = useState({
        title: "",
        description:""
        });
    
       // Function to handle input changes and update state
       const handleInputChange = (e) => {
        const { name, value} = e.target;
        setBlogData((prevInput) => ({
            ...prevInput,
            [name]: value,
        }));
    };
    
    // function to upload data to backend
    async function handleSubmit(e){
        e.preventDefault(); 
        try {
            const res  = await fetch("http://localhost:3000/api/v1/blogs", {
                method: "POST",
                body:  JSON.stringify(blogData), // Sending form data as JSON
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${token}`
                }   
            });
    
            const data = await res.json();
            // console.log("Status:",res.status)
            console.log("Response from Backend:", data);
            alert(data.message)
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }


// extract navigate from react router
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
          // Use null if token is not present
        const token = user?.token || null;

        if (!token) {
            // If no token, redirect to signup page
            navigate("/signup");
        }
        // Empty dependency array to run only once
    }, [navigate]);

if (!token) {
    return navigate("/signup");
     }

    return (
        <div>
        <h1>Create Blog</h1>
        {/* form */}
    <form onSubmit={handleSubmit}>
            {/* Title Input */}
            <input
                type="text"
                id="title"
                name="title"
                value={blogData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter Title"
            />
            <br /><br />

            {/* Description Input */}
            <input
                type="text"
                id="description"
                name="description"
                value={blogData.description}
                onChange={handleInputChange}
                required
                placeholder="Enter Description"
            />
            <br /><br />

            {/* Submit Button */}
            <button type="submit">Submit</button>
    </form>  
        </div>
    )
}


export default CreateBlog;