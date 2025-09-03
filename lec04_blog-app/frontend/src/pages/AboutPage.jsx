import React from "react";
import { useSelector } from "react-redux";

const AboutPage = () => {
    const { bio,blogs, following, followers } = useSelector((state) => state.user);
    
    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Bio Section - Medium Style */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">About</h2>
                
                {bio ? (
                    <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-7 text-[15px]">
                            {bio}
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-400 text-sm">
                            No bio added yet
                        </p>
                    </div>
                )}
            </div>

            {/* Simple Stats - Minimal */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-gray-100">
                <div className="text-center">
                    <div className="text-gray-900 font-medium mb-1">{blogs?.length || 0}</div>
                    <div className="text-gray-500 text-xs">Blogs</div>
                </div>
                
                <div className="text-center">
                    <div className="text-gray-900 font-medium mb-1">{followers?.length || 0}</div>
                    <div className="text-gray-500 text-xs">Followers</div>
                </div>
                
                <div className="text-center">
                    <div className="text-gray-900 font-medium mb-1">{following?.length || 0}</div>
                    <div className="text-gray-500 text-xs">Following</div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;