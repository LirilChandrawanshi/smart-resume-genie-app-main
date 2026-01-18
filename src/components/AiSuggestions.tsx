
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Sparkles, ThumbsUp, ThumbsDown, LightbulbIcon, RefreshCw } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface AiSuggestionsProps {
  resumeData: any;
  onApplySuggestion: (field: string, value: string) => void;
}

const AiSuggestions: React.FC<AiSuggestionsProps> = ({ resumeData, onApplySuggestion }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{field: string, value: string, applied: boolean}>>([]);

  // Mock function to simulate AI suggestions
  const generateSuggestions = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newSuggestions = [];
      
      // Check if summary is empty or short
      if (!resumeData.personalInfo.summary || resumeData.personalInfo.summary.length < 50) {
        newSuggestions.push({
          field: 'summary',
          value: "Detail-oriented software engineer with 5+ years of experience developing user-focused applications using Java, Spring Boot, and React. Proven track record of improving application performance and implementing innovative solutions that meet business needs.",
          applied: false
        });
      }
      
      // Check for skills suggestions
      const techStack = ["Java", "Spring Boot", "React.js", "HTML", "CSS", "MongoDB"];
      const existingSkills = resumeData.skills.map(s => s.name.toLowerCase());
      
      for (const tech of techStack) {
        if (!existingSkills.some(skill => skill.toLowerCase().includes(tech.toLowerCase()))) {
          newSuggestions.push({
            field: 'skill',
            value: tech,
            applied: false
          });
          break;
        }
      }
      
      // Experience description suggestions
      if (resumeData.experience.some(exp => !exp.description || exp.description.length < 30)) {
        const expIndex = resumeData.experience.findIndex(exp => !exp.description || exp.description.length < 30);
        if (expIndex !== -1 && resumeData.experience[expIndex].title.toLowerCase().includes("developer")) {
          newSuggestions.push({
            field: `experience-${expIndex}-description`,
            value: "Led development of RESTful APIs using Spring Boot, reducing response time by 30%. Collaborated with cross-functional teams to implement features that increased user engagement by 25%.",
            applied: false
          });
        }
      }
      
      setSuggestions(newSuggestions);
      setLoading(false);
      
      if (newSuggestions.length === 0) {
        toast({
          title: "No suggestions available",
          description: "Your resume looks good! We don't have any suggestions at this time.",
        });
      }
    }, 1500);
  };

  const handleApplySuggestion = (index: number) => {
    const suggestion = suggestions[index];
    
    if (suggestion.field === 'summary') {
      onApplySuggestion('summary', suggestion.value);
    } else if (suggestion.field === 'skill') {
      // Add as a new skill
      onApplySuggestion('newSkill', suggestion.value);
    } else if (suggestion.field.startsWith('experience-')) {
      const parts = suggestion.field.split('-');
      const expIndex = parseInt(parts[1]);
      onApplySuggestion(`experience-${expIndex}-description`, suggestion.value);
    }
    
    // Mark as applied
    const updatedSuggestions = [...suggestions];
    updatedSuggestions[index] = { ...updatedSuggestions[index], applied: true };
    setSuggestions(updatedSuggestions);
    
    toast({
      title: "Suggestion applied",
      description: "The AI suggestion has been added to your resume.",
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
        <CardDescription>Get personalized suggestions to enhance your resume</CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-6">
            <LightbulbIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">Get Smart Suggestions</h3>
            <p className="text-muted-foreground mb-4">Let our AI analyze your resume and suggest improvements to make it stand out.</p>
            <Button 
              onClick={generateSuggestions} 
              className="bg-resume-primary hover:bg-resume-secondary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Suggestions
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Personalized Suggestions</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSuggestions([])}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
            
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="bg-accent border-accent">
                <CardContent className="p-4">
                  <div className="mb-2">
                    <span className="font-medium text-sm">
                      {suggestion.field === 'summary' && 'Professional Summary'}
                      {suggestion.field === 'skill' && 'Add Missing Skill'}
                      {suggestion.field.startsWith('experience-') && 'Experience Description'}
                    </span>
                  </div>
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
                      disabled={suggestion.applied}
                      className={suggestion.applied ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {suggestion.applied ? "Applied" : "Apply"}
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
