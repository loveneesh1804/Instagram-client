import React from 'react';
import Meta from '../../assets/images/meta.jpeg';
import Logo from '../../assets/images/logo.png';

const Fallback = () => {
  return (
    <div className='fallback'>
        <img src={Logo} alt="insta-ico" />
        <footer>
            <span>from</span>
            <img src={Meta} alt="meta-ico" />
        </footer>
    </div>
  )
}

export default Fallback