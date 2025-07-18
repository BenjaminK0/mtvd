import { useEffect, useState, useMemo } from 'react';
import CountUp from 'react-countup';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Repo {
  name: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export default function GitHubDashboard() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [commitData, setCommitData] = useState<number[]>([]);

  useEffect(() => {
    fetch('https://api.github.com/users/BenjaminK0/repos')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort(
          (a: Repo, b: Repo) => b.stargazers_count - a.stargazers_count
        );
        setRepos(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error('API error:', err);
        setLoading(false);
      });

    fetch('http://localhost:5000/api/github/commits')
      .then(res => res.json())
      .then(data => setCommitData(data.weeks))
      .catch(err => console.error('Commit API error:', err));
  }, []);

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  const languageData = useMemo(() => {
    const languageCount: { [key: string]: number } = {};
    repos.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    });
    return {
      labels: Object.keys(languageCount),
      datasets: [
        {
          label: 'Languages',
          data: Object.values(languageCount),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF9800', '#9C27B0',
          ],
        },
      ],
    };
  }, [repos]);

  const commitChartData = useMemo(() => {
    return {
      labels: Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`),
      datasets: [
        {
          label: 'Total Commits (Last 52 Weeks)',
          data: commitData,
          fill: true,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
        },
      ],
    };
  }, [commitData]);

  const repoCreationData = useMemo(() => {
    const creationCount: { [key: string]: number } = {};
    repos.forEach(repo => {
      const year = new Date(repo.created_at).getFullYear().toString();
      creationCount[year] = (creationCount[year] || 0) + 1;
    });
    return {
      labels: Object.keys(creationCount).sort(),
      datasets: [
        {
          label: 'Repositories Created',
          data: Object.values(creationCount),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
        },
      ],
    };
  }, [repos]);

  return (
    <div className="gitHub-page">
    <div className={`github-dashboard-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <h1 className="dashboard-title">Center For Industry Solutions: GitHub Statistics</h1>
      
      <div className="controls-row">
        <label className="dark-mode-toggle">
          Dark Mode
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
        </label>
        <input
          type="text"
          className="search-bar"
          placeholder="Search Repositories"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="main-content-row">
          <div className="left-column">
            <div className="chart-container">
              <h2>📈 Commit Activity (Past 52 Weeks)</h2>
              <Line data={commitChartData} />
            </div>
            <div className="chart-container">
              <h2>📅 Repository Creation Timeline</h2>
              <Bar data={repoCreationData} />
            </div>
          </div>
          <div className="chart-container">
            <h2>🥧 Language Usage</h2>
            <Pie data={languageData} />
          </div>
          <div className="repos-container">
            {filteredRepos.map(repo => (
              <div className="repo-card" key={repo.name}>
                <h3>
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                    {repo.name}
                  </a>
                </h3>
                <p>⭐ Stars: <CountUp end={repo.stargazers_count} duration={1} /></p>
                <p>🍴 Forks: <CountUp end={repo.forks_count} duration={1} /></p>
                <p>🐛 Open Issues: <CountUp end={repo.open_issues_count} duration={1} /></p>
                <p>🗣 Language: {repo.language || 'N/A'}</p>
                <p>📅 Updated: {new Date(repo.updated_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}