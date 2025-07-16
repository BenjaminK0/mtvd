import React, { useEffect, useState } from 'react';
import SpotlightSlide from '../SpotlightSlide';

const slides = [
  {
    duration: 10000,
    props: {
      title: 'AI-Powered Autonomous Visual Inspection',
      description: 'Boston Dynamics Spot walking around the Scout Motors Plant in Blythewood, SC',
      keywords: ['AI', 'Robotics', 'Navigation', 'Computer Vision'],
      videoSrc: '',
      qrLink: 'https://yourlabsite.com/projects/drone-ai'
    }
  },
  {
    duration: 5000,
    props: {
      title: 'Smart Sensor Networks',
      description: 'Custom lab security systems with digital alerts',
      keywords: ['IoT', 'Sensors', 'MQTT', 'Safety'],
      videoSrc: '',
      qrLink: 'https://yourlabsite.com/projects/sensors'
    }
  },
  {
    duration: 15000,
    props: {
        title: 'Autonomous Object Reconstruction and Additive Manufacturing System',
        description: 'Leveraging YASKAWA Robot Arm we can create 3D prints of any object in its sight',
        keywords: ['Robotics', 'Meshroom', 'Cloud computing', 'IoT', 'MQTT'],
        videoSrc: '',
        qrLink: 'https://yourlabsite.com/projects/sensors'
    }
  },
  {
    duration: 15000,
    props: {
        title: 'Autonomous Facial Recognition Door Response System',
        description: 'Once a familiar face is recognized outside the lab, Spot will boot up, and open the door for you',
        keywords: ['Robotics', 'Spot', 'Deep Learning', 'PyTorch', 'Edge Computing', 'IoT', 'MQTT'],
        videoSrc: '',
        qrLink: 'https://yourlabsite.com/projects/sensors'
    }
  }
];

export default function ResearchSpotlightPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setFadeKey(prev => prev + 1);
    }, slides[currentIndex].duration);

    return () => clearTimeout(timeout);
  }, [currentIndex]);

  return (
    <div className='rsp-big-container'>
        <div key={fadeKey} className="fade-wrapper">
        <SpotlightSlide {...slides[currentIndex].props} />
        </div>
    </div>
  );
}
