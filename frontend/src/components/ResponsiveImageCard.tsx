import { Link } from 'react-router-dom';

type ResponsiveImageCardProps = {
  imageUrl: string;
  headerText: string;
  link?: string;
};

export default function ResponsiveImageCard({ imageUrl, headerText, link }: ResponsiveImageCardProps) {
  const card = (
      <div className="home-card-container">
        <img className="card-image" src={imageUrl} alt={headerText} />
        <div>
          <h1 className="headerText">{headerText}</h1>
        </div>
      </div>
   
  );

  return link ? <Link to={link}>{card}</Link> : card;
}
