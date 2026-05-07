/** @format */

import React from "react"
import { SwapForm } from "./components/SwapForm"

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-900 flex flex-col items-center justify-center p-4 selection:bg-sky-200 selection:text-slate-900">
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(circle_700px_at_50%_120px,#0ea5e922,transparent),linear-gradient(to_right,#0f172a10_1px,transparent_1px),linear-gradient(to_bottom,#0f172a10_1px,transparent_1px)] bg-[size:5rem_5rem]" />
      <SwapForm />
    </div>
  )
}

export default App
