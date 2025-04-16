import { Button } from "@/shadcn-components/ui/button"
import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { setIsOpen } from "../utils/commentSlice"
import { addNewComment } from "../utils/selectedBlogSlice"
import { useState } from "react"
import axios from "axios"



const Comment = () => {
    const [comment, setComment] = useState([]);
    const dispatch = useDispatch();

    console.log(comment);

    const { token } = useSelector((state) => state.user);
    const { _id : id, comments } = useSelector((state) => state.selectedBlog);

async function handleComment(){
    try{
        const res = await axios.post(`http://localhost:3000/api/v1/blogs/comment/${id}`,
            { comment },
            {
                headers:{
                    Authorization: `Bearer ${ token }`
                }
            }
        )
        console.log(res);
        console.log(res.data.newComment);
        dispatch(addNewComment(res.data.newComment))
        toast.success(res.data.message);
    }catch(err){
        console.log(err);
    }

}
    return (
        <div className="bg-white drop-shadow-lg border-l border-gray-200 h-screen fixed top-0 right-0 w-[400px] p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-medium">Comment ({comments.length})</span>
                <i onClick={() => dispatch(setIsOpen(false))} className="fi fi-br-cross text-gray-500 hover:text-gray-700 cursor-pointer text-xl"></i>
            </div>

            {/* Input Box */}
            <input
                type="text" 
                placeholder="Write a comment..." 
                onChange={(e) => setComment(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-0 text-lg"
            />

            {/* Add Button */}
            <Button onClick={handleComment} className="mt-4 bg-green-500 hover:bg-green-600 text-white">
                Add
            </Button>

            {
                comments.map((comment) => (
                       <p key={comment._id}>{comment.comment}</p>
                    )
        )
            }
        </div>
    )
}

export default Comment
