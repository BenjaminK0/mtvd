import Header from '../Header';
import ResponsiveImageCard from '../ResponsiveImageCard';

import DeviceInventory from '../../assets/DeviceInventory.png';
import SensorData from '../../assets/SensorData.png';
import GitHubActivity from '../../assets/GitHubActivity.svg';
import CalendarImage from '../../assets/Calendar.png';
import Spotlight from '../../assets/Spotlight.webp';
import Chatbot from '../../assets/chatbot.png';

export default function Home() {
  return (
    <div className="HomePage">
      <Header />
      <div className="home-cards-container">
        <ResponsiveImageCard imageUrl={DeviceInventory} headerText="Device Logs" link="/device-log"/>
        <ResponsiveImageCard imageUrl={SensorData} headerText="Sensor Data" />
        <ResponsiveImageCard imageUrl={GitHubActivity} headerText="GitHub Activity" link="/github-dashboard"/>

        <ResponsiveImageCard imageUrl={CalendarImage} headerText="Calendar" link="/calendar" />
        <ResponsiveImageCard imageUrl={Chatbot} headerText="Chatbot" link="/chatbot"/>
        <ResponsiveImageCard imageUrl={Spotlight} headerText="Spotlight" link="/research-spotlight"/>
      </div>
    </div>
  );
}
