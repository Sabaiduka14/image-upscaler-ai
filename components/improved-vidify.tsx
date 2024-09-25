'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons"
import { Video, Loader2 } from "lucide-react"

export function ImprovedVidify() {
  const [prompt, setPrompt] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleConvert = async () => {
    setIsLoading(true)
    setError("")
    setVideoUrl("")

    try {
      const response = await fetch("/api/text2video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate video")
      }

      const data = await response.json()
      setVideoUrl(data.video.url)
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to generate video. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Video />
            <span className="ml-2 text-xl font-bold text-gray-900">Text2Video</span>
          </div>
          <Button variant="outline" className="flex items-center">
            Help
            <QuestionMarkCircledIcon className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Convert Text to Video</h1>
          <div className="bg-white shadow-md rounded-lg p-6">
            <Textarea
              placeholder="Start typing or paste the text you want to convert to video..."
              className="min-h-[200px] mb-4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button 
              className="w-full" 
              onClick={handleConvert}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                "Convert to Video"
              )}
            </Button>
          </div>
          {error && (
            <p className="mt-4 text-red-500 text-center">{error}</p>
          )}
          {videoUrl && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Generated Video</h2>
              <video controls className="w-full rounded-lg shadow-md">
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      </main>
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
          © 2023 text2video. All rights reserved.
        </div>
      </footer>
    </div>
  )
}