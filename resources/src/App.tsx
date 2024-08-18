const valor = import.meta.env.VITE_DEVELOPMENT_BACKEND_URL
export default function App() {
  return (
    <div className='min-h-[90vh] text-center content-center'>
      <p>Hello world {valor}</p>
    </div>
  )
}
