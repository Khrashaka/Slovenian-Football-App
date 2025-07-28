import React, { useState, useEffect } from 'react';
import { Search, Trophy, Users, TrendingUp, Clock, RefreshCw, User, Shield, Zap, Target, Settings, AlertCircle, CheckCircle, Loader, Calendar } from 'lucide-react';
import { useFootballAPI } from '../hooks/useFootballAPI';

interface AppConfig {
  footballApiKey?: string;
  newsApiKey?: string;
}

const FootballApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fixtures');
  const [activeSubTab, setActiveSubTab] = useState('1SNL');
  const [config, setConfig] = useState<AppConfig>({});
  const [isElectron, setIsElectron] = useState(false);

  // Initialize Football API hook
  const {
    // Data
    liveFixtures,
    recentFixtures,
    upcomingFixtures,
    standings,
    players,
    transfers,
    news,
    
    // Loading states
    isLoadingLive,
    isLoadingFixtures,
    isLoadingUpcoming,
    isLoadingStandings,
    isLoadingPlayers,
    isLoadingTransfers,
    isLoadingNews,
    isLoadingAny,
    
    // Error states
    errors,
    
    // Methods
    refreshAll,
    refreshLive,
    refreshFixtures,
    refreshUpcoming,
    refreshStandings,
    refreshPlayers,
    refreshTransfers,
    refreshNews,
    testConnection,
    
    // Stats and info
    apiStats,
    seasonInfo
  } = useFootballAPI(config.footballApiKey, config.newsApiKey);

  // Check if running in Electron and load config
  useEffect(() => {
    const checkElectron = () => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        setIsElectron(true);
        loadConfig();
        
        // Listen for config updates
        window.electronAPI.onConfigUpdate((newConfig: AppConfig) => {
          setConfig(newConfig);
          console.log('Config updated:', newConfig);
        });
      } else {
        console.log('Not running in Electron or electronAPI not available');
        setIsElectron(false);
        // Set demo config for browser testing
        setConfig({ footballApiKey: '', newsApiKey: '' });
      }
    };

    checkElectron();
    const timeout = setTimeout(checkElectron, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // Load initial data when API key is available
  useEffect(() => {
    if (config.footballApiKey && isElectron) {
      console.log('API key available, loading initial data...');
      refreshAll();
    }
  }, [config.footballApiKey, isElectron, refreshAll]);

  const loadConfig = async () => {
    try {
      if (window.electronAPI) {
        const savedConfig = await window.electronAPI.getConfig();
        setConfig(savedConfig);
        console.log('Loaded config:', savedConfig);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleRefresh = () => {
    refreshAll();
  };

  const tabs = [
    { id: 'fixtures', label: 'Live & Fixtures', icon: Clock },
    { id: 'results', label: 'Recent Results', icon: Trophy },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
    { id: 'rankings', label: 'Standings', icon: TrendingUp },
    { id: 'performance', label: 'Players', icon: Users },
    { id: 'transfers', label: 'Transfers', icon: RefreshCw },
    { id: 'news', label: 'News', icon: Search }
  ];

  const subTabs = [
    { id: '1SNL', label: '1. SNL' },
    { id: 'pokal', label: 'Pokal' },
    { id: 'ucl', label: 'UCL' },
    { id: 'uel', label: 'UEL' },
    { id: 'conf', label: 'Conf. League' }
  ];

  // Calculate summary stats from real data
  const summaryStats = [
    {
      icon: Trophy,
      title: 'Season Leader',
      value: standings.length > 0 ? standings[0].team : 'Loading...',
      subtitle: standings.length > 0 ? `${standings[0].points} points` : '',
      color: 'bg-purple-500'
    },
    {
      icon: Target,
      title: 'Top Scorer',
      value: players.length > 0 ? players.find(p => p.goals > 0)?.name || 'No data' : 'Loading...',
      subtitle: players.length > 0 ? `${players.find(p => p.goals > 0)?.goals || 0} goals` : '',
      color: 'bg-red-500'
    },
    {
      icon: Zap,
      title: 'Best Rated',
      value: players.length > 0 ? players[0]?.name || 'No data' : 'Loading...',
      subtitle: players.length > 0 ? `${players[0]?.avgRating.toFixed(1)} rating` : '',
      color: 'bg-yellow-500'
    },
    {
      icon: Users,
      title: 'Active Players',
      value: players.length.toString(),
      subtitle: `in ${seasonInfo.totalTeams} teams`,
      color: 'bg-blue-500'
    },
    {
      icon: RefreshCw,
      title: 'Recent Transfers',
      value: transfers.length.toString(),
      subtitle: 'this window',
      color: 'bg-green-500'
    }
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
                Running in browser. Use the Electron app for live API data.
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
                Configure your RapidAPI keys in File → Settings to access live 2025/26 season data.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (isLoadingAny) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Loader className="h-5 w-5 text-blue-600 mr-2 animate-spin" />
            <div>
              <h3 className="font-semibold text-blue-800">Loading 2025/26 Season Data</h3>
              <p className="text-blue-700 text-sm">
                Fetching latest PrvaLiga information...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (Object.keys(errors).length > 0) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="font-semibold text-red-800">API Connection Issues</h3>
              <p className="text-red-700 text-sm">
                Some data could not be loaded. Check your API subscription and try refreshing.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <h3 className="font-semibold text-green-800">Live 2025/26 Data Connected</h3>
              <p className="text-green-700 text-sm">
                Season: {seasonInfo.status} • API Key: {config.footballApiKey?.substring(0, 8)}... • Requests: {apiStats.requestsUsed}
              </p>
            </div>
          </div>
          <div className="text-sm text-green-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  const renderFixturesTab = () => {
    const fixtures = activeTab === 'fixtures' ? [...liveFixtures, ...recentFixtures] : 
                    activeTab === 'results' ? recentFixtures : upcomingFixtures;

    if (fixtures.length === 0) {
      const isLoading = activeTab === 'fixtures' ? (isLoadingLive || isLoadingFixtures) : 
                       activeTab === 'results' ? isLoadingFixtures : isLoadingUpcoming;

      return (
        <div className="text-center py-12">
          {isLoading ? (
            <>
              <Loader className="h-12 w-12 mx-auto mb-4 text-purple-500 animate-spin" />
              <p className="text-gray-500">Loading {activeTab}...</p>
            </>
          ) : (
            <>
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No {activeTab} available for the 2025/26 season.</p>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {fixtures.map((fixture) => (
          <div key={fixture.id} className={`bg-white rounded-lg shadow p-4 border-l-4 ${
            fixture.isLive ? 'border-l-red-500' : 'border-l-purple-500'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{fixture.homeTeam}</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {fixture.homeScore !== null ? fixture.homeScore : '-'}
                  </div>
                </div>
                <div className="text-gray-500">vs</div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{fixture.awayTeam}</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {fixture.awayScore !== null ? fixture.awayScore : '-'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  fixture.isLive ? 'bg-red-100 text-red-800' : 
                  fixture.status === 'FT' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {fixture.status}
                </div>
                <div className="text-sm text-gray-500 mt-1">{fixture.competition}</div>
                <div className="text-xs text-gray-400">
                  {new Date(fixture.date).toLocaleDateString()}
                </div>
                {fixture.round && (
                  <div className="text-xs text-gray-400">{fixture.round}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStandingsTab = () => {
    if (standings.length === 0) {
      return (
        <div className="text-center py-12">
          {isLoadingStandings ? (
            <>
              <Loader className="h-12 w-12 mx-auto mb-4 text-purple-500 animate-spin" />
              <p className="text-gray-500">Loading 2025/26 standings...</p>
            </>
          ) : (
            <>
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No standings available for the 2025/26 season.</p>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-purple-600 text-white p-4">
          <h3 className="text-lg font-semibold">2025/26 Prva Liga Standings</h3>
          <p className="text-purple-100 text-sm">Current season • {seasonInfo.status}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">W</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">D</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">L</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GD</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Form</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.map((team) => (
                <tr key={team.position} className={
                  team.position === 1 ? 'bg-yellow-50' :
                  team.position <= 3 ? 'bg-blue-50' :
                  team.position >= standings.length - 1 ? 'bg-red-50' : ''
                }>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {team.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {team.team}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.played}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.won}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.drawn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.lost}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.goalsFor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.goalsAgainst}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={team.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">
                    {team.points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {team.form}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPlayersTab = () => {
    if (players.length === 0) {
      return (
        <div className="text-center py-12">
          {isLoadingPlayers ? (
            <>
              <Loader className="h-12 w-12 mx-auto mb-4 text-purple-500 animate-spin" />
              <p className="text-gray-500">Loading player statistics...</p>
            </>
          ) : (
            <>
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No player data available for the 2025/26 season.</p>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-purple-600 text-white p-4">
          <h3 className="text-lg font-semibold">Top Players - 2025/26 Season</h3>
          <p className="text-purple-100 text-sm">Best performing players in Prva Liga</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Games</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Goals</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assists</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {players.map((player, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {player.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.club}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.age}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.games}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    {player.goals}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                    {player.assists}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">
                    {player.avgRating.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTransfersTab = () => {
    if (transfers.length === 0) {
      return (
        <div className="text-center py-12">
          {isLoadingTransfers ? (
            <>
              <Loader className="h-12 w-12 mx-auto mb-4 text-purple-500 animate-spin" />
              <p className="text-gray-500">Loading transfer data...</p>
            </>
          ) : (
            <>
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No recent transfers available.</p>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-purple-600 text-white p-4">
          <h3 className="text-lg font-semibold">Recent Transfers</h3>
          <p className="text-purple-100 text-sm">Latest player movements in Slovenian football</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transfers.map((transfer, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transfer.player}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{transfer.from}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{transfer.to}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transfer.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderNewsTab = () => {
    if (news.length === 0) {
      return (
        <div className="text-center py-12">
          {isLoadingNews ? (
            <>
              <Loader className="h-12 w-12 mx-auto mb-4 text-purple-500 animate-spin" />
              <p className="text-gray-500">Loading latest news...</p>
            </>
          ) : (
            <>
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No recent news available. Configure News API key for updates.</p>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {news.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex space-x-4">
              {article.imageUrl && (
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{article.summary}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="font-medium">{article.source}</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                {article.url && (
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    Read full article →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'fixtures':
      case 'results':
      case 'upcoming':
        return renderFixturesTab();
      case 'rankings':
        return renderStandingsTab();
      case 'performance':
        return renderPlayersTab();
      case 'transfers':
        return renderTransfersTab();
      case 'news':
        return renderNewsTab();
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
              <div>
                <h1 className="text-2xl font-bold">Slovenian Football Hub</h1>
                <p className="text-purple-200 text-sm">2025/26 Season • {seasonInfo.status}</p>
              </div>
              {isElectron && <span className="text-sm bg-purple-500 px-2 py-1 rounded">Electron</span>}
              {!isElectron && <span className="text-sm bg-blue-500 px-2 py-1 rounded">Demo</span>}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoadingAny}
              className="bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingAny ? 'animate-spin' : ''}`} />
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
                <p className="text-lg font-bold text-gray-900 truncate">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.subtitle}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors whitespace-nowrap ${
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

          {(activeTab === 'fixtures' || activeTab === 'results' || activeTab === 'upcoming') && (
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

        {/* API Status Footer */}
        {config.footballApiKey && (
          <div className="mt-8 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div>
                API Requests Used: {apiStats.requestsUsed} | 
                Season: 2025/26 | 
                Teams: {seasonInfo.totalTeams}
              </div>
              <div>
                Last Refresh: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FootballApp;