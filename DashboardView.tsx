import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, BarChart3, TrendingUp, Activity, Eye, Download, Trash2, X, LogOut, Settings } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface FileItem {
  id: number;
  name: string;
  uploadDate: string;
  size: string;
  rows: number;
  columns: number;
  charts: number;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

interface DashboardViewProps {
  userName: string;
  onLogout: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ userName, onLogout }) => {
  const [dragActive, setDragActive] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    fileId: number | null;
    fileName: string;
  }>({
    isOpen: false,
    fileId: null,
    fileName: ''
  });
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: 1,
      name: 'CNCD Pet Dog Registration.xlsx',
      uploadDate: '2025-06-06',
      size: '0.0 MB',
      rows: 667,
      columns: 11,
      charts: 0
    },
    {
      id: 2,
      name: 'Sales_Data_Q1.xlsx',
      uploadDate: '2024-12-01',
      size: '2.1 MB',
      rows: 1250,
      columns: 8,
      charts: 3
    },
    {
      id: 3,
      name: 'Marketing_Analytics.xlsx',
      uploadDate: '2024-11-28',
      size: '1.8 MB',
      rows: 890,
      columns: 12,
      charts: 5
    },
    {
      id: 4,
      name: 'Customer_Feedback.xlsx',
      uploadDate: '2024-11-25',
      size: '3.2 MB',
      rows: 2100,
      columns: 6,
      charts: 2
    }
  ]);
  const [uploadedData, setUploadedData] = useState<any[][] | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedXAxis, setSelectedXAxis] = useState<string | null>(null);
  const [selectedYAxis, setSelectedYAxis] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'Bar' | 'Line' | 'Pie' | 'Scatter' | null>(null);
  const [chartData, setChartData] = useState<any[] | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file && (file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          setUploadedData(json);
          setUploadedFileName(file.name);
          setSelectedXAxis(null); // Reset selections on new upload
          setSelectedYAxis(null);
          setChartType(null);
          setChartData(null); // Clear previous chart data

          // Simulate file upload to history (optional, based on backend integration)
          const newFile: FileItem = {
            id: Date.now(),
            name: file.name,
            uploadDate: new Date().toISOString().split('T')[0],
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            rows: json.length > 0 ? json.length -1 : 0, // Assuming header row
            columns: json.length > 0 ? json[0].length : 0,
            charts: 0 // Initial charts count
          };
          setFiles(prevFiles => [newFile, ...prevFiles]);

        }
      };
      reader.readAsBinaryString(file);
    } else {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleFileAction = (action: string, fileId: number) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    switch(action) {
      case 'view':
        // For now, we'll just log the data or show a simple preview if data is stored per file
        alert(`Viewing data for ${file.name}`);
        // In a real app, you'd fetch the file data (if not stored in state) and display it.
        break;
      case 'download':
        alert(`Downloading ${file.name}`);
        // Implement actual download logic
        break;
      case 'delete':
        setConfirmDialog({
          isOpen: true,
          fileId,
          fileName: file.name
        });
        break;
    }
  };

  const handleDeleteConfirm = () => {
    if (confirmDialog.fileId) {
      setFiles(prevFiles => prevFiles.filter(f => f.id !== confirmDialog.fileId));
      // Also clear uploaded data if the deleted file is the one currently previewed
      if (uploadedFileName === files.find(f => f.id === confirmDialog.fileId)?.name) {
        setUploadedData(null);
        setUploadedFileName(null);
        setSelectedXAxis(null); // Reset selections
        setSelectedYAxis(null);
        setChartType(null);
        setChartData(null); // Clear chart data
      }
    }
  };

  const handleGenerateChart = () => {
    if (!uploadedData || !selectedXAxis || !selectedYAxis || !chartType) return;

    const xAxisIndex = uploadedData[0]?.indexOf(selectedXAxis);
    const yAxisIndex = uploadedData[0]?.indexOf(selectedYAxis);

    if (xAxisIndex === -1 || yAxisIndex === -1) {
      alert('Selected columns not found in data.');
      return;
    }

    const dataForChart = uploadedData.slice(1).map(row => {
      const rowData: any = {};
      rowData[selectedXAxis] = row[xAxisIndex];
      rowData[selectedYAxis] = row[yAxisIndex];
      return rowData;
    });

    setChartData(dataForChart);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#f08080'];

  const renderChart = () => {
    if (!chartData || !selectedXAxis || !selectedYAxis || !chartType) return null;

    const commonProps = {
      data: chartData,
      margin: {
        top: 20, right: 30, left: 20, bottom: 5,
      },
    };

    const axisProps = {
      fontSize: 12,
      tickFormatter: (value: any) => String(value),
    };

    switch (chartType) {
      case 'Bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={selectedXAxis} {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip />
              <Legend />
              <Bar dataKey={selectedYAxis} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'Line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={selectedXAxis} {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={selectedYAxis} stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'Pie':
         const pieData = chartData.map((item: any) => ({
             name: item[selectedXAxis],
             value: parseFloat(item[selectedYAxis]) || 0 // Ensure value is a number
         })).filter(item => !isNaN(item.value)); // Filter out non-numeric values

        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'Scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey={selectedXAxis} name={selectedXAxis} {...axisProps} />
              <YAxis type="number" dataKey={selectedYAxis} name={selectedYAxis} {...axisProps} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name={uploadedFileName || 'Data'} data={chartData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const stats = [
    { label: 'Total Files', value: files.length, icon: FileSpreadsheet, color: 'from-blue-500 to-blue-600', trend: '+2 this week' },
    { label: 'Charts Created', value: files.reduce((acc, file) => acc + file.charts, 0), icon: BarChart3, color: 'from-purple-500 to-purple-600', trend: '+5 this week' },
    { label: 'Data Points', value: files.reduce((acc, file) => acc + file.rows, 0).toLocaleString(), icon: Activity, color: 'from-green-500 to-green-600', trend: '+1,250 this week' },
    { label: 'Storage Used', value: '8.1 MB', icon: TrendingUp, color: 'from-orange-500 to-orange-600', trend: '+2.1 MB this week' } // This would need dynamic calculation in a real app
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-8 border border-white/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">ExcelViz Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">{userName}</span>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{userName.charAt(0)}{userName.split(' ')[1]?.charAt(0)}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">{stat.label}</div>
              <div className="text-xs font-semibold text-green-600 mt-2">{stat.trend}</div>
            </div>
          ))}
        </div>

        {/* Upload Section */}
        <section className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-white/30 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upload New Excel File</h2>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-blue-400 bg-blue-50 scale-105'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="w-10 h-10 text-white" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop your Excel file here, or{' '}
              <button
                onClick={() => document.getElementById('fileInput')?.click()}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500">Supports .xlsx and .xls files up to 10MB</p>
            <input
              id="fileInput"
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </div>

          {uploadedData && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview: {uploadedFileName}</h3>
              <div className="overflow-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {uploadedData[0]?.map((header: any, index: number) => (
                        <th
                          key={index}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {uploadedData.slice(1).map((row: any[], rowIndex: number) => (
                      <tr key={rowIndex}>
                        {row.map((cell: any, cellIndex: number) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Graph Generation Panel */}
        {uploadedData && (
          <section className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-white/30 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Generate Graph</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="xAxis" className="block text-sm font-medium text-gray-700 mb-2">X-Axis</label>
                <select
                  id="xAxis"
                  name="xAxis"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedXAxis || ''}
                  onChange={(e) => setSelectedXAxis(e.target.value)}
                >
                  <option value="">Select X-Axis Column</option>
                  {uploadedData[0]?.map((header: any, index: number) => (
                    <option key={index} value={header}>{header}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="yAxis" className="block text-sm font-medium text-gray-700 mb-2">Y-Axis</label>
                <select
                  id="yAxis"
                  name="yAxis"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedYAxis || ''}
                  onChange={(e) => setSelectedYAxis(e.target.value)}
                >
                  <option value="">Select Y-Axis Column</option>
                  {uploadedData[0]?.map((header: any, index: number) => (
                    <option key={index} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="chartType"
                    value="Bar"
                    checked={chartType === 'Bar'}
                    onChange={() => setChartType('Bar')}
                  />
                  <span className="ml-2 text-gray-900">Bar</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="chartType"
                    value="Line"
                    checked={chartType === 'Line'}
                    onChange={() => setChartType('Line')}
                  />
                  <span className="ml-2 text-gray-900">Line</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="chartType"
                    value="Pie"
                    checked={chartType === 'Pie'}
                    onChange={() => setChartType('Pie')}
                  />
                  <span className="ml-2 text-gray-900">Pie</span>
                </label>
                 <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="chartType"
                    value="Scatter"
                    checked={chartType === 'Scatter'}
                    onChange={() => setChartType('Scatter')}
                  />
                  <span className="ml-2 text-gray-900">Scatter</span>
                </label>
              </div>
            </div>
            
            <button
              onClick={handleGenerateChart}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              disabled={!selectedXAxis || !selectedYAxis || !chartType}
            >
              Generate Chart
            </button>
            
            {/* Chart will be rendered here */}
            <div className="mt-8">
              {chartData ? renderChart() : (
                <div className="bg-gray-100 h-96 flex items-center justify-center rounded-lg text-gray-500 font-medium">
                  Select axes and chart type to generate a chart
                </div>
              )}
            </div>
          </section>
        )}

        {/* Files Section */}
        <section className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upload History</h2>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium">
                Filter
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium">
                Export All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{file.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{file.uploadDate}</span>
                      <span>{file.size}</span>
                      <span>{file.rows.toLocaleString()} rows</span>
                      <span>{file.columns} columns</span>
                      <span className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        {file.charts} charts
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFileAction('view', file.id)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleFileAction('download', file.id)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleFileAction('delete', file.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDeleteConfirm}
        title="Delete File"
        message={`Are you sure you want to delete "${confirmDialog.fileName}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default DashboardView; 