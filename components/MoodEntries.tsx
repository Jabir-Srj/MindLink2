import { Card, CardContent } from "@/components/ui/card";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  note: string;
  created_at: string;
}

interface MoodEntriesProps {
  entries: MoodEntry[];
}

export default function MoodEntries({ entries }: MoodEntriesProps) {
  const moodOptions = ["😢", "😕", "😐", "🙂", "😄"];
  const moodColors = [
    'rgba(239, 68, 68, 0.7)',   // Red - sad
    'rgba(249, 115, 22, 0.7)',  // Orange - somewhat sad
    'rgba(234, 179, 8, 0.7)',   // Yellow - neutral
    'rgba(34, 197, 94, 0.7)',   // Green - happy
    'rgba(59, 130, 246, 0.7)',  // Blue - very happy
  ];

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const data = {
    labels: sortedEntries.slice(0, 7).map(e => new Date(e.created_at).toLocaleDateString()).reverse(),
    datasets: [{
      label: 'Mood History',
      data: sortedEntries.slice(0, 7).map(e => e.mood).reverse(),
      fill: true,
      backgroundColor: 'rgba(28, 59, 112, 0.1)',
      borderColor: '#1c3b70',
      borderWidth: 2,
      tension: 0.3,
      pointBackgroundColor: sortedEntries.slice(0, 7).map(e => moodColors[e.mood]).reverse(),
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 4,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            return moodOptions[value];
          },
          color: '#333',
          font: {
            size: 14
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#333',
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#333',
        padding: 12,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        callbacks: {
          label: function(context: any) {
            return `Mood: ${moodOptions[context.raw]}`;
          }
        }
      }
    }
  };

  return (
    <div style={{ 
      width: '100%',
      maxWidth: '900px',
      margin: '40px auto 0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px'
    }}>
      {/* Chart section */}
      {entries.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '10px',
          padding: '30px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
          border: '1px solid #eee',
          width: '100%'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            marginBottom: '25px', 
            color: '#333',
            textAlign: 'center',
            fontWeight: '500',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}>Mood Trends</h3>
          <div style={{ 
            height: '350px',
            background: '#f9f9f9',
            borderRadius: '8px',
            padding: '20px' 
          }}>
            <Line data={data} options={options} />
          </div>
        </div>
      )}

      {/* Mood entries grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '25px',
        width: '100%'
      }}>
        {sortedEntries.slice(0, 6).map((entry) => (
          <div 
            key={entry.id} 
            style={{ 
              background: 'white',
              borderRadius: '10px',
              padding: '22px',
              cursor: 'pointer',
              border: '1px solid #eee',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: entry.note ? '10px' : '0'
            }}>
              <span style={{ 
                fontSize: '30px'
              }}>
                {moodOptions[entry.mood]}
              </span>
              <span style={{ 
                color: '#777',
                fontSize: '14px',
                textAlign: 'right',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}>
                {new Date(entry.created_at).toLocaleDateString()} • {new Date(entry.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            
            {entry.note && (
              <p style={{ 
                color: '#444',
                fontSize: '15px',
                lineHeight: '1.5',
                margin: '10px 0 0 0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}>
                {entry.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 