import { useEffect, useState } from "react"

function Blog(){
    // states for data
    const [blogData, setBlogData] = useState([])
    // function for blogs
    async function handleBlogs() {
        try {
            const res = await fetch("http://localhost:3000/api/v1/blogs", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();
            console.log(data);
            setBlogData(data.blogs);
        } catch (error) {
            console.error("Error fetching blogs:", error);
        }
    }
    // api call -> use effect pr
    useEffect(() => {
        handleBlogs();
    }, []);

    return(
        <div>
        {
    blogData.map((blog) => (
        <ul key={blog._id}>
            <li>{blog.title}</li>
            <li>{blog.description}</li>
            {/* <li>{blog.creator.name}</li> */}
        </ul>
    ))
}
        </div>
    )
}

export default Blog