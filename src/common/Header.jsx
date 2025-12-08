import React from 'react'
import "./Header.css"
import { Link } from "react-router-dom"
import { Main } from '../Bridge'

const Header = () => {
  return (

    <Link to={"/"}>
    <div className="header">
      SnapList
    </div>
    </Link>
  )
}

export default Header;

//<div className="bg-gray-500 text-white p-4 font-bold text-xl"></div>