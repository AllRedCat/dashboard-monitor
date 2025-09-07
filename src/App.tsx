import './styles/App.css'
import { useWebSocket } from './hooks'
import { MetricsContainer } from './components/metrics'

function App() {
  const { metrics, networkRates, networkChartData } = useWebSocket();

  return (
    <>
      <h1 className='m-top-0'>Dashboard metrics</h1>
      {metrics ? (
        <MetricsContainer 
          metrics={metrics}
          networkRates={networkRates}
          networkChartData={networkChartData}
        />
      ) : (
        <p>Loading metrics...</p>
      )}
    </>
  )
}

export default App
