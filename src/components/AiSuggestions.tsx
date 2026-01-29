
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Sparkles, ThumbsUp, ThumbsDown, LightbulbIcon, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { generateATSSuggestions, calculateATSScore, type ATSuggestion } from '../lib/atsSuggestions';
import { Badge } from './ui/badge';

interface AiSuggestionsProps {
  resumeData: any;
  onApplySuggestion: (field: string, value: string) => void;
}

interface ExtendedSuggestion extends ATSuggestion {
  applied: boolean;
}

const AiSuggestions: React.FC<AiSuggestionsProps> = ({ resumeData, onApplySuggestion }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ExtendedSuggestion[]>([]);
  const [atsScore, setAtsScore] = useState<{ score: number; feedback: string[] } | null>(null);

  // Generate ATS-friendly suggestions using rule-based checks and optional AI
  const generateSuggestions = async () => {
    setLoading(true);
    
    try {
      // Calculate ATS score (now async to support dataset-based scoring)
      const score = await calculateATSScore(resumeData);
      setAtsScore(score);
      
      // Generate suggestions
      const atsSuggestions = await generateATSSuggestions(resumeData);
      
      // Convert to extended format
      const extendedSuggestions: ExtendedSuggestion[] = atsSuggestions.map(s => ({
        ...s,
        applied: false
      }));
      
      setSuggestions(extendedSuggestions);
      
      if (extendedSuggestions.length === 0) {
        toast({
          title: "Great job!",
          description: `Your resume scored ${score.score}/100 on ATS compatibility. Keep up the good work!`,
        });
      } else {
        toast({
          title: "Suggestions generated",
          description: `Found ${extendedSuggestions.length} suggestion${extendedSuggestions.length > 1 ? 's' : ''} to improve your ATS score (${score.score}/100)`,
        });
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Only summary, skill, and experience-description can be applied to resume state; others are guidance-only
  const canApplySuggestion = (field: string) =>
    field === 'summary' ||
    field === 'skill' ||
    field.startsWith('experience-');

  const handleApplySuggestion = (index: number) => {
    const suggestion = suggestions[index];

    if (!canApplySuggestion(suggestion.field)) {
      toast({
        title: "Guidance only",
        description: "This suggestion is advice to consider; update your resume manually in the form.",
      });
      return;
    }

    if (suggestion.field === 'summary') {
      onApplySuggestion('summary', suggestion.value);
    } else if (suggestion.field === 'skill') {
      onApplySuggestion('newSkill', suggestion.value);
    } else if (suggestion.field.startsWith('experience-')) {
      const parts = suggestion.field.split('-');
      const fieldKey = parts.length === 3 ? `${parts[0]}-${parts[1]}-${parts[2]}` : `${parts[0]}-${parts[1]}-description`;
      onApplySuggestion(fieldKey, suggestion.value);
    }

    // Mark as applied only when we actually updated resume state
    const updatedSuggestions = [...suggestions];
    updatedSuggestions[index] = { ...updatedSuggestions[index], applied: true };
    setSuggestions(updatedSuggestions);

    toast({
      title: "Suggestion applied",
      description: "The ATS-friendly suggestion has been added to your resume.",
    });
  };

  const handleFeedback = (positive: boolean) => {
    toast({
      title: positive ? "Thanks for your feedback!" : "We'll improve our suggestions",
      description: positive 
        ? "We're glad you found our suggestions helpful." 
        : "Thank you for helping us improve the suggestion quality.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-resume-primary" />
          <span>AI Resume Assistant</span>
        </CardTitle>
        <CardDescription>Get free ATS-friendly suggestions to optimize your resume</CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-6">
            <LightbulbIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">Get ATS-Friendly Suggestions</h3>
            <p className="text-muted-foreground mb-4">
              Our free analysis uses rule-based checks and AI to identify improvements for better ATS compatibility.
            </p>
            <Button 
              onClick={generateSuggestions} 
              className="bg-resume-primary hover:bg-resume-secondary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze & Generate Suggestions
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ATS Score Display */}
            {atsScore && (
              <Card className="bg-accent border-accent">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {atsScore.score >= 80 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <span className="font-medium">ATS Compatibility Score</span>
                    </div>
                    <Badge variant={atsScore.score >= 80 ? "default" : atsScore.score >= 60 ? "secondary" : "destructive"}>
                      {atsScore.score}/100
                    </Badge>
                  </div>
                  {atsScore.feedback.length > 0 && (
                    <p className="text-xs text-muted-foreground">{atsScore.feedback[0]}</p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">ATS-Friendly Suggestions</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSuggestions([]);
                  setAtsScore(null);
                }}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
            
            {suggestions.map((suggestion, index) => (
              <Card key={index} className={`bg-accent border-accent ${suggestion.priority === 'high' ? 'border-l-4 border-l-orange-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {suggestion.type === 'summary' && 'Professional Summary'}
                        {suggestion.type === 'skill' && 'Add Missing Skill'}
                        {suggestion.type === 'experience' && 'Experience Description'}
                        {suggestion.type === 'education' && 'Education Details'}
                        {suggestion.type === 'format' && 'Formatting Issue'}
                        {suggestion.type === 'keyword' && 'Keyword Optimization'}
                      </span>
                      <Badge 
                        variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{suggestion.reason}</p>
                  <p className="text-sm mb-3">{suggestion.value}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleFeedback(true)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleFeedback(false)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleApplySuggestion(index)}
                      disabled={suggestion.applied && canApplySuggestion(suggestion.field)}
                      className={suggestion.applied && canApplySuggestion(suggestion.field) ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {suggestion.applied && canApplySuggestion(suggestion.field)
                        ? "Applied"
                        : canApplySuggestion(suggestion.field)
                          ? "Apply"
                          : "Got it"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button 
              onClick={generateSuggestions} 
              variant="outline" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Getting more suggestions...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Suggestions
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiSuggestions;
