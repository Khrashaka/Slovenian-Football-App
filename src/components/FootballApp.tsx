import React, { useState, useEffect } from 'react';
import { Search, Trophy, Users, TrendingUp, Clock, RefreshCw, User, Shield, Zap, Target, Settings } from 'lucide-react';

// Data interfaces
interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  competition: string;
  date: string;
}

interface Standing {
  position: number;
  team: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDifference: number;
}

interface Player {
  name: string;
  club: string;
  position: string;
  games: number;
  rating: number;
  avgRating: number;
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

interface Transfer {
  player: string;
  from: string;
  to: string;
  date: string;
  type: string;
  fee?: string;
}

interface AppConfig {
  footballApiKey?: string;
  newsApiKey?: string;
}

// Mock data
const mockLiveFixtures: Fixture[] = [
  { id: 1, homeTeam: 'NK Maribor', awayTeam: 'NK Olimpija', homeScore: 2, awayScore: 1, status: 'LIVE', competition: '1. SNL', date: '2025-07-27' },
  { id: 2, homeTeam: 'NK Celje', awayTeam: 'NK Domžale', homeScore: 0, awayScore: 0, status: 'LIVE', competition: '1. SNL', date: '2025-07-27' },
  { id: 3, homeTeam: 'NK Koper', awayTeam: 'NK Bravo', homeScore: 1, awayScore: 3, status: 'FT', competition: '1. SNL', date: '2025-07-27' }
];

const mockStandings: Standing[] = [
  { position: 1, team: 'NK Maribor', points: 45, played: 20, won: 14, drawn: 3, lost: 3, goalDifference: 18 },
  { position: 2, team: 'NK Olimpija', points: 42, played: 20, won: 13, drawn: 3, lost: 4, goalDifference: 15 },
  { position: 3, team: 'NK Celje', points: 38, played: 20, won: 11, drawn: 5, lost: 4, goalDifference: 8 },
  { position: 4, team: 'NK Domžale', points: 35, played: 20, won: 10, drawn: 5, lost: 5, goalDifference: 3 }
];

const mockNews: NewsItem[] = [
  {
    id: 1,
    title: 'NK Maribor Wins Against Olimpija in Derby',
    summary: 'Exciting match ends 2-1 with Maribor taking all three points in the Ljubljana derby.',
    source: 'Sport1',
    publishedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'New Transfer Window Opens',
    summary: 'Several Slovenian clubs are looking to strengthen their squads.',
    source: 'RTV Sport',
    publishedAt: new Date().toISOString()
  }
];

const mockTransfers: Transfer[] = [
  { player: 'Jan Novak', from: 'NK Celje', to: 'NK Maribor', date: '2025-07-20', type: 'Transfer', fee: '€150,000' },
  { player: 'Miha Kovač', from: 'NK Olimpija', to: 'Dinamo Zagreb', date: '2025-07-15', type: 'Transfer', fee: '€300,000' }
];

const mockPlayers: Player[] = [
  { name: 'Josip Iličić', club: 'NK Maribor', position: 'Forward', games: 18, rating: 144, avgRating: 8.0 },
  { name: 'Kenan Pirić', club: 'NK Olimpija', position: 'Goalkeeper', games: 20, rating: 156, avgRating: 7.8 },
  { name: 'Matic Vrbanec', club: 'NK Celje', position: 'Defender', games: 19, rating: 133, avgRating: 7.0 }
];

const FootballApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fixtures');
  const [activeSubTab, setActiveSubTab] = useState('1SNL');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AppConfig>({});
  const [fixtures, setFixtures] = useState<Fixture[]>(mockLiveFixtures);
  const [standings, setStandings] = useState<Standing[]>(mockStandings);
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [transfers, setTransfers] = useState<Transfer[]>(mockTransfers);
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [apiStatus, setApiStatus] = useState<'none' | 'loading' | 'success' | 'error'>('none');
  const [isElectron, setIsElectron] = useState(false);

  // Check if running in Electron and load config
  useEffect(() => {
    // Check if we're running in Electron
    const checkElectron = () => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        setIsElectron(true);
        loadConfig();
        
        // Listen for config updates
        window.electronAPI.onConfigUpdate((newConfig: AppConfig) => {
          setConfig(newConfig);
          console.log('Config updated:', newConfig);
          if (newConfig.footballApiKey) {
            loadAllData();
          }
        });
      } else {
        console.log('Not running in Electron or electronAPI not available');
        setIsElectron(false);
        // Set mock config for browser testing
        setConfig({ footballApiKey: 'mock-key', newsApiKey: 'mock-key' });
        setApiStatus('success');
      }
    };

    // Check immediately and also after a delay in case electronAPI loads later
    checkElectron();
    const timeout = setTimeout(checkElectron, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const loadConfig = async () => {
    try {
      if (window.electronAPI) {
        const savedConfig = await window.electronAPI.getConfig();
        setConfig(savedConfig);
        console.log('Loaded config:', savedConfig);
        if (savedConfig.footballApiKey) {
          loadAllData();
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadAllData = async () => {
    setApiStatus('loading');
    setIsLoading(true);

    try {
      console.log('Loading data...');
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set data (mock data for now, replace with real API calls later)
      setFixtures(mockLiveFixtures);
      setStandings(mockStandings);
      setNews(mockNews);
      setTransfers(mockTransfers);
      setPlayers(mockPlayers);

      setApiStatus('success');
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      setApiStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (config.footballApiKey || !isElectron) {
      loadAllData();
    }
  };

  const tabs = [
    { id: 'fixtures', label: 'Live Fixtures', icon: Clock },
    { id: 'results', label: 'Results', icon: Trophy },
    { id: 'rankings', label: 'Rankings', icon: TrendingUp },
    { id: 'news', label: 'News', icon: Search },
    { id: 'performance', label: 'Performance', icon: Users },
    { id: 'transfers', label: 'Transfers', icon: RefreshCw }
  ];

  const subTabs = [
    { id: '1SNL', label: '1. SNL' },
    { id: 'pokal', label: 'Pokal' },
    { id: 'ucl', label: 'UCL' },
    { id: 'uel', label: 'UEL' },
    { id: 'conf', label: 'Conf. League' }
  ];

  const summaryStats = [
    { icon: Trophy, title: 'Leading Team', value: 'NK Maribor', subtitle: '45 points', color: 'bg-purple-500' },
    { icon: Shield, title: 'Top Goalkeeper', value: 'Kenan Pirić', subtitle: '7.8 avg rating', color: 'bg-blue-500' },
    { icon: User, title: 'Top Defender', value: 'Matic Vrbanec', subtitle: '7.0 avg rating', color: 'bg-green-500' },
    { icon: Zap, title: 'Top Midfielder', value: 'Dino Štiglec', subtitle: '7.0 avg rating', color: 'bg-yellow-500' },
    { icon: Target, title: 'Top Attacker', value: 'Josip Iličić', subtitle: '8.0 avg rating', color: 'bg-red-500' }
  ];

  const renderApiStatus = () => {
    if (!isElectron) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <h3 className="font-semibold text-blue-800">Demo Mode</h3>
              <p className="text-blue-700 text-sm">
                Running in browser with mock data. Use the Electron app for live data.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!config.footballApiKey) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Settings className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="font-semibold text-yellow-800">API Configuration Required</h3>
              <p className="text-yellow-700 text-sm">
                Configure your RapidAPI keys in File → Settings to get live football data.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (apiStatus === 'loading') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <RefreshCw className="h-5 w-5 text-blue-600 mr-2 animate-spin" />
            <div>
              <h3 className="font-semibold text-blue-800">Loading Live Data</h3>
              <p className="text-blue-700 text-sm">Fetching latest football information...</p>
            </div>
          </div>
        </div>
      );
    }

    if (apiStatus === 'success') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <h3 className="font-semibold text-green-800">Live Data Connected</h3>
              <p className="text-green-700 text-sm">
                Last updated: {new Date().toLocaleTimeString()} • API Key: {config.footballApiKey?.substring(0, 8)}...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (apiStatus === 'error') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Settings className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="font-semibold text-red-800">API Connection Error</h3>
              <p className="text-red-700 text-sm">
                Unable to fetch live data. Check your API keys in File → Settings.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderFixturesTab = () => (
    <div className="space-y-4">
      {fixtures.map((fixture) => (
        <div key={fixture.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="font-semibold">{fixture.homeTeam}</div>
                <div className="text-2xl font-bold text-purple-600">{fixture.homeScore}</div>
              </div>
              <div className="text-gray-500">vs</div>
              <div className="text-center">
                <div className="font-semibold">{fixture.awayTeam}</div>
                <div className="text-2xl font-bold text-purple-600">{fixture.awayScore}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`px-2 py-1 rounded text-sm font-semibold ${
                fixture.status === 'LIVE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {fixture.status}
              </div>
              <div className="text-sm text-gray-500 mt-1">{fixture.competition}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRankingsTab = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">W</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">D</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">L</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GD</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pts</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {standings.map((team) => (
            <tr key={team.position} className={team.team === 'NK Maribor' ? 'bg-purple-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{team.position}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{team.team}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.played}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.won}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.drawn}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.lost}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderNewsTab = () => (
    <div className="space-y-4">
      {news.map((article) => (
        <div key={article.id} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
          <p className="text-gray-600 mb-3">{article.summary}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{article.source}</span>
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Games</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {players.map((player, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{player.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.club}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.position}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.games}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.rating}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">{player.avgRating.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTransfersTab = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transfers.map((transfer, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{transfer.player}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.from}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.to}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transfer.date).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{transfer.fee || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'fixtures':
      case 'results':
        return renderFixturesTab();
      case 'rankings':
        return renderRankingsTab();
      case 'news':
        return renderNewsTab();
      case 'performance':
        return renderPerformanceTab();
      case 'transfers':
        return renderTransfersTab();
      default:
        return renderFixturesTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Slovenian Football Hub</h1>
              {isElectron && <span className="text-sm bg-purple-500 px-2 py-1 rounded">Electron</span>}
              {!isElectron && <span className="text-sm bg-blue-500 px-2 py-1 rounded">Demo</span>}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderApiStatus()}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {summaryStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.title}</h3>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.subtitle}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {(activeTab === 'fixtures' || activeTab === 'results') && (
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex space-x-6 px-6">
                {subTabs.map((subTab) => (
                  <button
                    key={subTab.id}
                    onClick={() => setActiveSubTab(subTab.id)}
                    className={`py-3 px-1 text-sm font-medium transition-colors ${
                      activeSubTab === subTab.id
                        ? 'text-purple-600 border-b-2 border-purple-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {subTab.label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>

        <div className="min-h-96">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default FootballApp;