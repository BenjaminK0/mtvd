import Header from '../Header';
import ResponsiveImageCard from '../ResponsiveImageCard';

import DeviceInventory from '../../assets/DeviceInventory.png';
import SensorData from '../../assets/SensorData.png';
import GitHubActivity from '../../assets/GitHubActivity.svg';
import CalendarImage from '../../assets/Calendar.png';
import KPIs from '../../assets/KPIs.webp';
import Spotlight from '../../assets/Spotlight.webp';

export default function Home() {
  return (
    <div className="HomePage">
      <Header />
      <div className="home-cards-container">
        <ResponsiveImageCard imageUrl={DeviceInventory} headerText="Device Logs" link="/device-log"/>
        <ResponsiveImageCard imageUrl={SensorData} headerText="Sensor Data" />
        <ResponsiveImageCard imageUrl={GitHubActivity} headerText="GitHub Activity" />

        <ResponsiveImageCard imageUrl={CalendarImage} headerText="Calendar" link="/calendar" />
        <ResponsiveImageCard imageUrl={KPIs} headerText="KPIs" />
        <ResponsiveImageCard imageUrl={Spotlight} headerText="Spotlight" link="/research-spotlight"/>
      </div>
    </div>
  );
}
