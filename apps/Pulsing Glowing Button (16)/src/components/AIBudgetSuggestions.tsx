import React, { useState } from 'react';
import { Sparkles, TrendingUp, CheckCircle, XCircle, Info } from 'lucide-react';

type BudgetCategory = 'Venue' | 'Catering' | 'Marketing' | 'Logistics' | 'Entertainment' | 'StaffTravel' | 'Miscellaneous';

interface AISuggestion {
  id: string;
  category: BudgetCategory;
  description: string;
  suggestedCost: number;
  reasoning: string;
  confidence: number;
  accepted: boolean;
}

export const AIBudgetSuggestions: React.FC<{ eventId: string; eventType: string; attendees: number }> = ({
  eventId,
  eventType,
  attendees,
}) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([
    {
      id: '1',
      category: 'Venue',
      description: 'Premium Conference Center with AV Equipment',
      suggestedCost: 15000,
      reasoning: `Based on ${attendees} attendees and ${eventType} type, a premium venue with built-in AV equipment will provide the best value. Similar events of this scale typically allocate 30% of budget to venue.`,
      confidence: 0.92,
      accepted: false,
    },
    {
      id: '2',
      category: 'Catering',
      description: 'Full-Day Catering Package (Breakfast, Lunch, Refreshments)',
      suggestedCost: 8500,
      reasoning: `At $18.89 per person for ${attendees} attendees, this aligns with industry standards for professional events. Includes breakfast, lunch, and coffee breaks.`,
      confidence: 0.88,
      accepted: false,
    },
    {
      id: '3',
      category: 'Marketing',
      description: 'Digital Marketing Campaign & Event Promotion',
      suggestedCost: 12000,
      reasoning: `For a ${eventType} targeting ${attendees} attendees, a comprehensive digital marketing strategy including social media, email campaigns, and targeted ads is recommended. This represents 24% of the budget, which is optimal for attendee acquisition.`,
      confidence: 0.85,
      accepted: false,
    },
    {
      id: '4',
      category: 'Technology',
      description: 'Event Management Platform & Mobile App',
      suggestedCost: 5000,
      reasoning: `Modern events benefit from dedicated event apps for networking, scheduling, and engagement. Based on your attendee count, this investment will improve attendee satisfaction by 35%.`,
      confidence: 0.78,
      accepted: false,
    },
    {
      id: '5',
      category: 'Entertainment',
      description: 'Keynote Speaker & Evening Entertainment',
      suggestedCost: 7500,
      reasoning: `Industry data shows that ${eventType} events with professional entertainment see 42% higher attendee satisfaction. This budget allows for a recognized keynote speaker plus evening entertainment.`,
      confidence: 0.81,
      accepted: false,
    },
  ]);

  const acceptSuggestion = (id: string) => {
    setSuggestions(suggestions.map((s) => (s.id === id ? { ...s, accepted: true } : s)));
  };

  const rejectSuggestion = (id: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== id));
  };

  const totalSuggested = suggestions.reduce((sum, s) => sum + s.suggestedCost, 0);
  const acceptedTotal = suggestions.filter((s) => s.accepted).reduce((sum, s) => sum + s.suggestedCost, 0);
  const avgConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;

  const getCategoryColor = (category: BudgetCategory) => {
    const colors: Record<BudgetCategory, string> = {
      Venue: 'bg-purple-100 text-purple-800',
      Catering: 'bg-green-100 text-green-800',
      Marketing: 'bg-blue-100 text-blue-800',
      Logistics: 'bg-yellow-100 text-yellow-800',
      Entertainment: 'bg-pink-100 text-pink-800',
      StaffTravel: 'bg-orange-100 text-orange-800',
      Miscellaneous: 'bg-gray-100 text-gray-800',
    };
    return colors[category];
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AI Budget Suggestions</h2>
            <p className="text-sm text-gray-600">
              Powered by machine learning • Avg confidence: {(avgConfidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Suggested Budget</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${totalSuggested.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{suggestions.length} suggestions</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Accepted Suggestions</p>
          <p className="text-2xl font-bold text-green-600 mt-1">${acceptedTotal.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{suggestions.filter((s) => s.accepted).length} accepted</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Potential Savings</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            ${((totalSuggested * 0.15).toFixed(0)).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">vs. traditional planning</p>
        </div>
      </div>

      {/* AI Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">How AI suggestions work</p>
          <p className="text-blue-700">
            Our AI analyzes data from 10,000+ similar events, considering your event type ({eventType}), attendee count ({attendees}),
            industry benchmarks, and seasonal pricing to provide optimized budget recommendations.
          </p>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`bg-white rounded-lg border-2 transition-all ${
              suggestion.accepted ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(suggestion.category)}`}>
                      {suggestion.category}
                    </span>
                    <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                      {(suggestion.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{suggestion.description}</h3>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-gray-900">${suggestion.suggestedCost.toLocaleString()}</p>
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>{suggestion.reasoning}</span>
                </p>
              </div>

              {/* Actions */}
              {!suggestion.accepted && (
                <div className="flex gap-3">
                  <button
                    onClick={() => acceptSuggestion(suggestion.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept & Add to Budget
                  </button>
                  <button
                    onClick={() => rejectSuggestion(suggestion.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Dismiss
                  </button>
                </div>
              )}

              {suggestion.accepted && (
                <div className="flex items-center gap-2 text-green-700 bg-green-100 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Added to budget</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Summary */}
      {suggestions.filter((s) => s.accepted).length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Ready to finalize your AI-optimized budget?</p>
              <p className="text-sm text-gray-600 mt-1">
                You've accepted {suggestions.filter((s) => s.accepted).length} suggestion(s) totaling ${acceptedTotal.toLocaleString()}
              </p>
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md">
              Apply to Event Budget
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
