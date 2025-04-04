import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const AuthForm = ({type}) => {
    // state for user data 
    const [userData, setUserData] = useState({
        "name":"",
        "email":"",
        "password":""
    });

    // navigate hook
    const navigate = useNavigate();

    // form submit pr backend call -> API: create user
    async function handleAuthForm(e){
        try{
            // prevent form from refresh
            e.preventDefault();

        // axios
        const res = await axios.post(`http://localhost:3000/api/v1/${type}`, userData);

           console.log("Axios wala response:", res);
           // token store
           localStorage.setItem("token", res.data.token);
           // user store
       localStorage.setItem("user", JSON.stringify(res.data.user));
           
              // Success (status 200)
           if(res.status === 200){
               toast.success(res.data.message);
               console.log(res);
           }
            // If it's a signin, redirect to home page
            if (type == "signin") {
                // Redirect to the home page
              return navigate("/");
          }
            // If it's a signup, redirect to signin page
            if (type == "signup") {
                // Redirect to the home page
              return navigate("/signin");
          }
        }
        catch(err){
          // Error (network issue or status 4xx/5xx)
            toast.error(err.response.data.message);
            console.log("Error submitting user data: ", err)
        }
    }

    // user data post to backend
    async function handleInput(e) {
        const {name, value} = e.target;
        // set user data
        setUserData(prevData => {
            return {
                ...prevData,
                [name]:value
            }
        })    
    }


    return (
        <div className="mx-auto max-w-md p-6">
          <h1 className="mb-6 text-2xl font-semibold">{ type=="signup" ? "Sign Up" : "Sign In"}</h1>
    
          <form onSubmit={handleAuthForm} className="space-y-4">
          {
           (type == "signup") &&
            (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input onChange={handleInput} id="name" name="name" placeholder="Enter your name" required />
            </div>
            )
        }
            
    
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input onChange={handleInput}id="email" name="email" type="email" placeholder="Enter your email address" required />
            </div>

    
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input onChange={handleInput} id="password" name="password" type="password" placeholder="Create a password" required />
            </div>
    
            <Button type="submit" className="w-full">
           { type=="signup" ? "Register" : "Sign In"}
            </Button>

           <div>
            {
            type=="signin" ? (
              <p>Don't have an account <Link to="/signup">Sign up</Link></p>
            ) : (
              <p>Already have an account <Link to="/signin">Sign in</Link></p>
            )
            }

           </div>
          </form>
        </div>
      )
}

export default AuthForm;