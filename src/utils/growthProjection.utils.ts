
interface SubjectLevel {
    averageLevel: number;
    levelCounts: { [key: number]: number };
  }
  
  interface GrowthProjectionResult {
    subject: string;
    growthProjection: string;
    recommendation?: string;
  }
  
  export const calculateGrowthProjection = (proficiencyReport: Array<{ subject: string; averageLevel: string; levelCounts: { [key: number]: number } }>): GrowthProjectionResult[] => {
    return proficiencyReport.map(item => {
      const averageLevel = Number(item.averageLevel);
      let growthProjection = "On Track";
      let recommendation = "";
  
      if (averageLevel < 2) {
        growthProjection = "Need Improvement";
        recommendation = "Focus on fundamental concepts and consider additional resources.";
      } else if (averageLevel >= 2 && averageLevel < 4) {
        growthProjection = "On Track";
        recommendation = "Maintain the current pace and reinforce learning.";
      } else {
        growthProjection = "Above Average";
        recommendation = "Continue to challenge and deepen understanding.";
      }
  
      return {
        subject: item.subject,
        growthProjection,
        recommendation,
      };
    });
  };
  