import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, FileText, BarChart3, LineChart, PieChart, Eye, Edit2, Trash2, Brain, Moon, Sun, Search, Save, Share2, LogOut, User, Settings, HelpCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { LineChart as RechartsLine, BarChart as RechartsBar, PieChart as RechartsPie, ScatterChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Bar, Pie, Cell, Scatter } from 'recharts';
import * as THREE from 'three';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface User {
  name: string;
  role: string;
  email: string;
}

interface ChartConfig {
  xAxis: string;
  yAxis: string;
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | '3d-column';
}

interface UploadHistoryItem {
  id: number;
  filename: string;
  uploadDate: string;
  rows: number;
  data: any[];
}

interface SavedConfig {
  id: number;
  name: string;
  xAxis: string;
  yAxis: string;
  chartType: ChartConfig['chartType'];
}

interface AIInsights {
  summary: string[];
  recommendations: string[];
}

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  // State management
  const [user, setUser] = useState<User>({ name: 'John Doe', role: 'user', email: 'john.doe@example.com' });
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    xAxis: '',
    yAxis: '',
    chartType: 'bar'
  });
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([
    {
      id: 1,
      filename: 'sales_data.xlsx',
      uploadDate: '2024-12-01',
      rows: 150,
      data: []
    },
    {
      id: 2,
      filename: 'revenue_report.xlsx',
      uploadDate: '2024-11-28',
      rows: 89,
      data: []
    }
  ]);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [configName, setConfigName] = useState<string>('');

  // State for header modals
  const [showUserProfileModal, setShowUserProfileModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const threeJsRef = useRef<HTMLDivElement>(null);

  // Effect to regenerate chart when config changes
  useEffect(() => {
    generateChart();
  }, [chartConfig, currentData]); // Re-run effect if chartConfig or currentData changes

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result) {
          throw new Error('Failed to read file');
        }
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setCurrentData(jsonData);
        setColumns(Object.keys(jsonData[0] || {}));
        setSelectedFile(file);
        
        // Add to upload history
        const newUpload: UploadHistoryItem = {
          id: Date.now(),
          filename: file.name,
          uploadDate: new Date().toISOString().split('T')[0],
          rows: jsonData.length,
          data: jsonData
        };
        setUploadHistory(prev => [newUpload, ...prev]);
      } catch (error) {
        alert('Error reading file. Please ensure it\'s a valid Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Chart generation
  const generateChart = () => {
    if (!currentData.length || !chartConfig.xAxis || !chartConfig.yAxis) {
      
      return;
    }

    if (chartConfig.chartType === '3d-column') {
      generate3DChart();
    }
  };

  // 3D Chart with Three.js
  const generate3DChart = () => {
    if (!threeJsRef.current) return;

    // Clear previous chart
    while (threeJsRef.current.firstChild) {
      threeJsRef.current.removeChild(threeJsRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 300);
    renderer.setClearColor(darkMode ? 0x1a1a1a : 0xf0f0f0);
    threeJsRef.current.appendChild(renderer.domElement);

    // Create 3D bars
    const geometry = new THREE.BoxGeometry(0.5, 1, 0.5);
    const material = new THREE.MeshBasicMaterial({ color: 0x4f46e5 });

    currentData.slice(0, 10).forEach((item, index) => {
      const height = parseFloat(item[chartConfig.yAxis]) || 0;
      const scaledHeight = (height / 100) * 2; // Scale for visibility
      
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = (index - 5) * 1;
      cube.position.y = scaledHeight / 2;
      cube.scale.y = scaledHeight;
      scene.add(cube);
    });

    camera.position.z = 8;
    camera.position.y = 3;
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
      scene.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();
  };

  // Download chart as PNG
  const downloadChart = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      link.download = `chart_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      alert('Error generating chart image.');
    }
  };

  // Export as PDF
  const exportToPDF = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 100);
      pdf.save(`chart_${Date.now()}.pdf`);
    } catch (error) {
      alert('Error generating PDF.');
    }
  };

  // Generate AI Insights
  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const insights: AIInsights = {
        summary: [
          `Dataset contains ${currentData.length} records`,
          `${columns.length} columns analyzed`,
          'Strong correlation detected between selected variables'
        ],
        recommendations: [
          'Consider seasonal trends in your data',
          'Outliers detected - review data quality',
          'Recommended chart type: Line chart for time series'
        ]
      };
      setAiInsights(insights);
      setIsGeneratingInsights(false);
    }, 2000);
  };

  // Save chart configuration
  const saveConfig = () => {
    if (!configName.trim()) return;
    
    const newConfig: SavedConfig = {
      id: Date.now(),
      name: configName,
      xAxis: chartConfig.xAxis,
      yAxis: chartConfig.yAxis,
      chartType: chartConfig.chartType
    };
    
    setSavedConfigs(prev => [...prev, newConfig]);
    setConfigName('');
    setShowSaveModal(false);
  };

  // Load saved configuration
  const loadConfig = (config: SavedConfig) => {
    setChartConfig({
      xAxis: config.xAxis,
      yAxis: config.yAxis,
      chartType: config.chartType
    });
  };

  // Render chart based on type
  const renderChart = () => {
    if (!currentData.length || !chartConfig.xAxis || !chartConfig.yAxis) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Upload data and configure chart to see visualization</p>
        </div>
      );
    }

    const chartData = currentData.map(item => ({
      name: item[chartConfig.xAxis],
      value: parseFloat(item[chartConfig.yAxis]) || 0
    }));

    switch (chartConfig.chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLine data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} />
            </RechartsLine>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBar data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4f46e5" />
            </RechartsBar>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie data={chartData}>
              <Pie
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#4f46e5"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPie>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Scatter dataKey="value" fill="#4f46e5" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case '3d-column':
        return (
          <div className="flex justify-center">
            <div ref={threeJsRef} className="border rounded-lg"></div>
          </div>
        );
      default:
        return null;
    }
  };

  // Filter upload history
  const filteredHistory = uploadHistory.filter(item =>
    item.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle history actions
  const handleViewHistory = (item: UploadHistoryItem) => {
    setCurrentData(item.data);
    setColumns(Object.keys(item.data[0] || {}));
    // Optionally scroll to chart or data preview section
  };

  const handleEditHistory = (item: UploadHistoryItem) => {
    const newFilename = prompt(`Enter new filename for ${item.filename}:`);
    if (newFilename !== null && newFilename.trim() !== '') {
      setUploadHistory(prev =>
        prev.map(historyItem =>
          historyItem.id === item.id ? { ...historyItem, filename: newFilename.trim() } : historyItem
        )
      );
    }
  };

  const handleDeleteHistory = (itemId: number) => {
    setUploadHistory(prev => prev.filter(item => item.id !== itemId));
  };

  // Handle starting a new analysis
  const handleNewAnalysis = () => {
    setCurrentData([]);
    setColumns([]);
    setSelectedFile(null);
    setChartConfig({ xAxis: '', yAxis: '', chartType: 'bar' });
    setAiInsights(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Clear 3D chart if it exists
    if (threeJsRef.current) {
      while (threeJsRef.current.firstChild) {
        threeJsRef.current.removeChild(threeJsRef.current.firstChild);
      }
    }
  };

  const theme = darkMode ? 'dark' : '';

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${theme}`}>
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Excel Analytics</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">Welcome, {user.name}</span>
              <button
                onClick={() => setShowUserProfileModal(true)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              <button
                onClick={() => { console.log('Logout clicked'); onLogout(); }}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Excel File Upload
              </h2>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Choose Excel File
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Upload .xlsx or .xls files
                </p>
              </div>
              {selectedFile && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    ✓ {selectedFile.name} uploaded successfully
                  </p>
                </div>
              )}
              <button
                onClick={handleNewAnalysis}
                className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Start New Analysis
              </button>
            </div>

            {/* Chart Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Chart Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    X-Axis
                  </label>
                  <select
                    value={chartConfig.xAxis}
                    onChange={(e) => setChartConfig(prev => ({ ...prev, xAxis: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select X-Axis</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Y-Axis
                  </label>
                  <select
                    value={chartConfig.yAxis}
                    onChange={(e) => setChartConfig(prev => ({ ...prev, yAxis: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Y-Axis</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chart Type
                  </label>
                  <select
                    value={chartConfig.chartType}
                    onChange={(e) => setChartConfig(prev => ({ ...prev, chartType: e.target.value as ChartConfig['chartType'] }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="scatter">Scatter Plot</option>
                    <option value="3d-column">3D Column Chart</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={generateChart}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Generate Chart
                  </button>
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Saved Configurations */}
            {savedConfigs.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Saved Chart Configs
                </h3>
                <div className="space-y-2">
                  {savedConfigs.map(config => (
                    <div key={config.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{config.name}</span>
                      <button
                        onClick={() => loadConfig(config)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Load
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Middle Column - Chart Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Display */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Chart Visualization
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={downloadChart}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PNG
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </button>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </button>
                </div>
              </div>
              <div ref={chartRef}>
                {renderChart()}
              </div>
            </div>

            {/* Data Preview */}
            {currentData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Data Preview ({currentData.length} rows)
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {columns.slice(0, 5).map(col => (
                          <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {currentData.slice(0, 5).map((row, index) => (
                        <tr key={index}>
                          {columns.slice(0, 5).map(col => (
                            <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Upload History & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Upload History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Upload History
              </h2>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Filename
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rows
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredHistory.map(file => (
                    <tr key={file.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {file.filename}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {file.uploadDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {file.rows}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewHistory(file)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditHistory(file)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHistory(file.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              AI Insights
            </h2>
            {!aiInsights ? (
              <div className="text-center py-8">
                <button
                  onClick={generateInsights}
                  disabled={isGeneratingInsights || !currentData.length}
                  className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingInsights ? 'Generating...' : 'Generate AI Insights'}
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Upload data to get AI-powered insights
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h4>
                  <ul className="space-y-1">
                    {aiInsights.summary.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {aiInsights.recommendations.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setAiInsights(null)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Generate New Insights
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Configuration Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Save Chart Configuration
            </h3>
            <input
              type="text"
              placeholder="Configuration name"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={saveConfig}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Profile</h3>
            <p className="text-gray-700 dark:text-gray-300">Display user profile information here.</p>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowUserProfileModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
            <p className="text-gray-700 dark:text-gray-300">Display settings options here.</p>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Help & Support</h3>
            <p className="text-gray-700 dark:text-gray-300">Display help content or contact information here.</p>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 

