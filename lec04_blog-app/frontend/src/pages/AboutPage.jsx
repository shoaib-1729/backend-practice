import React from "react"
import { useSelector } from "react-redux";

const AboutPage = () => {
    const { bio } = useSelector((state) => state.user)
  return (
    <div>
      About Page
      Bio: {bio}
    </div>
  )
};

export default AboutPage;
