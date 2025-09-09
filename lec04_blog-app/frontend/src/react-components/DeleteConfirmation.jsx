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
import { useDispatch, useSelector } from "react-redux";
import { handleDeleteBlog, handleDeleteUser } from "../utils/helperFunc";
import toast from "react-hot-toast";

const DeleteConfirmation = ({ type, item, setShowDeleteDropdown }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const {
    token,
    id: userId,
    savedBlogs,
    likedBlogs,
  } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Configuration based on type
  const config = {
    blog: {
      title: "Are you sure you want to delete this blog?",
      description: (
        <>
          This action cannot be undone. This will permanently delete your blog
          post{" "}
          <span className="font-semibold line-clamp-1 text-gray-900">
            {item?.title}
          </span>{" "}
          and remove it from all users who have liked or saved it.
        </>
      ),
      loadingText: "Deleting Blog...",
      loadingDesc: "Please wait while we remove your blog post permanently.",
      buttonText: "Delete Blog",
      tooltipText: "Delete Blog",
      icon: "fi fi-rs-trash",
      canDelete: item?.creator?._id === userId,
      // navigateAfter: "/",
      trigger: (
        <div className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full cursor-pointer">
          <i className="fi fi-rs-trash mr-3"></i>
          Delete Blog
        </div>
      ),
    },

    user: {
      title: "Are you sure you want to delete your account?",
      description: (
        <>
          This action cannot be undone. This will permanently delete your
          account{" "}
          <span className="font-semibold text-gray-900">{item?.name}</span>,
          along with all your blog posts, comments, likes, and saved data from
          our servers.
        </>
      ),
      loadingText: "Deleting Account...",
      loadingDesc:
        "Please wait while we permanently remove your account and all associated data.",
      buttonText: "Delete Account",
      tooltipText: "Delete Account",
      icon: "fi fi-rs-trash",
      canDelete: item?._id === userId,
      // navigateAfter: "/login",
      trigger: (
        <div className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full cursor-pointer">
          <i className="fi fi-rs-trash mr-3"></i>
          Delete Account
        </div>
      ),
    },
  };

  const currentConfig = config[type];

  const onDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      if (type === "blog") {
        await handleDeleteBlog(item._id, token, dispatch);
      } else if (type === "user") {
        await handleDeleteUser(
          token,
          savedBlogs,
          likedBlogs,
          setShowDeleteDropdown,
          dispatch
        );
      }
      // navigate to home page for both the cases
      // thoda delay for smooth UX, then navigate
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      toast.error(`Error deleting ${type}:`, error);
      setIsDeleting(false);
    }
  };

  // Agar permission nahi hai toh null return
  if (!currentConfig.canDelete) {
    return null;
  }

  return (
    <>
      {/* Deleting spinner overlay */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentConfig.loadingText}
              </h3>
              <p className="text-sm text-gray-600">
                {currentConfig.loadingDesc}
              </p>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild onClick={() => setIsOpen(true)}>
              {currentConfig.trigger}
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{currentConfig.tooltipText}</p>
          </TooltipContent>
        </Tooltip>

        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              {currentConfig.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              {currentConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                setShowDeleteDropdown(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {currentConfig.buttonText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteConfirmation;
