"use client";
import React, { useEffect, useState, useContext } from 'react';
import ReportCard from './ReportCard';
import { AppContext } from './context/AppContext';

const BASE_API_URL = 'http://127.0.0.1:8000';

const ResultsPage = () => {
  const { selectedImageType: ctxSelectedImageType, processedData: ctxProcessedData } = useContext(AppContext);

  // Try to get processed data from context or localStorage
  let selectedImageType = ctxSelectedImageType;
  let processedData = ctxProcessedData;
  if (!processedData && typeof window !== 'undefined') {
    const saved = localStorage.getItem('mediscan_processed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.processedData) processedData = parsed.processedData;
        if (parsed?.selectedImageType) selectedImageType = parsed.selectedImageType;
      } catch (e) {
        console.warn('Failed to parse persisted processed data');
      }
    }
  }

  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we have processedData from navigation, use it directly
    if (processedData) {
      // Construct your reportData using processedData from UploadPage
      const predictionData = processedData.predictions || [];
      const reportText = processedData.report || '';
      const disease = processedData.disease || '';
      const symptoms = processedData.symptoms || [];

      // Find the top prediction for confidence and diagnosis
      const sorted = Array.isArray(predictionData) && predictionData.length
        ? [...predictionData].sort((a, b) => b[1] - a[1])
        : [];

      const topK = sorted.slice(0, 3);
      const topSymptoms = symptoms.length ? symptoms : topK.map(([cond]) => cond);
      const [bestCond, bestScore] = sorted.length ? sorted[0] : [disease, 1];

      const specialtyMap = {
        Diabetes: 'Endocrinologist',
        Pneumonia: 'Pulmonologist',
        Depression: 'Psychiatrist',
        'Heart Disease': 'Cardiologist',
        'Pleural Effusion': 'Pulmonologist',
      };

      const specialty = specialtyMap[bestCond] || 'General Physician';

      const formattedReport = {
        symptoms: topSymptoms,
        diagnosis: disease || bestCond,
        confidence: Math.round((bestScore || 1) * 100),
        recommendations: [
          `Consult a ${specialty}`,
          'Follow a healthy lifestyle',
          'Get relevant tests done',
        ],
        suggested_tests: ['Blood Test', 'Imaging', 'Consultation'],
        specialty,
        timestamp: new Date().toISOString(),
        report: reportText,
      };

      setReportData(formattedReport);
      setLoading(false);
      return;
    }

    // Fallback: if no processedData, fetch from API as before
    if (!cleanType) {
      setError('No image type specified and no data passed.');
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const [predictionRes, reportRes] = await Promise.all([
          fetch(`${BASE_API_URL}/predict/${cleanType}/`),
          fetch(`${BASE_API_URL}/generate-report/${cleanType}/`),
        ]);

        if (!predictionRes.ok || !reportRes.ok) {
          throw new Error('One of the API calls failed');
        }

        const predictionData = await predictionRes.json();
        const reportDataRaw = await reportRes.json();

        const sorted = predictionData.predictions.sort((a, b) => b[1] - a[1]);
        const topK = sorted.slice(0, 3);
        const symptoms = topK.map(([cond]) => cond);
        const [bestCond, bestScore] = sorted[0];

        const specialtyMap = {
          Diabetes: 'Endocrinologist',
          Pneumonia: 'Pulmonologist',
          Depression: 'Psychiatrist',
          'Heart Disease': 'Cardiologist',
          'Pleural Effusion': 'Pulmonologist',
        };

        const specialty = specialtyMap[bestCond] || 'General Physician';

        const formattedReport = {
          symptoms,
          diagnosis: reportDataRaw.disease || bestCond,
          confidence: Math.round(bestScore * 100),
          recommendations: [
            `Consult a ${specialty}`,
            'Follow a healthy lifestyle',
            'Get relevant tests done',
          ],
          suggested_tests: ['Blood Test', 'Imaging', 'Consultation'],
          specialty,
          timestamp: new Date().toISOString(),
          report: reportDataRaw.report || '',
        };

        setReportData(formattedReport);
      } catch (err) {
        console.error(err);
        setError('Failed to load report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [cleanType, processedData]);

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-500 min-h-screen">Loading report...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-2xl text-red-600 opacity-60 min-h-screen">
        {error} 😢
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen space-y-6 max-w-4xl mx-auto">
      <div id="report-content">
        <ReportCard report={reportData} />
      </div>
    </div>
  );
};

export default ResultsPage;
