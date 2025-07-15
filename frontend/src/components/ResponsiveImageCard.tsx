type ResponsiveImageCardProps = {
  imageUrl: string;
  headerText: string;
}

export default function ResponsiveImageCard({ imageUrl, headerText }: ResponsiveImageCardProps)
{
  return(
    <section>
        <div className="home-card-container">

            <img className="card-image" src={imageUrl} alt={headerText}/>

            <div className="">
            <h1 className="headerText">{headerText}</h1>
            </div>

        </div>
   </section>
  );
}

