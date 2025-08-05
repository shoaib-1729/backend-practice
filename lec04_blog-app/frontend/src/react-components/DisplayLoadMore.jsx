import { Button } from "@/shadcn-components/ui/button";


const DisplayLoadMore = ({data, hasMoreBlogs, setPageNo}) => {
  return (
    <div>
     { data.length > 0 && hasMoreBlogs && (
        <Button 
            onClick={() => setPageNo((prev) => prev + 1)}
            className=" bg-black text-white cursor-pointer">
              Load More
            </Button>)
}
    </div>
  )
};

export default DisplayLoadMore ;
