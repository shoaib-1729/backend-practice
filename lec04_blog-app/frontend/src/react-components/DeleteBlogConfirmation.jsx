import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shadcn-components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shadcn-components/ui/tooltip";
import { handleDeleteBlog } from "../utils/helperFunc";

const DeleteBlogConfirmation = ({ blog, token, dispatch, userId }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const onDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteBlog(blog._id, token, dispatch);
      
      // Add a small delay for better UX, then navigate to home
      setTimeout(() => {
        navigate("/");
      }, 1000);
      
    } catch (error) {
      console.error("Error deleting blog:", error);
      setIsDeleting(false);
    }
  };

  if (blog.creator?._id !== userId) {
    return null;
  }

  return (
    <>
      {/* Background overlay blur when deleting */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Deleting Blog...
              </h3>
              <p className="text-sm text-gray-600">
                Please wait while we remove your blog post permanently.
              </p>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild onClick={() => setIsOpen(true)}>
              <div className="flex items-center space-x-2 cursor-pointer">
                <i className="fi fi-rs-trash cursor-pointer text-xl transition-transform transform hover:scale-110 hover:text-red-500" />
              </div>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete</p>
          </TooltipContent>
        </Tooltip>

        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              Are you sure you want to delete this blog?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              This action cannot be undone. This will permanently delete your blog post
              <span className="font-medium text-gray-800"> "{blog.title}"</span> and remove
              it from all users who have liked or saved it.
            </AlertDialogDescription>
          </AlertDialogHeader>
         
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Delete Blog
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteBlogConfirmation;