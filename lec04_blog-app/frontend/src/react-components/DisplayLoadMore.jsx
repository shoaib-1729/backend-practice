import { Button } from "@/shadcn-components/ui/button";


const DisplayLoadMore = ({data, hasMoreBlogs, setPageNo}) => {
  return (
    <div>
     { data.length > 0 && hasMoreBlogs && (
        <Button 
            onClick={() => setPageNo((prev) => prev + 1)}
            className=" bg-black text-white cursor-pointer">
<<<<<<< HEAD
              Load More
=======
              Load More...
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            </Button>)
}
    </div>
  )
};

export default DisplayLoadMore ;
