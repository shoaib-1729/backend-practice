import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios";
import toast from "react-hot-toast";

const AuthForm = ({type}) => {
    // state for user data 
    const [userData, setUserData] = useState({
        "name":"",
        "email":"",
        "password":""
    });


    // form submit pr backend call -> API: create user
    async function handleAuthForm(e){
        try{
            // prevent form from refresh
            e.preventDefault();
        //     console.log("Form submitted with user data:", userData);
        //     const data = await fetch(`http://localhost:3000/api/v1/${type}`, {
        //     method:"POST",
        //     body:JSON.stringify(userData),
        //     headers:{
        //            "Content-Type": "application/json"
        //       }
        // });
        //    const res = await data.json();

        // axios
        const res = await axios.post(`http://localhost:3000/api/v1/${type}`, userData);

           console.log("Axios wala response:", res);
              // Success (status 200)
           if(res.status === 200){
               toast.success(res.data.message);
               console.log(res);
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
          </form>
        </div>
      )
}

export default AuthForm;