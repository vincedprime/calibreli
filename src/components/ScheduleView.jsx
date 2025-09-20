import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plane } from 'lucide-react';
import { format } from 'date-fns';

export function ScheduleView({ recommendations, totalPTOUsed, availablePTO }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Your Optimized PTO Schedule
          </CardTitle>
          <CardDescription>
            No recommendations generated. Please check your input parameters.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Long Weekend':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Mini Break':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Week Break':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Long Weekend':
        return <MapPin className="h-4 w-4" />;
      case 'Mini Break':
        return <Clock className="h-4 w-4" />;
      case 'Week Break':
        return <Plane className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const totalDaysOff = recommendations.reduce((sum, rec) => sum + rec.totalDays, 0);
  const efficiency = totalPTOUsed > 0 ? (totalDaysOff / totalPTOUsed).toFixed(1) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Your Optimized PTO Schedule
          </CardTitle>
          <CardDescription>
            Here's your personalized vacation plan to maximize your time off
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
              <div className="text-sm text-blue-600">Vacation Periods</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalDaysOff}</div>
              <div className="text-sm text-green-600">Total Days Off</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{totalPTOUsed}</div>
              <div className="text-sm text-purple-600">PTO Days Used</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{efficiency}x</div>
              <div className="text-sm text-orange-600">Efficiency Ratio</div>
            </div>
          </div>
          
          {availablePTO - totalPTOUsed > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>Note:</strong> You have {availablePTO - totalPTOUsed} PTO days remaining that could be used for additional vacation time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${getTypeColor(recommendation.type)} flex items-center gap-1`}>
                      {getTypeIcon(recommendation.type)}
                      {recommendation.type}
                    </Badge>
                    <h3 className="text-lg font-semibold">
                      {recommendation.dateRange}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Days:</span>
                      <div className="font-medium">{recommendation.totalDays} days</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PTO Used:</span>
                      <div className="font-medium text-red-600">{recommendation.ptoDaysUsed} days</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weekends:</span>
                      <div className="font-medium text-blue-600">{recommendation.weekendDays} days</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Holidays:</span>
                      <div className="font-medium text-green-600">{recommendation.holidayDays} days</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {recommendation.efficiency.toFixed(1)}x
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Efficiency
                  </div>
                </div>
              </div>
              
              {/* Detailed breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-muted-foreground">
                  <strong>Breakdown:</strong> {recommendation.ptoDaysUsed} PTO day{recommendation.ptoDaysUsed !== 1 ? 's' : ''}
                  {recommendation.weekendDays > 0 && ` + ${recommendation.weekendDays} weekend day${recommendation.weekendDays !== 1 ? 's' : ''}`}
                  {recommendation.holidayDays > 0 && ` + ${recommendation.holidayDays} holiday${recommendation.holidayDays !== 1 ? 's' : ''}`}
                  {' = '}
                  <strong>{recommendation.totalDays} total days off</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Tips for Your Vacation Planning</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Book flights and accommodations early for better deals, especially for long weekends</li>
            <li>• Consider travel time when planning consecutive vacation periods</li>
            <li>• Check with your manager about blackout dates or busy periods to avoid</li>
            <li>• Remember to submit PTO requests according to your company's policy</li>
            <li>• Keep some PTO days in reserve for unexpected needs or opportunities</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
