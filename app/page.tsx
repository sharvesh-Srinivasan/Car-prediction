"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Car, Zap, Gauge, Settings, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation";

interface FormData {
  brand: string
  model: string
  model_year: string
  milage: string
  fuel_type: string
  transmission: string
  cylinders: string
  horse_power: string
  liter_capacity: string
  gear: string
  accident: string
  clean_title: string
  ext_col: string
  int_col: string
  electric: string
}

const initialFormData: FormData = {
  brand: "",
  model: "",
  model_year: "",
  milage: "",
  fuel_type: "",
  transmission: "",
  cylinders: "",
  horse_power: "",
  liter_capacity: "",
  gear: "",
  accident: "",
  clean_title: "",
  ext_col: "Unknown",
  int_col: "Unknown",
  electric: "False",
}

export default function CarPricePrediction() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Basic Information",
      icon: Car,
      fields: ["brand", "model", "model_year"],
    },
    {
      title: "Vehicle Details",
      icon: Settings,
      fields: ["milage", "fuel_type", "transmission", "ext_col", "int_col", "electric"],
    },
    {
      title: "Engine Specifications",
      icon: Zap,
      fields: ["cylinders", "horse_power", "liter_capacity", "gear"],
    },
    {
      title: "History & Condition",
      icon: AlertCircle,
      fields: ["accident", "clean_title"],
    },
  ]

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const isStepComplete = (stepIndex: number) => {
    const stepFields = steps[stepIndex].fields
    return stepFields.every((field) => formData[field as keyof FormData] !== "")
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to get prediction from server.");
      }
      setResult(`₹${data.price.toLocaleString()}`);
    } catch (err) {
      setError("Failed to get prediction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setResult("");
    setError(null);
    setCurrentStep(0);
  };

  const renderStepContent = () => {
    const step = steps[currentStep]
    const StepIcon = step.icon

    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <StepIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">{step.title}</h3>
        </div>

        {currentStep === 0 && (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="brand" className="text-sm font-medium text-gray-700">
                Brand
              </Label>
              <Input
                id="brand"
                placeholder="e.g., Toyota, Honda, BMW"
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="model" className="text-sm font-medium text-gray-700">
                Model
              </Label>
              <Input
                id="model"
                placeholder="e.g., Camry, Civic, X5"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="model_year" className="text-sm font-medium text-gray-700">
                Model Year
              </Label>
              <Input
                id="model_year"
                type="number"
                min="1990"
                max="2025"
                placeholder="2020"
                value={formData.model_year}
                onChange={(e) => handleInputChange("model_year", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="milage" className="text-sm font-medium text-gray-700">
                Mileage (miles)
              </Label>
              <Input
                id="milage"
                type="number"
                min="0"
                placeholder="50000"
                value={formData.milage}
                onChange={(e) => handleInputChange("milage", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fuel_type" className="text-sm font-medium text-gray-700">
                Fuel Type
              </Label>
              <Select value={formData.fuel_type} onValueChange={(value) => handleInputChange("fuel_type", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrol">⛽ Petrol</SelectItem>
                  <SelectItem value="Diesel">🚛 Diesel</SelectItem>
                  <SelectItem value="Electric">⚡ Electric</SelectItem>
                  <SelectItem value="Hybrid">🔋 Hybrid</SelectItem>
                  <SelectItem value="Other">🔧 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transmission" className="text-sm font-medium text-gray-700">
                Transmission
              </Label>
              <Select value={formData.transmission} onValueChange={(value) => handleInputChange("transmission", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A/T">🔄 Automatic</SelectItem>
                  <SelectItem value="M/T">⚙️ Manual</SelectItem>
                  <SelectItem value="Dual">🔀 Dual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ext_col" className="text-sm font-medium text-gray-700">
                Exterior Color
              </Label>
              <Input
                id="ext_col"
                placeholder="e.g., White, Black, Red"
                value={formData.ext_col}
                onChange={(e) => handleInputChange("ext_col", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="int_col" className="text-sm font-medium text-gray-700">
                Interior Color
              </Label>
              <Input
                id="int_col"
                placeholder="e.g., Beige, Black, Grey"
                value={formData.int_col}
                onChange={(e) => handleInputChange("int_col", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="electric" className="text-sm font-medium text-gray-700">
                Electric Vehicle
              </Label>
              <Select value={formData.electric} onValueChange={(value) => handleInputChange("electric", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Is it electric?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="True">Yes</SelectItem>
                  <SelectItem value="False">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="cylinders" className="text-sm font-medium text-gray-700">
                Cylinders
              </Label>
              <Input
                id="cylinders"
                type="number"
                min="2"
                max="16"
                placeholder="4"
                value={formData.cylinders}
                onChange={(e) => handleInputChange("cylinders", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="horse_power" className="text-sm font-medium text-gray-700">
                Horse Power
              </Label>
              <Input
                id="horse_power"
                type="number"
                min="30"
                max="1000"
                placeholder="200"
                value={formData.horse_power}
                onChange={(e) => handleInputChange("horse_power", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="liter_capacity" className="text-sm font-medium text-gray-700">
                Engine Capacity (L)
              </Label>
              <Input
                id="liter_capacity"
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                placeholder="2.0"
                value={formData.liter_capacity}
                onChange={(e) => handleInputChange("liter_capacity", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="gear" className="text-sm font-medium text-gray-700">
                Gear (Speed)
              </Label>
              <Input
                id="gear"
                type="number"
                min="3"
                max="10"
                placeholder="6"
                value={formData.gear}
                onChange={(e) => handleInputChange("gear", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="accident" className="text-sm font-medium text-gray-700">
                Accident History
              </Label>
              <Select value={formData.accident} onValueChange={(value) => handleInputChange("accident", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select accident history" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None reported">✅ None reported</SelectItem>
                  <SelectItem value="At least 1 accident or damage reported">⚠️ At least 1 accident reported</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="clean_title" className="text-sm font-medium text-gray-700">
                Clean Title
              </Label>
              <Select value={formData.clean_title} onValueChange={(value) => handleInputChange("clean_title", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select title status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">✅ Yes</SelectItem>
                  <SelectItem value="No">❌ No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Home Button */}
        <button
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={() => router.push("/")}
        >
          Home
        </button>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Car className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Car Price Predictor
          </h1>
          <p className="text-gray-600">Get an instant estimate of your car's market value</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep || (index === currentStep && isStepComplete(index))

              return (
                <div key={index} className="flex flex-col items-center">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-400"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCompleted && index !== currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </motion.div>
                  <span
                    className={`text-xs mt-2 text-center ${isActive ? "text-blue-600 font-medium" : "text-gray-500"}`}
                  >
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Form Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-gray-800">
              Step {currentStep + 1} of {steps.length}
            </CardTitle>
            <CardDescription>Fill in the details to get your car's predicted price</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-6 bg-transparent"
                >
                  Previous
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStepComplete(currentStep)}
                    className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Next
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={!isStepComplete(currentStep) || isLoading}
                      className="px-6 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Predicting...
                        </>
                      ) : (
                        <>
                          <Gauge className="w-4 h-4 mr-2" />
                          Predict Price
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={resetForm}
                      disabled={isLoading}
                      className="px-6 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                    >
                      Reset
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mt-6"
            >
              <Alert className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-lg font-semibold text-green-800">
                  Predicted Price: {result}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          {[
            { icon: Zap, title: "Instant Results", desc: "Get predictions in seconds" },
            { icon: Gauge, title: "Accurate Pricing", desc: "AI-powered market analysis" },
            { icon: Car, title: "All Car Types", desc: "Support for various models" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg"
            >
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-fit mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
