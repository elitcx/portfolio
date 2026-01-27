import React from'react';
import { useEffect, useState } from 'react'
import './App.css'
import NavigationBar from './NavigationBar.jsx'
import ThemeSlider from './ThemeSlider.jsx'
import Button from './Button.jsx'
import { motion } from "framer-motion";
import projects from './assets/projects.json';

// ProfileCard was an accidental insertion during edits and has been removed.

const fadeIn = {
  initial: { opacity: 0, y: -20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: "easeInOut" },
  viewport: { once: true, amount: 0.3 }
};

const fadeInFast = {
  initial: { opacity: 0, y: -10 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: "easeIn" },
  viewport: { once: true, amount: 0.3 }
};

function ImageZoom({ src, alt, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function CertificateCard({image, title, description}){
  const [zoomOpen, setZoomOpen] = useState(false);

  return (
    <>
      <motion.div {...fadeIn} className='certificate-container flex flex-col gap-4 rounded-xl items-center mb-4' style={{fontFamily: 'Nunito Sans'}}>
        <img src={image} className='certificate max-h-80 w-fit object-contain rounded-xl' onClick={() => setZoomOpen(true)}/>
        <h1 className='text-black font-bold text-2xl text-center'>{title}</h1>
        <p className='text-black text-lg text-center opacity-70'>{description}</p>
      </motion.div>
      {zoomOpen && (
          <ImageZoom
            src={image}
            alt={title}
            onClose={() => setZoomOpen(false)}
          />
        )}
    </>
  )
}

const certificates = [
  {image:'/images/certificates/image0.jpg', title:'Battle of Technology PingFEST UNS 2025', description:'2nd Place'},
  {image:'/images/certificates/image2.jpg', title:'Competitive Programming IAA UKDW Yogyakarta 2025', description:'2nd Place'},
  {image:'/images/certificates/image1.jpg', title:'OSN Informatika Surakarta 2025', description:'Finalist'},
  {image:'/images/certificates/logicodix.png', title:'Logicodix Programming & Coding Competition UNESA 2025', description:'2nd Place'},
  {image:'/images/certificates/image3.jpg', title:'Informatics Rally Games and Logic (IRGL) PCU 2025', description:'3rd Place'},
  {image:'/images/certificates/image4.jpg', title:'Final OMNAS 13 Matematika 2024', description:'Silver Medalist'},
  {image:'/images/certificates/image5.jpg', title:'Final OMNAS 13 English 2024', description:'Silver Medalist'},
  {image:'/images/certificates/image6.jpg', title:'National Junior Highschool Math Competition - Practo Math Academy 2024', description:'2nd Place'},
  {image:'/images/certificates/image7.jpg', title:'Entrepreneurship Business Challenge & Competition 6.0 UKWMS 2024', description:'Top 10'},
  {image:'/images/certificates/image8.jpg', title:'Intro to Software Engineering Course - RevoU 2025', description:'Finished'},
  {image:'/images/certificates/image9.jpg', title:'Cybersecurity Workshop: "Breaking the Code: Outsmart, Decode, Conquer" - PSB Academy 2025', description:'2nd Place Team'},
]

function ItemGrid(){
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const visibleItems = showAllCertificates ? certificates : certificates.slice(0, 3);

  return (
    <>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px', maxWidth: '1600px', width: '100%', margin: 'auto'}}>
        {visibleItems.map((item,index) =>
        <CertificateCard image={item.image} title={item.title} description={item.description} key={index}/>)}
      </div>
      {certificates.length > 3 && (
        <div className='flex w-full justify-center'>
          <motion.button {...fadeIn} onClick={() => setShowAllCertificates(!showAllCertificates)} className='m-auto font-bold w-fit rounded-lg h-fit px-4 py-2 bg-defaultdark dark:bg-white items-center gap-2 text-white dark:text-black text-sm text-center flex' style={{fontFamily: 'Nunito Sans', transition: 'all 0.2s', display: 'block'}} onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.opacity = 0.9;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.opacity = 1;
          }}>
            {showAllCertificates ? `View Less` : `View More (+${certificates.length-3})`}
          </motion.button>
        </div>
      )}
    </>
    
  )
}

function HomePage(props){

  const today = new Date();
  const birthDate = new Date("2008-11-22")
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());
  if (!hasBirthdayPassed) {
    age--;
  }

  

  const verticalLineStyle = 'h-full border-2 border-defaultdark rounded-full';
  const lineBarStyle = 'border-4 rounded-full mx-6 border-black';
  const skillStyle = 'flex flex-row w-full text-nowrap items-center  text-lg font-semibold drop-shadow-md';
  const badgeStyle = "skill-level px-2 py-1 rounded-lg text-xs md:text-sm font-medium dark:text-white text-black hover:scale-105";
  const languageStyle = 'text-black font-bold text-md md:text-2xl';

  useEffect(() => {
    const elements = document.getElementsByClassName('skill-level');
    for (const element of elements){
      if (element.textContent.includes('Competition Level')){
        element.classList.add('dark:bg-red-800')
        element.classList.add('bg-red-300')
      } else if (element.textContent.includes('Intermediate')){
        element.classList.add('dark:bg-yellow-600')
        element.classList.add('bg-yellow-400')
      } else if (element.textContent.includes('Beginner')){
        element.classList.add('dark:bg-green-700')
        element.classList.add('bg-green-400')
      }
    }
  },[])

  useEffect(() => {
  const bars = document.querySelectorAll(".bar-animate");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("active");
    });
  });

  bars.forEach(bar => observer.observe(bar));
}, []);

  return (
    <div id="home" className='w-full min-h-[50vh] dark:bg-sky-300 bg-blue-500 flex flex-col lg:flex-row px-10 md:py-24 gap-10 py-24 items-center flex-wrap' style={{flex: '1 0 auto'}}>
      {/* Card container */}
        <motion.div {...fadeIn}>
          <div className="picture-container min-h-80 md:h-full bg-red-300 rounded-xl flex-shrink-0 aspect-square" style={{
            backgroundImage: "url('/images/banner.webp')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}></div>
        </motion.div>
        
        <div className=" text-black px-4 md:px-6 flex-1" >
          <motion.div {...fadeIn}>
            <p className='text-[2.5rem] md:text-[3rem] font-bold' style={{fontFamily: 'Nunito Sans'}}>About Me</p>
            <hr className='border-black border-t-8 rounded-xl mb-6 mt-2' style={{transition: 'border-color 0.5s ease, color 0.5s ease'}}/>
            <p className='text-justify text-lg md:text-xl' style={{fontFamily: 'Nunito Sans'}}>I'm a <b>{age} year old student at SMA Regina Pacis Surakarta</b>, passionate about <b>Software Engineering and Development</b>. I love turning ideas into real, working applications and exploring how code can solve everyday problems.
            With a strong interest in problem-solving, clean code, and modern development practices, I enjoy challenges that push me to think critically and build efficiently. Whether it’s creating simple tools or experimenting with larger projects, <b>I’m always eager to learn, improve, and bring meaningful solutions to life.</b><br/><br/>
  
  🚀 <b>   My goal: to become a skilled developer who builds impactful, user-focused software.<br/>
    💡 What drives me: curiosity, creativity, and the excitement of solving complex problems. </b></p>
          </motion.div>
        </div>

        <motion.div {...fadeIn} className='w-full lg:w-full h-[15vh] flex flex-row items-center justify-around mb-10 text-center text-black mt-10' style={{flex: '1 1 auto'}}>
          <div className="space-y-4 mx-4">
            <h1 className='text-2xl lg:text-5xl font-extrabold' style={{fontFamily: 'Nunito Sans'}}>10+</h1>
            <p className="text-md lg:text-xl font-bold opacity-70" style={{fontFamily: 'Nunito Sans'}}>NATIONAL COMPETITIONS WON</p>
          </div> <hr className={verticalLineStyle} style={{transition: 'border-color 0.5s ease, color 0.5s ease'}} />
          <div className="space-y-4 mx-4">
            <h1 className='text-2xl lg:text-5xl font-extrabold' style={{fontFamily: 'Nunito Sans'}}>15+</h1>
            <p className="text-md lg:text-xl font-bold opacity-70" style={{fontFamily: 'Nunito Sans'}}>PROJECTS COMPLETED</p>
          </div> <hr className={verticalLineStyle} style={{transition: 'border-color 0.5s ease, color 0.5s ease'}}/>
          <div className="space-y-4 mx-4">
            <h1 className='text-2xl lg:text-5xl font-extrabold' style={{fontFamily: 'Nunito Sans'}}>5+</h1>
            <p className="text-md lg:text-xl font-bold opacity-70" style={{fontFamily: 'Nunito Sans'}}>YEARS OF PROGRAMMING</p>
          </div>
        </motion.div>
        
        <div className='w-full h-[30vh] flex flex-row flex-start items-center'>
          <div className=" flex flex-col h-full justify-around mx-4">
            <p className={languageStyle} style={{fontFamily: 'Nunito Sans', display: 'flex', flexDirection: 'row', alignItems: 'center'}}><img src='/images/c++.png' className='w-8 mr-2'/>C++</p>
            <p className={languageStyle} style={{fontFamily: 'Nunito Sans', display: 'flex', flexDirection: 'row', alignItems: 'center'}}><img src='/images/python.webp' className='w-8 mr-2'/>Python</p>
            <p className={languageStyle} style={{fontFamily: 'Nunito Sans', display: 'flex', flexDirection: 'row', alignItems: 'center'}}><img src='/images/javascript.png' className='w-8 mr-2'/>JavaScript</p>
            <p className={languageStyle} style={{fontFamily: 'Nunito Sans', display: 'flex', flexDirection: 'row', alignItems: 'center'}}><img src='/images/ReactJS.webp' className='w-8 mr-2'/>ReactJS</p>
            <p className={languageStyle} style={{fontFamily: 'Nunito Sans', display: 'flex', flexDirection: 'row', alignItems: 'center'}}><img src='/images/sql.png' className='w-8 mr-2'/>SQL</p>
          </div>
          <div className="flex flex-col h-full justify-around mx-2 w-full flex-shrink-1">
            <div className={skillStyle}><hr className={`${lineBarStyle} bar-animate `} style={{"--target-sm": "41%", "--target-md": "82%"}}></hr><span className={`${badgeStyle} block md:hidden`} style={{transition: 'background-color 0.3s ease, transform 0.3s ease'}}>Competition Level</span><span className={`${badgeStyle} hidden md:block`} style={{transition: 'background-color 0.3s ease, transform 0.3s ease'}}>Competition Level (Algorithms/CP)</span></div>
            <div className={skillStyle}><hr className={`${lineBarStyle} bar-animate`} style={{"--target-sm": "36%", "--target-md": "72%"}}></hr><span className={`${badgeStyle} block md:hidden`} style={{transition: 'background-color 0.3s ease, transform 0.3s ease'}}>Competition Level</span><span className={`${badgeStyle} hidden md:block`} style={{transition: 'background-color 0.3s ease, transform 0.3s ease'}}>Competition Level (Automation/Py Scripts)</span></div>
            <div className={skillStyle}><hr className={`${lineBarStyle} bar-animate`} style={{"--target-sm": "26%", "--target-md": "52%"}}></hr><span className={`${badgeStyle} block md:hidden`} style={{transition: 'background-color 0.3s ease, transform 0.3s ease'}}>Intermediate</span><span className={`${badgeStyle} hidden md:block`} style={{transition: 'background-color 0.3s ease, transform 0.3s ease'}}>Intermediate (Frontend/Web)</span></div>
            <div className={skillStyle}><hr className={`${lineBarStyle} bar-animate`} style={{"--target-sm": "26%", "--target-md": "52%"}}></hr><span className={`${badgeStyle} block md:hidden`} style={{transition: 'background-color 0.3s ease, transform 0.3s ease'}}>Intermediate</span><span className={`${badgeStyle} hidden md:block`} style={{transition: 'background-color 0.3s ease, transform 0.3s ease'}}>Intermediate (Components/SPA)</span></div>
            <div className={skillStyle}><hr className={`${lineBarStyle} bar-animate`} style={{"--target-sm": "11%", "--target-md": "22%"}}></hr><span className={`${badgeStyle} block md:hidden`} style={{transition: 'background-color 0.3s ease, transform 0.3s ease'}}>Beginner</span><span className={`${badgeStyle} hidden md:block`} style={{transition: 'background-color 0.3s ease, transform 0.3s ease'}}>Beginner (CRUD Queries)</span></div>
          </div>
        </div>
        <hr className='w-full h-full border-4 border-defaultdark rounded-full my-10'/>
        <motion.h1 {...fadeIn} className='text-black text-[2.5rem] md:text-[3rem] font-bold text-center w-full' style={{fontFamily: 'Nunito Sans'}}>My Certifications</motion.h1>
        <ItemGrid/>
        
    </div>
  )
}

function ContactCard({icon, link, platform}){
  return (
    <div className='flex w-40 h-fit justify-center'>
      <a href={link} target="_blank" rel="noopener noreferrer" className='justify-center flex w-full rounded-lg h-fit p-2 px-4 bg-defaultdark dark:bg-white flex-row items-center gap-2 text-white dark:text-black text-xs md:text-lg text-center'>
        <img src={icon} className='h-6 md:h-8'></img>
        <h1>{platform}</h1>
      </a>
    </div>
  )
}

function Contact(){
  return (
    <div className='flex min-h-[20vh] w-full flex-col p-8 items-center'>
      <h1 className='font-bold text-xl dark:text-white text-black mb-4' style={{fontFamily: 'Nunito Sans'}}>Contact Me:</h1>
      <div className='flex flex-row w-full max-w-[800px] h-[50%] gap-8 justify-between text-center font-bold' style={{fontFamily: 'Nunito Sans'}}>
        <ContactCard icon='/images/instagram.webp' link='https://www.instagram.com/kenneth_kiel/#' platform='Instagram'/>
        <ContactCard icon='/images/whatsapp.png' link='https://wa.me/62861592211' platform='WhatsApp'/>
        <ContactCard icon='/images/github.svg' link='https://github.com/elitcx' platform='GitHub'/>
      </div>
      <div className='text-center leading-8 mt-6' style={{fontFamily: 'Nunito Sans'}}>Kenneth Jehezkiel Marvel Wijaya's Personal Portfolio</div>
      <div className='text-center leading-8' style={{fontFamily: 'Nunito Sans'}}>Copyright © 2025</div>
    </div>
  )
}

function ProjectCard({image, title, description, link, categories, setZoomImage}){

  useEffect(() =>{
    const categories = document.getElementsByClassName('category');
    for (const cat of categories){
      if (cat.textContent.includes('Python')){
        cat.style.backgroundColor = '#ffb742'
      }
      if (cat.textContent.includes('C++')){
        cat.style.backgroundColor = '#004283'
      }
      if (cat.textContent.includes('HTML')){
        cat.style.backgroundColor = '#e44d26';
      }
      if (cat.textContent.includes('CSS')){
        cat.style.backgroundColor = '#204ce6';
      }
      if (cat.textContent.toLowerCase().includes('javascript')){
        cat.style.backgroundColor = '#d6ba32';
      }
      if (cat.textContent.toLowerCase().includes('react')){
        cat.style.backgroundColor = '#01b377';
      }
    }
  },[])

  return (
    <div className='card rounded-xl p-5 backdrop-blur-md' style={{backgroundColor: 'rgba(255,255,255,0.1)', transition: 'transform 0.3s, box-shadow 0.3s', border: '1px solid rgba(255,255,255,0.2)'}}
    onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow =
          '0 12px 48px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      >

        <img src={image}
      alt={title}
      onClick={() => setZoomImage({ src: image, alt: title })}
      style={{
          width: '100%',
          height: 200,
          objectFit: 'cover',
          borderRadius: 8,
          marginBottom: 15,
      }}/>

      {categories.map((category, index) =>
      <span
        key={index}
        className='category'
        style={{
          display: 'inline-block',
          padding: '4px 8px',
          backgroundColor: '#667eea',
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 'bold',
          marginBottom: 8,
          marginRight: 4
        }}
      >
        {category}
      </span>)}
      <h3 className='font-bold' style={{ margin: '0 0 10px', fontSize: 18, fontFamily: 'Nunito Sans' }}>{title}</h3>
      <p style={{
          opacity: 0.7,
          fontSize: 13,
          margin: '0 0 15px',
          lineHeight: 1.5,
          wordWrap: 'wrap',
        }}>
          {description.substring(0,160)}...
        </p>
        {link && <button className='font-bold w-fit rounded-lg h-fit px-4 py-2 bg-defaultdark dark:bg-white items-center gap-2 text-white dark:text-black text-sm text-center' style={{fontFamily: 'Nunito Sans', transition: 'all 0.2s'}} onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.opacity = 0.9;
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.opacity = 1;
        }}><a href={link}>View Project</a></button>}
      </div>
  )
}

function PortfolioPage(props){
  const [zoomImage, setZoomImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const displayedProjects = React.useMemo(() => {
      let filtered = projects;
  
      if (searchTerm) {
        filtered = filtered.filter(
          (project) =>
            project.title
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            project.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            project.categories.some((cat) =>
            cat.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
  
      if (selectedCategory.toLowerCase() !== 'all') {
        filtered = filtered.filter(
          (project) =>
          project.categories.some((cat) =>
          cat.toLowerCase() === selectedCategory.toLowerCase())
        );
      }
  
      return filtered;
    }, [projects, searchTerm, selectedCategory]);

  return (
    <>
      <div className='w-full min-h-screen flex flex-col dark:bg-blue-500 bg-sky-300 p-32 items-center'>
        <h1 className='font-extrabold mb-4 text-center' style={{fontFamily: 'Nunito Sans', textShadow: '0 2px 10px rgba(0,0,0,0.3)', fontSize: '48px'}}>Browse Projects</h1>
        <div className='w-full flex flex-row items-center gap-4 mb-5 justify-center'>
          <input type='text' placeholder='Search for projects...' style={{width: '100%',
            maxWidth: '500px',
            padding: '12px 20px',
            fontSize: 16,
            borderRadius: 8,
            border: '2px solid rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            flexShrink: 0,
            transition: 'all 0.2s',
            }} 
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.opacity = 0.9;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.opacity = 1;
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
          ></input> 
  
            <select
            value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '12px 20px',
                  fontSize: 16,
                  borderRadius: 8,
                  border: '2px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.opacity = 0.9;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.opacity = 1;
          }}
              >
                <option className='text-black'>All</option>
                <option className='text-black'>C++</option>
                <option className='text-black'>Python</option>
                <option className='text-black'>Website</option>
              </select>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px', maxWidth: '1200px', width: '100%'}}>
          {displayedProjects.map((project, index) => (
            <ProjectCard
            key={index}
            title={project.title}
            description={project.description}
            link={project.link}
            image={project.image}
            categories={project.categories}
            setZoomImage={setZoomImage}
            />
          ))}
        </div>
        
      </div>
      {zoomImage && (
  <ImageZoom
    src={zoomImage.src}
    alt={zoomImage.alt}
    onClose={() => setZoomImage(null)}
  />
)}
    </>
  )
}

// TODO: Create Contact Page

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
    } catch (e) {
      // ignore
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Keep the `toggleDarkMode` name used by child components; accept a boolean value
  function toggleDarkMode(value) {
    setDarkMode(value);
    try {
      localStorage.setItem('theme', value ? 'dark' : 'light');
    } catch (e) {
      // ignore
    }
  }
  const [page, changePage] = useState(1);
  const [navBarEnabled, enableNavBar] = useState(false);

  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, [page]);

  function scrollToHome() {
    const el = document.getElementById('home');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const titles = {
    1: 'Home Page',
    2: 'Portfolio Page',
    3: 'Contact Page' // ! Connect Contact Page
  }

  useEffect(() => {
    const pageTitle = titles[page];
    document.title = pageTitle;
  },[page])

  useEffect(() => {
    const bg = darkMode ? '#191a1b' : '#fff';
    const fg = darkMode ? '#fff' : '#000';
    document.body.style.backgroundColor = bg;
    document.body.style.color = fg;
    document.documentElement.style.backgroundColor = bg;
    document.documentElement.style.color = fg;
  }, [darkMode])

  useEffect(() => {
  const html = document.documentElement;
  if (darkMode) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}, [darkMode]);

  return(
    <div className='bg-white text-black dark:bg-defaultdark dark:text-white m-0 flex flex-wrap flex-col items-center text-wrap min-h-screen' style={{
      transition: 'background-color 0.5s ease, color 0.5s ease',
      width: '100%'

    }}>
      <NavigationBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} page={page} changePage={changePage}/>
      {/* Hero / intro */}
      
      <div className='flex flex-col w-full h-full'>
        {page === 1 && (
          <div className='flex justify-center items-center w-full h-screen'>
            <div className='w-fit flex flex-col text-center'>
              <p id='typewriter' className="typewriter leading-normal font-normal text-center block w-full max-w-full min-w-0 whitespace-nowrap" style={{fontFamily: 'Nunito Sans', textShadow: '0px 1px 2px #2d2a2d', fontSize: 'clamp(0.9rem, 3vw, 3rem)'}}>
                Hello, I'm <span className='dark:text-sky-300 text-blue-600 font-bold'>Kenneth Jehezkiel Marvel Wijaya.</span>
              </p>
              <button id='viewmore' type='button' onClick={scrollToHome} className='block text-black dark:text-white opacity-60 font-medium'>Scroll down to view more</button>
              <div className='mt-2' onClick={scrollToHome} id='viewmorebutton'><Button/></div>
            </div>
          </div>
        )}
        
        {page === 1 && <HomePage darkMode={darkMode} />}
        {page === 2 && <PortfolioPage darkMode={darkMode}/>}
        <Contact/>
      </div>
      
      
    </div>
  )
}

export default App
