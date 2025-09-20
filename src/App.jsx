import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { ScheduleView } from './components/ScheduleView';
import { optimizePTO } from './utils/ptoOptimizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Calendar, Sparkles } from 'lucide-react';

function App() {
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationParams, setOptimizationParams] = useState(null);

  const handleOptimization = async (params) => {
    setIsLoading(true);
    setOptimizationParams(params);
    
    try {
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results = optimizePTO(params);
      setRecommendations(results);
    } catch (error) {
      console.error('Error optimizing PTO:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPTOUsed = recommendations 
    ? recommendations.reduce((sum, rec) => sum + rec.ptoDaysUsed, 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Calendar className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Calibreli</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Maximize your paid time off by intelligently combining PTO days with holidays and weekends
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Input Form */}
          <InputForm onSubmit={handleOptimization} isLoading={isLoading} />

          {/* Loading State */}
          {isLoading && (
            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                  <h3 className="text-lg font-semibold mb-2">Optimizing Your Schedule</h3>
                  <p className="text-muted-foreground">
                    Analyzing holidays, weekends, and your preferences...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {recommendations && !isLoading && (
            <ScheduleView 
              recommendations={recommendations}
              totalPTOUsed={totalPTOUsed}
              availablePTO={optimizationParams?.ptoDays || 0}
            />
          )}

          {/* Welcome Message */}
          {!recommendations && !isLoading && (
            <Card className="w-full max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Welcome to Smart PTO Planning</CardTitle>
                <CardDescription className="text-center">
                  Get started by filling out the form above to generate your personalized vacation schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Smart Scheduling</h3>
                    <p className="text-sm text-muted-foreground">
                      Our algorithm finds the best combinations of PTO, holidays, and weekends
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Multiple Styles</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose from balanced mix, long weekends, or mini breaks based on your preference
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Maximize Impact</h3>
                    <p className="text-sm text-muted-foreground">
                      Get more days off while using fewer PTO days through strategic planning
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 py-8 border-t border-gray-200">
          <p className="text-muted-foreground">
            Built with ❤️ to help you make the most of your time off
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
