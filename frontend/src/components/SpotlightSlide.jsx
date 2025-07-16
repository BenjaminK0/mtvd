import React from 'react';

export default function SpotlightSlide({ title, description, keywords, videoSrc, qrLink }) {
  return (
    <div className="spotlight-container fade-in">
      <h1 className="project-title">{title}</h1>
      <p className="project-desc">{description}</p>
      <video className="project-video" src={videoSrc} autoPlay muted loop playsInline />
      <div className="keywords">
        {keywords.map((kw, idx) => (
          <span key={idx} className="keyword">{kw}</span>
        ))}
      </div>
      <div className="qr-container">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrLink)}&size=100x100`}
          alt="QR Code"
        />
      </div>
    </div>
  );
}