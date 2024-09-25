'use client'

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons"
import { Image, Loader2, Maximize2, Download, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { ImageComparisonSlider } from "./image-comparison-slider"

export function ImageUpscaler() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [upscaledImageUrl, setUpscaledImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isFullScreen, setIsFullScreen] = useState(false)
  const fullScreenImageRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showComparison, setShowComparison] = useState(false)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        })
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpscale = async () => {
    if (!imageFile) return

    setIsLoading(true)
    setError("")
    setUpscaledImageUrl("")

    const formData = new FormData()
    formData.append('image', imageFile)

    try {
      toast({
        title: "Upscaling image",
        description: "This may take a few moments...",
      })
      const response = await fetch("/api/image-upscale", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to upscale image")
      }

      if (!data.image || !data.image.url) {
        throw new Error("Upscaled image URL not found in response")
      }

      setUpscaledImageUrl(data.image.url)
      toast({
        title: "Image upscaled successfully",
        description: "Your image has been upscaled and is ready for download.",
      })
    } catch (error) {
      console.error("Error during image upscaling:", error)
      setError(error instanceof Error ? error.message : "Failed to upscale image. Please try again.")
      toast({
        title: "Error",
        description: "Failed to upscale image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      fullScreenImageRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullScreen(!isFullScreen)
  }

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullScreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
    }
  }, [])

  const handleDownload = () => {
    if (upscaledImageUrl) {
      fetch(upscaledImageUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'upscaled_image.png'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        })
        .catch(error => {
          console.error('Error downloading image:', error)
          toast({
            title: "Error",
            description: "Failed to download image. Please try again.",
            variant: "destructive",
          })
        })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image />
            <span className="ml-2 text-xl font-bold text-gray-900">Image Upscaler</span>
          </div>
          <Button variant="outline" className="flex items-center">
            Help
            <QuestionMarkCircledIcon className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Upscale Your Image</h1>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full py-8 border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors"
              >
                <Image className="mr-2" />
                {imageFile ? 'Change Image' : 'Select an Image'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {imagePreview && (
              <div className="mb-4">
                <img src={imagePreview} alt="Original" className="max-w-full h-auto rounded-lg" />
              </div>
            )}
            <Button 
              className="w-full" 
              onClick={handleUpscale}
              disabled={isLoading || !imageFile}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Upscaling...
                </>
              ) : (
                "Upscale Image"
              )}
            </Button>
          </div>
          {error && (
            <p className="mt-4 text-red-500 text-center">{error}</p>
          )}
          {upscaledImageUrl && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Upscaled Image</h2>
              <div className="relative">
                {showComparison ? (
                  <ImageComparisonSlider
                    beforeImage={imagePreview!}
                    afterImage={upscaledImageUrl}
                  />
                ) : (
                  <img 
                    ref={fullScreenImageRef}
                    src={upscaledImageUrl} 
                    alt="Upscaled" 
                    className="max-w-full h-auto rounded-lg shadow-md" 
                  />
                )}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Button onClick={() => setShowComparison(!showComparison)} size="sm" variant="secondary">
                    {showComparison ? "Hide Comparison" : "Show Comparison"}
                  </Button>
                  <Button onClick={handleDownload} size="sm" variant="secondary">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                {isFullScreen && (
                  <Button 
                    onClick={toggleFullScreen} 
                    size="sm" 
                    variant="secondary"
                    className="absolute top-2 left-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
          © 2024 Image Upscaler. All rights reserved.
        </div>
      </footer>
    </div>
  )
}