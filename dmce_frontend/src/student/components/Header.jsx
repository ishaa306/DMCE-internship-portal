import React from 'react';
import './Header.css';
import logo from '../../assets/images/dmce.png';
/*const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };*/

const Header = () => {
    return (
        <header className="dmce-header">
            <div className="dmce-subclass">
                <img src={logo} alt="DMCE Logo" className="dmce-logo" />
                <div className="dmce-title">
                    <p className="dmce-subtitle">Nagar Yuvak Shikshan Sanstha, Airoli</p>
                    <h1 className="dmce-main-title">Datta Meghe College Of Engineering</h1>
                </div>
            </div>

            <div className="logout-container">
                <button className="logout-button" >Logout</button>
            </div>
        </header>
    );
};

export default Header;