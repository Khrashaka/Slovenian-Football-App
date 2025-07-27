import React, { useState, useEffect } from 'react';
import { Search, Trophy, Users, TrendingUp, Clock, RefreshCw, User, Shield, Zap, Target } from 'lucide-react';

// Mock data structures based on our API client types
interface MockFixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  competition: string;
  date: string;
}

interface MockStanding {
  position: number;
  team: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDifference: number;
}

interface MockPlayer {
  name: string;
  club: string;
  position: string;
  games: number;
  rating: number;
  avgRating: number;
}

interface MockNews {
  id: number;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

interface MockTransfer {
  player: string;
  from: string;
  to: string;
  date: string;
  type: string;
  fee?: string;
}

// Mock data
const mockLiveFixtures: MockFixture[] = [
  { id: 1, homeTeam: 'NK Maribor', awayTeam: 'NK Olimpija', homeScore: 2, awayScore: 1, status: 'LIVE', competition: '1. SNL', date: '2025-07-27' },
  { id: 2, homeTeam: 'NK Celje', awayTeam: 'NK Domžale', homeScore: 0, awayScore: 0, status: 'LIVE', competition: '1. SNL', date: '2025-07-27' },
  { id: 3, homeTeam: 'NK Koper', awayTeam: 'NK Bravo', homeScore: 1, awayScore: 3, status: 'FT', competition: '1. SNL', date: '2025-07-27' }
];

const mockStandings: MockStanding[] = [
  { position: 1, team: 'NK Maribor', points: 45, played: 20, won: 14, drawn: 3, lost: 3, goalDifference: 18 },
  { position: 2, team: 'NK Olimpija', points: 42, played: 20, won: 13, drawn: 3, lost: 4, goalDifference: 15 },
  { position: 3, team: 'NK Celje', points: 38, played: 20, won: 11, drawn: 5, lost: 4, goalDifference: 8 },
  { position: 4, team: 'NK Domžale', points: 35, played: 20, won: 10, drawn: 5, lost: 5, goalDifference: 3 }
];

const mockPlayers: MockPlayer[] = [
  { name: 'Josip Iličić', club: 'NK Maribor', position: 'Forward', games: 18, rating: 144, avgRating: 8.0 },
  { name: 'Kenan Pirić', club: 'NK Olimpija', position: 'Goalkeeper', games: 20, rating: 156, avgRating: 7.8 },
  { name: 'Matic Vrbanec', club: 'NK Celje', position: 'Defender', games: 19, rating: 133, avgRating: 7.0 },
  { name: 'Dino Štiglec', club: 'NK Domžale', position: 'Midfielder', games: 17, rating: 119, avgRating: 7.0 }
];

const mockNews: MockNews[] = [
  {
    id: 1,
    title: 'NK Maribor Signs New Star Player for European Campaign',
    summary: 'The Viola have strengthened their squad with a promising midfielder ahead of the Conference League qualifiers.',
    source: '24ur Sport',
    publishedAt: '2025-07-27T10:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop'
  },
  {
    id: 2,
    title: 'Ljudski Vrt Stadium Renovation Updates',
    summary: 'Latest updates on the ongoing modernization of NK Maribor\'s home stadium.',
    source: 'RTV Slovenija',
    publishedAt: '2025-07-26T16:45:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=250&fit=crop'
  }
];

const mockTransfers: MockTransfer[] = [
  { player: 'Marko Božić', from: 'NK Celje', to: 'NK Maribor', date: '2025-07-20', type: 'Transfer', fee: '€250,000' },
  { player: 'Luka Menalo', from: 'NK Olimpija', to: 'Dinamo Zagreb', date: '2025-07-15', type: 'Transfer', fee: '€500,000' }
];

const FootballApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fixtures');
  const [activeSubTab, setActiveSubTab] = useState('1SNL');
  const [isLoading, setIsLoading] = useState(false);

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
    {
      icon: Trophy,
      title: 'Leading Team',
      value: 'NK Maribor',
      subtitle: '45 points',
      color: 'bg-purple-500'
    },
    {
      icon: Shield,
      title: 'Top Goalkeeper',
      value: 'Kenan Pirić',
      subtitle: '7.8 avg rating',
      color: 'bg-blue-500'
    },
    {
      icon: User,
      title: 'Top Defender',
      value: 'Matic Vrbanec',
      subtitle: '7.0 avg rating',
      color: 'bg-green-500'
    },
    {
      icon: Zap,
      title: 'Top Midfielder',
      value: 'Dino Štiglec',
      subtitle: '7.0 avg rating',
      color: 'bg-yellow-500'
    },
    {
      icon: Target,
      title: 'Top Attacker',
      value: 'Josip Iličić',
      subtitle: '8.0 avg rating',
      color: 'bg-red-500'
    }
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const renderFixturesTab = () => (
    <div className="space-y-4">
      {mockLiveFixtures.map((fixture) => (
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Played</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Won</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drawn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GD</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockStandings.map((team) => (
              <tr key={team.position} className={team.team === 'NK Maribor' ? 'bg-purple-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.team}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.played}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.won}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.drawn}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.lost}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNewsTab = () => (
    <div className="space-y-4">
      {mockNews.map((article) => (
        <div key={article.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex space-x-4">
            {article.imageUrl && (
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
              <p className="text-gray-600 mb-3">{article.summary}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{article.source}</span>
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Games</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Rating</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockPlayers.map((player, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.name}</td>
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
    </div>
  );

  const renderTransfersTab = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockTransfers.map((transfer, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transfer.player}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.from}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.to}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transfer.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{transfer.fee || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'fixtures':
        return renderFixturesTab();
      case 'results':
        return renderFixturesTab(); // Same component, different data filter
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
      {/* Header */}
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Slovenian Football Hub</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
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

        {/* Main Navigation Tabs */}
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

          {/* Sub-tabs for fixtures and results */}
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

        {/* Tab Content */}
        <div className="min-h-96">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default FootballApp;
