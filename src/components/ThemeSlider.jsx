import React from 'react'
import './Switch.css'

function ThemeSlider({ darkMode, toggleDarkMode }){
  function handleClick(){
    if (typeof toggleDarkMode === 'function') toggleDarkMode(!darkMode)
    console.log('Mode changed.')
  }

  return (
    <label className='ui-switch'>
      <input type='checkbox' onChange={handleClick} checked={!!darkMode} />
      <div className='slider'>
        <div className='circle'></div>
      </div>
    </label>
  )
}

export default ThemeSlider;
