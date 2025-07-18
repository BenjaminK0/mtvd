import { useEffect, useState, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import {
  Card,
  CardContent,
  Typography,
  Link,
  CircularProgress,
  Container,
  TextField,
  CssBaseline,
  FormControlLabel,
  Switch,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import CountUp from 'react-countup';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Filler } from 'chart.js';
ChartJS.register(Filler);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
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
            '#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF9800', '#9C27B0'
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

  const theme = useMemo(() => createTheme({ palette: { mode: darkMode ? 'dark' : 'light' } }), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          My GitHub Repositories
        </Typography>

        <FormControlLabel
          control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
          label="Dark Mode"
        />

        <TextField
          label="Search Repositories"
          variant="outlined"
          fullWidth
          sx={{ mb: 4 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                📈 Commit Activity (Past 52 Weeks)
              </Typography>
              <Line data={commitChartData} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                🥧 Language Usage
              </Typography>
              <Pie data={languageData} />
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {filteredRepos.map(repo => (
                  <Grid item xs={12} sm={6} md={4} key={repo.name}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <Link href={repo.html_url} target="_blank" rel="noopener">
                            {repo.name}
                          </Link>
                        </Typography>
                        <Typography variant="body2">
                          ⭐ Stars: <CountUp end={repo.stargazers_count} duration={1} />
                        </Typography>
                        <Typography variant="body2">
                          🍴 Forks: <CountUp end={repo.forks_count} duration={1} />
                        </Typography>
                        <Typography variant="body2">
                          🐛 Open Issues: <CountUp end={repo.open_issues_count} duration={1} />
                        </Typography>
                        <Typography variant="body2">
                          🗣 Language: {repo.language || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          📅 Updated: {new Date(repo.updated_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}
      </Container>
    </ThemeProvider>
  );
}
